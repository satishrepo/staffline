/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define SME_Interview_Request model -------------
 */
const SMEInterviewRequest = dbContext.define('SME_Interview_Request', {
    smeInterviewRequestId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "SMEInterviewRequest_Id"
    },
    smeInterviewId: {
        type: Sequelize.INTEGER,       
        field: "SMEInterview_Id"
    },
    smeResumeId: {
        type: Sequelize.INTEGER,       
        field: "SME_Resume_Id"
    },
    requestStatus: {
        type: Sequelize.INTEGER,
        field: 'Request_Status'
    },
    createdBy: {
        type: Sequelize.INTEGER,
        field: "Created_By"
    },
    createdDate: {
        type: Sequelize.DATE,
        field: "Created_Date"
    }
});

module.exports = {
    SMEInterviewRequest: SMEInterviewRequest,
}