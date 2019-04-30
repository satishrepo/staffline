/**
 *  -------Import all classes and packages -------------
 */
import accountModel from '../../models/accounts/accounts-model';
import DashboardModel from '../../models/dashboard/dashboard-model';
import responseFormat from '../../core/response-format';
import configContainer from '../../config/localhost';
import logger from '../../core/logger';
import EmailModel from '../../models/emails/emails-model';
import CommonMethods from '../../core/common-methods';
import DashboardValidation from '../../validations/dashboards/dashboards-validation';
import enums from '../../core/enums';
import CrudOperationModel from '../../models/common/crud-operation-model';
import { BMsgRecipient } from '../../entities/dashboard/broadcast-message-recipient'
import { EmployeeDetails } from '../../entities';

import async from 'async';

/**
 *  -------Initialize global variabls-------------
 */
let dashboardModel = new DashboardModel(),
    config = configContainer.loadConfig(),
    commonMethods = new CommonMethods(),
    crudOperationModel = new CrudOperationModel(),
    dashboardValidation = new DashboardValidation();


export default class DashboardController {
    constructor() {
        //
    }

    /**
     * Get logged in employee dashboard data
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */
    getDashboardData(req, res, next) {
        let response = responseFormat.createResponseTemplate(),
            msgCode = [],
            employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;

        if (!employeeDetailsId) {
            response = responseFormat.getResponseMessageByCodes(['invalidAuthToken'], { code: 417 });
            res.status(200).json(response);
        } else {
            /**
             * check id exists
             */
            accountModel.getUserById(employeeDetailsId)
                .then((isUsers) => {
                    if (isUsers) {
                        dashboardModel.getDashboardData(employeeDetailsId)
                            .then((userDashboard) => {
                                response = responseFormat.getResponseMessageByCodes('', { content: { dataList: userDashboard } });
                                res.status(200).json(response);
                            })
                            .catch((error) => {
                                let resp = commonMethods.catchError('dashboard-controller/getDashboardData', error);
                                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                res.status(resp.code).json(response);
                            })
                    } else {
                        response = responseFormat.getResponseMessageByCodes(['invalidAuthToken'], { code: 417 });
                        res.status(200).json(response);
                    }

                }).catch((error) => {
                    let resp = commonMethods.catchError('dashboard-controller/getDashboardData', error);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                })
        }
    }

