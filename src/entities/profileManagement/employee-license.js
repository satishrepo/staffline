/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define EmployeeLicense model -------------
 */
const EmployeeLicense = dbContext.define('EmployeeLicense', {
    employeeLicenseId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "EmployeeLicense_Id"
    },
    employeeDetailsId: {
        type: Sequelize.INTEGER,
        field: "EmployeeDetails_Id"
    },
    licenseTypeId: {
        type: Sequelize.INTEGER,
        field: "LicenseType"
    },
    registeredStateId: {
        type: Sequelize.INTEGER,
        field: "RegisteredState"
    },
    licenceNumber: {
        type: Sequelize.STRING,
        field: "LicenceNumber"
    },
    expirationDate: {
        type: Sequelize.DATE,
        field: "ExpirationDate"
    },
    isActive: {
        type: Sequelize.BOOLEAN,
        field: "IsActive"
    },
    createdBy: {
        type: Sequelize.INTEGER,
        field: "CreatedBy"
    },
    createdDate: {
        type: Sequelize.DATE,
        field: "CreatedDate",
        defaultValue: new Date()
    }
});


module.exports = {
    EmployeeLicense: EmployeeLicense,
}