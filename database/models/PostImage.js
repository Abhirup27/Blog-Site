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
    }
  }, {
    tableName: 'PostImages',
    timestamps: false
  });

  PostImage.associate = (models) => {
   
  };

  return PostImage;
};