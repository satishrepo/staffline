/**
 *  -------Import all classes and packages -------------
*/
import configContainer from "../../config/localhost";
import { dbContext, Sequelize } from "../../core/db";
import { CountryList, StateList, CityList } from "../../entities/regions/regions";

/**
 *  -------Initialize global variabls-------------
 */
let config = configContainer.loadConfig();

export default class RegionModel {

    constructor() {
        //
    }
    /**
     * Get all country list
     */
    getAllCountry() {
        return CountryList.findAll({
            where: {
                IsActive: 1
            },
            attributes: [
                ["Country_Id", "countryId"],
                ["Country_Code", "countryCode"],
                ["Country_Name", "countryName"],
                ["IsActive", "isActive"]
            ]
        })
    }

    /**
     * Get all state list by country id
     * @param {*} countryId : country id
     */
    getAllStateByCountryId(countryId) {
        return StateList.findAll({
            where: [{
                Status: 1,
                Country_Id: countryId
            }],
            attributes: [
                ["State_ID", "state"],
                ["State_IEU_Id", "stateId"],
                ["Country_Id", "countryId"],
                ["State_Name", "stateName"],
                ["State_Code", "stateCode"],
                ["Status", "status"]
            ]
        })
    }

    /**
     * Get all city list by state id
     * @param {*} stateId : state id
     */
    getAllCityByStateId(stateId) {
        return CityList.findAll({
            where: [{
                Status: 1,
                State_Id: stateId
            }],
            attributes: [
                ["City_Id", "cityId"],
                ["Country_Id", "countryId"],
                ["State_Id", "stateId"],
                ["City_Name", "cityName"],
                ["Status", "status"]
            ]
        })
    }

    /**
     * get Location By Search string
     * @param {*} searchString : input search string
     */
    getLocationBySearch(searchString) {       
        let query = "EXEC API_S_uspRegions_GetLocationsSuggestion @searchString='" + searchString.trim() + "' ";
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                return details;
            });
    }



}