/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define LEGALAPPTYPE model -------------
 */
const legalAppType = dbContext.define('LEGALAPPTYPE', {
    APPTYPEID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: false
    },
    APPTYPECODE: {
        type: Sequelize.INTEGER
    },
    APPTYPENAME: {
        type: Sequelize.INTEGER
    },
    STATUS: {
        type: Sequelize.CHAR
    }
});

/**
 *  -------Define ACTIVITIES_MASTER model -------------
 */
const currentEmploymentStatusList = dbContext.define('ACTIVITIES_MASTER ', {
    ACTIVITY_ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: false
    },
    ACTIVITY_NAME: {
        type: Sequelize.STRING
    },
    ACTIVITY_TYPE: {
        type: Sequelize.STRING
    },
    ACTIVITY_STATUS: {
        type: Sequelize.INTEGER
    }
});

/**
 *  -------Define HOTLIST_CATEGORY model -------------
 */
const skillCategoryList = dbContext.define('HOTLIST_CATEGORY', {
    HL_CATEGORY_ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: false
    },
    HL_CATEGORY_DESC: {
        type: Sequelize.STRING
    }
});


module.exports = {
    currentEmploymentStatusList: currentEmploymentStatusList,
    legalAppType: legalAppType,
    skillCategoryList: skillCategoryList,
}