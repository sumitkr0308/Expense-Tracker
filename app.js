const express = require("express");
const path=require('path');
const fs=require('fs');
const cors = require('cors');
const morgan=require('morgan');
const app = express();
require("dotenv").config();

const port=process.env.PORT;

const db = require("./utils/db");
const expenseRoutes = require("./routes/expenseRoutes");
const userRoutes = require('./routes/userRoutes');
const expenseController = require("./controllers/expenseController");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes=require("./routes/paymentRoutes");
const premiumRoutes = require("./routes/premiumRoutes");
const passwordRoutes=require("./routes/passwordRoutes");

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));


// Models
require("./models/signupUser");
require("./models/expense");
require("./models/order");
require("./models/payment")


// Routes
app.get('/', expenseController.getExpenseHome);
app.use('/user', userRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/password",passwordRoutes)

// premium 
app.use('/premium',premiumRoutes);

const accessLogStream=fs.createWriteStream(path.join(__dirname,'access.log'),{
  flags:'a'
})

app.use(morgan('combined',{stream:accessLogStream}));
// Sync database
db.sync({ alter: true })
  .then(() => {
    app.listen(port, () => console.log(` Server running on ${port}`));
  })
  .catch(err => console.error(" Database error:", err));
