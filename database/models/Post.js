module.exports = ( sequelize, DataTypes ) => {
    const Post = sequelize.define('Post', {
        p_id: {
            type: DataTypes.CHAR(36),
            primaryKey: true
        },
        username: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        title: {
            type: DataTypes.STRING(128),
            allowNull: false
        },
        content: {
            type: DataTypes.TEXT
        },
        visibility: {
        type: DataTypes.ENUM('public', 'private', 'friends'),
        defaultValue: 'private'
        }
    },
        {
            tableName: 'Posts',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        });
    
     Post.associate = (models) => {
         Post.belongsTo(models.User, { foreignKey: 'username' });
         
    };
    return Post;
};