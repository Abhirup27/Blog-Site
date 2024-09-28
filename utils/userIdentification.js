export function getClientIp(req) {
    return req.headers['x-forwarded-for'] ?.split(',').shift() ||
        req.socket ?.remoteAddress;
}

export function findUser(users, header, sessionid, data)
{
    let user;
    if (sessionid != undefined) {
        const ipAddress = getClientIp(header);
         user = users.find(u => u.session == sessionid && u.lastLoginIp == ipAddress);
    }
    else if (sessionid == undefined && header == undefined)
    {
        user = users.find(u => u.username === data.username && u.password === data.password);
    }
    return user;
}

export function findPost(data)
{

}