/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';


/**
 *  -------Define EmployeeAccessToken model -------------
 */
const EmployeeAccessToken = dbContext.define('EmployeeAccessToken', {
    employeeAccessTokenId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "EmployeeAccessToken_Id"
    },
    employeeDetailsId: {
        type: Sequelize.INTEGER,
        field: "EmployeeDetails_Id"
    },
    accessTokenKey: {
        type: Sequelize.TEXT,
        field: "AccessTokenKey"
    },
    completeUrl: {
        type: Sequelize.TEXT,
        field: "CompleteURL"
    },
    createdDate: {
        type: Sequelize.DATE,
        field: "Created_Date"
    },
    
});


module.exports = {
    EmployeeAccessToken: EmployeeAccessToken,
}