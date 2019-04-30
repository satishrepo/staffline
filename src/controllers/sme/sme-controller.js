/**
 *  -------Import all classes and packages -------------
 */

import EmailModel from '../../models/emails/emails-model';
//import SummaryModel from '../../models/summary/summary-model';
import CrudOperationModel from '../../models/common/crud-operation-model';
import responseFormat from '../../core/response-format';
import { messageList } from '../../core/message-list';
import configContainer from '../../config/localhost';
import logger from '../../core/logger';
import CommonMethods from '../../core/common-methods';
import enums from '../../core/enums';
import moment from 'moment';
import path from 'path';
import async from 'async';


// call entities
import { APP_REF_DATA } from "../../entities/common/app-ref-data";
import { EmployeeDetails, ResumeMaster, CandidateSkills } from '../../entities';
import { CandidateSMEAvailability } from '../../entities/sme/candidate-sme-availability';
import { SMEInterview } from '../../entities/sme/sme-interview';
import { SMEInterviewRequest } from '../../entities/sme/sme-interview-request';
import SmeModel from '../../models/sme/sme-model';
import accountModel from '../../models/accounts/accounts-model';
import JobsModel from '../../models/jobs/jobs-model';

import fieldsLength from '../../core/fieldsLength';


/**
 *  -------Initialize variabls-------------
 */
let config = configContainer.loadConfig(),
    smeModel = new SmeModel(),
    jobsModel = new JobsModel(),
    commonMethods = new CommonMethods(),
    crudOperationModel = new CrudOperationModel();

const emailModel = new EmailModel();

export default class SmeController {
    constructor() { }

    getSmeContent(req, res, next)
    {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let response = responseFormat.createResponseTemplate();
        let smeReason = req.body.smeReason ? req.body.smeReason.trim() : '';
        let msgCode = [];

        if (msgCode.length) 
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else 
        {
            let content = {
                pageTitle : 'StafflinePro™ SME program',
                pageDescription : 'Earn cash rewards and recognition as an expert in your domain.',
                content : [
                    {
                        title : 'What is the SME program?',
                        description : 'The Subject Matter Expert Program is designed to provide unique opportunities to individuals who are identified as leaders in their discipline.'
                    },
                    {
                        title : 'How does this program help me?',
                        description : 'As an SME, you will be able to earn additional income and receive recognition for your expertise. Get paid to review job descriptions and pre-screen candidates for a variety of roles specific to your field. You may also receive opportunities to consult or join short term projects that require your specific skillset. As the SME Program continues to evolve, you could receive public recognition as a community leader within your domain.'
                    },
                    {
                        title : 'How does this program help StafflinePro™?',
                        description : 'We provide our partners with the best talent globally. Our multi-tier process of candidate vetting utilizes outside experts, in addition to our internal team. Your knowledge and experience will be utilized to review job descriptions and pre-screen candidates before submission. The SME Program also allows StafflinePro™ to provide it’s partners with industry experts when unique questions or projects arise.'
                    },
                    {
                        title : 'What are the requirements?',
                        description : 'Subject Matter Experts have developed their expertise in their particular discipline over a long period of time and after a great deal of immersion in the topic. Additionally, experts maintain a rigorous program of continuous study in their field. \n \n To be accepted into the StafflinePro™ SME Program, individuals must have had experience completing job descriptions and training others in their field. In addition, all applicants must undergo a verification process by the StafflinePro™ team, which includes Professional verification and Personal identification.'
                    }
                ]
            }
            response = responseFormat.getResponseMessageByCodes('', { content: { dataList: [content] } });
            res.status(200).json(response);
        } 
    }

    /**
     * Apply
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */

