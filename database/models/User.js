module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      primaryKey: true
    },
    password: {
      type: DataTypes.STRING(38),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
     verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    name: DataTypes.STRING(100),
    bio: DataTypes.TEXT,
    ip_addr: DataTypes.STRING(45),
    session_id: DataTypes.STRING(128)
  }, {
    tableName: 'Users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
   User.associate = (models) => {
    User.hasMany(models.Post, { foreignKey: 'username' });
     User.hasMany(models.Image, { foreignKey: 'username' });
     User.hasOne(models.verificationToken, { foreignKey: 'username' });
  };

  return User;
};