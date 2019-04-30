/**
 *  -------Import all classes and packages -------------
 */
//call all models
import JobsModel from '../../models/jobs/jobs-model';
import UserModel from '../../models/profileManagement/profile-management-model';
import AccountsModel from '../../models/accounts/accounts-model';
import StaticPagesModel from '../../models/staticPages/staticPages-model';
import CrudOperationModel from '../../models/common/crud-operation-model';
import EmailModel from '../../models/emails/emails-model';

import { JobSearchAlert } from '../../entities/index';
import { CandidateSkills } from '../../entities/index';
import { ResumeMaster } from '../../entities/index';
import { jobEligibility } from '../../entities/jobs/job-eligibility';
import { SearchParameter } from '../../entities/jobs/search-parameter';

import JobsValidation from '../../validations/jobs/jobs-validation';

import responseFormat from '../../core/response-format';
import CommonMethods from '../../core/common-methods';
import async from 'async';
import logger from '../../core/logger';
import enums from '../../core/enums';
import configContainer from '../../config/localhost';
import crypto from 'crypto';
import request from 'request';

let jobsModel = new JobsModel(),
    userModel = new UserModel(),
    commonMethods = new CommonMethods(),
    crudOperationModel = new CrudOperationModel(),
    staticPagesModel = new StaticPagesModel(),
    jobsValidation = new JobsValidation(),
    emailModel = new EmailModel(),
    // accountsModel = new AccountsModel(),
    config = configContainer.loadConfig();


export default class JobsController {
    constructor() { }

    /**
     * Get Job statistics
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */

    getStatistics(req, res, next) 
    {
        let response = responseFormat.createResponseTemplate(),
            employeeDetailsId = (req.tokenDecoded) ? req.tokenDecoded.data.employeeDetailsId : 0,
            self = this,
            resumeId = 0;
        
        async.parallel({
        
            /**
            * get job alerts
            */
            jobAlerts: function (done) {
                if (employeeDetailsId > 0) {
                    self.getJobSearchAlerts(employeeDetailsId, 1)
                        .then(jobAlerts => {
                            done(null, jobAlerts);
                        })
                        .catch(error => {
                            //console.log(error);
                            done(error, []);
                        })
                }
                else {
                    done(null, []);
                }
            },

        }, function (err, results) {
            
            if (err) {
                let resp = commonMethods.catchError('jobs-controller/getStatistics', err);
                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                res.status(resp.code).json(response);
            } else {
                response = responseFormat.getResponseMessageByCodes([''], { content: { dataList: [results] } });
                res.status(200).json(response);
            }
        })
    }

    /**
    * get job Alerts and counts
    */
    getJobSearchAlerts(employeeDetailsId, isAlert) 
    {
        let jobAlertsAndCount = [], self = this, i = 1;
        return new Promise(function (resolve, reject) {
            return jobsModel.getJobSearchAlert(employeeDetailsId, isAlert)
                .then(jobAlerts => { 
                    return resolve(jobAlerts);
                })
                .catch((error) => {
                    return resolve(jobAlerts);
                })
        });
    }

    getJobStatistics(req, res, next) 
    {
        let response = responseFormat.createResponseTemplate(),
            employeeDetailsId = (req.tokenDecoded) ? req.tokenDecoded.data.employeeDetailsId : 0;
        
        let type = req.body.type || "matching-jobs";

        async.parallel({
        
            /**
            * get job alerts
            */
            jobAlerts: function (done) {
                if (employeeDetailsId > 0) {
                    jobsModel.getJobAlerts(employeeDetailsId, type)
                    .then(jobAlerts => { 
                        done(null, jobAlerts);
                    })
                    .catch(error => {
                        //console.log(error);
                        done(error, []);
                    })
                }
                else {
                    done(null, []);
                }
            },

        }, function (err, results) {
            
            if (err) {
                let resp = commonMethods.catchError('jobs-controller/getJobStatistics', err);
                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                res.status(resp.code).json(response);
            } else {
                response = responseFormat.getResponseMessageByCodes([''], { content: { dataList: [results] } });
                res.status(200).json(response);
            }
        })
    }
    /**
     * get Job Count By UserLocation
     */
    getJobCountByUserLocation(employeeDetailsId) {
        return new Promise(function (resolve, reject) {
            jobsModel.getJobCountByUserLocation(employeeDetailsId)
                .then(jobCount => {
                    return resolve(jobCount);
                })

        });
    }


    /**
     * 
     * @param {*} searchParams : searchParams for count job
     * @param {*} jobAlertObj : job alert object
     */
    getAlertCount(searchParams, jobAlertObj) {
        return new Promise(function (resolve, reject) {
            let obj = jobAlertObj;
            async.series([
                function (done) {
                    if (searchParams.location) {
                        jobsModel.getCityMasterDetailsByCondition(searchParams.location)
                            .then((city) => {
                                searchParams.latitude = (city.Latitude || 0);
                                searchParams.longitude = (city.Langitude || 0);
                                done();
                            })
                            .catch(err => {
                                //console.log(err);
                                done();
                            })
                    } else {
                        done();
                    }
                },
                function (done) 
                {
                    jobsModel.getJobsCount(searchParams)
                    .then((jobs) => {
                        done(null, jobs);
                    })
                    .catch((error) => {
                        done(null, 0);
                    })
                    
                    // jobsModel.getJobsList(searchParams)
                    //     .then((jobs) => {
                    //         done(null, jobs.paging.totalCount);
                    //     })
                    //     .catch((error) => {
                    //         done(null, 0);
                    //     })
                }
            ], function (err, results) {
                if (err) {
                    return resolve(results[1]);
                } else {
                    obj['count'] = results[1];
                    return resolve(obj);
                }
            })
        });
    }

