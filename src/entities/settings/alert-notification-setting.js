/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define AlertNotificationSetting model -------------
 */
const AlertNotificationSetting = dbContext.define('AlertNotificationSetting', {
    alertNotificationSettingId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "AlertNotificationSetting_Id"
    },
    employeeDetailsId: {
        type: Sequelize.INTEGER,       
        field: "EmployeeDetails_Id"
    },
    alertTypeId: {
        type: Sequelize.INTEGER,
        field: "AlertType"
    },
    alertStatus: {
        type: Sequelize.INTEGER,
        field: "Status"      
    },
    switchOffStatus: {
        type: Sequelize.INTEGER,
        field: "SwitchOffStatus"      
    },
    alertFrequencyId: {
        type: Sequelize.INTEGER,
        field: 'AlertFrequency'
    },
    dateFrom: {
        type: Sequelize.DATE,
        field: 'DateFrom',
        allowNull: true
    },
    dateTo: {
        type: Sequelize.DATE,
        field: 'DateTo',
        allowNull: true
    },
    createdBy: {
        type: Sequelize.INTEGER,
        field: "Created_By"
    },
    createdDate: {
        type: Sequelize.DATE,
        field: "Created_Date"
    },  
    modifiedBy: {
        type: Sequelize.INTEGER,
        field: "Modified_By"
    },
    modifiedDate: {
        type: Sequelize.DATE,
        field: "Modified_Date"
    },
   

});

module.exports = {
    AlertNotificationSetting: AlertNotificationSetting,
}