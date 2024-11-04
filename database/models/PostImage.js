module.exports = (sequelize, DataTypes) => {
  const PostImage = sequelize.define('PostImage', {
    p_id: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      references: {
        model: 'Posts',
        key: 'p_id'
      }
    },
    i_id: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      references: {
        model: 'Images',
        key: 'i_id'
      }
    },
      width: {
      type: DataTypes.SMALLINT,
      allowNull: false
    },
    height: {
      type: DataTypes.SMALLINT, 
      allowNull: false
    }
  }, {
    tableName: 'PostImages',
     timestamps: true,
     createdAt: 'created_at',
      updatedAt: 'updated_at'
  });

  PostImage.associate = (models) => {
   
  };

  return PostImage;
};