    /**
    * get Job search history  and alert
    */
    getJobSearchHistory(employeeDetailsId) {
        return new Promise(function (resolve, reject) {
            return jobsModel.getJobSearchAlert(employeeDetailsId, 0)
                .then(jobSearchHistory => {
                    return resolve(jobSearchHistory);
                })
        });
    }

    /**
   * save Job search history if not exists
   */
    SaveJobSearchHistory(reqBody, isJobCount) {//employeeDetailsId, keyword, location, isAlert) {
        return new Promise(function (resolve, reject) {

            if (!reqBody.keyword && !reqBody.location && (reqBody.isHot != enums.jobs.isHot || reqBody.isHot != enums.jobs.isNotHot) && !reqBody.miles && !Array.isArray(reqBody.jobCategory) && !Array.isArray(reqBody.jobAssignmentType) && !(reqBody.jobListType)) {
                return resolve(true);
            } else {
                let object = {
                    searchName: "Filtered Jobs",
                    searchParameter: "",
                    searchParameterHashData: "",
                    isAlert: 0,
                    createdBy: reqBody.employeeDetailsId,
                    createdDate: new Date()
                };
                if (
                    (reqBody.jobListType)
                    || (
                        //(reqBody.keyword || reqBody.location) &&
                        (
                            (!reqBody.isHot || reqBody.isHot != enums.jobs.isNotHot || reqBody.isHot != enums.jobs.isHot)
                            && (
                                (!reqBody.miles || (reqBody.miles && !reqBody.location) || (reqBody.miles == 50 && reqBody.location))
                                && !reqBody.jobCategory.length && !reqBody.jobAssignmentType.length
                            )
                        )
                    )
                ) {
                    object.searchName = commonMethods.getJobTitleKeyword(reqBody.keyword, reqBody.location, reqBody.jobListType, reqBody.jobTitle);
                }

                object.searchParameter = commonMethods.getJobSearchParams(reqBody);
                object.searchParameterHashData = crypto.createHash('md5').update(object.searchName.toLocaleLowerCase()).digest('hex')

                // job search will not create on empty search 
                if (isJobCount > 0) {
                    return jobsModel.isDuplicateJobSearchHistory(reqBody.employeeDetailsId, object.searchParameterHashData)
                        .then((isDuplicate) => {

                            let whereCondition = { jobSearchAlertId: 0 };
                            if (isDuplicate.length) {
                                whereCondition = { jobSearchAlertId: isDuplicate[0].jobSearchAlertId };
                            }

                            //save/update job hostory
                            return crudOperationModel.saveModel(JobSearchAlert, object, whereCondition)
                                .then((jobHistory) => {
                                    return resolve(true);
                                })
                                .catch(err => {
                                    //console.log(err);
                                    return resolve(false);
                                })

                        })
                        .catch(err => {
                            //console.log(err);
                            return resolve(false);
                        })
                } else {
                    return resolve(true);
                }

            }
        });
    }

    /**
      * get ProjectType And Count
      */
    getProjectTypeAndCount() {
        return new Promise(function (resolve, reject) {
            return jobsModel.getProjectTypeCounts()
                .then(projectType => {
                    return resolve(projectType);
                })
        });
    }

    /**
     * get job looking ForBetter
     */
    getJoblookingForBetter() {
        return new Promise(function (resolve, reject) {
            return staticPagesModel.getStaticPage(enums.pageReferenceId.jobsLookingForBetter)
                .then(jobsLookingForBetter => {
                    return resolve(jobsLookingForBetter);
                })
        });
    }
    /**
       * Get Job matching jobs
       * @param {*} req : HTTP request argument
       * @param {*} res : HTTP response argument
       * @param {*} next : Callback argument
       */
    getJobTitleSuggestion(req, res, next) {
        let response = responseFormat.createResponseTemplate(),
            searchString = req.body.searchString,
            msgCode = [];

        if (!searchString || searchString.length < 2) {
            msgCode.push('searchString:searchStringLocation');
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        } else {
            jobsModel.getJobTitleSuggestion(searchString)
                .then((location) => {
                    response = responseFormat.getResponseMessageByCodes('', { content: { dataList: location } });
                    res.status(200).json(response);
                })
                .catch((error) => {
                    let resp = commonMethods.catchError('jobs-controller/getJobTitleSuggestion', error);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                })
        }
    }

    /**
       * Get Job matching jobs
       * @param {*} req : HTTP request argument
       * @param {*} res : HTTP response argument
       * @param {*} next : Callback argument
       */

