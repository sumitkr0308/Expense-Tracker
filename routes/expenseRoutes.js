const express=require("express");
const router=express.Router();
const expenseController=require("../controllers/expenseController");
const authenticate=require("../middleware/auth")


// fetch all expense
router.get("/",authenticate,expenseController.getAllExpenses);

// add expense
router.post('/',authenticate,expenseController.addExpense);

// edit
router.put('/:id',authenticate,expenseController.editExpense);

// delete
router.delete("/:id",authenticate,expenseController.deleteExpense);

module.exports=router;