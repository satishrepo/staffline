/**
 *  -------Import all classes and packages -------------
 */
import express from 'express';
import RegionsController from '../../controllers/regions/regions-controller.js';

/**
 *  -------Initialize global variabls-------------
 */
let app = express();
let router = express.Router();
let regionsController = new RegionsController();

/**
 *  -------Declare all routes-------------
 */
let routerGetCountry = router.route('/regions/country');
let routerGetStateByCountryId = router.route('/regions/state/:countryId');
let routerGetCityByStateId = router.route('/regions/city/:stateId');
let routerPostLocationBySearch = router.route('/regions/location/search');

/**
 *  ------ Bind all routes with related controller method-------------
 */
routerGetCountry
    .get(regionsController.getCountry.bind(regionsController));

routerGetStateByCountryId
    .get(regionsController.getStateByCountryId.bind(regionsController));

routerGetCityByStateId
    .get(regionsController.getCityByStateId.bind(regionsController));

routerPostLocationBySearch
    .post(regionsController.getLocationBySearch.bind(regionsController));


module.exports = router;

