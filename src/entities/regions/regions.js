/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define Country_Master model -------------
 */
const CountryList = dbContext.define('Country_Master', {
    countryId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: false,
        field: "Country_Id"
    },
    countryCode: {
        type: Sequelize.STRING,
        field: "Country_Code"
    },
    countryName: {
        type: Sequelize.STRING,
        field: "Country_Name"
    },
    isActive: {
        type: Sequelize.INTEGER,
        field: "IsActive"
    }
    // Dialing_Code: {
    //     type: Sequelize.STRING
    // },
    // Sorting_Order: {
    //     type: Sequelize.INTEGER
    // },

});

/**
 *  -------Define State_Master model -------------
 */
const StateList = dbContext.define('State_Master', {
    stateId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: false,
        field: "State_ID"
    },
    countryId: {
        type: Sequelize.INTEGER,
        field: "Country_Id"
    },
    stateName: {
        type: Sequelize.STRING,
        field: "State_Name"
    },
    stateCode: {
        type: Sequelize.STRING,
        field: "State_Code"
    },
    status: {
        type: Sequelize.INTEGER,
        field: "Status"
    }
    // Time_Zone: {
    //     type: Sequelize.STRING
    // },  

    // State_IEU_Id: {
    //     type: Sequelize.INTEGER
    // }
});

/**
 *  -------Define City_Master model -------------
 */
const CityList = dbContext.define('City_Master', {
    cityId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: false,
        field: "City_Id"
    },
    countryId: {
        type: Sequelize.INTEGER,
        field: "Country_Id"
    },
    stateId: {
        type: Sequelize.INTEGER,
        field: "State_Id"
    },
    cityName: {
        type: Sequelize.STRING,
        field: "City_Name"
    },
    status: {
        type: Sequelize.INTEGER,
        field: "Status"
    }
    // Langitude: {
    //     type: Sequelize.STRING
    // },
    // Latitude: {
    //     type: Sequelize.STRING
    // },
    // IEU_Id: {
    //     type: Sequelize.INTEGER
    // }
});

module.exports = {
    CountryList: CountryList,
    CityList: CityList,
    StateList: StateList,
}