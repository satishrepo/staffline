/**
 *  -------Import all classes and packages ------------
 */

import configContainer from "../../config/localhost";
import { dbContext, Sequelize } from "../../core/db";
import enums from '../../core/enums';
import CommonMethods from "../../core/common-methods";
import { InvoiceExpenseEntry } from "../../entities/expenses/invoice-expense-entry";
import path from 'path';
import logger from '../../core/logger';

/**
 *  -------Initialize global variables-------------
 */
let config = configContainer.loadConfig();

export default class ExpensesModel {

    constructor() {
        //
    }

    /**
     * get expense list
     */
    getExpenseList(employeeDetailsId) {
        let query = "EXEC API_SP_GetExpenseList @EmployeeDetails_Id = \'" + employeeDetailsId + "\' ";

        let expenseVars = enums.uploadType.expenseDocument;

        let docPath = config.portalHostUrl + config.documentBasePath + expenseVars.path + '/';

        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                details.forEach(item => {
                    item.documentExpenseFileLocation = docPath + item.documentExpenseName;
                    item.documentExpenseName = item.originalFileName || item.documentExpenseName;
                    delete item.originalFileName;
                    delete item.documentExpenseLocation;
                })
                return details;
            })
    }


    /**
    * post expense request
    * @param {*} pjEmployeeId 
    * @param {*} reqData 
    */
    postAddExpenseRequest(employeeDetailsId, reqData) {

        let commonMethods = new CommonMethods();
        let folderName = enums.subFolders.expenses,
            timestamp = new Date().getTime(),
            response = {};

        let expenseVars = enums.uploadType.expenseDocument;

        if (reqData.fileName && reqData.file) {

            let fileName = reqData.fileName,
                file = reqData.file;

            return new Promise(function (resolve, reject) {
                commonMethods.fileUpload(file, fileName, expenseVars.docTypeId)
                    .then((docFileUpload) => {
                        if (docFileUpload.isSuccess) {
                            // reqData.file = fileUpload.filePath;
                            return InvoiceExpenseEntry.create({
                                employeeDetailsId: employeeDetailsId,
                                projectDetailId: reqData.projectDetailId,
                                expenseFromDate: reqData.expenseFromDate,
                                expenseToDate: reqData.expenseToDate,
                                billTo: reqData.billableToClient,
                                expenseAmount: reqData.expenseAmount,
                                documentExpenseName: docFileUpload.fileName,
                                originalFileName: fileName,
                                // documentExpenseLocation: fileName,
                                expenseDescription: reqData.description,
                                createdBy: employeeDetailsId,
                                createdDate: new Date()
                            })
                                .then((result) => {
                                    result.isSuccess = true;
                                    return resolve(result);
                                }).catch((error) => {
                                    error.isSuccess = false;
                                    return reject(error);
                                })
                        } else {
                            response.isSuccess = docFileUpload.isSuccess;
                            response.msgCode = docFileUpload.msgCode[0];
                            return resolve(response);
                        }
                    })
                    .catch((error) => {
                        let resp = commonMethods.catchError('expenses-model/postAddExpenseRequest docFileUpload process', error);
                        response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                        res.status(resp.code).json(response);
                    })
            })
        }
    }
}