    apply(req, res, next) 
    {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let response = responseFormat.createResponseTemplate();
        let empDetails = {};
        let employeeData = {};
        let candidatePrimarySkills = '';
        let domainName = '';
        let resumeLink = '';
        let self = this;


        let domainId = req.body.domainId ? req.body.domainId : 0;
        let linkedIn = req.body.linkedIn ? req.body.linkedIn.trim() : '';
        let contactNumber = req.body.contactNumber ? req.body.contactNumber.trim() : '';
        let smeReason = req.body.smeReason ? req.body.smeReason.trim() : '';

        let msgCode = [];
        if(smeReason == '')
        {
            msgCode.push('smeReason');
        }
        if ( !(contactNumber) ||  ( contactNumber && !commonMethods.isValidPhone(contactNumber)) )
        {
            msgCode.push('contactNumber');
        }

        if( !(domainId) ){
            msgCode.push('domainId');
        }
        if( !(linkedIn) ||  ( linkedIn && (linkedIn.length > fieldsLength.users.linkedIn)) ){
            msgCode.push('linkedIn');
        }
        if (req.body.skills && req.body.skills.length) 
        {
            let reqBody = req.body;
            //let primary = reqBody.skills.filter(itm => { return itm.isPrimary });
            let sks = reqBody.skills.map(itm => { return itm.skillName.toLowerCase() });

            if(sks.some( (item, i) => { return sks.indexOf(item) != i} ))
            {
                msgCode.push('skillName:duplicateSkills')
            }

            // if(primary.length < 1)
            // {     
            //     msgCode.push('noPrimarySkill')
            // }
            
            for(let i=0; i<reqBody.skills.length; i++)
            {
                reqBody.skills[i].skillName = reqBody.skills[i].skillName ? reqBody.skills[i].skillName.trim() : '';

                if (reqBody.skills[i].candidateSkillId && !(commonMethods.isValidInteger(reqBody.skills[i].candidateSkillId))) {
                    msgCode.push('candidateSkillId')
                }
                if (!reqBody.skills[i].skillName) {
                    msgCode.push('skillName');
                }
                if (!reqBody.skills[i].yearExp || !(commonMethods.isValidNumber(reqBody.skills[i].yearExp))
                || reqBody.skills[i].yearExp == 0  
                || reqBody.skills[i].yearExp > fieldsLength.users.yearsOfExp
                ) {
                    msgCode.push('yearExp');
                }
            }
        }

        
        if (msgCode.length) 
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else 
        {   
            let condition = { employeeDetailsId: 0 };
            async.series([
                
                function(done)
                {
                    
                    crudOperationModel.findAllByCondition(CandidateSkills, { 
                        employeeDetailsId: employeeDetailsId,
                        resumeId : { $ne : null }, 
                    })
                    .then( skills =>{
                        if(skills.length){
                            done();
                        }else{
                            msgCode.push('noSkill');
                            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
                            res.status(200).json(response);
                        }
                    });

                },
                function(done){
                    jobsModel.getResumeDocumentList(employeeDetailsId)
                    .then((userResume) => {
                        if(userResume.length){
                            resumeLink = userResume[0].resumeFile;
                            done();
                        }else{
                            msgCode.push('noResume');
                            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
                            res.status(200).json(response);
                        }
                    });
                },
                function(done){
                    empDetails['modifiedDate'] = new Date().toDateString();
                    empDetails['modifiedBy'] = employeeDetailsId;

                    empDetails['domainId'] = domainId;
                    empDetails['linkedIn'] = linkedIn;
                    if (employeeDetailsId != undefined && employeeDetailsId > 0) {
                        condition = { employeeDetailsId: employeeDetailsId };
                        empDetails.employeeDetailsId = employeeDetailsId;
    
                    };

                    crudOperationModel.saveModel(EmployeeDetails, empDetails, condition)
                    .then(rs => { 
                        employeeData = rs;
                        done();
                    }).catch((error) => {
                        let resp = commonMethods.catchError('profile-management-controller/editUser EmployeeDetails process.', error);
                        response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                        res.status(resp.code).json(response);
                    })

                },
                function(done){
                    empDetails['modifiedDate'] = new Date().toDateString();
                    empDetails['modifiedBy'] = employeeDetailsId;

                    empDetails['contactNumber'] = contactNumber;
                    if (employeeDetailsId != undefined && employeeDetailsId > 0) {
                        condition = { employeeDetailsId: employeeDetailsId };
                        empDetails.employeeDetailsId = employeeDetailsId;
    
                    };
                    crudOperationModel.saveModel(ResumeMaster, empDetails, condition)
                    .then(rs2 => { 
                        done();
                    }).catch((error) => {
                        let resp = commonMethods.catchError('sme-controller/apply ResumeMaster process.', error);
                        response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                        res.status(resp.code).json(response);
                    })
                },
                function(done)
                {
                    if (req.body.skills) 
                    {
                        self.manageSkills(employeeDetailsId, req.body.skills, function (response) 
                        {
                            if(response.statusCode != 200)
                            {
                                res.status(response.statusCode).json(response.responseFormat);
                            }
                            else
                            {
                                done(null, 'skills');
                            }
                        })
                    }
                    else
                    {
                        done(null, 'skills');
                    }
                },
                function(done){
                    crudOperationModel.findModelByCondition(APP_REF_DATA, { KeyID : domainId })
                    .then( domain => {
                        if(domain){
                            domainName = domain.keyName;
                            done();
                        }else{
                            done();
                        }
                    })
                },
                function(done){
                    crudOperationModel.findAllByCondition(CandidateSkills, { 
                        employeeDetailsId: employeeDetailsId,
                        resumeId : { $ne : null }, 
                    })
                    .then( skills =>{
                        if(skills.length){
                            skills.forEach(function (item) {
                                candidatePrimarySkills +=  candidatePrimarySkills != '' ? ', '+item.skillName : item.skillName;
                            });
                            done();
                        }else{
                            done();
                        }
                    });
                },
                function(done){
                    crudOperationModel.findModelByCondition(ResumeMaster, { employeeDetailsId : employeeDetailsId })
                    .then( emp => {

                        let body = [
                            { name: "EMPLOYEENAME", value: emp.firstName + ' '+ emp.lastName },
                            { name: "EMAILID", value: emp.emailId },
                            { name: "PHONENUMBER", value: emp.contactNumber },
                            { name: 'Domain', value: domainName},
                            { name: 'LinkedIn', value: emp.linkedIn},
                            { name: 'PRIMARYSKILLS', value: candidatePrimarySkills},
                            { name: 'RESUME', value: resumeLink},
                            { name: "COMMENTS", value: smeReason }
                        ]
                        let options = {
                            mailTemplateCode: enums.emailConfig.codes.adminMails.smeApply,
                            toMail: [{ mailId: null, displayName: null, employeeId: null, configKeyName : 'SUPPORTMAILID' }],
                            placeHolders: body,
                            ccMail : [     
                                {mailId : enums.emailConfig.codes.eMails.neville, displayName : 'Neville', configKeyName:null},
                                {mailId : enums.emailConfig.codes.eMails.ppatlola, displayName : 'P Patlola', configKeyName:null}
                            ]
                        };
            
                        emailModel.mail(options, 'sme-controller apply')
                        .then(rs => { }) 

                        response = responseFormat.getResponseMessageByCodes(['success:formSubmitted']);
                        res.status(200).json(response);
                    })
                }
                
                
            ], function (error, rs) {
                if (error) {
                    let response = commonMethods.catchError('sme-controller/apply for SME', error);
                    resp.statusCode = response.code;
                    resp.responseFormat = responseFormat.getResponseMessageByCodes(response.message, { code: response.code });
                    next(resp);
                }
                else {
                    next(rs);
                }
            });

        }
    }

