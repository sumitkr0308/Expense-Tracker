const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db");

const Payment = sequelize.define(
  "Payment",
  {
    orderId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    paymentSessionId: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    currency: {
      type: DataTypes.STRING,
      defaultValue: "INR",
    },

    customerId: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    customerPhone: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "PENDING"
      },

    transactions: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
  },
  {
    tableName: "payments",
    timestamps: true,
  }
);

module.exports = Payment;
