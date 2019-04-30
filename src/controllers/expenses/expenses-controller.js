/**
 *  -------Import all classes and packages -------------
 */

import accountModel from '../../models/accounts/accounts-model';
import ExpensesModel from '../../models/expenses/expenses-model';
import CrudOperationModel from '../../models/common/crud-operation-model';
import EmailModel from '../../models/emails/emails-model';

// call all entities 
import { ProjectDetails } from "../../entities/index";

import ExpensesValidation from '../../validations/expenses/expenses-validation';

import responseFormat from '../../core/response-format';
import configContainer from '../../config/localhost';
import logger from '../../core/logger';
import CommonMethods from '../../core/common-methods';
import enums from '../../core/enums';
import async from 'async';
import moment from 'moment';

/**
 *  -------Initialize global variabls-------------
 */
let config = configContainer.loadConfig(),
    commonMethods = new CommonMethods(),
    expensesValidation = new ExpensesValidation(),
    expensesModel = new ExpensesModel(),
    crudOperationModel = new CrudOperationModel();

const emailModel = new EmailModel();

export default class ExpensesController {
    constructor() {
        //
    }
    /**
         * Get Expenses list
         * @param {*} req : HTTP request argument
         * @param {*} res : HTTP response argument
         * @param {*} next : Callback argument
         */
    getExpenses(req, res, next) {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId,
            response = responseFormat.createResponseTemplate();

        if (!employeeDetailsId) {
            response = responseFormat.getResponseMessageByCodes(['invalidAuthToken'], { code: 417 });
            res.status(200).json(response);
        } else {
            expensesModel.getExpenseList(employeeDetailsId)
                .then((expense) => {
                    response = responseFormat.getResponseMessageByCodes([''], { content: { dataList: expense } });
                    res.status(200).json(response);
                })
                .catch((error) => {
                    let resp = commonMethods.catchError('expenses-controller/getExpenses', error);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                })
        }
    }