    getSmeAvailability(req, res, next)
    {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let response = responseFormat.createResponseTemplate();
        let msgCode = [];

        if (msgCode.length) 
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else 
        {
            smeModel.getSmeAvailability(employeeDetailsId)
            .then( rs => {
                response = responseFormat.getResponseMessageByCodes('', { content: { dataList: [rs] } });
                res.status(200).json(response);
            })
        }
    }

    saveSmeAvailability(req, res, next)
    {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let response = responseFormat.createResponseTemplate();
        let msgCode = [];
      
        if(req.body.fromTime == undefined)
        {
            msgCode.push('fromTime');
        }

        if(req.body.toTime == undefined)
        {
            msgCode.push('toTime');
        }

        if(req.body.weekDays == undefined || !Array.isArray(req.body.weekDays) || req.body.weekDays.length < 0)
        {
            msgCode.push('weekDays');
        }

        if (msgCode.length) 
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else 
        {
            let availabilityData = [];
            async.series([
                function(done)
                {
                    // get Resume Id
                    crudOperationModel.findModelByCondition(ResumeMaster, {employeeDetailsId : employeeDetailsId})
                    .then( rs => {
                        if(rs)
                        {
                            availabilityData = req.body.weekDays.map( item => {
                                return  {
                                    weekDay : item,
                                    fromTime : req.body.fromTime,
                                    toTime : req.body.toTime,
                                    resumeId : rs.resumeId,
                                    createdBy : employeeDetailsId,
                                    createdDate : new Date()
                                }
                            });

                            done()
                        }
                        else
                        {
                            done(' invalid User ')
                        }
                    })
                },
                function(done)
                {
                    // save data
                    crudOperationModel.bulkSave(CandidateSMEAvailability, availabilityData)
                    .then(rs => {
                        if(rs) 
                        {
                            done()
                        }
                        else
                        {
                            done(' Error Saving Candidate-Sme-Availability ')
                        }
                    })
                }
            ], function(error, result){
                if(error)
                {
                    let resp = commonMethods.catchError('sme-controller/saveSmeAvailability', error);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                }
                else
                {
                    response = responseFormat.getResponseMessageByCodes(['success:saved']);
                    res.status(200).json(response);
                }
            })
            
        }
    }

