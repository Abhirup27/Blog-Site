const { Sequelize } = require('sequelize');

async function getUserLogin(userid, passwd, ipaddr, sessionid, User) {
    try {
        const user = await User.findOne({
            where: {
                username: userid,
                password: passwd
            }
        });

        if (user) {
            await setUserInfo(userid, { ip_addr: ipaddr, session_id: sessionid }, User);
            console.log("This is the data ", user);
            return user.dataValues;
        }
        return null;
    } catch (err) {
        console.log(err);
        return null;
    }
}
async function removeUser(userid, User)
{
    try {
        return await User.destroy(
            {
                where: {
                    username: userid
                }
            }
        );
    } catch (error)
    {
        console.error("error deleting user"+ error);
        throw error;
    }
}

async function getUsersV(userid, User)
{
    try {
        const foundUser = await User.findOne({
            where: {
                username:userid
            },

            attributes: ['username', 'created_at', 'verified']
        })

        return foundUser
    } catch (error)
    {
        console.error("error getting user info:", error);
        throw error;
    }
}
async function verifyUser(sessionid, ipaddr, User) {
  
    try {
        return await User.findOne({
            where: {
                session_id: sessionid,
                ip_addr: ipaddr
            }
        });
    } catch (err) {
        console.log(err);
        return null;
    }
}

async function setUserInfo(userid,updateData, User) {
    try {
        const result = await User.update({
            ...updateData
        }, {
            where: {
                username: userid
            }
        });
        console.log('Updated rows:', result[0]);
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}

async function newUserRegister(userid, email, passwd, name, User) {
    
    try {
        const existingUserByUsername = await User.findOne({
            where: {
                username: userid
            }
        });

        const existingUserByEmail = await User.findOne({
            where: {
                email: email
            }
        });
       
        if (!existingUserByUsername || !existingUserByEmail) {
            await User.create({
                username: userid,
                email: email,
                password: passwd,
                name: name
            });
            return true;
        }
        console.log(existingUserByUsername);
        return false;
    } catch (err) {
        console.log(err);
        return false;
    }
}
async function getRefreshToken(token, RefreshToken)
{
    try {
        const refresh_token = await RefreshToken.findOne({
            where: {
                refresh_token: token
            }
        });
        return refresh_token;
    } catch (err)
    {
        console.error(err);
        throw err;
    }
}
async function setToken(token, RefreshToken)
{
    try {
        const result = await RefreshToken.create({
            refresh_token: token
        })
        return result;
    }
    catch (err)
    {
        console.error(err);
        throw err;
    }
}
module.exports = { getUserLogin, verifyUser, setUserInfo, newUserRegister, getRefreshToken, setToken, removeUser, getUsersV };