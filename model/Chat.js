const Sequelize= require("sequelize");

// strucure de notre base de données, nos colonnes
module.exports= (sequelize, DataTypes)=> {
    return sequelize.define("chat", {
        name: Sequelize.STRING,
        message: Sequelize.STRING,
        room: Sequelize.STRING
    })
}