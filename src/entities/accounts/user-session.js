/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define UserSession model -------------
 */
const UserSession = dbContext.define('UserSession', {
    SessionId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    EmployeeDetails_Id: {
        type: Sequelize.INTEGER
    },
    SessionUniqueId: {
        type: Sequelize.STRING
    },
    CreatedBy: {
        type: Sequelize.BIGINT
    },
    CreatedOn: {
        type: Sequelize.DATE
    },
    UpdatedBy: {
        type: Sequelize.BIGINT
    },   
    UpdatedOn: {
        type: Sequelize.DATE
     },   
    LastLoggedIn: {
        type: Sequelize.DATE
     },   
    Status: {
        type: Sequelize.BIGINT
     },   
    RowVersion: {
        type: Sequelize.INTEGER
    },   
    // RowGuid: {
    //    type: Sequelize.STRING,  
    //    unique: 'compositeIndex'
    // }
});


module.exports = {
    UserSession: UserSession,
}