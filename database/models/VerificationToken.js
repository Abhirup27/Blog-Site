module.exports = (sequelize, DataTypes) => {
  const verificationToken = sequelize.define('VerificationToken', {
    token: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      primaryKey: true
    },
    username: {
    type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    }
  }, {
    tableName: 'VerificationTokens'
  });
     verificationToken.associate = (models) => {
    verificationToken.belongsTo(models.User, { foreignKey: 'username' });
    };

  return verificationToken;
};