    deleteSmeAvailability(req, res, next)
    {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let response = responseFormat.createResponseTemplate();
        let msgCode = [];

        let smeAvailabilityId = req.params.smeAvailabilityId || req.body.smeAvailabilityId;

        if(!smeAvailabilityId || smeAvailabilityId < 1)
        {
            msgCode.push('smeAvailabilityId')
        }

        if (msgCode.length) 
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else 
        {
            crudOperationModel.deleteModel(CandidateSMEAvailability, {smeAvailabilityId : smeAvailabilityId})
            .then( rs => {
                response = responseFormat.getResponseMessageByCodes(['success:deleted']);
                res.status(200).json(response);
            })
        }

    }

    getInterviews(req, res, next)
    {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let response = responseFormat.createResponseTemplate();
        let msgCode = [];

        if (msgCode.length) 
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else 
        {
            smeModel.getInterviews(employeeDetailsId)
            .then( rs => {
                response = responseFormat.getResponseMessageByCodes('', { content: { dataList: rs } });
                res.status(200).json(response);
            })
        }
    }

    getInterviewDetails(req, res, next)
    {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let response = responseFormat.createResponseTemplate();
        let msgCode = [];
        let interviewRequestId = req.params.interviewRequestId

        if(!interviewRequestId || interviewRequestId < 1)
        {
            msgCode.push('interviewRequestId');
        }

        if (msgCode.length) 
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else 
        {
            smeModel.getInterviewDetails(interviewRequestId)
            .then( rs => {
                response = responseFormat.getResponseMessageByCodes('', { content: { dataList: rs } });
                res.status(200).json(response);
            })
        }
    }

