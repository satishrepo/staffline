/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define PT_PlacementTracker model -------------
 */
const PtPlacementTracker = dbContext.define('PT_PlacementTracker', {
    placementTrackerId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "PlacementTracker_Id"
    },
    customerId: {
        type: Sequelize.STRING,
        field: "Customer_Id"
    },
    // placementTrackerId: {
    //     type: Sequelize.INTEGER,
    //     field: "PlacementTracker_Id"
    // },
    // bgCheckEnvStatus: {
    //     type: Sequelize.INTEGER,
    //     field: "BGCheck"
    // },
    // clientEnvStatus: {
    //     type: Sequelize.INTEGER,
    //     field: "OnBoardingClientDocCompAggr"
    // },
    // benefitsEnvStatus: {
    //     type: Sequelize.INTEGER,
    //     field: "Benefits"
    // },
    // bgUpdatedOn: {
    //     type: Sequelize.DATE,
    //     field: "BGCheckCompletedDate"
    // },
    // offerLetterUpdatedOn: {
    //     type: Sequelize.DATE,
    //     field: "OfferLetterCompletedDate"
    // },
    // clientEnvUpdatedOn: {
    //     type: Sequelize.DATE,
    //     field: "OnBoardingClientDocCompAggr_CompDate"
    // },
    // benefitsEnvUpdatedOn: {
    //     type: Sequelize.DATE,
    //     field: "Benefits_CompDate"
    // },  
    

});

module.exports = {
    PtPlacementTracker: PtPlacementTracker
}