const { Sequelize } = require('sequelize');



async function getUserLogin(userid, passwd, ipaddr, sessionid, User) {
    let data;
    User.findAll({
        where: {
            username: userid,
            password: passwd
        }
    }).then( async (user) => {
        await setUserInfo(userid, passwd, ipaddr, sessionid, User).then(async (result) => {
            console.log(result)
            if (result) {
                console.log("This is the data " + user);
                data = user;
                return user;
           } else {
            console.log("failed to update user info in DB");
        }

        })
            
        
    }).catch((err) => {
        console.log(err);
    });
    return data;
}

async function verifyUser(sessionid, ipaddr, db) {
    const { User } = db;
    User.findAll({
        where: {
            session_id: sessionid,
            ip_addr: ipaddr
        }
    }).then((user) => {
        return user;
    }).catch((err) => {
        console.log(err);
    });
    return undefined;

}

async function setUserInfo(userid, passwd, ipaddr, sessionid, User) {
    console.log("THIS IS THE DATA " + userid)
    
    await User.update({
            ip_addr: ipaddr,
            session_id: sessionid
        }, {
            where: {
                username: userid
            }
        })
        .then((result) => {
            console.log('Updated rows:', result[0]);
            return true;
        })
        .catch((err) => {
            if (err) {
                console.log(err);
                return false;
            }
        })
    return true;
}


async function newUserRegister(userid, email, passwd, name, db) {
    const { User } = db;
    
    User.findAll({
        where: {
            username: userid
        }
    }).then((user) => {
        if (user == undefined) {
            User.create({
                username: userid,
                email: email,
                password: passwd,
                name : name
            }).catch((err) => {
                if (err) {
                    console.log(err);
                }
            })
        }

    }).catch((err) => {
        console.log(err);
    });


}

module.exports = { getUserLogin, verifyUser, setUserInfo, newUserRegister };