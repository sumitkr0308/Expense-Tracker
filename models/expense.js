const {DataTypes}=require("sequelize");
const sequelize=require("../utils/db");
const User=require("./signupUser");

const expense= sequelize.define('expenses',{
    amount:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    description:{
        type:DataTypes.STRING,
        allowNull:false
    },
    category:{
        type:DataTypes.STRING,
        allowNull:false
    },
     note: {
        type:DataTypes.STRING,
        allowNull: true,
        },

});


// relationship
User.hasMany(expense);
expense.belongsTo(User);


module.exports=expense;