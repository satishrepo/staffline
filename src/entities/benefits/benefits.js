/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define BenefitMaster model -------------
 */
const BenefitMaster = dbContext.define('Benefit_Master', {
    Benefit_Id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: false
    },
    Benefit_Name: {
        type: Sequelize.STRING
    },
    Description: {
        type: Sequelize.STRING
    },
    Group_Id: {
        type: Sequelize.STRING
    },
    Form_Doc: {
        type: Sequelize.STRING
    },
    Support_Doc: {
        type: Sequelize.STRING
    },
    BenefitSummary_Doc: {
        type: Sequelize.STRING
    },
    Provider_Name: {
        type: Sequelize.STRING
    },
    Provider_Address: {
        type: Sequelize.STRING
    },
    Start_Date: {
        type: Sequelize.DATE
    },
    End_Date: {
        type: Sequelize.DATE
    },
    Status: {
        type: Sequelize.INTEGER
    },
    Created_Date: {
        type: Sequelize.DATE
    },
    Created_By: {
        type: Sequelize.DATE
    },
    Benefit_Contains: {
        type: Sequelize.STRING
    },
    BenefitOrder: {
        type: Sequelize.INTEGER
    },
    ShowOnEmpPortal: {
        type: Sequelize.INTEGER
    }
});

module.exports = {
    BenefitMaster: BenefitMaster
}