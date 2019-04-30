/**
 *  -------Import all classes and packages -------------
 */
import RegionsModel from '../../models/regions/regions-model';
import responseFormat from '../../core/response-format';
import configContainer from '../../config/localhost';
import logger from '../../core/logger';

/**
 *  -------Initialize variabls-------------
 */
let config = configContainer.loadConfig(),
    regionsModel = new RegionsModel();

export default class RegionsController {
    constructor() {
        //
    }

    /**
     * Get all country list
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */
    getCountry(req, res, next) {

        let response = responseFormat.createResponseTemplate();
        regionsModel.getAllCountry()
            .then((country) => {
                response = responseFormat.getResponseMessageByCodes('', { content: { dataList: country } });
                res.status(200).json(response);
            })
            .catch((error) => {
                let resp = commonMethods.catchError('regions-controller/getCountry', error);
                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });                
                res.status(resp.code).json(response);
            })
    }

    /**
     * Get all state list by country id
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */
    getStateByCountryId(req, res, next) {
        let response = responseFormat.createResponseTemplate(),
            countryId = req.params.countryId,
            msgCode = [];

        if (!countryId) {
            msgCode.push('countryId');
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        } else {
            regionsModel.getAllStateByCountryId(countryId)
                .then((state) => {
                    response = responseFormat.getResponseMessageByCodes('', { content: { dataList: state } });
                    res.status(200).json(response);
                })
                .catch((error) => {
                    let resp = commonMethods.catchError('regions-controller/getStateByCountryId', error);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });                
                    res.status(resp.code).json(response);
                })
        }
    }

    /**
     * Get all city list by state id
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */
    getCityByStateId(req, res, next) {

        let response = responseFormat.createResponseTemplate(),
            stateId = req.params.stateId,
            msgCode = [];

        if (!stateId) {
            msgCode.push('stateId');
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        } else {
            regionsModel.getAllCityByStateId(stateId)
                .then((city) => {
                    response = responseFormat.getResponseMessageByCodes('', { content: { dataList: city } });
                    res.status(200).json(response);
                })
                .catch((error) => {
                    let resp = commonMethods.catchError('regions-controller/getCityByStateId', error);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });                
                    res.status(resp.code).json(response);
                })
        }
    }
    /**
         * Get all city and state suggestion by search string
         * @param {*} req : HTTP request argument
         * @param {*} res : HTTP response argument
         * @param {*} next : Callback argument
         */
    getLocationBySearch(req, res, next) {

        let response = responseFormat.createResponseTemplate(),
            searchString = req.body.searchString,
            msgCode = [];

        if (!searchString || searchString.length < 2) {
            msgCode.push('searchString:searchStringLocation');
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        } else {
            regionsModel.getLocationBySearch(searchString)
                .then((location) => {
                    response = responseFormat.getResponseMessageByCodes('', { content: { dataList: location } });
                    res.status(200).json(response);
                })
                .catch((error) => {
                    let resp = commonMethods.catchError('regions-controller/getLocationBySearch', error);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });                
                    res.status(resp.code).json(response);
                })
        }
    }


}