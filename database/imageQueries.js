const { Sequelize } = require('sequelize');
const { Op } = require('sequelize');

async function getImages(postId,PostImage, Image)
{

}
async function storeImage(userId, Image)
{
    const result = Image.create()
}

module.exports = {getImages,storeImage};