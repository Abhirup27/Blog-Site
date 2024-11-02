'use strict';

const { getUserLogin, setUserInfo, verifyUser, newUserRegister } = require('./userQueries');
const { getPostsLists, getPost, createPost, updatePost, deletePost } = require('./postQueries');
const { createDatabase } = require('./createDB');
const { storeImage, getImages } = require('./imageQueries');
const fs = require('fs');
const path = require('path');
const {Sequelize, DataTypes} = require('sequelize');
const process = require('process');
const { storeImage } = require('./imageQueries');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || config.database,
    process.env.DB_USER || config.username,
    process.env.DB_PASSWORD || config.password,
    {
      host: process.env.DB_HOST || config.host,
      port: process.env.DB_PORT || config.port,
      dialect: 'mariadb',
      dialectOptions: {
       timezone: '+5:30'
     },
     define: {
       timestamps: true,
       createdAt: {
         type: DataTypes.DATE,
         get() {
           return this.getDataValue('createdAt')
             .toISOString()
             .replace(/\.\d{3}Z$/, 'Z');
         }
       },
       updatedAt: {
         type: DataTypes.DATE,
         get() {
           return this.getDataValue('updatedAt')
             .toISOString()
             .replace(/\.\d{3}Z$/, 'Z');
         }
       }
     }

    }
  );
}

fs
  .readdirSync(__dirname+'/models')
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    
    const model = require(path.join(__dirname + '/models', file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
    console.log(model.name + " model loaded");
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = {getPostsLists, getPost, createPost, updatePost, deletePost, getUserLogin, setUserInfo, verifyUser, newUserRegister, createDatabase, storeImage, getImages,db};