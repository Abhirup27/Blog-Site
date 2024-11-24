const { Sequelize } = require('sequelize');
const { Op } = require('sequelize');


async function getToken(token, VerificationToken)
{
    try {
        const result = await VerificationToken.findOne(
            {
                where: {
                    token: token
                }
            }
        );

        return result;

    } catch (error)
    {
        console.error("Error fetching token from DB.", error);
        throw error;
    }
}


async function addToken(userid,token, VerificationToken)
{
    try {
        const result = await VerificationToken.create(
            {
                token: token,
                username:userid
            }
        );

        return result;

    } catch (error)
    {
        console.error("Error creating token in DB.", error);
        throw error;
    }

}

async function deleteToken(token, VerificationToken)
{
    try {
        const result = await verificationToken.destroy(
            {
                where: {
                    token:token
                }
            }
        )
        
        return result;
    }
    catch (error)
    {
         console.error("Error deleting token in DB.", error);
        throw error;
    }
}

module.exports = { getToken, addToken,deleteToken };