/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define SearchParameter model -------------
 */
const SearchParameter = dbContext.define('SearchParameter', {
    searchParameterId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "SearchParameter_Id"
    },
    searchName: {
        type: Sequelize.STRING,
        field: "SearchName"
    },
    searchParameter: {
        type: Sequelize.STRING,
        field: "SearchParameter"
    },
    searchParamType: {
        type: Sequelize.INTEGER,
        field: "SearchParamType"
    },
    searchPage: {
        type: Sequelize.STRING,
        field: "SearchPage"
    },
    webSiteURLName: {
        type: Sequelize.INTEGER,
        field: "WebSiteURLName"
    },
    status: {
        type: Sequelize.INTEGER,
        field: "Status"
    },
    createdBy: {
        type: Sequelize.INTEGER,
        field: "Created_By"
    },
    createdDate: {
        type: Sequelize.DATE,
        field: "Created_Date",
        defaultValue: new Date()

    }
});

module.exports = {
    SearchParameter: SearchParameter
}