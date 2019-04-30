/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define OnBoarding_Envelope_Signers model -------------
 */
const OnBoardingEnvelopeSigners = dbContext.define('OnBoarding_Envelope_Signers', {
    onBoardingEnvelopeSignerId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "OnBoarding_Envelope_SignerId"
    },
    onBoardingEnvelopeId: {
        type: Sequelize.INTEGER,
        field: "OnBoarding_EnvelopeId"
    },
    signerRole: {
        type: Sequelize.STRING(500),
        field: "Signer_Role"
    },
    signerOrder: {
        type: Sequelize.INTEGER,
        field: "Signer_Order"
    },
    signingProviderEnvelopeId: {
        type: Sequelize.TEXT,
        field: "SigningProvider_EnvelopeId"
    },
    employeeDetailsId: {
        type: Sequelize.INTEGER,
        field: "EmployeeDetails_Id"
    },
    envelopeSignerId: {
        type: Sequelize.STRING(500),
        field: "Envelope_SignerId"
    },
    envelopeSignerName: {
        type: Sequelize.STRING(500),
        field: "Envelope_Signer_Name"
    },
    envelopeSignerEmail: {
        type: Sequelize.STRING(500),
        field: "Envelope_Signer_Email"
    },
    envelopeSignerStatus: {
        type: Sequelize.STRING,
        field: "Envelope_Signer_Status"
    },
    envelopeSignerSignedAt: {
        type: Sequelize.DATE,
        field: "Envelope_Signer_Signed_At"
    },
    envelopeSignerLastViewedAt: {
        type: Sequelize.DATE,
        field: "Envelope_Signer_LastViewed_At"
    },
    envelopeSignerLastRemindedAt: {
        type: Sequelize.DATE,
        field: "Envelope_Signer_LastReminded_At"
    },
    createdBy: {
        type: Sequelize.INTEGER,
        field: "Created_By"
    },
    createdOn: {
        type: Sequelize.DATE,
        field: "Created_On"
    },
    updatedBy: {
        type: Sequelize.INTEGER,
        field: "Updated_By"
    },
    updatedOn: {
        type: Sequelize.DATE,
        field: "Updated_On"
    },
    isEmployee: {
        type: Sequelize.INTEGER,
        field: "isEmployee"
    },
    

});

module.exports = {
    OnBoardingEnvelopeSigners: OnBoardingEnvelopeSigners
}
