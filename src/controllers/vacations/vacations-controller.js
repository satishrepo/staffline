/**
 *  -------Import all classes and packages -------------
 */
import accountModel from '../../models/accounts/accounts-model';
import VacationsModel from '../../models/vacations/vacations-model';
import responseFormat from '../../core/response-format';
import configContainer from '../../config/localhost';
import logger from '../../core/logger';
import CommonMethods from '../../core/common-methods';
import enums from '../../core/enums';
import VacationValidation from '../../validations/vacations/vacations-validation';
import EmailModel from '../../models/emails/emails-model';
import moment from 'moment';

/**
 *  -------Initialize variabls-------------
*/
let config = configContainer.loadConfig(),
    vacationsModel = new VacationsModel(),
    commonMethods = new CommonMethods(),
    vacationValidation = new VacationValidation();

const emailModel = new EmailModel();


export default class VacationsController {
    constructor() {
        //
    }

    /**
     * Get all vacations list
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */
    getVacationsRequest(req, res, next) {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId,
            response = responseFormat.createResponseTemplate(),
            msgCode = [];

        if (!employeeDetailsId) {
            msgCode.push('invalidAuthToken');
        }
        if (msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        } else {

            /**
             * check id exists
             */
            accountModel.getUserById(employeeDetailsId)
                .then((isUsers) => {/**/
                    if (isUsers) {
                        vacationsModel.getAllVacationsRequests(isUsers.PJEmployee_Id)
                            .then((vacations) => {
                                response = responseFormat.getResponseMessageByCodes('', { content: { dataList: vacations } });
                                res.status(200).json(response);
                            })
                            .catch((error) => {
                                let resp = commonMethods.catchError('vacations-controller/getUserById.', error);
                                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                res.status(resp.code).json(response);
                            })
                    } else {
                        response = responseFormat.getResponseMessageByCodes(['invalidAuthToken'], { code: 417 });
                        res.status(200).json(response);
                    }

                }).catch((error) => {
                    let resp = commonMethods.catchError('vacations-controller/getVacationsRequest.', error);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                })
        }
    }

    /**
     * post new vacation request
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */
    postAddVacations(req, res, next) {

        let response = responseFormat.createResponseTemplate(),
            msgCode = [],
            employeeDetailsId = req.tokenDecoded.data.employeeDetailsId,
            reqData = {
                fromDate: req.body.fromDate,
                toDate: req.body.toDate,
                reason: req.body.reason,
                contactInfo: req.body.contactInfo,
                joinSameClient: req.body.joinSameClient
            };

        msgCode = vacationValidation.addVacationsValidation(reqData, employeeDetailsId);
        if (msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        } else {

            /**
             * check id exists
             */
            accountModel.getUserById(employeeDetailsId)
                .then((isUsers) => { 
                    if (isUsers) {
                        if (isUsers.Employee_Type != enums.employeeType.jobSeeker) {

                            vacationsModel.postAddVacations(isUsers.PJEmployee_Id, reqData)
                                .then((vacationsData) => {

                                    // email to applicant
                                    let data = [
                                            {name : "USERFIRSTNAME", value : isUsers.First_Name},
                                            {name : "STARTDATE", value : moment(reqData.fromDate).format('MM-DD-YYYY')},
                                            {name : "ENDDATE", value : moment(reqData.toDate).format('MM-DD-YYYY')},
                                            {name : "REASON", value : reqData.reason},
                                            {name : "SAMECLIENT", value : (reqData.joinSameClient == 1 ? 'Yes':'No')},
                                            {name : "CONTACTDETAILS", value : commonMethods.toUSFormat(reqData.contactInfo) },
                                            {name : "HRSUPPORTNAME", value : ''},
                                            {name : "HRSUPPORTEMAIL", value : ''},
                                            {name : "HRSUPPORTCONTACT", value : ''}
                                        ];
                                    let options = {        
                                            mailTemplateCode : enums.emailConfig.codes.vacationRequest.code,
                                            toMail : [{mailId : isUsers.Email_Id, displayName : isUsers.First_Name, employeeId : employeeDetailsId }],                                                                    
                                            placeHolders : data,
                                            replyToEmailid : 'HRSUPPORTEMAIL'
                                    }

                                    emailModel.mail(options, 'vacation-controller/postAddVacations applicant-mail')
                                    .then( rs =>{ })


                                    // email to HR about vacation request 
                                    let data_hr = [
                                            {name : "USERFIRSTNAME", value : isUsers.First_Name},
                                            {name : "USEREMAILID", value : isUsers.Email_Id},
                                            {name : "STARTDATE", value : moment(reqData.fromDate).format('MM-DD-YYYY')},
                                            {name : "ENDDATE", value : moment(reqData.toDate).format('MM-DD-YYYY')},
                                            {name : "REASON", value : reqData.reason},
                                            {name : "SAMECLIENT", value : (reqData.joinSameClient == 1 ? 'Yes':'No')},
                                            {name : "CONTACTDETAILS", value : commonMethods.toUSFormat(reqData.contactInfo)}
                                        ];
                                    let options_hr = {        
                                            mailTemplateCode : enums.emailConfig.codes.supportMails.hr,
                                            toMail : [{mailId : '', displayName : '', configKeyName : 'HRSUPPORTEMAIL'}],                                                                    
                                            placeHolders : data_hr                                            
                                    }

                                    emailModel.mail(options_hr, 'vacation-controller/postAddVacations hr-mail')
                                    .then( rs =>{ })


                                    response = responseFormat.getResponseMessageByCodes(['success:saved']);
                                    res.status(200).json(response);
                                })
                                .catch((error) => {
                                    let resp = commonMethods.catchError('vacations-controller/postAddVacations.', error);
                                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                    res.status(resp.code).json(response);
                                })
                        } else {
                            response = responseFormat.getResponseMessageByCodes(['error:invalidEmployeeType'], { code: 417 });
                            res.status(200).json(response);
                        }
                    } else {
                        response = responseFormat.getResponseMessageByCodes(['invalidAuthToken'], { code: 417 });
                        res.status(200).json(response);
                    }
                }).catch((error) => {
                    let resp = commonMethods.catchError('vacations-controller/postAddVacations.', error);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                })
        }
    }
}