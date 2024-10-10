//const mariadb = require('mariadb');
const mariadb = require("mariadb");
const Sequelize = require("sequelize")

// const pool = mariadb.createPool({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     port: parseInt(process.env.DB_PORT, 10) || 3306,
//     connectionLimit: 5

// });

const pool = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mariadb',
    port: process.env.DB_PORT || 3306
});

 async function getConnection()
{
    try {
        return await pool.getConnection();
    } catch (err) {
        console.error('error connecting to the database: ', err);
        throw err;
    }
}

module.exports = { getConnection };