    updateInteviewStatus(req, res, next)
    {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let response = responseFormat.createResponseTemplate();
        let msgCode = [];
        let interviewRequestId = req.body.interviewRequestId;
        let smeAvailabilityId = req.body.availabilityId;
        let action = req.body.action;

        let userActions = ['accepted', 'notAvailable', 'notInterested'];

        if(!interviewRequestId || interviewRequestId < 1)
        {
            msgCode.push('interviewRequestId');
        }
        if(userActions == 'accepted' && (!smeAvailabilityId || smeAvailabilityId < 1))
        {
            msgCode.push('availabilityId:smeAvailabilityId');
        }
        if(!action || action == '' || userActions.indexOf(action) < 0)
        {
            msgCode.push('action:smeInterviewAction');
        }

        let interviewStatus = enums.sme.requestStatus[action]; 

        
        if (msgCode.length) 
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else 
        {
            if(interviewStatus == enums.sme.requestStatus.notAvailable || interviewStatus == enums.sme.requestStatus.notInterested)
            {
                crudOperationModel.saveModel(SMEInterviewRequest , {requestStatus : interviewStatus}, {smeInterviewRequestId : interviewRequestId})
                .then( rs => {
                    response = responseFormat.getResponseMessageByCodes(['success:saved']);
                    res.status(200).json(response);
                })
            }
            else
            {
                let smeInterviewId = 0;
                let loggedUserResumeId = 0;
                async.waterfall([
                    function(done)
                    {
                        crudOperationModel.findModelByCondition(ResumeMaster, {employeeDetailsId : employeeDetailsId})
                        .then(rs => {
                            if(rs)
                            {
                                loggedUserResumeId = rs.resumeId;
                                done();
                            }
                            else
                            {
                                done(' Invalid User ')
                            }
                        })
                    },
                    function(done)
                    {
                        crudOperationModel.findModelByCondition(SMEInterviewRequest, {smeInterviewRequestId : interviewRequestId})
                        .then(rs => {
                            if(rs)
                            {
                                smeInterviewId = rs.smeInterviewId;
                                done();
                            }
                            else
                            {
                                done(' can not find interview ')
                            }
                        })
                    },
                    function(done)
                    {
                        // get candidate availability data
                        crudOperationModel.findModelByCondition(CandidateSMEAvailability, {smeAvailabilityId : smeAvailabilityId})
                        .then( rs => {
                            done(null, rs)
                        })
                    },
                    function(candidateAvailabilityData, done)
                    {
                        // update interview table 
                        let interviewData = {
                            interviewerResumeId : loggedUserResumeId,
                            interviewDate : candidateAvailabilityData.availableDate,
                            interviewWeekDay : candidateAvailabilityData.weekDay,
                            interviewFrom : candidateAvailabilityData.fromTime,
                            interviewTo : candidateAvailabilityData.toTime,
                            interviewStatus : enums.sme.requestStatus.accepted
                        }
                      
                        crudOperationModel.updateAll(SMEInterview, interviewData, {smeInterviewId : smeInterviewId })
                        .then( rs => {
                            done()
                        })
                    },
                    function(done)
                    {
                        // update interview request status 
                        crudOperationModel.updateAll(SMEInterviewRequest , {requestStatus : enums.sme.requestStatus.accepted}, {smeInterviewRequestId : interviewRequestId})
                        .then( rs => { 
                            // update others status as grabbed-by-others 
                            crudOperationModel.updateAll(SMEInterviewRequest , 
                                {requestStatus : enums.sme.requestStatus.grabbedByOther}, 
                                {smeInterviewId : smeInterviewId, smeResumeId : {$ne : loggedUserResumeId}})
                            .then( rs1 => {
                                
                            })
                            done()
                        })
                    }
                ],function(error, result)
                {
                    if(error)
                    {
                        let resp = commonMethods.catchError('sme-controller/updateInteviewStatus', error);
                        response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                        res.status(resp.code).json(response);
                    }
                    else
                    {
                        response = responseFormat.getResponseMessageByCodes(['success:saved']);
                        res.status(200).json(response);
                    }
                })

            }

        }
    }

