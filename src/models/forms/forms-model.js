/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from "../../core/db";
import configContainer from "../../config/localhost";
import logger from "../../core/logger";
import enums from '../../core/enums.js';

/**
 *  -------Initialize global variabls-------------
 */
let config = configContainer.loadConfig();

export default class FormsModel {

    constructor() {
        //
    }

    /**
     * get forms list by department Code
     * @param {*} deptName : Department Name
     * @param {*} employeeDetailsId : EmployeeId of logged-in user
     */
    getFormsByDeptName(deptName, employeeDetailsId) {
        let query = "EXEC API_SP_GetFormsList @Dept_Name=\'" + deptName + "\', @Employee=\'" + employeeDetailsId + "\'";
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                let formDetails = [];
                if (details.length) {
                    details.forEach(function (item) {
                        let serverURL = config.portalHostUrl + config.documentBasePath + "/" + enums.downloadForms.downloadFormSubFolder + "/" + item.FileName;
                        formDetails.push({
                            formId: item.FormID,
                            formName: item.FormName,
                            description: item.Description,
                            deptCode: item.Dept_Code,
                            deptName: item.Dept_Name,
                            updateDate: item.UpdateDate,
                            formSize: item.FormSize,
                            deptEmail: item.Dept_Email,
                            fileName: item.FileName,
                            filePathUrl: serverURL
                        })
                    })
                }

                return formDetails;
            })
    }
}