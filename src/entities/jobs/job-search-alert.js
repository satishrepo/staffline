/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define JobSearchAlert model -------------
 */
const JobSearchAlert = dbContext.define('JobSearchAlert', {
    jobSearchAlertId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "JobSearchAlert_Id"
    },
    searchName: {
        type: Sequelize.STRING,
        field: "SearchName"
    },
    searchParameter: {
        type: Sequelize.STRING,
        field: "SearchParameter"
    },
    searchParameterHashData: {
        type: Sequelize.STRING,
        field: "SearchParameter_HashData"
    },
    isAlert: {
        type: Sequelize.BOOLEAN,
        field: "isAlert"
    },
    createdBy: {
        type: Sequelize.BOOLEAN,
        field: "Created_By"
    },
    createdDate: {
        type: Sequelize.DATE,
        field: "Created_Date",
        defaultValue: new Date()

    }
});

module.exports = {
    JobSearchAlert: JobSearchAlert
}