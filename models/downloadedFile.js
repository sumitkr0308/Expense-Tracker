const {DataTypes} = require("sequelize");
const sequelize = require("../utils/db"); 
const User = require("./signupUser");  
const DownloadFile = sequelize.define("DownloadFile", {
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true,
    },
      UserId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
    fileURL:{
        type:DataTypes.STRING,
        allowNull:false
    }
}, {
    timestamps: true
}); 

// association
User.hasMany(DownloadFile);
DownloadFile.belongsTo(User);


module.exports = DownloadFile;