const dateUtils = require('./dateUtils');
const userIdentification = require('./userIdentification');
const processPost = require('./processPost');
const sendMail = require('./mail-verifier');

module.exports = {
    ...dateUtils,
    ...userIdentification,
    ...processPost,
    sendMail
};