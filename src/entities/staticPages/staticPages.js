/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define EmployeeContactDetails model -------------
 */
const staticPageDetails = dbContext.define('ApiStaticContent', {
    apiStaticContentId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    section: {
        type: Sequelize.STRING
    },
    contents: {
        type: Sequelize.STRING,
    },
    isActive: {
        type: Sequelize.BOOLEAN
    },
    createdBy: {
        type: Sequelize.INTEGER
    }
});


module.exports = {
    staticPageDetails: staticPageDetails,
}