/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';


/**
 *  -------Define EmployeeDetails model -------------
 */
const AccountChangePassword = dbContext.define('EmployeeDetails', {
    Email_Id: {
        type: Sequelize.STRING
    }    ,
    Password: {
        type: Sequelize.STRING
    }
});


module.exports = {
    AccountChangePassword:AccountChangePassword,
}