    /**
         * save expenses
         * @param {*} req : HTTP request argument
         * @param {*} res : HTTP response argument
         * @param {*} next : Callback argument
         */
    postExpenses(req, res, next) {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId,
            response = responseFormat.createResponseTemplate(),
            msgCode = [];
        let reqData = {
            projectDetailId: req.body.projectDetailId,
            expenseFromDate: req.body.expenseFromDate,
            expenseToDate: req.body.expenseToDate,
            billableToClient: req.body.billableToClient,
            expenseAmount: req.body.expenseAmount,
            fileName: req.body.fileName,
            file: req.body.file,
            description: req.body.description
        };

        let expenseVars = enums.uploadType.expenseDocument;
        let projectDetails = {};
        msgCode = expensesValidation.expenseValidation(reqData, employeeDetailsId, expenseVars.allowedExt);

        if (msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        } else {
            accountModel.getUserById(employeeDetailsId)
                .then((isUsers) => {
                    if (isUsers) {

                        async.series([
                            function (done) {
                                if (req.body.projectDetailId) {
                                    //check project is related to employee or not
                                    crudOperationModel.findModelByCondition(ProjectDetails,
                                        {
                                            projectDetailId: ~~req.body.projectDetailId,
                                            employeeDetailsId: ~~employeeDetailsId
                                        })
                                        .then((details) => {
                                            if (details) {
                                                projectDetails = details;
                                                done();
                                            }
                                            else {
                                                response = responseFormat.getResponseMessageByCodes(['projectDetailId'], { code: 417 });
                                                res.status(200).json(response);
                                            }

                                        })
                                } else {
                                    done();
                                }
                            },
                            function (done) {
                                expensesModel.postAddExpenseRequest(isUsers.EmployeeDetails_Id, reqData)
                                    .then((vacationsData) => {
                                        if (vacationsData.isSuccess) {
                                            done();
                                        } else {
                                            response = responseFormat.getResponseMessageByCodes(['fileName:file'], { code: 417 });
                                            res.status(200).json(response);
                                        }
                                    })
                                    .catch((error) => {
                                        let resp = commonMethods.catchError('expenses-controller/postExpenses', error);
                                        response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                        res.status(resp.code).json(response);
                                    })
                            }
                        ],
                            function (err) {
                                if (err) {
                                    //console.log('err:', err);
                                    let resp = commonMethods.catchError('expenses-controller/postExpenses', err);
                                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                    res.status(resp.code).json(response);
                                }
                                else
                                {
                                    // email to applicant
                                    let data = [
                                            {name : "USERFIRSTNAME", value : isUsers.First_Name},
                                            {name : "PROJECTNAME", value : projectDetails.projectName},
                                            {name : "STARTDATE", value : moment(reqData.expenseFromDate).format('MM-DD-YYYY')},
                                            {name : "ENDDATE", value : moment(reqData.expenseToDate).format('MM-DD-YYYY')},
                                            {name : "CLIENTBILLABLE", value : (reqData.billableToClient == 1 ? "Yes" :"No")},
                                            {name : "AMOUNT", value : reqData.expenseAmount},
                                            {name : "DESCRIPTION", value : reqData.description},                          
                                            {name : "ACCOUNTSUPPORTNAME", value : ''},
                                            {name : "ACCOUNTSUPPORTEMAIL", value : ''},
                                            {name : "ACCOUNTSUPPORTCONTACT", value : ''}
                                        ];
                                    let options = {        
                                            mailTemplateCode : enums.emailConfig.codes.expenseRequest.code,
                                            toMail : [{mailId : isUsers.Email_Id, displayName : isUsers.First_Name, employeeId : employeeDetailsId}],                                                                    
                                            placeHolders : data                                            
                                    }

                                    emailModel.mail(options, 'expenses-controller/postExpenses applicant')
                                    .then( rs =>{ })

                                    // email to Account Support 
                                    let data_hr = [
                                            {name : "USERNAME", value : isUsers.First_Name},
                                            {name : "USEREMAILID", value : isUsers.Email_Id},
                                            {name : "PROJECTNAME", value : projectDetails.projectName},
                                            {name : "STARTDATE", value : moment(reqData.expenseFromDate).format('MM-DD-YYYY')},
                                            {name : "ENDDATE", value : moment(reqData.expenseToDate).format('MM-DD-YYYY')},
                                            {name : "CLIENTBILLABLE", value : (reqData.billableToClient == 1 ? "Yes" :"No")},
                                            {name : "AMOUNT", value : reqData.expenseAmount},
                                            {name : "DESCRIPTION", value : reqData.description}                                            
                                        ];
                                    let options_hr = {        
                                            mailTemplateCode : enums.emailConfig.codes.supportMails.account,
                                            toMail : [{mailId : '', displayName : '', configKeyName : 'ACCOUNTSUPPORTEMAIL'}], 
                                            placeHolders : data_hr,
                                            replyToEmailid : 'SUPPORTMAILID'                                         
                                    }

                                    emailModel.mail(options_hr, 'vacation-controller/postExpenses account-mail')
                                    .then( rs =>{ })

                                    
                                    response = responseFormat.getResponseMessageByCodes(['success:expenseSuccess']);
                                    res.status(200).json(response);
                                }

                            })

                        // //check project is related to employee or not
                        // crudOperationModel.findModelByCondition(ProjectDetails,
                        //     {
                        //         projectDetailId: ~~req.body.projectDetailId,
                        //         employeeDetailsId: ~~employeeDetailsId
                        //     })
                        //     .then((details) => {
                        //         if (details) {
                        //             expensesModel.postAddExpenseRequest(isUsers.EmployeeDetails_Id, reqData)
                        //                 .then((vacationsData) => {
                        //                     if (vacationsData.isSuccess) {
                        //                         response = responseFormat.getResponseMessageByCodes(['expenseSuccess']);
                        //                         res.status(200).json(response);
                        //                     } else {
                        //                         response = responseFormat.getResponseMessageByCodes(['invalidDocType'], { code: 417 });
                        //                         res.status(200).json(response);
                        //                     }
                        //                 })
                        //                 .catch((error) => {
                        //                     logger.error('Error has occured in expenses-controller/postExpenses.', error);
                        //                     response = responseFormat.getResponseMessageByCodes(['common400'], { code: 400 });
                        //                     res.status(400).json(response);
                        //                 })
                        //         }
                        //         else {
                        //             response = responseFormat.getResponseMessageByCodes(['projectDetailId:invalidProjectDetailId'], { code: 417 });
                        //             res.status(200).json(response);
                        //         }
                        //     })

                    } else {
                        response = responseFormat.getResponseMessageByCodes(['invalidAuthToken'], { code: 417 });
                        res.status(200).json(response);
                    }
                }).catch((error) => {
                    let resp = commonMethods.catchError('expenses-controller/postExpenses getUserById ', error);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                })
        }
    }
}