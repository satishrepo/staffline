/**
 *  -------Import all classes and packages -------------
 */
import configContainer from "../../config/localhost";
import { dbContext, Sequelize } from "../../core/db";
import enums from '../../core/enums';


/**
 *  -------Initialize global variabls-------------
 */

let config = configContainer.loadConfig();

export default class LcaModel {

    constructor() {
        //
    }
    getAllLcaFiling(pjEmployeeId) {

        let lcaVars = enums.uploadType.LCADocuments;

        let query = "EXEC API_SP_GetLca @PJEmployee_Id=\'" + pjEmployeeId + "\'";
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                let lcaFiling = [];
                if (details.length) {
                    details.forEach(function (element) {
                        lcaFiling.push({
                            validityFrom: element.Validity_From,
                            validityTo: element.Validity_To,
                            stateId: element.State,
                            state: element.State_Name,
                            employeeId: element.Employee_Id,
                            city: element.City,
                            country: element.Country,
                            lca: element.LCA,
                            lcaDocName: element.LCA_DOC_NAME,
                            lcaDocUploadName: element.LCA_DOC_UPLOAD_NAME,
                            lcaDocPath: config.portalHostUrl + config.documentBasePath + lcaVars.path + '/' + element.LCA_DOC_UPLOAD_NAME
                        })

                    });
                }
                return lcaFiling;
            })
    }
}