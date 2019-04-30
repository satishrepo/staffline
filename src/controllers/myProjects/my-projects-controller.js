/**
 *  -------Import all classes and packages -------------
 */
import MyProjectsModel from '../../models/myProjects/my-projects-model';
import CrudOperationModel from '../../models/common/crud-operation-model';
import UserModel from '../../models/profileManagement/profile-management-model';
import JobsModel from '../../models/jobs/jobs-model';
import MyProjectValidation from '../../validations/myProjects/my-projects-validation';
import { ResumeMaster } from '../../entities/profileManagement/resume-master';
import responseFormat from '../../core/response-format';
import CommonMethods from '../../core/common-methods';
import configContainer from '../../config/localhost';
import logger from '../../core/logger';
import enums from '../../core/enums.js';
import EmailModel from '../../models/emails/emails-model';

import moment from 'moment';
import async from 'async';

// call all entities 
import { ProjectDetails, ProjectProfile, SkillRole, SkillTechnology, EmployeeDetails } from "../../entities/index";
import { APP_REF_DATA } from "../../entities/common/app-ref-data";

/**
 *  -------Initialize global variabls-------------
 */
let myProjectsModel = new MyProjectsModel(),
    config = configContainer.loadConfig(),
    userModel = new UserModel(),
    jobsModel = new JobsModel(),
    crudOperationModel = new CrudOperationModel(),
    commonMethods = new CommonMethods(),
    myProjectValidation = new MyProjectValidation();

const emailModel = new EmailModel();

export default class MyProjectsController {

    constructor() {
        //
    }
    /**
     *  Get all master look-ups data    
     */
    getLookUpdata(req, res, next) 
    {
        let response = responseFormat.createResponseTemplate();

        let respData = [{
            primaryTechnology: null,
            role: null
        }];

        async.parallel({
            primaryTechnology : function(done)
            {
                crudOperationModel.findAll(SkillTechnology)
                .then((tech) => {
                   
                    done(null,tech)
                }).catch((error) => {
                    done(error)
                });
            },
            role : function(done)
            {
                crudOperationModel.findAll(SkillRole)
                .then((role) => {
                   
                    done(null, role)
                })
                .catch((error) => {
                    done(error)
                });
            }, 
            reason : function(done)
            {
                crudOperationModel.findAllByCondition(APP_REF_DATA,
                {
                    parentId: enums.appRefParentId.projectEndReason,
                    keyId: { $ne: enums.appRefParentId.projectEndReason }
                }, [['keyId', 'reasonId'], ['keyName', 'reasonName']],['keyName', 'ASC']
                ).then(rs => {
                   
                    done(null, rs)
                })
            }
        },function(err, results) { 
            if(err)
            {
                let resp = commonMethods.catchError('my-projects-controller/getLookUpdata getRoleList', err);
                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                res.status(resp.code).json(response);
            }
            else
            {
                response = responseFormat.getResponseMessageByCodes('', { content: { dataList: [results] } });
                res.status(200).json(response);
            }
        })
    }

    /**
     * Get logged in employee current project
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */
    getCurrentProject(req, res, next) {
        let response = responseFormat.createResponseTemplate();
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        if (employeeDetailsId) {
            myProjectsModel.getEmployeeProject(employeeDetailsId, enums.employeeProjects.currentProject)
                .then((projects) => {
                    response = responseFormat.getResponseMessageByCodes('', { content: { dataList: projects } });
                    res.status(200).json(response);

                }).catch((error) => {
                    let resp = commonMethods.catchError('my-projects-controller/getCurrentProject', error);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                })
        } else {
            response = responseFormat.getResponseMessageByCodes(['invalidAuthToken'], { code: 417 });
            res.status(200).json(response);
        }
    }

    /**
     * Get logged in employee past all projects
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */
    getPastProjects(req, res, next) {
        let response = responseFormat.createResponseTemplate();
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        if (employeeDetailsId) {
            myProjectsModel.getEmployeeProject(employeeDetailsId, enums.employeeProjects.pastProject)
                .then((projects) => {
                    response = responseFormat.getResponseMessageByCodes('', { content: { dataList: projects } });
                    res.status(200).json(response);

                }).catch((error) => {
                    let resp = commonMethods.catchError('my-projects-controller/getPastProject', error);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                })
        } else {
            response = responseFormat.getResponseMessageByCodes(['invalidAuthToken'], { code: 417 });
            res.status(200).json(response);
        }
    }


