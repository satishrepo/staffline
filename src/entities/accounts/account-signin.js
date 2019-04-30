/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define EmployeeDetails model -------------
 */
const AccountSignIn = dbContext.define('EmployeeDetails', {
    EmployeeDetails_Id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    PJEmployee_Id: {
        type: Sequelize.STRING
    },
    Email_Id: {
        type: Sequelize.STRING
    },
    First_Name: {
        type: Sequelize.STRING
    },
    Last_Name: {
        type: Sequelize.STRING
    },
    Employee_Type: {
        type: Sequelize.INTEGER
    },
    ProfilePicture: {
        type: Sequelize.STRING
    },
    emp_status: {
        type: Sequelize.CHAR
    },
    isAccountActivated: {
        type: Sequelize.BOOLEAN
    },
    password: {
        type:Sequelize.STRING
    },
    AccountActivation_Date:{
        type:Sequelize.DATE
    },
    CompanyMaster_Id:{
        type: Sequelize.INTEGER
    }
},{
    hasTrigger:true
});


module.exports = {
    AccountSignIn: AccountSignIn,
}