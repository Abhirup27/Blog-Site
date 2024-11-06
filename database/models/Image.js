module.exports = (sequelize, DataTypes) => {
  const Image = sequelize.define('Image', {
    i_id: {
      type: DataTypes.CHAR(36),
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: 'Users',
        key: 'username'
      }
    },
    file_path: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    visibility: {
      type: DataTypes.ENUM('public', 'private', 'friends'),
      defaultValue: 'private'
    },
    used: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'Images',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Image.associate = (models) => {
    Image.belongsTo(models.User, { foreignKey: 'username' });
    Image.belongsToMany(models.Post, { 
      through: 'PostImages',
      foreignKey: 'i_id',
      otherKey: 'p_id'
    });
  };

  return Image;
};