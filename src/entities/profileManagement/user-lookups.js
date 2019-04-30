/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define APP_REF_DATA model -------------
 */
const UserLookups = dbContext.define('APP_REF_DATA', {
    KeyID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: false
    },
    KeyName: {
        type: Sequelize.STRING
    },
    ParentID: {
        type: Sequelize.INTEGER
    },
    Description: {
        type: Sequelize.STRING
    },
    Value: {
        type: Sequelize.STRING
    }
});

module.exports = {
    UserLookups: UserLookups  
}