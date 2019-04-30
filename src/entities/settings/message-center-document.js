/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define MessageCenterDocument model -------------
 */
const MessageCenterDocument = dbContext.define('MessageCenterDocument', {
    messageCenterDocId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "MessageCenterDoc_Id"
    },
    messageId: {
        type: Sequelize.INTEGER,
        field: "Message_Id"
    },
    fileName: {
        type: Sequelize.STRING,
        field: "File_Name"       
    },    
    createdBy: {
        type: Sequelize.INTEGER,
        field: "Created_By"
    },
    createdDate: {
        type: Sequelize.DATE,
        field: "Created_Date"
    },
    fileNameAlias: {
        type: Sequelize.STRING,
        field: "File_Name_Alias"       
    }, 
    


});

module.exports = {
    MessageCenterDocument: MessageCenterDocument,
}