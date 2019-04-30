/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define DOCUMENT_CHECKLIST_TRANSACTION model -------------
 */
const documentChecklistTransaction = dbContext.define('DOCUMENT_CHECKLIST_TRANSACTION', {
    documentChecklistTransactionId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "DOCUMENT_CHECKLIST_TRANSACTION_ID"
    },
    groupId: {
        type: Sequelize.INTEGER,
        field: "GROUP_ID"
    },
    userId: {
        type: Sequelize.STRING(50),
        field: "USER_ID"
    },

    documentId: {
        type: Sequelize.INTEGER,
        field: "DOCUMENT_ID"
    },
    documentDate: {
        type: Sequelize.DATE,
        field: "DOCUMENT_DATE"
    },
    expiryDate: {
        type: Sequelize.DATE,
        field: "EXPIRY_DATE"
    },
    documentStatus: {
        type: Sequelize.INTEGER,
        field: "DOCUMENT_STATUS"
    },
    dmsDocId: {
        type: Sequelize.INTEGER,
        field: "DMS_Doc_Id"
    },
    createdDate: {
        type: Sequelize.DATE,
        field: "Created_Date"
    },
    createdBy: {
        type: Sequelize.INTEGER,
        field: "Created_By"
    },
    spName: {
        type: Sequelize.STRING,
        field: "SP_Name",
        default : "staffline ORM"
    },
    dataInsertFrom: {
        type: Sequelize.INTEGER,
        field: "DataComeFrom"
    },
    placementTrackerId: {
        type: Sequelize.INTEGER,
        field: "PlacementTracker_Id"
    },
    

});

module.exports = {
    documentChecklistTransaction: documentChecklistTransaction
}