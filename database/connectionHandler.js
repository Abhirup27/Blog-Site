//const mariadb = require('mariadb');
import mariadb from "mariadb";
const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    connectionLimit: 5

});

export async function getConnection()
{
    try {
        return await pool.getConnection();
    } catch (err) {
        console.error('error connecting to the database: ', err);
        throw err;
    }
}

//module.exports = { getConnection };