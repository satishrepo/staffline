/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define EmployeeContactDetails model -------------
 */
const EmployeeContactDetails = dbContext.define('EmployeeContactDetails', {
    EmployeeContactDetails_Id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    EmployeeDetails_Id: {
        type: Sequelize.INTEGER
    },
    Address1: {
        type: Sequelize.STRING,
        field: "address"
    },
    Country: {
        type: Sequelize.INTEGER
    },
    State: {
        type: Sequelize.INTEGER
    },
    City_Id: {
        type: Sequelize.INTEGER
    },   
    Zip_Code: {
        type: Sequelize.STRING
     },   
    Phone_Cell: {
        type: Sequelize.STRING
    }
});


module.exports = {
    EmployeeContactDetails: EmployeeContactDetails,
}