    getMatchingJobs(req, res, next) 
    {
        let response = responseFormat.createResponseTemplate(), 
        self = this;
        
        if (req.body.employeeDetailsId && !commonMethods.isValidInteger(req.body.employeeDetailsId)) 
        {
            response = responseFormat.getResponseMessageByCodes(['employeeDetailsId'], { code: 417 });
            res.status(200).json(response);
        } 
        else 
        {
            crudOperationModel.findModelByCondition(ResumeMaster, {employeeDetailsId:req.body.employeeDetailsId})
            .then( user => {
                if(!user)
                {
                    let defaultFormat = jobsModel.getDefaultJobRespose();
                    response.responseFormat = responseFormat.getResponseMessageByCodes([''], { content: { dataList: defaultFormat } });
                    res.status(200).json(response.responseFormat);
                }
                else
                {
                    let employeeDetailsId = (req.body.employeeDetailsId) ? req.body.employeeDetailsId : ((req.tokenDecoded) ? req.tokenDecoded.data.employeeDetailsId : 0);

                    let reqBody = {
                        employeeDetailsId: employeeDetailsId,
                        pageCount: req.paging ? req.paging.pageCount ? req.paging.pageCount : enums.paging.pageCount : enums.paging.pageCount,
                        // pageSize: req.paging ? req.paging.pageSize ? req.paging.pageSize : enums.paging.pageSize : enums.paging.pageSize,
                        pageSize: req.paging ? req.paging.pageSize ? req.paging.pageSize : 1000 : 1000,
                        keyword: req.keyword ? req.keyword : "",
                        location: req.location ? req.location : '',
                        miles: (req.miles || req.miles == "0") ? req.miles : ((req.location) ? enums.jobs.defaultMiles : ""),
                        isHot: (req.isHot || req.isHot == "0") ? req.isHot : enums.jobs.isHotDefaultValueForAllResult,
                        jobCategory: req.jobCategory ? req.jobCategory : "",
                        jobAssignmentType: req.jobAssignmentType ? req.jobAssignmentType : "",
                        sortRelevance: req.sort ? ((req.sort.relevance) ? req.sort.relevance : "") : "", // matching job will be sorted by rank DESC
                        sortDate: req.sort ? ((req.sort.date) ? req.sort.date : "") : "",
                        latitude: 0,
                        longitude: 0,
                        cjmJobIds: req.cjmJobIds ? req.cjmJobIds : "",
                        jobListType: req.jobListType ? req.jobListType : enums.jobListType.matchingJobs,
                        jobTitle: req.jobTitle ? req.jobTitle : "",
                        resumeId: 0,
                        //sort:{relevance : 'd'} // matching job will be sorted by rank DESC
                    };

                    // console.log(reqBody)
                    
                    self.getJobDetailList(reqBody, function (response) 
                    {
                        res.status(response.statusCode).json(response.responseFormat);
                    });
                }
            })

            
    
        }
    }

    /**
      * Get Job similar jobs
      * @param {*} req : HTTP request argument
      * @param {*} res : HTTP response argument
      * @param {*} next : Callback argument
      */

    getSimilarJobs(req, res, next) {
        let response = responseFormat.createResponseTemplate(),
            reqBody = {
                keyword: "",
                location: "",
                employeeDetailsId: (req.tokenDecoded) ? req.tokenDecoded.data.employeeDetailsId : 0,
                cjmJobId: req.params.cjmJobId
            },
            similarTo = { "jobId": "0", "jobTitle": "" },
            self = this;
        self.getJobDetails(reqBody, function (response) {
            if (response.statusCode == 200 && response.responseFormat.code == 200) {
                reqBody.keyword = response.responseFormat.content.dataList[0].keywords;
                reqBody.location = response.responseFormat.content.dataList[0].city + ", " + response.responseFormat.content.dataList[0].state;
                reqBody.cjmJobIds = [req.params.cjmJobId];
                reqBody.jobListType = enums.jobListType.similarJobs;
                reqBody.jobTitle = response.responseFormat.content.dataList[0].jobTitle;

                self.getJobDetailList(reqBody, function (response) {
                    response.responseFormat.content.dataList[0].similarTo = { "jobId": reqBody.cjmJobIds, "jobTitle": reqBody.jobTitle };
                    /*
                    if (response.responseFormat.content.dataList[0].jobs.length > 0)
                        response.responseFormat.content.dataList[0].similarTo = { "jobId": reqBody.cjmJobIds, "jobTitle": reqBody.jobTitle };
                    else
                        response.responseFormat.content.dataList[0].similarTo = similarTo;
                    */

                    res.status(response.statusCode).json(response.responseFormat);
                });
            } else {
                let defaultFormat = jobsModel.getDefaultJobRespose();
                defaultFormat[0].similarTo = similarTo;
                response.responseFormat = responseFormat.getResponseMessageByCodes([''], { content: { dataList: defaultFormat } });
                res.status(200).json(response.responseFormat);
            }
        });
    }



    /**
     * Get staff contacts
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */
    getJobs(req, res, next) {
        let reqBody = req.body;
        reqBody.employeeDetailsId = req.body.matchingJobUserId || ( (req.tokenDecoded) ? req.tokenDecoded.data.employeeDetailsId : 0 );
        this.getJobDetailList(reqBody, function (response) {
            res.status(response.statusCode).json(response.responseFormat);
        });
    }


    /**
       * Get Job details by id
       * @param {*} req : HTTP request argument
       * @param {*} res : HTTP response argument
       * @param {*} next : Callback argument
       */
    getJobsById(req, res, next) {
        let reqBody = {
            employeeDetailsId: (req.tokenDecoded) ? req.tokenDecoded.data.employeeDetailsId : 0,
            cjmJobId: req.params.cjmJobId
        };
        this.getJobDetails(reqBody, function (response) {
            res.status(response.statusCode).json(response.responseFormat);
        });
    }

    /**
     * Get Create Job Alert
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
    */

