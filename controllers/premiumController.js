const Expense = require("../models/expense");
const User = require("../models/signupUser");
const sequelize = require("../utils/db");

exports.showLeaderboard = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findByPk(userId);
    if (!user || !user.isPremium) {
      return res.status(403).json({ message: "Access denied. Not a premium user." });
    }

    // final optimized method
      const leaderboard = await User.findAll({
      attributes: [ "name", "totalExpense"],
      order: [["totalExpense", "DESC"]]
    });

    // method 1 (using join)
    // const leaderboard = await Expense.findAll({
    //   attributes: [
    //     "UserId",
    //     [sequelize.fn("SUM", sequelize.col("amount")), "totalAmount"],
    //   ],
    //   group: ["UserId", "User.id"],
    //   order: [[sequelize.fn("SUM", sequelize.col("amount")), "DESC"]],
    //   include: [
    //     {
    //       model: User,
    //       attributes: ["id", "name", "email"],
    //     }
    //   ]
    // });

    res.json(leaderboard);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error });
  }
};
