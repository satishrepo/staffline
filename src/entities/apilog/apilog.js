/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define APILog model -------------
 */
const APILog = dbContext.define('APILog', {
    apiLogId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "APILog_Id"
    },
    application: {
        type: Sequelize.INTEGER,       
        field: "API_Application"
    },
    method: {
        type: Sequelize.STRING,
        field: "Calling_Method"
    },
    endPoint: {
        type: Sequelize.STRING,
        field: "EndPoint_URL"      
    },
    requestHeader: {
        type: Sequelize.TEXT,
        field: "RequestHeader"      
    },
    inputBody: {
        type: Sequelize.TEXT,
        field: 'InputLog'
    },
    errorLog: {
        type: Sequelize.TEXT,
        field: 'ErrorLog'     
    },
    fromIp: {
        type: Sequelize.STRING,
        field: 'FromIP',
        allowNull: true
    },
    createdDate: {
        type: Sequelize.DATE,
        field: "Created_Date"
    }
});

module.exports = {
    APILog: APILog,
}