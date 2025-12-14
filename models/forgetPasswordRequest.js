const {DataTypes}=require('sequelize');
const sequelize=require('../utils/db');
const Users=require('../models/signupUser')

const forgetPasswordRequests =sequelize.define('forgetPasswordRequests',{
    id:{
        type:DataTypes.UUID,
        allowNull:false,
        primaryKey:true
    },
    isActive:{
        type:DataTypes.BOOLEAN,
        defaultValue:true
    }
});

Users.hasMany(forgetPasswordRequests)
forgetPasswordRequests.belongsTo(Users);

module.exports=forgetPasswordRequests;

