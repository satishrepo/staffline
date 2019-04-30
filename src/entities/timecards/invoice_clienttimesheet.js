/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define Invoice_ClientTimeSheet model -------------
 */
const Invoice_ClientTimeSheet = dbContext.define('Invoice_ClientTimeSheet', {
    TSUpload_ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    EmployeeID: {
        type: Sequelize.INTEGER
    },
    ProjectID: {
        type: Sequelize.INTEGER
    },
    CustomerID: {
        type: Sequelize.INTEGER
    },
    TSFromDate: {
        type: Sequelize.DATE
    },
    TSToDate: {
        type: Sequelize.DATE
    },
    TotalTimeSheetHrs: {
        type: Sequelize.DECIMAL(10,2)
    },
    ApproveStatus: {
        type: Sequelize.INTEGER
    },
    Created_Date: {
        type: Sequelize.DATE
    },
    Created_By: {
        type: Sequelize.INTEGER
    },
    IsDeleted: {
        type: Sequelize.INTEGER
    },
    // RowGUIID: {
    //     type: 'UNIQUEIDENTIFIER',
    //     allowNull: false,
    //     defaultValue: Sequelize.UUIDV1,
    // },
    Invoice_Completed: {
        type: Sequelize.INTEGER
    },
    DataCameFrom: {
        type: Sequelize.INTEGER
    },
    ClientApproval: {
        type: Sequelize.INTEGER
    },
    ClientTimeCardApproval: {
        type: Sequelize.INTEGER,
        defaultValue : 1
    },
    InsertedSP_Name: {
        type: Sequelize.STRING,
        defaultValue: "Staffline-API-ORM"
    },
    UpdatedSP_Name: {
        type: Sequelize.STRING,
        defaultValue: null
    }    
});

module.exports = {
    Invoice_ClientTimeSheet: Invoice_ClientTimeSheet  
}