/**
 * -------Import all classes and packages -------------
 */
import lengthValidation from './expenses-length-validation';
import CommonMethods from '../../core/common-methods';
import path from 'path';
import enums from '../../core/enums';

let commonMethods = new CommonMethods();

/**
 *  -------Initialize global variabls-------------
 */
export default class ExpensesValidation {

    /**
    * validation in  expense
    * @param {*} details : data in request body
    * @param {*} employeeDetailsId : logged in employee details id
    */
    expenseValidation(details, employeeDetailsId, allowedExt) {
        let reqBody = {
            employeeDetailsId: employeeDetailsId,
            projectDetailId: details.projectDetailId,
            expenseFromDate: details.expenseFromDate,
            expenseToDate: details.expenseToDate,
            billableToClient: details.billableToClient,
            expenseAmount: details.expenseAmount,
            fileName: details.fileName,
            file: details.file,
            description: details.description
        },
            err = [];

        if (!reqBody.employeeDetailsId) {
            err.push('invalidAuthToken');
        }
        if (!(reqBody.projectDetailId) && !commonMethods.isValidNumber(reqBody.projectDetailId)) {
            err.push('projectDetailId');
        }
        if (!reqBody.expenseFromDate || !(commonMethods.isValidDate(reqBody.expenseFromDate))) {
            err.push('expenseFromDate:date');
        }
        if (!reqBody.expenseToDate || !(commonMethods.isValidDate(reqBody.expenseToDate))) {
            err.push('expenseToDate:date');
        } else if (reqBody.expenseFromDate > reqBody.expenseToDate) {
            err.push('expenseFromDate:expenseFromDateCantGeater');
        }
        if (!commonMethods.isBoolean(reqBody.billableToClient)) {
            err.push('billableToClient');
        }
        if (!reqBody.expenseAmount || !commonMethods.isValidMoney(reqBody.expenseAmount)) {
            err.push('expenseAmount');
        }
        if (!reqBody.fileName || !reqBody.file || !(commonMethods.validateFileType(reqBody.file, reqBody.fileName, allowedExt))) {
            err.push('fileName:file');
        }

        return err;
    }
}
