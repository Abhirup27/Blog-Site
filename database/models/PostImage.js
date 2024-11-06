module.exports = (sequelize, DataTypes) => {
  const PostImage = sequelize.define('PostImage', {
    p_id: {
      type: DataTypes.CHAR(36),
      primaryKey: true
    },
    i_id: {
      type: DataTypes.CHAR(36),
      primaryKey: true
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
    PostImage.belongsTo(models.Post, {
      foreignKey: 'p_id',
      targetKey: 'p_id'
    });
    PostImage.belongsTo(models.Image, {
      foreignKey: 'i_id',
      targetKey: 'i_id'
    });
  };

  return PostImage;
};