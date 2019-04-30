/**
 *  -------Import all classes and packages -------------
 */
import configContainer from "../../config/localhost";
import { dbContext, Sequelize } from "../../core/db";
import { BenefitMaster } from "../../entities/benefits/benefits";
import CrudOperationModel from '../common/crud-operation-model';
import enums from '../../core/enums';
/**
 *  -------Initialize global variabls-------------
 */
let config = configContainer.loadConfig();
let crudOperationModel = new CrudOperationModel();

export default class BenefitsModel {

    constructor() {
        //
    }
    /**
     * get benefits static page
     * @param {*} status 
     */
    getAllBenefits(status, showOnEmpPortal) {

        return crudOperationModel.findAllByCondition(BenefitMaster, { Status: status, ShowOnEmpPortal: showOnEmpPortal }, 
            [
                ["Benefit_Id", "benefitId"], ["Benefit_Name", "benefitName"], ["Description", "description"], ["Group_Id", "groupId"], 
                ["Form_Doc", "formDoc"], ["Support_Doc", "supportDoc"], ["Provider_Name", "providerName"], ["Provider_Address", "providerAddress"], 
                ["Start_Date", "startDate"], ["End_Date", "endDate"], ["Status", "status"], ["Created_Date", "createdDate"], ["Created_By", "createdBy"], 
                ["Benefit_Contains", "benefitContains"], ["BenefitOrder", "benefitOrder"], ["ShowOnEmpPortal", "showOnEmpPortal"],
                ["BenefitSummary_Doc", "BenefitSummaryDoc"]
            ], ["BenefitOrder", "ASC"])
        .then(function (AuthorizationStatus) {
            var basePath = config.portalHostUrl + config.documentBasePath + '/ManageBenefits/';
            if (AuthorizationStatus.length) {
                AuthorizationStatus.forEach(function (item) {
                    item.formDoc = item.formDoc ? basePath + item.formDoc : '';
                    item.supportDoc = item.supportDoc ? basePath + item.supportDoc : '';
                    item.BenefitSummaryDoc = item.BenefitSummaryDoc ? basePath + item.BenefitSummaryDoc : '';
                });
                return AuthorizationStatus;
            } else {
                return [];
            }
        });
    }

    getAllBenefitsWithoutHtml(status, showOnEmpPortal) {

        return crudOperationModel.findAllByCondition(BenefitMaster, { Status: status, ShowOnEmpPortal: showOnEmpPortal }, 
            [
                ["Benefit_Id", "benefitId"], ["Benefit_Name", "benefitName"], ["Description", "description"], ["Group_Id", "groupId"], 
                ["Form_Doc", "formDoc"], ["Support_Doc", "supportDoc"], ["Provider_Name", "providerName"], ["Provider_Address", "providerAddress"], 
                ["Start_Date", "startDate"], ["End_Date", "endDate"], ["Status", "status"], ["Created_Date", "createdDate"], ["Created_By", "createdBy"], 
                ["BenefitOrder", "benefitOrder"], ["ShowOnEmpPortal", "showOnEmpPortal"],
                ["BenefitSummary_Doc", "BenefitSummaryDoc"]
            ], ["BenefitOrder", "ASC"])
        .then(function (AuthorizationStatus) {
            var basePath = config.portalHostUrl + config.documentBasePath + '/ManageBenefits/';
            if (AuthorizationStatus.length) {
                AuthorizationStatus.forEach(function (item) {
                    item.formDoc = item.formDoc ? basePath + item.formDoc : '';
                    item.supportDoc = item.supportDoc ? basePath + item.supportDoc : '';
                    item.BenefitSummaryDoc = item.BenefitSummaryDoc ? basePath + item.BenefitSummaryDoc : '';
                });
                return AuthorizationStatus;
            } else {
                return [];
            }
        });
    }

