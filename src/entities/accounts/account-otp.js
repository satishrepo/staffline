/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define EmployeeOTP model -------------
 */
const AccountOTP = dbContext.define('EmployeeOTP', {
    EmployeeOTP_Id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    EmployeeDetails_Id: {
        type: Sequelize.INTEGER
    },
    Secret_Key: {
        type: Sequelize.STRING
    },
    Token: {
        type: Sequelize.STRING
    },
    Expiry: {
        type: Sequelize.DATE
    },
    IsActive: {
        type: Sequelize.BOOLEAN
    }
});


module.exports = {
    AccountOTP: AccountOTP,
}