/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define JobSearchAlert model -------------
 */
const messageParticipant = dbContext.define('IM_MessageParticipant', {
    participantId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "MessageParticipant_Id"
    },
    chatId: {
        type: Sequelize.INTEGER,
        field: "MessageHeader_Id"
    },
    userId: {
        type: Sequelize.INTEGER,
        field: "UserId"
    },    
    userType: {
        type: Sequelize.INTEGER,
        field: "UserType"
    },
    participantStatus: {
        type: Sequelize.INTEGER,
        field: "ParticipationStatus"
    },
    readStatus: {
        type: Sequelize.INTEGER,
        field: "ReadStatus"
    },
    createdDate: {
        type: Sequelize.DATE,
        field: "Created_Date",
        defaultValue: new Date()
    },
    lastActive: {
        type: Sequelize.DATE,
        field: "LastActiveDateTime"
    },
});

module.exports = {
    messageParticipant: messageParticipant
}