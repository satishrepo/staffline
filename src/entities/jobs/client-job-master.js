/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define ClientJobMaster model -------------
 */
const ClientJobMaster = dbContext.define('CLIENT_JOB_MASTER', {
    cjmJobId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "CJM_JOB_ID"
    },
    cjmJobTitle: {
        type: Sequelize.STRING,
        field: "CJM_JOB_TITLE"
    },
    cjmStatus: {
        type: Sequelize.STRING,
        field: "CJM_STATUS"
    },
    referralBonus: {
        type: Sequelize.DECIMAL(10,2),
        field: "ReferralBonus"
    }


},{
    hasTrigger : true
});


module.exports = {
    ClientJobMaster: ClientJobMaster,
}