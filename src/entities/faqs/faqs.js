/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define FAQMaster model -------------
 */

const FaqMaster = dbContext.define('FAQs', {
    FAQ_ID: {
        type: Sequelize.INTEGER
    },
    FAQ_Subject: {
        type: Sequelize.STRING
    },
    FAQ_Detail: {
        type: Sequelize.TEXT
    },
    FAQ_TYPE : {
        type: Sequelize.CHAR
    },
    FAQ_DISPLAYDOC : {
        type : Sequelize.BOOLEAN
    }

});

module.exports = {  
    FaqMaster: FaqMaster
}