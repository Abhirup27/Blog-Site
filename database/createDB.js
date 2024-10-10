const { Sequelize } = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/config/config.json')[env];
async function createDatabase(dbName, dbUser, dbPassword, dbHost)
{
    const tempSequelize = new Sequelize('', dbUser, dbPassword,
    {
        host: dbHost,
        dialect: config.dialect
        });
    
   try {
    // Try to create the database
    await tempSequelize.query(`CREATE DATABASE IF NOT EXISTS ${dbName};`);
    console.log(`Database ${dbName} created or already exists.`);
  } catch (error) {
    console.error('Error creating database:', error);
     await tempSequelize.query(`CREATE DATABASE ${dbName};`);
  } finally {
    // Close the temporary connection
    await tempSequelize.close();
  }

  // Now create a Sequelize instance with the database specified
  const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    dialect: config.dialect
  });

  return sequelize;

}

module.exports = {createDatabase};