    /**
     * Get Project By ProjectId
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */
    getProjectByProjectId(req, res, next) {
        let response = responseFormat.createResponseTemplate(),
            employeeDetailsId = req.tokenDecoded.data.employeeDetailsId,
            projectdetailId = req.params.projectDetailId,
            msgCode = [];

        if (!employeeDetailsId) {
            msgCode.push('invalidAuthToken');
        }
        if (!projectdetailId || !(commonMethods.isValidInteger(projectdetailId))) {
            msgCode.push('projectDetailId');
        }
        if (msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        } else {

            myProjectsModel.getProjectByProjectId(employeeDetailsId, projectdetailId)
                .then((projects) => {
                    response = responseFormat.getResponseMessageByCodes('', { content: { dataList: projects } });
                    res.status(200).json(response);

                }).catch((error) => {
                    let resp = commonMethods.catchError('my-projects-controller/getProjectByProjectId', error);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                })
        }
    }


    /**
     * Update Project by project Id
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */
    putUpdateProject(req, res, next) {

        let response = responseFormat.createResponseTemplate(),
            employeeDetailsId = req.tokenDecoded.data.employeeDetailsId,
            msgCode = [],
            reqBody = {
                projectDetailId: req.body.projectDetailId,
                employeeDetailsId: employeeDetailsId,
                projectDuration: req.body.projectDuration,
                projectDescription: req.body.projectDescription,
                technologyId: req.body.technologyId,
                roleId: req.body.roleId,
                managerName: req.body.managerName,
                managerTitle: req.body.managerTitle,
                managerEmail: req.body.managerEmail,
                managerOffPhone: req.body.managerOffPhone,
                specialComments: req.body.specialComments,
                assignmentid: 0
            }

        msgCode = myProjectValidation.updateProjectValidation(reqBody);
        if (msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        } else {
            myProjectsModel.getProjectByProjectId(employeeDetailsId, reqBody.projectDetailId)
                .then((isprojects) => {
                    if (isprojects && isprojects.length) {
                        /**
                         * Save records in ProjectDetails and projectprofile table
                         */
                        async.series([
                            function (done) {
                                let condition = { employeeDetailsId: employeeDetailsId, projectDetailId: reqBody.projectDetailId };
                                crudOperationModel.saveModel(ProjectDetails, reqBody, condition)
                                    .then(projectDetails => {
                                        reqBody.assignmentid = projectDetails.projectId;
                                        done()
                                    }).catch((error) => {
                                        let resp = commonMethods.catchError('my-projects-controller/putUpdateProject  update ProjectDetails process', error);
                                        response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                        res.status(resp.code).json(response);
                                    })
                            },
                            function (done) {
                                let condition = { assignmentid: reqBody.assignmentid };
                                crudOperationModel.saveModel(ProjectProfile, reqBody, condition)
                                    .then(projectProfile => {
                                        done();
                                    }).catch((error) => {
                                        let resp = commonMethods.catchError('my-projects-controller/putUpdateProject  update ProjectDetails process', error);
                                        response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                        res.status(resp.code).json(response);
                                    })
                            }
                        ],
                            function (error) {
                                if (error) {
                                    let resp = commonMethods.catchError('my-projects-controller/putUpdateProject  update ProjectDetails process.', error);
                                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                    res.status(resp.code).json(response);
                                }
                                response = responseFormat.getResponseMessageByCodes(['success:saved']);
                                res.status(200).json(response);

                            })
                    } else {
                        response = responseFormat.getResponseMessageByCodes(['projectDetailId'], { code: 417 });
                        res.status(200).json(response);
                    }

                }).catch((error) => {
                    let resp = commonMethods.catchError('my-projects-controller/putUpdateProject  getProjectByProjectDetailId process', error);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                })
        }
    }


    /**
     * Project Ending Update to recruiter and support
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */


