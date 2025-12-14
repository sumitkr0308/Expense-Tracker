const path = require("path");
const Expenses = require("../models/expense");
const User = require("../models/signupUser");
const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();
const sequelize = require("../utils/db");
const expense = require("../models/expense");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const getExpenseHome = (req, res) => {
  res.sendFile(path.join(__dirname, "..", "view", "expense.html"));
};


// get all expense

const getAllExpenses = async (req, res) => {

  try {
    const userId = req.user.userId;

    // pagination params
    const page=Number(req.query.page)||1;
    const limit=Number(req.query.limit)||10;
    const offset=(page-1)*limit;
    const {count, rows}=await Expenses.findAndCountAll({
      where:{UserId:userId},
      limit,
      offset,
      order:[["createdAt", "DESC"]]  //sorting 

    });
    res.status(200).json({
      expenses:rows,
      currentPage:page,
      totalPages:Math.ceil(count/limit),
      totalCount:count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// add Expenses
const addExpense = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { amount, description,note } = req.body;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Give ONLY one expense category for the following text:
          "${description}"
          Return just ONE category word or phrase.Do NOT add explanations.`,
    });
    console.log(response.text);
    let category = response.text;

    const userId = req.user.userId;
    const expense = await Expenses.create(
      {
        amount,
        description,
        note,
        category,
        UserId: userId,
      },
      { transaction }
    );
    const user = await User.findByPk(userId, { transaction });
    user.totalExpense = (user.totalExpense || 0) + Number(amount);
    await user.save({ transaction });
    console.log("Expense created:", expense.dataValues);
    await transaction.commit();
    res.status(201).json(expense);
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};

const editExpense = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { amount, description } = req.body;

    // 1. Find the existing expense and user
    const expense = await Expenses.findOne({
      where: { id: id, UserId: userId },
    },{transaction});
    if (!expense) {
      await transaction.rollback();
      return res.status(404).json({ message: "Expense not found" });
    }

    const user = await User.findByPk(userId, { transaction });
    const originalAmount = expense.amount; // Store original amount
    const amountDifference = Number(amount) - originalAmount;

    // 2. Re-categorize if description changed
    let category = expense.category;
    if (description !== expense.description) {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Give ONLY one expense category for the following text: "${description}" Return just ONE category word or phrase.Do NOT add explanations.`,
      });
      category = response.text;
    }

    // 3. Update the expense record
    expense.description = description;
    expense.amount = amount;
    expense.category = category;
    await expense.save({ transaction });

    // 4. Update the user's totalExpense
    user.totalExpense = (user.totalExpense || 0) + amountDifference;
    await user.save({ transaction });
    await transaction.commit();
    res.status(200).json(expense);
  } catch (error) {
    await transaction.rollback();
    res
      .status(500)
      .json({ message: "Error updating expense", error: error.message });
  }
};

const deleteExpense = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // 1. Find the expense to get its amount before deleting
    const expense = await Expenses.findOne({
      where: { id: id, UserId: userId },
    },{transaction});
    if (!expense) {
      await transaction.rollback();
      return res.status(404).json({ message: "Expense not found" });
    }

    const amountToDelete = expense.amount;

    // 2. Delete the expense
    await Expenses.destroy({ where: { id: id, UserId: userId } });

    // 3. Update the user's totalExpense
    const user = await User.findByPk(userId,{transaction});
    user.totalExpense = (user.totalExpense || 0) - Number(amountToDelete);
    await user.save({ transaction });

    await transaction.commit();

    res.status(200).json({ message: "Expense deleted" });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: "Failed to delete expense" });
  }
};

module.exports = {
  getExpenseHome,
  getAllExpenses,
  addExpense,
  editExpense,
  deleteExpense,
};
