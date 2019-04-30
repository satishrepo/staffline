/**
 *  -------Import all classes and packages -------------
 */
import Sequelize from 'sequelize';
import configContainer from '../config/localhost';

let config = configContainer.loadConfig();

const dbContext = new Sequelize(config.db.dbname, config.db.username, config.db.password, {
    dialect: 'mssql',
    host: config.db.host,
    // dialectOptions: {
    //     instanceName: config.db.instance
    // },
    connectionTimeout: config.db.connectionTimeout,
    dialectOptions: {
        requestTimeout: config.db.requestTimeout
    },
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
    define: {
        freezeTableName: true,
        timestamps: false,
        hooks: {
            beforeUpdate: (instance, options) => {
                for (let i in instance.rawAttributes) {
                    if (instance.rawAttributes[i].readonly && instance.rawAttributes[i].readonly == true) {
                        instance[i] = instance._previousDataValues[i];
                    }
                }
                return instance;
            }
        },
        // hasTrigger: true
    },
    logging: false //console.log    
});

module.exports = {
    dbContext: dbContext,
    Sequelize: Sequelize,
}