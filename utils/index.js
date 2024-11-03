const dateUtils = require('./dateUtils');
const userIdentification = require('./userIdentification');
const processPost = require('./processPost');

module.exports = {
    ...dateUtils,
    ...userIdentification,
    ...processPost
};