    postJobsAlert(req, res, next)
    {
        let response = responseFormat.createResponseTemplate();
        let employeeDetailsId = req.tokenDecoded ? req.tokenDecoded.data.employeeDetailsId : 0;

        let reqBody = {
            employeeDetailsId: (req.tokenDecoded) ? req.tokenDecoded.data.employeeDetailsId : 0,
            searchName: req.body.searchName ? req.body.searchName : "",
            email: req.body.email ? req.body.email : "",
            searchParameter: req.body.searchParameter
        };
        let msgCode = [];

        if (reqBody.searchName == "") 
        {
            msgCode.push('searchName');
        }

        if (msgCode.length) 
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        } 
        else 
        {
            reqBody.searchParameterHashData = crypto.createHash('md5').update(reqBody.searchName.toLowerCase()).digest('hex');

            jobsModel.saveJobAlert(reqBody)
            .then(alerts => {
                let statusCode = 417;
                if (alerts.length) 
                {
                    if (alerts[0].code == 200) 
                    {
                        statusCode = 200;
                        msgCode.push('success:jobAlertSaved');
                    } 
                    else if (alerts[0].code == 409) 
                    { 
                        msgCode.push('searchName:jobAlertDuplicate');
                    } 
                    else if (alerts[0].code == 417) 
                    { 
                        msgCode.push('searchName:Max5JobAlert');
                    } 
                    else 
                    {
                        statusCode = 500;
                        msgCode.push('common500');
                    }
                } 
                else 
                {
                    statusCode = 500;
                    msgCode.push('common500');
                }

                response = responseFormat.getResponseMessageByCodes(msgCode, { code: statusCode });
                res.status((statusCode == 500) ? 500 : 200).json(response);

            })
            .catch((error) => {
                let resp = commonMethods.catchError('jobs-controller/postJobsAlert', error);
                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                res.status(resp.code).json(response);
            })
        }

    }
   

    /**
       * Delete Job Alert
       * @param {*} req : HTTP request argument
       * @param {*} res : HTTP response argument
       * @param {*} next : Callback argument
       */
    deleteJobsAlert(req, res, next) 
    {
        let response = responseFormat.createResponseTemplate(),
            employeeDetailsId = (req.tokenDecoded) ? req.tokenDecoded.data.employeeDetailsId : 0,
            jobSearchAlertId = req.params.jobSearchAlertId || 0;
        if (jobSearchAlertId) 
        {
            crudOperationModel.findModelByCondition(JobSearchAlert, { jobSearchAlertId: jobSearchAlertId, createdBy: employeeDetailsId })
            .then((isExist) => {
                if (isExist) 
                {
                    crudOperationModel.deleteModel(JobSearchAlert, { jobSearchAlertId: jobSearchAlertId })
                    .then((isDelete) => {
                        response = responseFormat.getResponseMessageByCodes(['success:jobAlertDeleted']);
                        res.status(200).json(response);
                    })
                    .catch(err => {
                        let resp = commonMethods.catchError('jobs-controller/deleteJobsAlert crudOperationModel.deleteModel', err);
                        response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                        res.status(resp.code).json(response);
                    })
                } else {
                    response = responseFormat.getResponseMessageByCodes(['jobSearchAlertId'], { code: 417 });
                    res.status(200).json(response);
                }

            })
            .catch(err => {
                let resp = commonMethods.catchError('jobs-controller/deleteJobsAlert', err);
                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                res.status(resp.code).json(response);
            })

        } else {
            response = responseFormat.getResponseMessageByCodes(['jobSearchAlertId'], { code: 417 });
            res.status(200).json(response);
        }
    }

    deleteJobAlert(req, res, next) 
    {
        let response = responseFormat.createResponseTemplate(),
            employeeDetailsId = (req.tokenDecoded) ? req.tokenDecoded.data.employeeDetailsId : 0,
            jobSearchAlertId = req.params.jobSearchAlertId || 0;
        if (jobSearchAlertId) 
        {
            crudOperationModel.findModelByCondition(SearchParameter, { searchParameterId: jobSearchAlertId, createdBy: employeeDetailsId })
            .then((isExist) => {
                if (isExist) 
                {
                    crudOperationModel.deleteModel(SearchParameter, { searchParameterId: jobSearchAlertId })
                    .then((isDelete) => {
                        response = responseFormat.getResponseMessageByCodes(['success:jobAlertDeleted']);
                        res.status(200).json(response);
                    })
                    .catch(err => {
                        let resp = commonMethods.catchError('jobs-controller/deleteJobsAlert crudOperationModel.deleteModel', err);
                        response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                        res.status(resp.code).json(response);
                    })
                } else {
                    response = responseFormat.getResponseMessageByCodes(['jobSearchAlertId'], { code: 417 });
                    res.status(200).json(response);
                }

            })
            .catch(err => {
                let resp = commonMethods.catchError('jobs-controller/deleteJobsAlert', err);
                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                res.status(resp.code).json(response);
            })

        } else {
            response = responseFormat.getResponseMessageByCodes(['jobSearchAlertId'], { code: 417 });
            res.status(200).json(response);
        }
    }

    /**
       * Clear job history
       * @param {*} req : HTTP request argument
       * @param {*} res : HTTP response argument
       * @param {*} next : Callback argument
       */
    clearJobSearchHistory(req, res, next) {
        let response = responseFormat.createResponseTemplate(),
            employeeDetailsId = (req.tokenDecoded) ? req.tokenDecoded.data.employeeDetailsId : 0;

        crudOperationModel.deleteModel(JobSearchAlert, { createdBy: employeeDetailsId, isAlert: 0 })
            .then((isDelete) => {
                response = responseFormat.getResponseMessageByCodes(['success:jobSearchDeleted']);
                res.status(200).json(response);
            })
            .catch(err => {
                let resp = commonMethods.catchError('jobs-controller/clearJobSearchHistory', err);
                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                res.status(resp.code).json(response);
            })
    }
    /**
      * Get jobs Detail
      * @param {*} req : HTTP request argument
      * @param {*} next : Callback argument
      */
    getJobDetails(reqBody, next) {
        let response = {
            statusCode: 200,
            responseFormat: responseFormat.createResponseTemplate()
        },
            msgCode = [];
        if (!reqBody.cjmJobId) {
            msgCode.push('cjmJobId');
            response.responseFormat = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            next(response);
        } else {
            jobsModel.GetJobsDetailById(reqBody)
                .then((jobs) => {
                    if (jobs.length) {
                        if (jobs[0].cjmStatus && jobs[0].cjmStatus.toString().toLowerCase() != 'a') 
                        {
                            response.responseFormat = responseFormat.getResponseMessageByCodes(['cjmJobId:inactiveJob'], { code: 417 });
                            next(response);
                        } 
                        else 
                        { 
                            let encUser = commonMethods.encrypt('JOBSHAREDBY||'+reqBody.employeeDetailsId+'||'+jobs[0].cjmJobId+'||'+new Date().getTime());

                            let jobUrl = configContainer.uiHostUrl+'/jobs/'+reqBody.cjmJobId +(reqBody.employeeDetailsId > 0 ? '?uid='+encUser : '')

                            jobs[0]['linkToShare'] = {
                                emailShare : {
                                    message : "This job is available now. Want it #ApplyNow #hiring. StafflinePro™ "+ jobs[0].jobTitle +' ' + jobUrl,
                                    subject : "StafflinePro™",
                                    title : "StafflinePro"
                                },
                                socialShare : {
                                    message : "This job is available now. Want it #ApplyNow #hiring. StafflinePro™ "+ jobs[0].jobTitle +' ' + jobUrl,
                                    title : "StafflinePro"
                                },
                                url2share : jobUrl
                             }
                            response.responseFormat = responseFormat.getResponseMessageByCodes([''], { content: { dataList: jobs } });
                            next(response);
                        }
                    } else {
                        response.responseFormat = responseFormat.getResponseMessageByCodes(['cjmJobId'], { code: 417 });
                        next(response);
                    }
                })
                .catch((error) => {
                    let resp = commonMethods.catchError('jobs-controller/getJobDetails', error);
                    response.statusCode = resp.code;
                    response.responseFormat = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    next(response);
                })
        }
    }

    /**
    * Get jobs list
    * @param {*} req : HTTP request argument
    * @param {*} next : Callback argument
    */
    getJobDetailList(req, next) {
        let response = {
            statusCode: 200,
            responseFormat: responseFormat.createResponseTemplate()
        },
            reqBody = {
                employeeDetailsId: ~~req.employeeDetailsId,
                pageCount: req.paging ? req.paging.pageCount ? req.paging.pageCount : enums.paging.pageCount : enums.paging.pageCount,
                // pageSize: req.paging ? req.paging.pageSize ? req.paging.pageSize : enums.paging.pageSize : enums.paging.pageSize,
                pageSize: req.paging ? req.paging.pageSize ? req.paging.pageSize : 1000 : 1000,
                keyword: req.keyword ? req.keyword : "",
                location: req.location ? req.location : "",
                miles: (req.miles || req.miles == "0") ? req.miles : ((req.location) ? enums.jobs.defaultMiles : ""),
                isHot: (req.isHot || req.isHot == "0") ? req.isHot : enums.jobs.isHotDefaultValueForAllResult,
                jobCategory: req.jobCategory ? req.jobCategory : "",
                jobAssignmentType: req.jobAssignmentType ? req.jobAssignmentType : "",
                sortRelevance: req.sort ? ((req.sort.relevance) ? req.sort.relevance : "") : "",
                sortDate: req.sort ? ((req.sort.date) ? req.sort.date : "") : "",
                sortDistance: req.sort ? ((req.sort.distance) ? req.sort.distance : "") : "",
                latitude: 0,
                longitude: 0,
                cjmJobIds: req.cjmJobIds ? req.cjmJobIds : "",
                jobListType: req.jobListType ? req.jobListType : "",
                jobTitle: req.jobTitle ? req.jobTitle : "",
                resumeId: req.resumeId
            },
            msgCode = [],
            self = this,
            isJobCount = 0,
            jobList = {};

        // console.log('----------------------------------------reqBody:', reqBody);

        msgCode = jobsValidation.jobSearchValidation(reqBody); 
        if (msgCode.length) {
            response.responseFormat = responseFormat.getResponseMessageByCodes([''], { content: { dataList: jobsModel.getDefaultJobRespose() } });
            next(response);
        } else {
            reqBody.jobCategory = (reqBody.jobCategory) ? reqBody.jobCategory.join(",") : "";
            reqBody.jobAssignmentType = (reqBody.jobAssignmentType) ? reqBody.jobAssignmentType.join(",") : "";

            async.series([
                /*function (done) {
                    //method for get localjobs and other location jobs
                    if (reqBody.jobListType && reqBody.jobListType != enums.jobListType.similarJobs) 
                    {
                        //get local jobs and other location jobs
                        let encodedEmployeedetailsId = new Buffer(reqBody.employeeDetailsId.toString()).toString('base64');
                        let encodedBody = new Buffer(JSON.stringify({ EmployeeId: encodedEmployeedetailsId.toString() })).toString('base64');
                        var options = {
                            method: 'POST',
                            url: config.thirdPartyApiUrl + config.matchingJobEndpoint,
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
                                if (reqBody.jobListType == enums.jobListType.localJobs) {
                                    //rawBody.data.localJobs[0] -999  if user has not update their location in profile
                                    let localJobs = rawBody.data.localJobs ? rawBody.data.localJobs : [];
                                    localJobs = localJobs.map(item => {
                                        return item.CJM_JOB_ID;
                                    });
                                    reqBody.cjmJobIds = localJobs
                                    done();
                                } else if (reqBody.jobListType == enums.jobListType.otherLocationJobs) {
                                    let nonLocalJobs = rawBody.data.nonLocalJobs ? rawBody.data.nonLocalJobs : [];
                                    nonLocalJobs = nonLocalJobs.map(item => {
                                        return item.CJM_JOB_ID;
                                    });
                                    reqBody.cjmJobIds = nonLocalJobs;
                                    done();
                                }
                            } else {
                                done();
                            }
                        })
                    } else {
                        done();
                    }
                }, */               
                function(done)
                {
                    if (reqBody.jobListType && (reqBody.jobListType == enums.jobListType.localJobs || reqBody.jobListType == enums.jobListType.matchingJobs))
                    { 
                        crudOperationModel.findModelByCondition(ResumeMaster, {employeeDetailsId:req.employeeDetailsId})
                        .then( user => {
                            if(!user)
                            {
                                let defaultFormat = jobsModel.getDefaultJobRespose();
                                response.responseFormat = responseFormat.getResponseMessageByCodes([''], { content: { dataList: defaultFormat } });
                                // res.status(200).json(response.responseFormat);
                                next(response);
                            }
                            else
                            {
                                jobsModel.getCandidateSkillAndLocation( req.employeeDetailsId )
                                .then( empData => {
                                    if(empData.length)
                                    {                        
                                        reqBody['keyword'] = req.keyword ? req.keyword : empData[0].skillName,
                                        reqBody['location'] = req.location ? req.location : (empData[0].cityName+','+empData[0].stateName);
                                        reqBody['latitude'] = empData[0].lat;
                                        reqBody['longitude'] = empData[0].long;
                                        reqBody['resumeId'] = (empData[0].resumeId || 0);
                                        done();
                                    }
                                    else
                                    {
                                        done();
                                    }
                                }).catch(err => {
                                    //console.log(err);
                                    done();
                                })
                            }
                        })
                        
                    }
                    else if(reqBody.jobListType && reqBody.jobListType == enums.jobListType.otherLocationJobs)
                    {
                        jobsModel.getCandidateSkillAndLocation( req.employeeDetailsId )
                        .then( empData => {
                            if(empData.length)
                            {                        
                                reqBody['keyword'] = req.keyword ? req.keyword : empData[0].skillName;
                                reqBody['resumeId'] = (empData[0].resumeId || 0);
                                done();
                            }
                            else
                            {
                                done();
                            }
                        }).catch(err => {
                            //console.log(err);
                            done();
                        })
                    }
                    else
                    {
                        done();
                    }
                },
                function (done) {
                    if (reqBody.location && !reqBody['resumeId']) 
                    {
                        jobsModel.getCityMasterDetailsByCondition(reqBody.location)
                            .then((city) => {
                                reqBody.latitude = (city.Latitude || 0);
                                reqBody.longitude = (city.Langitude || 0);
                                done();
                            })
                            .catch(err => {
                                //console.log(err);
                                done();
                            })
                    } 
                    else 
                    {
                        done();
                    }
                },
                function (done) {
                    jobsModel.getJobsList(reqBody)
                        .then((jobDetails) => {
                            isJobCount = jobDetails.paging.totalCount;
                            jobList = jobDetails;
                            done();
                        })
                        .catch((error) => {
                            done();
                        })
                },
                function (done) {
                    async.parallel({
                        jobsDetails: function (done) {
                            done(null, jobList);
                        },
                        searchHistory: function (done) {
                            if (reqBody.employeeDetailsId > 0) {

                                self.SaveJobSearchHistory(reqBody, isJobCount)
                                .then(history => {
                                    self.getJobSearchHistory(reqBody.employeeDetailsId)
                                        .then(searchHistory => {
                                            done(null, searchHistory);
                                        })
                                        .catch((error) => {
                                            done(null, []);
                                        })
                                })
                                .catch((error) => {
                                    done(null, []);
                                })

                            }
                            else {
                                done(null, []);
                            }
                        },
                        locations: function (done) {
                            jobsModel.getJobsLocationsAndCount(reqBody)
                            .then((loc) => {
                                done(null, loc);
                            })
                            .catch((error) => {
                                done(null, []);
                            })
                        },
                        jobType: function (done) {
                            
                            jobsModel.getJobsTypeAndCount(reqBody)
                                .then((jobType) => {
                                    done(null, jobType);
                                })
                                .catch((error) => {
                                    done(null, []);
                                })

                        },
                        jobCategory: function (done) {

                            jobsModel.getJobsCategoryAndCount(reqBody)
                            .then((jobCategory) => {
                                done(null, jobCategory);
                            })
                            .catch((error) => {
                                done(null, []);
                            })

                        },
                        jobAssignmentType: function (done) {

                            jobsModel.getJobsAssignmentTypeAndCount(reqBody)
                                .then((jobAssignment) => {
                                    done(null, jobAssignment);
                                })
                                .catch((error) => {
                                    done(null, []);
                                })
                        },
                        distance: function (done) {
                            if (reqBody.location) {

                                jobsModel.getJobsDistanceAndCount(reqBody)
                                    .then((distance) => {
                                        done(null, distance);
                                    })
                                    .catch((error) => {
                                        done(null, []);
                                    })

                            } else {
                                done(null, []);
                            }
                        }
                    },
                        function (err, results) {
                            let resultData = [];
                            resultData.push({
                                searchHistory: results.searchHistory,
                                paging: results.jobsDetails.paging,
                                sorting: results.jobsDetails.sorting,
                                jobs: results.jobsDetails.jobs,
                                locations: results.locations,
                                jobType: results.jobType,
                                jobCategory: results.jobCategory,
                                jobAssignmentType: results.jobAssignmentType,
                                distance: results.distance
                            })

                            if (err) {
                                let resp = commonMethods.catchError('jobs-controller/clearJobSearchHistory', err);
                                response.statusCode = resp.code;
                                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                next(response);
                            } else {
                                response.responseFormat = responseFormat.getResponseMessageByCodes([''], { content: { dataList: resultData } });
                                next(response);
                            }
                        }
                    );
                }

            ], function (err, results) {
                if (err) {
                    response.statusCode = 200;
                    response.responseFormat = responseFormat.getResponseMessageByCodes([''], { content: { dataList: jobsModel.getDefaultJobRespose() } });
                    next(response);
                }
                response.responseFormat = responseFormat.getResponseMessageByCodes([''], { content: { dataList: results } });
                next(response);
            })
        }
    }


    /**
    * Not a fit job for me
    * @param {*} req : HTTP request argument
    * @param {*} next : Callback argument
    */

    jobNotFit(req, res, next) 
   {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let response = responseFormat.createResponseTemplate(),
            msgCode = [],
            jobId = req.body.jobId,
            matchScore = req.body.matchScore || '',
            fit = req.body.fit ? req.body.fit.toLowerCase() : '';

        let fitOptions = ['no','yes'];
       
        if (!jobId || !commonMethods.isValidInteger(jobId)) 
        {
            msgCode.push('jobId');
        }
        if (fitOptions.indexOf(fit) < 0) 
        {
            msgCode.push('jobId:fit');
        }

        if (msgCode.length) 
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else 
        {  
            
            let user = {};
            let jobInfo = {};

            async.series( [
                function(done)
                {
                    AccountsModel.getCandidateDetails(employeeDetailsId)
                    .then( userdata => {
                        if(userdata)
                        { 
                            user = userdata;
                            done()
                        }
                        else
                        {
                            response = responseFormat.getResponseMessageByCodes(['errorText:invalidUser'], { code: 417 });
                            res.status(200).json(response);
                        }
                    }).catch(e => {
                        done(e)
                    })
                },
                function(done)
                {
                    // get Job-details Data
                    jobsModel.getJobLocationAndKeywordByJobId(jobId)
                    .then(job => {
                        if (job.length) 
                        {
                            jobInfo = job[0];
                            done();
                        } 
                        else 
                        {
                            response = responseFormat.getResponseMessageByCodes(['jobId'], { code: 417 });
                            res.status(200).json(response);
                        }
                    }).catch(e => {
                        done(e)                        
                    })
                },
                function(done)
                {
                    let data = {
                        jobId : jobId,
                        employeeDetailsId : employeeDetailsId,
                        isEligible : fitOptions.indexOf(fit),
                        createdDate : new Date(),
                        createdBy : employeeDetailsId
                    }; 
                    crudOperationModel.saveModel(jobEligibility, data, {employeeDetailsId: employeeDetailsId, jobId: jobId})
                    .then( rs => { 
                        done()
                    }).catch(e => {
                        done(e)
                    })
                },
                /* function(done)
                {
                    jobsModel.getRecruiterDetails(employeeDetailsId)
                    .then(rec => { 
                        if (rec.length) 
                        {
                        }
                        else
                        {
                            response = responseFormat.getResponseMessageByCodes(['noRecruiter'], { code: 417 });
                            res.status(200).json(response);
                        }
                    }).catch(e => {
                        done(e)
                    })
                }, */
                function(done)
                { 
                    if(fit == 'yes')
                    {   
                        done()
                    }
                    else
                    { 
                        // Email to applicant candidate 
                      
                        let userInfo =  ' <br> Name : '+ user.firstName + ' ' + user.lastName + ' <br> '+ 
                                        ' Email : ' + user.emailId + ' <br> '+
                                        ' Current Location : '+(user.state || '' + ','+user.city || '') + ' <br> '+
                                        ' Prefered Location : ' + (user.prefferedCity ? user.prefferedCity.replace(/\|\|/g, " | ") : '') + '<br>' + 
                                        ' Desired Employment : ' + user.desiredEmployement.join(', ')+ '<br>'+
                                        ' Annual Salary : ' + user.annualSalary + ' <br> '+
                                        ' Rate : ' + user.contractRate + ' '+ user.contractRateType + '<br>' +
                                        ' Skills : ' + user.skills;

                        let jobData =   ' <br> Id : '+jobInfo.jobId + ' <br> '+ 
                                        ' Reference Id : '+jobInfo.jobRefId + ' <br> '+   
                                        ' Title : <a href="'+config.uiHostUrl+'/jobs/'+jobInfo.jobId+'">'+jobInfo.jobTitle + '</a> <br> '+ 
                                        ' Location : '+jobInfo.location + ' <br> '+ 
                                        ' keywords : '+jobInfo.keywords + ' <br> '+ 
                                        ' Employment Type : '+jobInfo.cjmAssessmentType + ' <br> '+
                                        ' Matching Score : '+ matchScore;

                        
                        let body = [
                            { name: "CANDIDATEINFO", value: userInfo },
                            { name: "JOBINFO", value: jobData }
                        ]
                      
                        let options = {
                            mailTemplateCode: enums.emailConfig.codes.adminMails.notFitForJob,
                            toMail : [{mailId : null, displayName : null, configKeyName:"SUPPORTMAILID"}],       
                            placeHolders: body
                        };
                     
                        emailModel.mail(options, 'jobs-controller/jobNotFit mail process.')
                        .then(rs => {
                            done()
                            
                        }).catch(e => {
                            done(e)
                        })
                    }
                }
            ] , function(err, result)
            {
                if(err)
                {
                    let resp = commonMethods.catchError('jobs-controller/jobNotFit process.', err);
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

    saveJobAlert(req, res, next)
    {
        let response = responseFormat.createResponseTemplate();
        let employeeDetailsId = req.tokenDecoded ? req.tokenDecoded.data.employeeDetailsId : 0;

        let reqBody = {
            createdBy: (req.tokenDecoded) ? req.tokenDecoded.data.employeeDetailsId : 0,
            searchName: req.body.searchName ? req.body.searchName.trim() : "",
            searchParameter: JSON.stringify(req.body.searchParameter),
            searchParamType : req.body.type == 'jobs' ? enums.jobsSearchType.jobSearch : enums.jobsSearchType.matchingJob,
            searchPage : req.body.type == 'jobs' ? 'joblist/search' : 'joblist/matching',
            webSiteURLName : enums.appRefValueOfStafflinePro,
            status : 1,
            createdDate : new Date()
        };

        let msgCode = [];

        if (reqBody.searchName == "" && req.body.type == 'jobs') 
        {
            msgCode.push('searchName');
        }

        if (reqBody.searchParameter == undefined) 
        {
            msgCode.push('searchParameter');
        }

        if (msgCode.length) 
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else 
        {  
            // value of type [jobs, matching-jobs]
            let type = req.body.type || 'matching-jobs';
            
            async.series([
                function(done)
                {
                    // check if user already saved 5 Alert for Job-Search
                    if(type == 'jobs')
                    {
                        crudOperationModel.findAllByCondition(SearchParameter, { createdBy : employeeDetailsId, searchParamType : enums.jobsSearchType.jobSearch })
                        .then( rs => { 
                            if( rs && rs.length >= 5)
                            {
                                response = responseFormat.getResponseMessageByCodes(['searchName:Max5JobAlert'], { code: 417 });
                                res.status(200).json(response);
                            }
                            else
                            {
                                done();
                            }
                        })
                    }
                    else
                    {
                        done();
                    }
                    
                },
                function(done)
                {
                    // check for duplicate job alert for Job-Search
                    if(type == 'jobs')
                    {
                        crudOperationModel.findModelByCondition(SearchParameter, { 
                            createdBy : employeeDetailsId, 
                            searchParamType : enums.jobsSearchType.jobSearch,
                            searchName : reqBody.searchName
                        })
                        .then( rs => {
                            if(rs)
                            {
                                response = responseFormat.getResponseMessageByCodes(['searchName:jobAlertDuplicate'], { code: 417 });
                                res.status(200).json(response);
                            }
                            else
                            {
                                done();
                            }
                        })
                    }
                    else
                    {
                        done();
                    }
                },
                function(done)
                {
                    if(type == 'jobs')
                    {
                        crudOperationModel.saveModel(SearchParameter, reqBody, {searchParameterId : 0})
                        .then (rs => {
                            if(rs)
                            {
                                response = responseFormat.getResponseMessageByCodes(['success:jobAlertSaved'], {});
                                res.status(200).json(response);
                            }
                            else
                            {
                                response = responseFormat.getResponseMessageByCodes(['errorText:common500'], {code:417});
                                res.status(200).json(response);
                            }
                            
                        })
                    }
                    else
                    {
                        crudOperationModel.saveModel(SearchParameter, reqBody, {createdBy:employeeDetailsId, searchParamType : enums.jobsSearchType.matchingJob})
                        .then (rs => {
                            response = responseFormat.getResponseMessageByCodes(['success:jobAlertSaved'], {});
                            res.status(200).json(response);
                            
                        })
                    }
                }
            ], function(err, result)
            {
                if(err)
                {
                    let resp = commonMethods.catchError('jobs-controller/saveJobAlert.', err);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                }   
                else
                {
                    response = responseFormat.getResponseMessageByCodes(['success:jobAlertSaved'], {});
                    res.status(200).json(response);
                }
            })
        }

    }

    
}