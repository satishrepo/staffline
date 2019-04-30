/**
 *  -------Import all classes and packages -------------
 */
import configContainer from "../../config/localhost";
import { dbContext, Sequelize } from "../../core/db";
import enums from '../../core/enums';
import _ from 'lodash';
import CommonMethods from '../../core/common-methods';
import logger from '../../core/logger';
import CrudOperationModel from "../common/crud-operation-model";
import fs from 'fs';
import EmailModel from '../emails/emails-model';

import { OnBoardingEnvelopes } from "../../entities/employeeonboarding/onBoarding-envelopes";

// ----------- Hellesign Object created ---------------------------

let config = configContainer.loadConfig();
let commonMethods = new CommonMethods();
let crudOperationModel = new CrudOperationModel();

const emailModel = new EmailModel();


export default class MailProviderModel {

    constructor() {
        //
    }


      

}