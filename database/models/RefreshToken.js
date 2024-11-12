module.exports = (sequelize, DataTypes) => {

    const RefreshToken = sequelize.define('RefreshToken', {
        refersh_token: {

            type: DataTypes.STRING(125),
            primaryKey:true
        }

    },
        {
            tableName: 'RefreshToken',
            timestamps: false,
        }
    )

    return RefreshToken;
}