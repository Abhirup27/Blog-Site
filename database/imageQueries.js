const { Sequelize } = require('sequelize');
const { Op } = require('sequelize');


async function getImages(postId, PostImage) {
    try {
        const result = await PostImage.findAll({
            where: {
                p_id: postId
            }

        })

        return result;
    }
    catch (err)
    {
        console.error("Error fetching post images from the DB " + err);
        throw err;

    }
}
async function storeImage(data, Image)
{
    try
    {
        const result = await Image.create({
        i_id: data.i_id,
        username: data.username,
        file_path: data.file_path,
            visibility: data.visibility,
            used: false
    })
    console.log(result);
    return result;
    } catch (err)
    {
        console.error("Error creating DB entry in images:" + err);
        throw err;
    }
}

async function createImageLink(data, PostImage, Image) {
    try {
        // First check if entry exists
        const existingLink = await PostImage.findOne({
            where: {
                i_id: data.i_id,
                p_id: data.p_id
            }
        });

        if (!existingLink) {
            const result = await PostImage.create({
                i_id: data.i_id,
                p_id: data.p_id,
                width: data.width,
                height: data.height
            });
            const markImageUsed = await Image.update(
                {
                    used: true
                },
                {
                where: {i_id:data.i_id}
                }
            )
            return result;
        }

        return existingLink;
        
    } catch (err) {
        console.error("error creating image link with post: " + err);
        throw err;
    }
}

async function getImagePath(filters, Image)
{
    try {
        const result = await Image.findOne({

            where: {
                ...filters
            },
            attributes: ['file_path']
        })

        if (!result) {
            return null;
        }
        return result;

    } catch (err)
    {
        console.error("Error fetching Image" + err);
        throw err;
    }


    
}
module.exports = {getImages,storeImage, getImagePath, createImageLink};