    /**
     * Get logged in employee dashboard time card data
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */
    getDashboardTimeCardData(req, res, next) {
        let response = responseFormat.createResponseTemplate(),
            msgCode = [],
            employeeDetailsId = req.tokenDecoded.data.employeeDetailsId,
            toDate = req.body.toDate,
            fromDate = req.body.fromDate;

        msgCode = dashboardValidation.dashboardTimecardValidation(req.body, employeeDetailsId);

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
                        let currentDate = new Date(),
                            prevDate = new Date();
                        toDate = (!toDate) ? new Date() : new Date(toDate);

                        if (!fromDate) {
                            fromDate = new Date(commonMethods.prevMonthFirstDate(toDate));
                        } else {
                            fromDate = new Date(fromDate);
                        } if (fromDate.getFullYear().toString().length != 4) {
                            response = responseFormat.getResponseMessageByCodes(['fromDate:date'], { code: 417 });
                            res.status(200).json(response);
                        } else if (toDate.getFullYear().toString().length != 4) {
                            response = responseFormat.getResponseMessageByCodes(['toDate:date'], { code: 417 });
                            res.status(200).json(response);
                        } else {
                            toDate = toDate.getFullYear() + '-' + (toDate.getMonth() + 1) + '-' + toDate.getDate();
                            fromDate = fromDate.getFullYear() + '-' + (fromDate.getMonth() + 1) + '-' + fromDate.getDate();

                            if (fromDate > toDate) {
                                response = responseFormat.getResponseMessageByCodes(['fromDate:date'], { code: 417 });
                                res.status(200).json(response);
                            } else {
                                dashboardModel.getDashboardTimeCardData(employeeDetailsId, fromDate, toDate)
                                    .then((timecard) => {
                                        response = responseFormat.getResponseMessageByCodes('', { content: { dataList: timecard } });
                                        res.status(200).json(response);
                                    })
                                    .catch((error) => {
                                        let resp = commonMethods.catchError('dashboard-controller/getDashboardTimecardData', error);
                                        response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                        res.status(resp.code).json(response);
                                    })
                            }
                        }
                    } else {
                        response = responseFormat.getResponseMessageByCodes(['invalidAuthToken'], { code: 417 });
                        res.status(200).json(response);
                    }
                }).catch((error) => {
                    let resp = commonMethods.catchError('dashboard-controller/getDashboardTimecardData', error);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                })
        }
    }

    /**
     * Send contactUs Email
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */
    postContactUs(req, res, next) {

        let response = responseFormat.createResponseTemplate(),
            employeeDetailsId = req.tokenDecoded.data.employeeDetailsId,
            content = req.body.content,
            msgCode = [];

        msgCode = dashboardValidation.contactUsValidation(req.body, employeeDetailsId);


        if (msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        } else {
            accountModel.getUserById(employeeDetailsId)
                .then((details) => {
                    if (details) {
                        let fromEmail = details.Email_Id,
                            firstName = details.First_Name,
                            lastName = details.Last_Name;

                        const emailModel = new EmailModel();
                        /**
                         * send email
                         */
                        emailModel.sendMail(enums.emailTemplateEvents.emailDashboardContactUs, firstName, config.contactUsToEmail, null, null, null, null, content.replace(/''/g, "'"), lastName, fromEmail);
                        response = responseFormat.getResponseMessageByCodes(['success:contactUsSuccess']);
                        res.status(200).json(response);
                    } else {

                        let resp = commonMethods.catchError('expenses-controller/postExpenses');
                        response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                        res.status(resp.code).json(response);
                    }
                }).catch((error) => {
                    let resp = commonMethods.catchError('dashboard-controller/postContactUs', error);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                })
        }
    }


    getBroadcast(req, res, next)
    {
        let response = responseFormat.createResponseTemplate();
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let msgCode = [];
        let messageTypeId = req.body.messageTypeId || 0;

        let data = {};

        async.series([

            function(done)
            {
                dashboardModel.getBroadcastMessages(employeeDetailsId, messageTypeId)
                .then( rs => {
                    data = rs;
                    done(null)
                })
            },
            function(done)
            {
                dashboardModel.checkIsNewLogin(employeeDetailsId)
                .then( rs => {
                    data['showWelcomeMessage'] = rs;
                    done(null)
                })
            }

        ], function(err, result)
        {
            if(err)
            {
                let resp = commonMethods.catchError('dashboard-controller/getBroadcast', err);
                response.statusCode = resp.code;
                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                res.status(200).json(response);
            }
            else
            { 
                // update user NewLogin Status
                crudOperationModel.saveModel(EmployeeDetails, {isNewLogin : -1}, {employeeDetailsId : employeeDetailsId})
                .then( rs => {
                    
                })
               
                // let rs = result.broadcast;
                // rs['showWelcomeMessage'] = result.newEmployee;
                response = responseFormat.getResponseMessageByCodes('', { content: { dataList: [data] } });
                res.status(200).json(response);
            }
        })
        
        /* dashboardModel.getBroadcastMessages(employeeDetailsId, messageTypeId)
        .then( rs => {
            response = responseFormat.getResponseMessageByCodes('', { content: { dataList: [rs] } });
            res.status(200).json(response);
        }) */
    }


    updateBroadcast(req, res, next)
    {
        let response = responseFormat.createResponseTemplate();
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let msgCode = [];
        let messageId = req.body.messageId || 0;
        
        if(messageId == 0)
        {
            msgCode.push('messageId');
        }

        if(msgCode.length)
        {
            msgCode.push('messageId');
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else
        {
            crudOperationModel.saveModel(BMsgRecipient, {readStatus : 1, readDate : new Date()}, {recipientId : employeeDetailsId, messageId : messageId})
            .then( rs => {
                response = responseFormat.getResponseMessageByCodes(['success:saved']);
                res.status(200).json(response);
            })
        }
    }


    
}