/**
 *  -------Import all classes and packages -------------
 */
import configContainer from "../../config/localhost";
import { dbContext, Sequelize } from "../../core/db";
import { ProjectDetails } from "../../entities/myProjects/project-details";
import { ProjectProfile } from "../../entities/myProjects/project-profile";

/**
 *  -------Initialize global variabls-------------
 */
let config = configContainer.loadConfig();

export default class MyProjectsModel {

    constructor() {
        //
    }

    /**
     * get list of employee current projects
     * @param {*} employeeDetailsId : logged in employee details id
     * @param {*} isCurrentProject : status of project if it is current or nor (0 or 1)
     */
    getEmployeeProject(employeeDetailsId, isCurrentProject) {
        let query = "EXEC API_SP_GetEmployeeProjects @EmployeeDetailsId=\'" + employeeDetailsId + "\', @IsCurrentProject=\'" + isCurrentProject + "\' ";
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((proj) => {
                let projects = [], projectDetails = {}, managerDetails = {};
                if (proj.length) {
                    proj.forEach(function (item) {
                        projectDetails = {
                            projectDetailId: item.projectDetailId,
                            projectId: item.projectId,
                            projectName:item.projectName,
                            startDate: item.startDate,
                            endDate:item.endDate,
                            clientName: item.clientName,
                            projectDuration: item.projectDuration,
                            projectDescription: item.projectDescription,
                            technologyId: item.technologyId,
                            technology: item.technology,
                            roleId: item.roleId,
                            role: item.role,
                            payRate:item.payRate,
                            specialComments: item.specialComments  ,
                            modifiedDate:item.modifiedDate ,
                            projectStatusId: item.projectStatusId,
                            projectStatus:item.projectStatus,
                            projectEndDate : item.projectEndDate                            
                        },
                            managerDetails = {};

                        if (item.managerName && item.managerTitle && item.managerEmail && item.managerOffPhone) {
                            managerDetails = {
                                managerName: item.managerName,
                                managerTitle: item.managerTitle,
                                managerEmail: item.managerEmail,
                                managerOffPhone: item.managerOffPhone
                            }
                        }
                        projects.push({
                            projectDetails: projectDetails,
                            managerDetails: managerDetails
                        });
                    });
                }
                return projects;
            })
    }

    /**
     * get project by project id
     * @param {*} employeeDetailsId : logged in employee details id 
     * @param {*} projectDetailId : project id
     */
    getProjectByProjectId(employeeDetailsId, projectDetailId) {
        let query = "EXEC API_SP_GetProjectByProjectDetailId @EmployeeDetailsId=\'" + employeeDetailsId + "\' "
            + ",@ProjectDetail_Id=\'" + projectDetailId + "\' ";
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((result) => {
                result = JSON.parse(JSON.stringify(result).replace(/'/g, "''").replace(/null/g, "\"\"").replace(/"\"\""/g, "\"\""));
                return result;
            })
    }

    
}