    informToAm(req, res, next)
    {
        let response = responseFormat.createResponseTemplate(),
            employeeDetailsId = req.tokenDecoded.data.employeeDetailsId,
            projectDetailId = req.body.projectDetailId,
            projectEndDate = req.body.projectEndDate,
            reasonId = req.body.reasonId,
            comment = req.body.comment,
            msgCode = [];


        if (!projectDetailId || !(commonMethods.isValidInteger(projectDetailId))) {
            msgCode.push('projectDetailId');
        }
        if (!projectEndDate || !(commonMethods.isValidDate(projectEndDate))) {
            msgCode.push('projectEndDate');
        }
        if (!reasonId) {
            msgCode.push('reasonId:validReason');
        }


        if (msgCode.length) 
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        } 
        else 
        {
            
            myProjectsModel.getProjectByProjectId(employeeDetailsId, projectDetailId)
            .then( dtl => { 
                if(dtl.length)
                { 
                    
                    let endReason = {
                        assignmentid : dtl[0].projectId,
                        projectEndDate : projectEndDate,
                        projectEndReason : reasonId,
                        projectEndComments : comment,
                        modifiedBy : employeeDetailsId,
                        modifiedDate : new Date()
                    };
        
                    crudOperationModel.saveModel(ProjectProfile, endReason, {assignmentid : dtl[0].projectId})
                    .then( rs => {

                        // Check if all acrive project end request raised 
                        myProjectsModel.getEmployeeProject(employeeDetailsId, 1)
                        .then( prjs => {
                            if(prjs.length)
                            { 
                                let endDate = prjs.filter( item => {
                                    return moment(new Date(item.projectDetails.projectEndDate)).isAfter(new Date(item.projectDetails.startDate), 'day') ? item.projectDetails.projectEndDate : false; 
                                });
                                
                               if(endDate.length == prjs.length)
                               {
                                   // all projects endDateRequest raised update isNewLogin status to - New Job Seeker
                                   crudOperationModel.saveModel(EmployeeDetails, {isNewLogin : enums.newLogin.newJobSeeker}, {employeeDetailsId : employeeDetailsId})
                                   .then( rs => {

                                   })
                               }
                                
                            }
                        })
                       
                        // Send Email 
                        jobsModel.getRecruiterDetails(employeeDetailsId)
                        .then(rec => { 
                            if (rec.length) 
                            {
                                crudOperationModel.findAllByCondition(ResumeMaster, {employeeDetailsId : employeeDetailsId})
                                .then( user => {
                                    if(user.length)
                                    {
                                        // email to recruiter 
                                        let data = [
                                            {name : "RECRUITERFIRSTNAME", value : rec[0].firstName},
                                            {name : "USERNAME", value : (user[0].firstName+' '+user[0].lastName) },
                                            {name : "CANDIDATEFIRSTNAME", value : user[0].firstName},
                                            {name : "CANDIDATEEMAIL", value : user[0].emailId},
                                            {name : "PROJECTNAME", value : dtl[0].projectName},
                                            {name : "CLIENTNAME", value : dtl[0].clientName},
                                            {name : "STARTDATE", value : moment(dtl[0].startDate).format('MMMM Do YYYY')},
                                            // {name : "ENDDATE", value : (dtl[0].endDate ? moment(dtl[0].endDate).format('DD-MM-YYYY') : '' )},
                                            {name : "EMPLOYEEFULLNAME", value : (user[0].firstName+' '+user[0].lastName)},
                                            {name : "EMPLOYEEEMAIL", value : user[0].emailId},
                                            {name : "ENDDATE", value : moment(projectEndDate).format('MMMM Do YYYY')},
                                            {name : "COMMENT", value : commonMethods.nl2br(comment)},
                                        ];

                                        let options = {        
                                                mailTemplateCode : enums.emailConfig.codes.adminMails.informAm,
                                                toMail : [{mailId : rec[0].emailId, displayName : rec[0].firstName}],                                                                    
                                                placeHolders : data,
                                                ccMail : [
                                                    {"mailId":null,"displayName":null,"employeeId":null,"configKeyName":"SUPPORTMAILID"},
                                                    {"mailId":null,"displayName":null,"employeeId":null,"configKeyName":"LEGALSUPPORTEMAIL"},
                                                    {"mailId":null,"displayName":null,"employeeId":null,"configKeyName":"HRSUPPORTEMAIL"}
                                                ],
                                                
                                        }
                                    
                                        emailModel.mail(options, 'my-project-controller/informToAm ')
                                        .then( rs =>{ })

                                        response = responseFormat.getResponseMessageByCodes(['success:saved']);
                                        res.status(200).json(response);
                                    }
                                    
                                });                            
                            }
                            else
                            {
                                response = responseFormat.getResponseMessageByCodes(['noRecruiter'], { code: 417 });
                                res.status(200).json(response);
                            }
                        })
                    })
                    
                }
                else
                {
                    response = responseFormat.getResponseMessageByCodes(['projectDetailId'], { code: 417 });
                    res.status(200).json(response);
                }
            })
        

            
                
           
        }
    
    }

    
}