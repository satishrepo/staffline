/**
 *  -------Import all classes and packages -------------
 */
import accountModel from '../../models/accounts/accounts-model';
import StaticPagesModel from '../../models/staticPages/staticPages-model';
import responseFormat from '../../core/response-format';
import configContainer from '../../config/localhost';
import logger from '../../core/logger';
import EmailModel from '../../models/emails/emails-model';
import CommonMethods from '../../core/common-methods';
import PayrollsValidation from '../../validations/payrolls/payrolls-validation';
import enums from '../../core/enums';


/**
 *  -------Initialize global variabls-------------
 */
let staticPagesModel = new StaticPagesModel(),
    config = configContainer.loadConfig(),
    commonMethods = new CommonMethods(),
    payrollsValidation = new PayrollsValidation();


export default class PayrollsController {
    constructor() {
        //
    }

    /**
     * Get payroll  static page
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */
    getPayrollsInfo(req, res, next) {
        let response = responseFormat.createResponseTemplate(),
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
                        staticPagesModel.getStaticPage(enums.pageReferenceId.payrollInfo)
                            .then((payrollInfo) => {
                                response = responseFormat.getResponseMessageByCodes('', { content: { dataList: payrollInfo } });
                                res.status(200).json(response);
                            })
                            .catch((error) => {

                                let resp = commonMethods.catchError('payroll-controller/getPayrollInfo', error);
                                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                res.status(resp.code).json(response);
                            })
                    } else {
                        response = responseFormat.getResponseMessageByCodes(['invalidAuthToken'], { code: 417 });
                        res.status(200).json(response);
                    }

                }).catch((error) => {
                    let resp = commonMethods.catchError('payroll-controller/getPayrollInfo', error);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                })
        }
    }

    /**
     * Get Payroll Calander static page
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */
    getPayrollsCalender(req, res, next) {
        let response = responseFormat.createResponseTemplate(),
            payrollCalenderType = req.params.payrollCalenderType,
            msgCode = [],
            employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;

        msgCode = payrollsValidation.getPayrollsCalendarValidation(employeeDetailsId, payrollCalenderType);

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
                        if (payrollCalenderType != enums.pageReferenceId.payrollCalenderWeekly && payrollCalenderType != enums.pageReferenceId.payrollCalenderBiweekly && payrollCalenderType != enums.pageReferenceId.payrollCalenderBimonthly) {
                            response = responseFormat.getResponseMessageByCodes(['payrollcalendertype'], { code: 417 });
                            res.status(200).json(response);
                        } else {
                            staticPagesModel.getStaticPage(payrollCalenderType)
                                .then((isCalenderType) => {
                                    if (isCalenderType) {
                                        response = responseFormat.getResponseMessageByCodes('', { content: { dataList: isCalenderType } });
                                        res.status(200).json(response);
                                    }
                                })
                                .catch((error) => {

                                    let resp = commonMethods.catchError('payroll-controller/getPayrollCalender', error);
                                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                    res.status(resp.code).json(response);
                                });
                        }
                    }
                })
                .catch((error) => {
                    let resp = commonMethods.catchError('payroll-controller/getPayrollCalender', error);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                });
        }
    }

    getPayrollsCalender(req, res, next) 
    {
        let response = responseFormat.createResponseTemplate(),
            payrollCalenderType = req.params.payrollCalenderType,
            msgCode = [],
            employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;

        msgCode = payrollsValidation.getPayrollsCalendarValidation(employeeDetailsId, payrollCalenderType);

        if (msgCode.length) 
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        } 
        else 
        {
          
            staticPagesModel.getPayrollCalender(payrollCalenderType, new Date().getFullYear())
            .then((data) => {
                response = responseFormat.getResponseMessageByCodes('', { content: { dataList: data } });
                res.status(200).json(response);
            })
            .catch((error) => {
                let resp = commonMethods.catchError('payroll-controller/getPayrollCalender', error);
                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                res.status(resp.code).json(response);
            });
        }
    }
}