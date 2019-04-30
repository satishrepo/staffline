/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define APP_REF_DATA model -------------
 */
const APP_REF_DATA = dbContext.define('APP_REF_DATA', {
    keyId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field : "KeyID"
    },
    keyName: {
        type: Sequelize.STRING,
        field : "KeyName"
    },
    parentId: {
        type: Sequelize.INTEGER,
        field : "ParentID"
    },
    description: {
        type: Sequelize.STRING,
        field : "Description"
    },
    value: {
        type: Sequelize.STRING,
        field : "Value"
    },
    maxLimitKeyId: {
        type: Sequelize.INTEGER,
        field : "MaxLimit_KeyId"
    }
    
});

module.exports = {
    APP_REF_DATA: APP_REF_DATA  
}