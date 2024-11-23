const dateUtils = require('./dateUtils');
const userIdentification = require('./userIdentification');
const processPost = require('./processPost');
const Mail = require('./mail-verifier');

module.exports = {
    ...dateUtils,
    ...userIdentification,
    ...processPost,
    ...Mail
};