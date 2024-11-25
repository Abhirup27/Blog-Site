module.exports = (sequelize, DataTypes) => {
  const verificationToken = sequelize.define('VerificationToken', {
    token: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      primaryKey: true
    },
    code: {
      type: DataTypes.INTEGER({
            validate: {
                min: 100000,  // 6 digits start at 100000
                max: 999999   // Maximum 6-digit number
            }
      }),
      allowNull: false,
    },
    username: {
    type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    }
  }, {
 
    tableName: 'VerificationTokens',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: false
  });
    verificationToken.associate = (models) => {
    verificationToken.belongsTo(models.User, { foreignKey: 'username' });
    };

  return verificationToken;
};