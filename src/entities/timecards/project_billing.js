/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define ProjectBilling model -------------
 */
const ProjectBilling = dbContext.define('ProjectBilling', {
    ProjectBilling_ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ProjectDetail_ID: {
        type: Sequelize.INTEGER
    },
    Billing_Cycle: {
        type: Sequelize.INTEGER
    }
});

module.exports = {
    ProjectBilling: ProjectBilling  
}