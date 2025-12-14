const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db");
const User = require("./signupUser");

const Order = sequelize.define("Order", {
  orderId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("PENDING", "SUCCESSFUL", "FAILED"),
    allowNull: false,
    defaultValue: "PENDING",
  },
  paymentId: {
    type: DataTypes.STRING,
  },
});

// Association
User.hasMany(Order);
Order.belongsTo(User);

module.exports = Order;