    getAllBenefitById(benefitId, status, showOnEmpPortal) {

        return crudOperationModel.findAllByCondition(BenefitMaster, { Benefit_Id: benefitId, Status: status, ShowOnEmpPortal: showOnEmpPortal }, 
            [
                ["Benefit_Id", "benefitId"], ["Benefit_Name", "benefitName"], ["Description", "description"], ["Group_Id", "groupId"], 
                ["Form_Doc", "formDoc"], ["Support_Doc", "supportDoc"], ["Provider_Name", "providerName"], ["Provider_Address", "providerAddress"], 
                ["Start_Date", "startDate"], ["End_Date", "endDate"], ["Status", "status"], ["Created_Date", "createdDate"], ["Created_By", "createdBy"], 
                ["Benefit_Contains", "benefitContains"], ["BenefitOrder", "benefitOrder"], ["ShowOnEmpPortal", "showOnEmpPortal"],
                ["BenefitSummary_Doc", "BenefitSummaryDoc"]
            ], ["BenefitOrder", "ASC"])
        .then(function (benefitsDetails) {
            var basePath = config.portalHostUrl + config.documentBasePath + '/ManageBenefits/';
            if (benefitsDetails.length) {
                benefitsDetails.forEach(function (item) {
                    item.formDoc = item.formDoc ? basePath + item.formDoc : '';
                    item.supportDoc = item.supportDoc ? basePath + item.supportDoc : '';
                    item.BenefitSummaryDoc = item.BenefitSummaryDoc ? basePath + item.BenefitSummaryDoc : '';
                });
                return benefitsDetails;
            } else {
                return [];
            }
        });
    }

    getEmployeeBenefits(employeeDetailsId)
    {
        let query = "EXEC API_SP_GetEmployeeBenefit @employeeDetails_id=" + employeeDetailsId + " ";
        // console.log(query)
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
        .then((details) => {
            return details;
        })
    }

    get401KEmployeeBenefits(employeeDetailsId)
    {
        let query = "EXEC API_SP_Get401KEmployeeBenefit @employeeDetails_id=" + employeeDetailsId + " ";
        // console.log(query)
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
        .then((details) => {
            return details;
        })
    }

    getUserDetails(employeeDetailsId)
    {
        return new Promise( resolve => {

            let query = "EXEC API_SP_GetUserProfileById @EmployeeDetails_Id=\'" + employeeDetailsId + "\'";
    
            dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((det) => {
                return det;
            })
            .then( emp => { 
                
                let empDetails = emp[0];
                let allProjects = {};

                // delete empDetails['employeeType'];
    
                let query = "EXEC API_SP_GetEmployeeProjects @EmployeeDetailsId=\'" + employeeDetailsId + "\', @IsCurrentProject=\'" + 1 + "\' ";
    
                dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
                .then((rs) => {
                        
                    allProjects['currentProjects'] = rs;
    
                    let query1 = "EXEC API_SP_GetEmployeeProjects @EmployeeDetailsId=\'" + employeeDetailsId + "\', @IsCurrentProject=\'" + 0 + "\' ";
    
                    dbContext.query(query1, { type: dbContext.QueryTypes.SELECT })
    
                    .then((rs1) => { 
                        
                        allProjects['oldProjects'] = rs1;
                        /*
                        if([enums.employeeType.consultant, enums.employeeType.subContractor].indexOf(empDetails.employeeTypeId) > -1)
                        { 
                            if(allProjects.currentProjects.length)
                            {
                                empDetails['employeeType'] = 'Employee';
                                empDetails['project'] = {
                                    id : allProjects.currentProjects[0].projectDetailId,
                                    title : allProjects.currentProjects[0].projectName,
                                    clientName : allProjects.currentProjects[0].clientName,
                                    startDate : allProjects.currentProjects[0].startDate,
                                    endDate : allProjects.currentProjects[0].endDate
                                }
                            }
                            else if(allProjects.oldProjects.length)
                            {
                                let id = allProjects.oldProjects.length - 1;
    
                                empDetails['employeeType'] = 'Ex-Employee';
                                empDetails['project'] = {
                                    id : allProjects.oldProjects[id].projectDetailId,
                                    title : allProjects.oldProjects[id].projectName,
                                    clientName : allProjects.oldProjects[id].clientName,
                                    startDate : allProjects.oldProjects[id].startDate,
                                    endDate : allProjects.oldProjects[id].endDate
                                }
                            }
                            else
                            {
                                empDetails['employeeType'] = 'Employee';
                                empDetails['project'] = {}
                            }
                        }
                        else
                        {
                            empDetails['employeeType'] = 'Job Seeker';
                            empDetails['project'] = {}
                        }
                        */
                        resolve(empDetails);
    
                    })
                })
    
                
            })
        })
  
    }


}