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
            await setUserInfo(userid, passwd, ipaddr, sessionid, User);
            console.log("This is the data ", user);
            return user;
        }
        return null;
    } catch (err) {
        console.log(err);
        return null;
    }
}

async function verifyUser(sessionid, ipaddr, db) {
    const { User } = db;
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

async function setUserInfo(userid, passwd, ipaddr, sessionid, User) {
    try {
        const result = await User.update({
            ip_addr: ipaddr,
            session_id: sessionid
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

async function newUserRegister(userid, email, passwd, name, db) {
    const { User } = db;
    try {
        const existingUser = await User.findOne({
            where: {
                username: userid
            }
        });
        
        if (!existingUser) {
            await User.create({
                username: userid,
                email: email,
                password: passwd,
                name: name
            });
            return true;
        }
        return false;
    } catch (err) {
        console.log(err);
        return false;
    }
}

module.exports = { getUserLogin, verifyUser, setUserInfo, newUserRegister };