const { Sequelize } = require('sequelize');
const { Op } = require('sequelize');


async function getImages(postId, PostImage, Image) {
    try {
        const result = PostImage.findAll({
            where: {
                p_id: postId
            }

        })
        return result;
    }
    catch (err)
    {
        console.error("Error fetching post images from the DB " + err);

    }
}
async function storeImage(data, Image)
{
    const result =  await Image.create({
        i_id: data.i_id,
        username: data.username,
        file_path: data.file_path,
        visibility: data.visibility
    }).then((result) => {
        console.log("Image Created in DB: " + result);
    }).catch((err) => {
        console.error("Error creating DB entry in images:" + err);
    })
    console.log(result);
    return result;
}

async function createImageLink(data, PostImage)
{
    try {
        const result = await PostImage.create({

            i_id: data.i_id,
            p_id: data.p_id
        })
        return result;
    } catch (err)
    {
        console.error("error creating image link with post" + err);
    }
}

async function getImageId(filters, Image)
{
    try {
        const result = await Image.findOne({

            where: {
                ...filters
            },
            //attributes: ['i_id']
        })

        if (!result) {
            return null;
        }
        return result;

    } catch (err)
    {
        console.error("Error fetching Image" + error);
        throw error;
    }


    
}
module.exports = {getImages,storeImage, getImageId, createImageLink};