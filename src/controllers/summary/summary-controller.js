/**
 *  -------Import all classes and packages -------------
 */

import EmailModel from '../../models/emails/emails-model';
import SummaryModel from '../../models/summary/summary-model';
import JobsModel from '../../models/jobs/jobs-model';
import ChatModel from '../../models/chat/chat-model';
import CrudOperationModel from '../../models/common/crud-operation-model';
import responseFormat from '../../core/response-format';
import { messageList } from '../../core/message-list';
import configContainer from '../../config/localhost';
import logger from '../../core/logger';
import CommonMethods from '../../core/common-methods';
import enums from '../../core/enums';
// import JobsValidation from '../../validations/jobs/jobs-validation';
import moment from 'moment';
import path from 'path';
import async from 'async';
import request from 'request';


// call entities
import { APP_REF_DATA } from "../../entities/common/app-ref-data";

/**
 *  -------Initialize variabls-------------
 */
let config = configContainer.loadConfig(),
    summaryModel = new SummaryModel(),
    jobsModel = new JobsModel(),
    commonMethods = new CommonMethods(),
    //messageList = new MessageList(),
    chatModel = new ChatModel(),
    crudOperationModel = new CrudOperationModel();
// jobsValidation = new JobsValidation();

export default class SummaryController {
    constructor() { }

    /**
     * get Matching Jobs
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */

    matchingJobs(req, res, next) {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let response = responseFormat.createResponseTemplate();

        summaryModel.getMatchingJobs(employeeDetailsId)
            .then(rs => {
                response = responseFormat.getResponseMessageByCodes('', { content: { dataList: rs } });
                res.status(200).json(response);
            }).catch(err => {                
                let resp = commonMethods.catchError('summary-controller/MatchingJobs', err);
                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });                
                res.status(resp.code).json(response);
            })
    }


    /**
     * get Recruiter Details
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */

    recruiterDetails(req, res, next) {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let response = responseFormat.createResponseTemplate();

        summaryModel.getRecruiterDetails(employeeDetailsId)
            .then(rs => {
                response = responseFormat.getResponseMessageByCodes('', { content: { dataList: rs } });
                res.status(200).json(response);
            }).catch(err => {
                let resp = commonMethods.catchError('summary-controller/recruiterDetails', err);
                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });                
                res.status(resp.code).json(response);
            })
    }


    /**
     * get Active Applications Count
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */

    jobsActivities_backup(req, res, next) {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let response = responseFormat.createResponseTemplate();
        let returnObj = {}; let localJobs = []; let localJobsMessage = "";
        let nonLocalJobs = [];

        //get local jobs and other location jobs
        let encodedEmployeedetailsId = new Buffer(employeeDetailsId.toString()).toString('base64');
        let encodedBody = new Buffer(JSON.stringify({ EmployeeId: encodedEmployeedetailsId.toString() })).toString('base64');
        var options = {
            method: 'POST',
            url: config.thirdPartyMatchingJobsApiUrl + config.matchingJobEndpoint,
            headers:
            {
                'Authorization': config.thirdPartyApiUrlToken,
                'Content-Type': 'application/json'
            },
            body: { data: encodedBody },
            json: true,
            timeout: 30000
        };
        request(options, function (error, response, rawBody) {

            if (rawBody && rawBody.status == 200 && rawBody.data) {
                //rawBody.data.localJobs[0] -999  if user has not update their location in profil
                if (rawBody.data.localJobs && rawBody.data.localJobs.length && rawBody.data.localJobs[0].CJM_JOB_ID == enums.jobs.userLocationMatchingJobsNull) {
                    localJobs = [];
                    localJobsMessage = messageList.missingLocationMessage;
                } else {
                    localJobs = rawBody.data.localJobs ? rawBody.data.localJobs : [];

                }
                nonLocalJobs = rawBody.data.nonLocalJobs ? rawBody.data.nonLocalJobs : [];
            }
            summaryModel.getActiveApplicationsCount(employeeDetailsId)
                .then(rs => {
                    returnObj = rs;              
                    returnObj.localJobs = { "count": localJobs.length, "message": localJobsMessage };
                    returnObj.otherLocationJobs = { "count": nonLocalJobs.length, "message": "" };

                    response = responseFormat.getResponseMessageByCodes('', { content: { dataList: [returnObj] } });
                    res.status(200).json(response);
                }).catch(err => {                   
                    let resp = commonMethods.catchError('summary-controller/jobsActivities', err);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });                
                    res.status(resp.code).json(response);
                })
        })
    }

    jobsActivities(req, res, next) 
    {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let response = responseFormat.createResponseTemplate();
        let returnObj = {}; 
        let localJobs = []; 
        let localJobsMessage = "";
        let nonLocalJobs = [];

        async.parallel({
            activeapp : function(done)
            {
                summaryModel.getActiveApplicationsCount(employeeDetailsId)
                .then(rs => {
                    done(null, rs)
                })
            },
            unreadConversations : function(done)
            {
                chatModel.getUnreadConversations(employeeDetailsId)
                .then(rs => {
                    done(null, rs.count)
                })
            },
            latestInterview : function(done)
            {
                summaryModel.getLatestInterview(employeeDetailsId)
                .then(rs => {
                    done(null, rs.interviewDate)
                })
            }
        },function(err, results) {
            returnObj = results.activeapp; 
            returnObj.interviewScheduled['date'] = results.latestInterview;
            returnObj['unreadConversations'] = {count : results.unreadConversations, message:''};                     
            response = responseFormat.getResponseMessageByCodes('', { content: { dataList: [returnObj] } });
            res.status(200).json(response);
        })
    
       
    }

    /**
     * get Pending Legal Request 
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */ 
    getLegalRequest(req, res, next)
    {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let response = responseFormat.createResponseTemplate();

        summaryModel.getLegalRequestCount(employeeDetailsId, enums.immigration.status.pending)
        .then( rs => {
            response = responseFormat.getResponseMessageByCodes('', { content: { dataList: [{'count':rs}] } });
            res.status(200).json(response);
        })
    }

    /**
     * get My Referrals 
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */

    getReferrals(req, res, next) {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let response = responseFormat.createResponseTemplate();

        summaryModel.getReferralsCount(employeeDetailsId)
            .then(rs => {
                response = responseFormat.getResponseMessageByCodes('', { content: { dataList: rs } });
                res.status(200).json(response);
            }).catch(err => {
                let resp = commonMethods.catchError('summary-controller/getReferrals', err);
                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });                
                res.status(resp.code).json(response);
            })
    }
}