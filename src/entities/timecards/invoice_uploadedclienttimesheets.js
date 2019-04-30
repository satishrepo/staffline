/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define Invoice_UploadedClientTimeSheets model -------------
 */
const Invoice_UploadedClientTimeSheets = dbContext.define('Invoice_UploadedClientTimeSheets', {
    UploadedTimeSheet_Id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    TSUpload_Id: {
        type: Sequelize.INTEGER
    },
    UploadedTimesheetName: {
        type: Sequelize.STRING(1000)
    },
    UploadedTimeSheetLocation: {
        type: Sequelize.STRING(1000)
    },
    Status: {
        type: Sequelize.INTEGER
    },
    
    Created_Date: {
        type: Sequelize.DATE
    },
    Created_By: {
        type: Sequelize.INTEGER
    },
    Modified_Date: {
        type: Sequelize.DATE
    },
    Modified_By: {
        type: Sequelize.INTEGER
    }
     
});

module.exports = {
    Invoice_UploadedClientTimeSheets: Invoice_UploadedClientTimeSheets  
}