    saveFeedback(req, res, next)
    {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let response = responseFormat.createResponseTemplate();
        let msgCode = [];
        let interviewId = req.body.interviewId;
        let feedback = req.body.feedback;
        let isRecommended = req.body.isRecommended ? req.body.isRecommended.toLowerCase() : '';
        let recommendedValues = ['no','yes'];

        if(!interviewId || interviewId < 1)
        {
            msgCode.push('interviewId');
        }
        if(!feedback || feedback == '')
        {
            msgCode.push('feedback');
        }
        if(!isRecommended || recommendedValues.indexOf(isRecommended) < 0)
        {
            msgCode.push('isRecommended');
        }
        
        if (msgCode.length) 
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else 
        {
            let loggedUserResumeId = 0;
            async.series([
                function(done)
                {
                    crudOperationModel.findModelByCondition(ResumeMaster, {employeeDetailsId : employeeDetailsId})
                    .then(rs => {
                        if(rs)
                        {
                            loggedUserResumeId = rs.resumeId;
                            done();
                        }
                        else
                        {
                            done(' Invalid User ')
                        }
                    })
                },
                function(done)
                {
                    // update interview status 
                    let smeData = {
                        isRecommended : recommendedValues.indexOf(isRecommended),
                        interviewFeedback : feedback,
                        interviewStatus : enums.sme.requestStatus.completed
                    }
                    crudOperationModel.updateAll(SMEInterview , smeData, {smeInterviewId : interviewId, interviewerResumeId : loggedUserResumeId})
                    .then( rs => { 
                        done()
                    })
                }
            ],function(error, result)
            {
                if(error)
                {
                    let resp = commonMethods.catchError('sme-controller/saveFeedabck', error);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                }
                else
                {
                    response = responseFormat.getResponseMessageByCodes(['success:saved']);
                    res.status(200).json(response);
                }
            })
        }
    }

    getCompensations(req, res, next)
    {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let response = responseFormat.createResponseTemplate();
        let msgCode = [];

        if (msgCode.length) 
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else 
        {
            smeModel.getCompensations(employeeDetailsId)
            .then( rs => {
                response = responseFormat.getResponseMessageByCodes('', { content: { dataList: rs } });
                res.status(200).json(response);
            })
        }
    }

    getCompensationDetails(req, res, next)
    {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let response = responseFormat.createResponseTemplate();
        let msgCode = [];
        let interviewId = req.params.interviewId;

        if(!interviewId || interviewId < 1)
        {
            msgCode.push('errorText:interviewId')
        }

        if (msgCode.length) 
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else 
        {
            smeModel.getCompensationDetails(interviewId)
            .then( rs => {
                response = responseFormat.getResponseMessageByCodes('', { content: { dataList: rs } });
                res.status(200).json(response);
            })
        }
    }

    

    /**
    * Manage skills
    * @param {*} employeeDetailsId : logged in user id
    * @param {*} skills :skill object
    */
   manageSkills(employeeDetailsId, skills, next) {
        let resp = {
            statusCode: 400,
            responseFormat: responseFormat.createResponseTemplate()
        };
        let resumeId = '';
        async.series([
            function (done) {
                crudOperationModel.findModelByCondition(ResumeMaster, { employeeDetailsId: ~~employeeDetailsId })
                .then((resume) => {
                    if (resume) {
                        resumeId = resume.resumeId;
                        done()
                    } else {
                        done()
                    }
                })
                .catch(error => {
                    done(error);
                })
            },
            function (done) {
                async.map(skills, function (item, cb) {
                    item.employeeDetailsId = employeeDetailsId;
                    item.resumeId = resumeId;
                    // item.createdBy = employeeDetailsId;
                    crudOperationModel.saveModel(CandidateSkills, item, { candidateSkillId: (item.candidateSkillId || 0) })
                    .then((result) => {
                        cb(null, result)
                    })

                }, function (err, rss) {
                    if (!err) {
                        done();
                    }
                    else {
                        done(err);
                    }
                })
            }
        ], function (error, rs) {
            if (error) {
                let response = commonMethods.catchError('onboarding-controller/editUser manageSkill process.', error);
                resp.statusCode = response.code;
                resp.responseFormat = responseFormat.getResponseMessageByCodes(response.message, { code: response.code });
                next(resp);
            }
            else {
                resp.statusCode = 200;
                resp.responseFormat = responseFormat.getResponseMessageByCodes(['success:saved']);
                next(resp);
            }
        })
    }

}