import DemoModel from '../../models/demo/demo-model';
import responseFormat from '../../core/response-format';
import configContainer from '../../config/localhost';
import logger from '../../core/logger';
import lodash from 'lodash';
import Q from 'q';
import path from 'path';
import enums from '../../core/enums';
import ProfileManagementValidation from '../../validations/profileManagement/profile-management-validation';

/**
 *  -------Initialize global variabls-------------
 */
const REDIS_LOOKUPS_KEY = 'profileLookup';
let demoModel = new DemoModel(),
  config = configContainer.loadConfig(),
  profileManagementValidation = new ProfileManagementValidation();

export default class DemoController {
  constructor() {
  }

  editDemo(req, res, next) {
    let response = responseFormat.createResponseTemplate(),
      msgCode = [],
      employeeDetailsId = req.tokenDecoded.data.employeeDetailsId,
      details = req.body;
     return demoModel.getEmployeeContactDetailsByEmployeeDetailsId(employeeDetailsId,details)
       .then((response)=>{
         //console.log('emp data ' , response);

         res.status(200).json('success');
       })
       .catch((error)=>{
         //console.log('emp error ' , error);
         response = responseFormat.getResponseMessageByCodes(['common400'], { code: 400 });
         res.status(400).json(response);
        //  res.status(400).json('error');
       })
  }
}
