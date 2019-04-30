/**
 *  -------Import all classes and packages -------------
 */
import accountModel from '../../models/accounts/accounts-model';
import TimecardsModel from '../../models/timecards/timecards-model';
import CrudOperationModel from '../../models/common/crud-operation-model';
import responseFormat from '../../core/response-format';
import configContainer from '../../config/localhost';
import logger from '../../core/logger';
import CommonMethods from '../../core/common-methods';
import enums from '../../core/enums';
import TimecardValidation from '../../validations/timecards/timecards-validation';
import StaticPagesModel from '../../models/staticPages/staticPages-model';
import moment from 'moment';
import path from 'path';
import async from 'async';
import fs from 'fs';
import _ from 'lodash'
import pdf from 'html-pdf';
import crypto from 'crypto';
import EmailModel from '../../models/emails/emails-model';

// call entities
import { Invoice_UploadedClientTimeSheets } from "../../entities/timecards/invoice_uploadedclienttimesheets";
import { Invoice_ClientTimeSheet } from "../../entities/timecards/invoice_clienttimesheet";
import { APP_REF_DATA } from "../../entities/common/app-ref-data";
import { Invoice_TimesheetEntryDetails } from "../../entities/timecards/invoice_timesheetentrydetails";
import { ProjectDetails } from "../../entities/myProjects/project-details";
import { ProjectBilling } from "../../entities/timecards/project_billing";
import { EmployeeDetails, ProjectProfile } from '../../entities';

/**
 *  -------Initialize variabls-------------
 */
let config = configContainer.loadConfig(),
    timecardsModel = new TimecardsModel(),
    commonMethods = new CommonMethods(),
    crudOperationModel = new CrudOperationModel(),
    timecardValidation = new TimecardValidation();

const emailModel = new EmailModel();

export default class TimecardsController {
    constructor() {

    }

    /**
     * Get timecards Lookup
      * @param {*} req : HTTP request argument
      * @param {*} res : HTTP response argument
      * @param {*} next : Callback argument
     */
    getTimecardsLookup(req, res, next) {
        let response = responseFormat.createResponseTemplate(),
            msgCode = [],
            employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let respData = [{
            // selectYear: null,
            status: null,
            // currentProject: null,
            defaultHours: enums.timecarDefaultHours.value,
            timecardsExpenseStatus: null,
        }];

        async.parallel({
            statusList: function (done) {
                timecardsModel.getAllStatusLookup(enums.appRefParentId.timecardParentId)
                .then((state) => {
                    done(null, state);
                })
            },
            expenseList: function (done) {
                timecardsModel.getAllStatusLookup(enums.appRefParentId.timecardExpenseParentId)
                .then((expenseStatus) => {
                    done(null, expenseStatus);
                })
            },
            frequencyList: function (done) {
                crudOperationModel.findAllByCondition(APP_REF_DATA,
                    {
                        parentId: enums.appRefParentId.timesheetFrequency,
                        keyId: { $ne: enums.appRefParentId.timesheetFrequency }
                    }, [['keyId', 'id'], ['keyName', 'name']], ['keyName', 'ASC']
                ).then(rs => {
                    done(null, rs)
                })
            },
            },function (err, results) 
            {
                if (err) {
                    let resp = commonMethods.catchError('timecards-controller/getTimecardsLookup', err);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                } 
                else 
                {
                    let resultData = [];
                    resultData.push({
                        status : results.statusList,
                        timecardsExpenseStatus : results.expenseList,
                        frequency : results.frequencyList
                    })
    
                    response.responseFormat = responseFormat.getResponseMessageByCodes([''], { content: { dataList: resultData } });
                    res.status(200).json(response);
                }
            }
        );

        /*
        timecardsModel.getAllStatusLookup(enums.appRefParentId.timecardParentId)
        .then((state) => {
            respData[0].status = state;

            timecardsModel.getAllStatusLookup(enums.appRefParentId.timecardExpenseParentId)
            .then((expenseStatus) => {
                respData[0].timecardsExpenseStatus = expenseStatus;
                response = responseFormat.getResponseMessageByCodes([''], { content: { dataList: respData } });
                res.status(200).json(response);
            })
            .catch((error) => {
                let resp = commonMethods.catchError('timecards-controller/getTimecardsLookup', error);
                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                res.status(resp.code).json(response);
            });
        
        })
        .catch((error) => {
            let resp = commonMethods.catchError('timecards-controller/getTimecardsLookup', error);
            response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
            res.status(resp.code).json(response);
        });
        */
    }

    /**
     * Get all timecards list
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */

    postListAllTimecards(req, res, next) {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId,
            response = responseFormat.createResponseTemplate(),
            msgCode = [],
            inputObj = {
                year : req.body.year ,
                month : req.body.month ,
                status : (req.body.status || 'unsubmitted')
            };


        if(inputObj.status && enums.timecard.statusList.indexOf(inputObj.status) < 0 )
        {
            // msgCode.push('status');
            inputObj.status = 'unsubmitted'
        }

        if (msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else {

            timecardsModel.getAllTimecards(employeeDetailsId, inputObj.year, inputObj.month, inputObj.status)
            .then((timesheet) => { 
              
                response = responseFormat.getResponseMessageByCodes('', { content: { dataList: timesheet } });
                res.status(200).json(response);
            })
            .catch((error) => {
                let resp = commonMethods.catchError('timecards-controller/postListAllTimecards', error);
                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                res.status(resp.code).json(response);
            })
        }
    }

    /**
     * Get missing timecards list (less then 40 hours)
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */
    postListMissingTimecards(req, res, next) {

        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId,
            response = responseFormat.createResponseTemplate(),
            msgCode = [],
            year = req.body.year,
            month = req.body.month,
            ts = [];

        msgCode = timecardValidation.postListMissingTimecards(employeeDetailsId, req.body);

        if (msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        } else {

            timecardsModel.getAllTimecards(employeeDetailsId, year)
                .then((timesheet) => {

                    // timesheet = commonMethods.filterCollectionWithKey(timesheet, enums.timecard.colTotalHours, enums.timecard.weeklyHours, enums.conditions.lessThen);


                    if (month > 0) {
                        // timesheet = commonMethods.filterCollectionWithKey(timesheet, enums.timecard.colMonth, month, enums.conditions.euqals);
                        ts = timesheet.filter(item => {
                            return item.month == month && enums.timecard.missingStatus.indexOf(item.status) > -1
                        });
                    }
                    else {
                        ts = timesheet.filter(item => { return enums.timecard.missingStatus.indexOf(item.status) > -1 });
                    }

                    response = responseFormat.getResponseMessageByCodes('', { content: { dataList: ts } });
                    res.status(200).json(response);
                })
                .catch((error) => {
                    let resp = commonMethods.catchError('timecards-controller/postListAllTimecards', error);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                })
        }
    }

    /**
     * Get all weekendingdate list
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */
    postListAllWeekEndingDates(req, res, next) {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId,
            response = responseFormat.createResponseTemplate(),
            msgCode = [],
            fromDate = req.body.fromDate,
            toDate = req.body.toDate;

        msgCode = timecardValidation.postListWeekEndingDates(employeeDetailsId, req.body);

        if (msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        } else if (fromDate > toDate) {
            response = responseFormat.getResponseMessageByCodes(['fromDate:fromDateCantGreater'], { code: 417 });
            res.status(200).json(response);
        } else {
            timecardsModel.getAllWeekEndingDates(fromDate, toDate)
                .then((weekend) => {
                    response = responseFormat.getResponseMessageByCodes('', { content: { dataList: weekend } });
                    res.status(200).json(response);
                })
                .catch((error) => {
                    let resp = commonMethods.catchError('timecards-controller/getAllWeekEndingDates', error);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                })
        }
    }

    /**
     * Get all previous saved timecard list
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */
    postListSavedTimecards(req, res, next) 
    {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId,
            response = responseFormat.createResponseTemplate(),
            msgCode = [],
            fromDate = req.body.fromDate,
            // toDate = req.body.toDate,
            projectDetailId = req.body.projectDetailId;

        //  msgCode = timecardValidation.getTimecardByDateRange(employeeDetailsId, fromDate, toDate);

         let sdate = moment(req.body.fromDate);
         let sdate1 = moment(req.body.fromDate);
         
         if(new Date(req.body.fromDate).getDay() != 1 && sdate.format('DD') != '01')
         {
            msgCode.push('fromDate'); 
         }

        if (msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        } else {

            timecardsModel.getTimeCardByDateRange(employeeDetailsId, fromDate)
                .then(timecard => {

                    response = responseFormat.getResponseMessageByCodes('', {
                        content: {
                            dataList: [{
                                    // clientApprovedTimecard: timesheet ,
                                    userTimecard: timecard.userTimecard ,
                                    // weekEnding: timecard.weekEnding 
                                }]                                   
                        }
                    });
                    res.status(200).json(response);

                }).catch(err => {
                    let resp = commonMethods.catchError('timecards-controller/getTimeCardByDateRange', err);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                })

        }
    }

    /**
    * Get weekend timecards by Entry Status Id
    * @param {*} req : HTTP request argument
    * @param {*} res : HTTP response argument
    * @param {*} next : Callback argument
    */
    getTimeCardByTSEntryId(req, res, next) {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId,
            response = responseFormat.createResponseTemplate(),
            msgCode = [],
            summaryId = req.params.tsEntryId;

        if (!summaryId) {
            response = responseFormat.getResponseMessageByCodes('', { code: 417 });
            res.status(200).json(response);
        }


        msgCode = timecardValidation.getTimeCardBySummaryId(summaryId);

        if (msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else {
            timecardsModel.getTimeCardByTSEntryId(employeeDetailsId, summaryId)
                .then(timecard => {
                    if (!timecard) {
                        // response = responseFormat.getResponseMessageByCodes('', { content: {messageList : { 'Empty Result': 'No Data Found with this id.'}}});
                        response = responseFormat.getResponseMessageByCodes('', { content: { dataList: [] } });
                        res.status(200).json(response);
                    }
                    else {

                        timecardsModel.getClientTimeSheetByDateAndEmployeeId(timecard.weekEnding[0], employeeDetailsId)

                            .then(docs => {
                                response = responseFormat.getResponseMessageByCodes('', {
                                    content: {
                                        dataList: [{ 
                                            clientApprovedTimecard: docs ,
                                             timeCard: timecard.timeCard ,
                                             timeCardStatus: timecard.timeCardStatus,
                                             weekEnding: timecard.weekEnding }]
                                    }
                                });
                                res.status(200).json(response);

                            }).catch(err => {
                                let resp = commonMethods.catchError('timecards-controller/getTimeCardByTSEntryId', err);
                                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                res.status(resp.code).json(response);
                            })
                    }


                }).catch(err => {
                    let resp = commonMethods.catchError('timecards-controller/getTimeCardByTSEntryId', err);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                })
        }
    }

    /**
    * get timecard content page
    * @param {*} req 
    * @param {*} res 
    * @param {*} next  
    */
    getTimecardContentPage(req, res, next) {

        let response = responseFormat.createResponseTemplate(),
            msgCode = [];

        if (msgCode && msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        } else {
            timecardsModel.getStaticContentPage(enums.pageReferenceId.timecardContentPage)
                //staticPagesModel.getStaticPage(enums.sectionStaticPages.contentPage)
                .then((contentPage) => {
                    response = responseFormat.getResponseMessageByCodes('', { content: { dataList: contentPage } });
                    res.status(200).json(response);
                })
                .catch((error) => {
                    let resp = commonMethods.catchError('timecards-controller/getTimecardContentPage', error);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                })
        }
    }


    /**
     * update or save timecards 
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */

    putSaveTimecards(req, res, next) 
    {

        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let input = req.body.userTimecard;
   
   
        let total = [];
        let msgCode = [];
        let totalRec = 0;
        let response = responseFormat.createResponseTemplate();        
        
        msgCode = timecardValidation.timeCardDetailEntryValidation(input);

        if (msgCode.length) 
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else 
        {
            let testd = moment(input.date.startDate);
            let testd1 = moment(input.date.startDate);
            let testd2 = moment(input.date.startDate);
            let endDate = '';
            let act = {};

            if(testd.endOf('isoweek').format('MM') != testd1.format('MM'))
            {                
                endDate = testd2.endOf('Month').format('YYYY-MM-DD');
            }
            else
            {
                endDate = testd2.endOf('isoweek').format('YYYY-MM-DD')
            }

             async.series([

                function (done) 
                {
                    // check for project status proceed if status is DRAFT only ( status for all projects will be same )
                    let id = input.projects[0].projectId;
                   
                    crudOperationModel.findModelByCondition(Invoice_TimesheetEntryDetails,
                    {
                        ProjectID: id,
                        EmployeeID: employeeDetailsId,
                        EntryDate : {$between : [input.date.startDate, endDate]}

                    }).then(rs => 
                    {   
                        // timecard is with submitted status can't be updated, send user with success message for now and don't update it

                        // if timecard is already submitted, restrict to update it ans show messsage to user
                        if ( rs  && rs.TSEntryStatus != enums.timecard.draftStatusId) 
                        {
                            response = responseFormat.getResponseMessageByCodes(['success:saved']);
                            res.status(200).json(response);
                            // response = responseFormat.getResponseMessageByCodes(['update:updateDisabled'], { code: 417 });
                            // res.status(200).json(response);
                        }
                        else {
                            done();
                        }
                        
                    })
                },
                function(done)
                {
                    // check if all projects are active - its enddate is null OR enddate is between weekend dates
                    let pIds = [];
                    pIds = input.projects.map( item => {
                        return item.projectId
                    });

                    async.every(pIds, function(id, cb)
                    {
                       
                        crudOperationModel.findModelByCondition(ProjectDetails,
                        {
                            projectDetailId: id,
                            $or: [{
                                    endDate : null
                                },
                                {
                                    endDate : {
                                        $between : [input.date.startDate, endDate]
                                    }
                                }]
                            
                        }).then(rs => 
                        {   
                            
                            if(!rs)
                            {
                                cb(true)
                            }
                            else
                            {
                                cb(false, '1')
                            }
                        });

                    }, function(err, rsp)
                    {
                        if(err)
                        {
                            response = responseFormat.getResponseMessageByCodes(['projects:inactiveProject'], { code: 417 });
                            res.status(200).json(response);
                        }
                        else
                        {
                            done()
                        }
                    })
                    
                },
                function(done)
                {
                    timecardsModel.getActiveProjects(employeeDetailsId, input.date.startDate, endDate)
                    .then(activePrjs => {
                
                        activePrjs.map( ac => {
                            act[ac.projectDetailId] = {startDate : ac.startDate, endDate : ac.endDate};
                        })
                        done();
                    })
                },
                function(done)
                {
                    // get billingCycleId and upate in input data
                    async.every(input.projects, (item, cb) => {

                        crudOperationModel.findModelByCondition(ProjectBilling, {ProjectDetail_ID: item.projectId})
                        .then( rs => {
                            if(rs)
                            {
                                item['BillingCycleID'] = rs.Billing_Cycle;
                                cb(null)
                            }
                            else
                            {
                                cb('err')
                            }
                        })
                    }, function(err, rslt){
                        if(err)
                        {
                            response = responseFormat.getResponseMessageByCodes(['errorText:noBillingId'], { code: 417 });
                            res.status(200).json(response);
                        }
                        else
                        { 
                            done();
                        }
                    })
                },
                function (done) 
                {
                   
                    accountModel.getUserById(employeeDetailsId)
                    .then((isUsers) => {
                        if (isUsers) 
                        {
                            for (let i in input.projects) 
                            {                                    
                                let summaryItem = {
                                    EmployeeID: employeeDetailsId,
                                    WeekNumber: moment(new Date(endDate), "YYYY-MM-DD").isoWeek(),
                                    // FromDate: fromDate,
                                    // ToDate: toDate,  
                                    TimesheetCycleId : 0,   
                                    BillingCycleID : input.projects[i].BillingCycleID,                                  
                                    EmployeeType: isUsers.Employee_Type,
                                    RegHrs: parseFloat(Number(input.projects[i].totalRegHrs)),
                                    OTHrs: parseFloat(Number(input.projects[i].totalOtHrs)),
                                    TotalHrs: (parseFloat(Number(input.projects[i].totalRegHrs)) + parseFloat(Number(input.projects[i].totalOtHrs))),
                                    WeekEnd_Date: endDate,
                                    SummaryComments: input.projects[i].comment,
                                    ProjectDetailId: input.projects[i].projectId,
                                    Created_Date: new Date().toISOString(),
                                    Created_By: isUsers.PJEmployee_Id,
                                    IsDeleted: enums.timecard.isDeleted,
                                    InsertFromPage: enums.timecard.insertFromPage
                                };
                             
                                let summaryCond = { EmployeeID: employeeDetailsId, WeekEnd_Date: endDate, ProjectDetailId: input.projects[i].projectId };


                                timecardsModel.saveInvoiceTimesheetEntrySummary(summaryItem, summaryCond)
                                .then(rs => {
                                    
                                    totalRec += input.projects[i].hoursDetail.length;

                                    for(let a=0; a<input.projects[i].hoursDetail.length; a++)
                                    {
                                        let detail = input.projects[i].hoursDetail[a];
                                        
                                        if(act[input.projects[i].projectId].endDate && moment(detail.day).isAfter(act[input.projects[i].projectId].endDate, 'day'))
                                        {
                                            // totalRec--;
                                            totalRec = totalRec - commonMethods.getDifferenceInDays(act[input.projects[i].projectId].endDate, 
                                                                                                    input.projects[i].hoursDetail[input.projects[i].hoursDetail.length-1].day);                                               
                                            break;
                                        }
                                        
                                        let detailItem = {
                                            TSEntery_ID: rs.TSEntery_ID,
                                            EmployeeID: employeeDetailsId,
                                            ProjectID: rs.ProjectDetailId, 
                                            EntryDate: detail.day, 
                                            RegHrs: parseFloat(Number(detail.regHrs)),
                                            OT1Hrs: parseFloat(Number(detail.otHrs)),
                                            TotalHrs: parseFloat(Number(detail.totHrs)),
                                            TSEntryStatus: input.status,
                                            Created_Date: new Date().toISOString(),
                                            Created_By: isUsers.PJEmployee_Id,
                                            IsDeleted: enums.timecard.isDeleted,
                                            InsertFromPage: enums.timecard.insertFromPage
                                        };

                                        let detailCond = { EmployeeID: employeeDetailsId, ProjectID: input.projects[i].projectId, EntryDate: detail.day };

                                        timecardsModel.saveInvoiceTimesheetEntryDetail(detailItem, detailCond)
                                        .then(rs1 => {
                                            total.push(rs1.TSEnteryDetail_ID)                                               
                                            if (total.length == totalRec) 
                                            {
                                                response = responseFormat.getResponseMessageByCodes(['success:saved']);
                                                res.status(200).json(response);
                                            }
                                        })

                                    }
                                })
                                .catch((error) => {
                                    let resp = commonMethods.catchError('timecards-controller/putSaveTimecards saveInvoiceTimesheetEntrySummary', error);
                                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                    res.status(resp.code).json(response);
                                })
                            }
                        }
                        else {
                            response = responseFormat.getResponseMessageByCodes(['invalidAuthToken'], { code: 417 });
                            res.status(200).json(response);
                        }

                    }).catch((error) => {
                        let resp = commonMethods.catchError('timecards-controller/putSaveTimecards', error);
                        response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                        res.status(resp.code).json(response);
                    })
                    
                }

            ],
                function (err, result) {
                    if (err) {
                        let resp = commonMethods.catchError('timecards-controller/putSaveTimecards', err);
                        response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                        res.status(resp.code).json(response);
                    }
                })
        }

       
    }

    /**
     * upload client approved time card document
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */


    uploadClientApprovedTimecard_BACKUP(req, res, next) 
    {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let input = {
            fromDate : req.body.fromDate,
            toDate : req.body.toDate,
            projects : req.body.projects,
            totalHours : req.body.totalHours
        };

        if(input.totalHours)
        {
            input.projects.forEach( it => {
                it['totalHours'] = input.totalHours
            })
        }

        let self = this;

        let response = responseFormat.createResponseTemplate();

        let timecardVars = enums.uploadType.timecardReport; 

        let msgCode = timecardValidation.addDocumentsValidation(input, timecardVars.allowedExt);

        let clientIds = [];
        let uploadIds = [];
        
        if (msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else 
        {   
            accountModel.getUserById(employeeDetailsId)
            .then((isUsers) => {
                if (isUsers) 
                {
                    async.eachSeries(input.projects, function (item, done) 
                    {
                        
                        timecardsModel.checkClientTimesheet(employeeDetailsId, item.projectId, input.fromDate, input.toDate)
                        .then(rs => {                        
                            if (rs) 
                            { 
                                response = responseFormat.getResponseMessageByCodes(['fromDate:documentExists'],  { code: 417 });
                                res.status(200).json(response);
                            }
                            else 
                            {                         
                                let clientSheetData = {
                                    EmployeeID: employeeDetailsId,
                                    ProjectID: item.projectId,
                                    TSFromDate: input.fromDate,
                                    TSToDate: input.toDate,
                                    TotalTimeSheetHrs: item.totalHours, 
                                    ApproveStatus : 0,   
                                    Invoice_Completed: 0,                     
                                    Created_Date: new Date(),
                                    Created_By: employeeDetailsId, 
                                    DataCameFrom: enums.timecard.insertFromPage
                                };

                                let clientCond = { TSUpload_ID: 0 };
                            
                                timecardsModel.saveInvoiceClientTimesheet(clientSheetData, clientCond)
                                .then(rs => {
                                
                                    clientIds.push(rs.TSUpload_ID);

                                    // convert files in pdf and return base64string and upload 
                                    self.convert(item.fileName, item.fileData, function( pdfRs )
                                    {
                                        if(pdfRs.success)
                                        {
                                            commonMethods.fileUpload(pdfRs.fileData, item.fileName+'.pdf', timecardVars.docTypeId)
                                            .then((docFileUpload) => { 
                                                if (docFileUpload.isSuccess) {
        
                                                    let uploadData = {
                                                        TSUpload_Id: rs.TSUpload_ID,
                                                        UploadedTimesheetName: docFileUpload.fileName,
                                                        UploadedTimeSheetLocation: item.fileName, 
                                                        Status: 1,
                                                        Created_Date: new Date(),
                                                        Created_By: employeeDetailsId
                                                    };
        
                                                    let uploadCond = { UploadedTimeSheet_Id: 0 };
        
                                                    timecardsModel.saveInvoiceUploadClientTimesheet(uploadData, uploadCond)
                                                    .then((rs1) => {                                                       
                                                        uploadIds.push(rs1.UploadedTimeSheet_Id);
                                                        done();
                                                    })
                                                    .catch((error) => {
                                                        let resp = commonMethods.catchError('timecards-controller/uploadClientApprovedTimecard', error);
                                                        response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                                        res.status(resp.code).json(response);
                                                    })
                                                }
                                                else {
                                                    // revert data - delete entry from clientsheeData
                                                    done('failedUpload')
                                                }
                                            })
                                        }
                                        else
                                        {
                                            // revert data - delete entry from clientsheeData
                                            done('failedUpload')
                                        }
                                        

                                    })

                                })
                                .catch((error) => {
                                    let resp = commonMethods.catchError('timecards-controller/uploadClientApprovedTimecard saveInvoiceClientTimesheet', error);
                                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                    res.status(resp.code).json(response);
                                })

                                // next();
                            }
                        })

                    }, function (err) {
                        
                        if (err) 
                        {
                            // revert data - delete entry from clientsheeData
                            if(clientIds.length || uploadIds.length)
                            {
                                crudOperationModel.deleteModel(Invoice_ClientTimeSheet, {TSUpload_ID : clientIds})
                                .then(delrs => {

                                })
                                crudOperationModel.deleteModel(Invoice_UploadedClientTimeSheets, {UploadedTimeSheet_Id : uploadIds})
                                .then(delrs1 => {
                                    // response = responseFormat.getResponseMessageByCodes(['errorText:errorFileUpload'], { code: 417 });
                                    // res.status(200).json(response);
                                })

                                response = responseFormat.getResponseMessageByCodes(['errorText:errorFileUpload'], { code: 417 });
                                res.status(200).json(response);
                            }
                            else
                            {
                                let resp = commonMethods.catchError('timecards-controller/uploadClientApprovedTimecard', err);
                                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                res.status(resp.code).json(response);
                            }
                        
                        }
                        else 
                        {
                            response = responseFormat.getResponseMessageByCodes(['success:timesheetUploaded']);
                            res.status(200).json(response);
                        }

                    });
                }
            })
           
            
        }
    }


    uploadClientApprovedTimecard(req, res, next) 
    {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let input = {
            fromDate : req.body.fromDate,
            toDate : req.body.toDate,
            projects : req.body.projects,
            totalHours : req.body.totalHours,
            // uploadedTimeSheetId : req.body.uploadedTimeSheetId || 0,
            // tsUploadId : req.body.tsUploadId || 0
        };

        if(input.totalHours)
        {
            input.projects.forEach( it => {
                it['totalHours'] = input.totalHours
            })
        }

        let self = this;

        let response = responseFormat.createResponseTemplate();

        let timecardVars = enums.uploadType.timecardReport; 

        let msgCode = timecardValidation.addDocumentsValidation(input, timecardVars.allowedExt);

        let clientIds = [];
        let uploadIds = [];
        
        if (msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else 
        {   
            accountModel.getUserById(employeeDetailsId)
            .then((isUsers) => {
                if (isUsers) 
                {
                    async.eachSeries(input.projects, function (item, done) 
                    {
                        
                        timecardsModel.checkClientTimesheet(employeeDetailsId, item.projectId, input.fromDate, input.toDate)
                        .then(rs => {           
                            if (rs && !item.tsUploadId) 
                            { 
                                response = responseFormat.getResponseMessageByCodes(['fromDate:documentExists'],  { code: 417 });
                                res.status(200).json(response);
                            }
                            else 
                            {                         
                                let clientSheetData = {
                                    EmployeeID: employeeDetailsId,
                                    ProjectID: item.projectId,
                                    TSFromDate: input.fromDate,
                                    TSToDate: input.toDate,
                                    TotalTimeSheetHrs: item.totalHours, 
                                    ApproveStatus : 0,   
                                    Invoice_Completed: 0,
                                    DataCameFrom: enums.timecard.insertFromPage
                                };

                                if(item.tsUploadId)
                                {
                                    clientSheetData['UpdatedSP_Name'] = 'Staffline-API-ORM';
                                }
                                else
                                {
                                    
                                    clientSheetData['Created_Date'] = new Date();
                                    clientSheetData['Created_By'] = employeeDetailsId;
                                }

                                let clientCond = { TSUpload_ID: item.tsUploadId };

                                timecardsModel.saveInvoiceClientTimesheet(clientSheetData, clientCond)
                                .then(rs => {

                                    if(!item.uploadedTimeSheetId || (item.uploadedTimeSheetId && (item.fileName && item.fileName != '') && (item.fileData && item.fileData != '') ))
                                    {
                                
                                        clientIds.push(rs.TSUpload_ID);

                                        // convert files in pdf and return base64string and upload 
                                        self.convert(item.fileName, item.fileData, function( pdfRs )
                                        {
                                            if(pdfRs.success)
                                            {
                                                commonMethods.fileUpload(pdfRs.fileData, item.fileName+'.pdf', timecardVars.docTypeId)
                                                .then((docFileUpload) => { 
                                                    if (docFileUpload.isSuccess) {
            
                                                        let uploadData = {
                                                            TSUpload_Id: rs.TSUpload_ID,
                                                            UploadedTimesheetName: docFileUpload.fileName,
                                                            UploadedTimeSheetLocation: item.fileName, 
                                                            Status: 1,
                                                        }

                                                        if(item.uploadedTimeSheetId)
                                                        {
                                                            uploadData['Modified_Date'] = new Date();
                                                            uploadData['Modified_By'] = employeeDetailsId;
                                                        }
                                                        else
                                                        {
                                                            uploadData['Created_Date'] = new Date();
                                                            uploadData['Created_By'] = employeeDetailsId;
                                                        }
                                                            
                                                        let uploadCond = { UploadedTimeSheet_Id: item.uploadedTimeSheetId };
            
                                                        timecardsModel.saveInvoiceUploadClientTimesheet(uploadData, uploadCond)
                                                        .then((rs1) => {                                                       
                                                            uploadIds.push(rs1.UploadedTimeSheet_Id);
                                                            done();
                                                        })
                                                        .catch((error) => {
                                                            let resp = commonMethods.catchError('timecards-controller/uploadClientApprovedTimecard', error);
                                                            response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                                            res.status(resp.code).json(response);
                                                        })
                                                    }
                                                    else {
                                                        // revert data - delete entry from clientsheeData
                                                        done('failedUpload')
                                                    }
                                                })
                                            }
                                            else
                                            {
                                                // revert data - delete entry from clientsheeData
                                                done('failedUpload')
                                            }
                                        })

                                    }
                                    else
                                    {
                                        done()
                                    }

                                })
                                .catch((error) => {
                                    let resp = commonMethods.catchError('timecards-controller/uploadClientApprovedTimecard saveInvoiceClientTimesheet', error);
                                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                    res.status(resp.code).json(response);
                                })

                            }
                        })

                    }, function (err) {
                        
                        if (err) 
                        {
                            // revert data - delete entry from clientsheeData
                            if(clientIds.length || uploadIds.length)
                            {
                                crudOperationModel.deleteModel(Invoice_ClientTimeSheet, {TSUpload_ID : clientIds})
                                .then(delrs => {

                                })
                                crudOperationModel.deleteModel(Invoice_UploadedClientTimeSheets, {UploadedTimeSheet_Id : uploadIds})
                                .then(delrs1 => {
                                    // response = responseFormat.getResponseMessageByCodes(['errorText:errorFileUpload'], { code: 417 });
                                    // res.status(200).json(response);
                                })

                                response = responseFormat.getResponseMessageByCodes(['errorText:errorFileUpload'], { code: 417 });
                                res.status(200).json(response);
                            }
                            else
                            {
                                let resp = commonMethods.catchError('timecards-controller/uploadClientApprovedTimecard', err);
                                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                res.status(resp.code).json(response);
                            }
                        
                        }
                        else 
                        {
                            // send timesheet update email

                            timecardsModel.getEmployeeDetails(employeeDetailsId)
                            .then( emp => {
                                if( emp.length )
                                {
                                    let rs = emp[0];
                                    let data = [
                                        {name : "EMPLOYEENAME", value : rs.firstName + ' '+ rs.lastName},
                                        {name : "PJEMPLOYEEID", value : rs.employeeId},
                                        {name : "DATERANGE", value : input.fromDate + ' - '+ input.toDate},
                                        {name : "TOTALTIMESHEETHOURS", value : input.projects[0].totalHours},
                                        {name : "PROJECTNAME", value : input.projects[0].projectName},
                                        {name : "BATCHID", value : rs.batchId},
                                    ];

                                    let subject = 'New Timesheet Added By: '+rs.firstName + ' '+ rs.lastName + ' / (Batch Id: '+ rs.batchId +' )';

                                    let options = {        
                                            mailTemplateCode : enums.emailConfig.codes.timeSheetUploaded.code,
                                            subject : subject,
                                            toMail : [{mailId : enums.emailConfig.codes.eMails.timesheet, displayName : 'Timesheet'}],                                                                    
                                            placeHolders : data,
                                            ccMail : [
                                                {mailId : enums.emailConfig.codes.eMails.balram, displayName : 'BTripathi'},
                                                {mailId : enums.emailConfig.codes.eMails.hrawat, displayName : 'Hrawat'}
                                            ]
                                    }
                                    
                                    logger.info(options)

                                    emailModel.mail(options, 'timecards-controller/uploadClineapprovedTimecard mail')
                                    .then( rs =>{ })
                                }

                            });

                            response = responseFormat.getResponseMessageByCodes(['success:timesheetUploaded']);
                            res.status(200).json(response);
                        }

                    });
                }
            })
           
            
        }
    }



    /**
     * delete time card document
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */


    deleteClientTimesheetInvoice(req, res, next) {

        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;

        let invoiceId = ~~req.params.uploadedTimeSheetId;


        let response = responseFormat.createResponseTemplate();

        let msgCode = timecardValidation.timeSheetInvoiceDeteleValidation(invoiceId);

        if (msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else {
            crudOperationModel.findModelByCondition(Invoice_UploadedClientTimeSheets,
                {
                    UploadedTimeSheet_Id: invoiceId
                }).then(rs => {
                    if (rs) {
                        crudOperationModel.findModelByCondition(Invoice_ClientTimeSheet,
                            {
                                TSUpload_ID: rs.TSUpload_Id,
                                EmployeeID: employeeDetailsId
                            }).then(rs1 => {
                                if (rs1) {
                                    crudOperationModel.deleteModel(Invoice_UploadedClientTimeSheets, { UploadedTimeSheet_Id: invoiceId })
                                        .then(rs => {
                                            response = responseFormat.getResponseMessageByCodes(['success:deleted']);
                                            res.status(200).json(response);
                                        }).catch((error) => {                                          
                                            let resp = commonMethods.catchError('timecards-controller/deleteClientTimesheetInvoice', error);
                                            response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                            res.status(resp.code).json(response);
                                        })

                                }
                                else {

                                    response = responseFormat.getResponseMessageByCodes(['uploadedTimeSheetId'], { code: 417 });
                                    res.status(200).json(response);
                                }

                            }).catch(err => {
                                let resp = commonMethods.catchError('timecards-controller/deleteClientTimesheetInvoice', err);
                                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                res.status(resp.code).json(response);
                            })
                    }
                    else {
                        response = responseFormat.getResponseMessageByCodes(['uploadedTimeSheetId'], { code: 417 });
                        res.status(200).json(response);
                    }

                }).catch(err => {
                    let resp = commonMethods.catchError('timecards-controller/deleteClientTimesheetInvoice', err);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                })


        }

    }


    /**
     * Get Client approved Time cards list
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */

    getClientApprovedTimecardList(req, res, next)
    {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId,
            response = responseFormat.createResponseTemplate(),
            msgCode = [],
            year = req.body.year,
            month = req.body.month;
            
        
        if (msgCode.length) 
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        } 
        else 
        {
            timecardsModel.getClientApprovedTimecardList(employeeDetailsId, year, month)
            .then( rs => {
                response = responseFormat.getResponseMessageByCodes('', { content: { dataList: rs } });
                res.status(200).json(response);
            })
        }

    }

    /**
     * Get List of active projects
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */
    getActiveProjects(req, res, next)
    {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId,
            response = responseFormat.createResponseTemplate(),
            msgCode = [],
            startDate = req.body.fromDate,
            endDate = req.body.toDate;
            
        if (!startDate || !commonMethods.isValidDate(startDate)) 
        {
            msgCode.push('fromDate:date');
        }
        if (!endDate || !commonMethods.isValidDate(endDate)) {
            msgCode.push('toDate:date');
        }

        if (new Date(startDate).getTime() > new Date(endDate).getTime()) {
            msgCode.push('toDate:invalidDateRange')
        }
    
        if (msgCode.length) 
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        } 
        else 
        {
            timecardsModel.getActiveProjects(employeeDetailsId, startDate, endDate)
            .then( rs => {
                if(rs.length)
                {
                    rs.forEach( item => {
                        item.projectId = item.projectDetailId;
                        delete item.projectDetailId;
                    })
                }
                response = responseFormat.getResponseMessageByCodes('', { content: { dataList: rs } });
                res.status(200).json(response);
            })
        }

    }

    /**
     * Get Client approved Time cards Details
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */
    getClientApprovedTimecardDetails(req, res, next)
    {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId,
            response = responseFormat.createResponseTemplate(),
            msgCode = [],
            startDate = req.body.fromDate,
            endDate = req.body.toDate;

        let timecardVars = enums.uploadType.timecardReport;
            
        if (!startDate || !commonMethods.isValidDate(startDate)) 
        {
            msgCode.push('fromDate:date');
        }
        if (!endDate || !commonMethods.isValidDate(endDate)) {
            msgCode.push('toDate:date');
        }

        if (new Date(startDate).getTime() > new Date(endDate).getTime()) {
            msgCode.push('toDate:invalidDateRange')
        }
    
        if (msgCode.length) 
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        } 
        else 
        {
            timecardsModel.getTimecardsDocumentList(employeeDetailsId, startDate, endDate)
            .then( rs => { 
                if(rs.length)
                { 
                    let out = {startDate :'',endDate : '', totalHours: 0, projects:[]};
                    out.startDate = startDate;
                    out.endDate = endDate;
                    // out.totalHours = rs[0].totalTimeSheetHrs;
                    out.totalHours = rs.length > 1 ? rs.reduce( function(a, b) { return a.totalTimeSheetHrs + b.totalTimeSheetHrs}) : rs[0].totalTimeSheetHrs;
                    out.totalHours = parseFloat(out.totalHours).toFixed(2);

                    rs.forEach( item => {
                        out.projects.push({
                            totalHours : item.totalTimeSheetHrs,
                            projectId : item.projectId,
                            projectName : item.projectTitle,
                            fileName : item.fileName,
                            path : config.portalHostUrl + config.documentBasePath + timecardVars.path + '/' + item.filePath                           
                        })
                    });
                
                    response = responseFormat.getResponseMessageByCodes('', { content: { dataList: [out] } });
                    res.status(200).json(response);
                }
                else
                {
                    response = responseFormat.getResponseMessageByCodes('', { content: { dataList: rs } });
                    res.status(200).json(response);
                }
            })
        }

    }

    /**
     * Get Pending hours list 
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */

    getPendingHours(req, res, next)
    {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId,
            response = responseFormat.createResponseTemplate();
       
        let sdate = moment(req.body.fromDate);
        let sdate1 = moment(req.body.fromDate);
        
        timecardsModel.getTimecardsPendingHours(employeeDetailsId)
        .then((timesheet) => { 
            response = responseFormat.getResponseMessageByCodes('', { content: { dataList: timesheet } });
            res.status(200).json(response);
        })
        .catch((error) => {
            let resp = commonMethods.catchError('timecards-controller/getPendingHours', error);
            response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
            res.status(resp.code).json(response);
        })
    }

    
    getActiveProjectsWithHours(req, res, next)
    {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId,
            response = responseFormat.createResponseTemplate(),
            msgCode = [],
            startDate = req.body.fromDate,
            endDate = req.body.toDate;

        let timecardVars = enums.uploadType.timecardReport;
            
        if (!startDate || !commonMethods.isValidDate(startDate)) 
        {
            msgCode.push('fromDate:date');
        }
        if (!endDate || !commonMethods.isValidDate(endDate)) {
            msgCode.push('toDate:date');
        }

        if (new Date(startDate).getTime() > new Date(endDate).getTime()) {
            msgCode.push('toDate:invalidDateRange')
        }
    
        if (msgCode.length) 
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        } 
        else 
        {
            timecardsModel.getActiveProjectsWithHOurs(employeeDetailsId, startDate, endDate)
            .then( rs => { 
                if(rs.length)
                { 
                    let out = {startDate :'',endDate : '', totalHours: 0, projects:[]};
                    out.startDate = startDate;
                    out.endDate = endDate;
                    // out.totalHours = rs[0].totalTimeSheetHrs;
                    out.totalHours = rs.length > 1 ? rs.reduce( function(a, b) { return a.totalTimeSheetHrs + b.totalTimeSheetHrs}) : rs[0].totalTimeSheetHrs;
                    out.totalHours = parseFloat(out.totalHours).toFixed(2);

                    rs.forEach( item => {
                        out.projects.push({
                            uploadedTimeSheetId : item.uploadedTimeSheetId,
                            tsUploadId : item.tsUploadId,
                            totalHours : item.totalTimeSheetHrs,
                            projectId : item.projectId,
                            projectName : item.projectTitle,
                            fileName : item.fileName,
                            path : item.filePath ? config.portalHostUrl + config.documentBasePath + timecardVars.path + '/' + item.filePath : ''
                        })
                    });
                
                    response = responseFormat.getResponseMessageByCodes('', { content: { dataList: [out] } });
                    res.status(200).json(response);
                }
                else
                {
                    response = responseFormat.getResponseMessageByCodes('', { content: { dataList: rs } });
                    res.status(200).json(response);
                }
            })
        }

    }


    convert(fileName, fileData, next)
    {
        let fileExt = path.extname(fileName).toLowerCase();
       
        commonMethods.convertOfficeDocToPdf(fileName, fileData)
        .then( r => {
            return next(r)
        })
        
       
    }

    getAllTimecards_New(req, res, next)
    {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId,
            response = responseFormat.createResponseTemplate();
       
        let msgCode = [];
        let startDate = req.body.startDate || '';
        let endDate = req.body.endDate || '';
        let status = req.body.status ? req.body.status.toLowerCase().trim() : 'pending';

        if(startDate && (!endDate || endDate == ''))
        {
            msgCode.push('endDate')
        }

        if(endDate && (!startDate || startDate == ''))
        {
            msgCode.push('startDate')
        }

        if (msgCode.length) 
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        } 
        else 
        {
            if(status == 'pending')
            {
                timecardsModel.getClientApprovedTimecardList_New(employeeDetailsId)
                .then((timesheet) => { 
                    
                    response = responseFormat.getResponseMessageByCodes('', { content: { dataList: timesheet } });
                    res.status(200).json(response);
                })
                .catch((error) => {
                    let resp = commonMethods.catchError('timecards-controller/getAllTimecards_New pending', error);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                })
            }
            else 
            {
                let statusId = status == 'submitted' ? 0 : 2;
                timecardsModel.getClientApprovedStatus(employeeDetailsId, statusId, startDate, endDate)
                .then((timesheet) => { 
                    
                    response = responseFormat.getResponseMessageByCodes('', { content: { dataList: timesheet } });
                    res.status(200).json(response);
                })
                .catch((error) => {
                    let resp = commonMethods.catchError('timecards-controller/getAllTimecards_New', error);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                })
            }
        }

        
      
    }

    //*************** New Methods for Timecard ************************ */

    getPendingTimeSheet(req, res, next)
    {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId,
            response = responseFormat.createResponseTemplate();

        let msgCode = [];
        let startDate = req.body.startDate || '';
        let endDate = req.body.endDate || '';
        let status = req.body.status ? req.body.status.toLowerCase().trim() : 'pending';

        if(startDate && (!endDate || endDate == ''))
        {
            msgCode.push('endDate')
        }

        if(endDate && (!startDate || startDate == ''))
        {
            msgCode.push('startDate')
        }

        if (msgCode.length) 
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        } 
        else 
        {

            if(status == 'pending')
            {
                timecardsModel.getPendingTimeSheet(employeeDetailsId)
                .then((timesheet) => { 
                    
                    response = responseFormat.getResponseMessageByCodes('', { content: { dataList: timesheet } });
                    res.status(200).json(response);
                })
                .catch((error) => {
                    let resp = commonMethods.catchError('timecards-controller/getPendingTimeSheet pending', error);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                })
            }
            else 
            {
                let statusId = status == 'submitted' ? 0 : 2;
                timecardsModel.getTimesheetHoursDetail(employeeDetailsId, statusId, startDate, endDate)
                .then((timesheet) => { 
                    response = responseFormat.getResponseMessageByCodes('', { content: { dataList: timesheet } });
                    res.status(200).json(response);
                })
                .catch((error) => {
                    let resp = commonMethods.catchError('timecards-controller/getPendingTimeSheet', error);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                })
            }

        }
        
    }

    getTimecardHoursDetail(req, res, next)
    {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId,
            response = responseFormat.createResponseTemplate();
       
        let msgCode = [];
        let startDate = req.body.startDate;
        let endDate = req.body.endDate;
        let projectId = req.body.projectId;
 
        timecardsModel.getTimecardHoursDetail(employeeDetailsId, projectId, startDate, endDate)
        .then((timesheet) => { 
            
            response = responseFormat.getResponseMessageByCodes('', { content: { dataList: timesheet } });
            res.status(200).json(response);
        })
        .catch((error) => {
            let resp = commonMethods.catchError('timecards-controller/getTimecardHoursDetail', error);
            response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
            res.status(resp.code).json(response);
        })
        
    }

    saveTimecardHours(req, res, next)
    {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId,
            response = responseFormat.createResponseTemplate();
       
        let msgCode = [];

        let timecard = {
            date : req.body.date,
            project: req.body.project
        };

        let billingCycleID = 0;
        let hoursData = [];

        let operationType = 0 ;
       
        // console.log(timecard.project.hoursDetail)

        msgCode = timecardValidation.saveTimecardHoursValidation(timecard);

        if (msgCode.length) 
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else 
        {
            async.series([

                function(done)
                {
                    // check if project is active - its end date is null OR end date is between weekend dates
                    crudOperationModel.findModelByCondition(ProjectDetails,
                    {
                        projectDetailId: timecard.project.projectId,
                        $or: [{
                            endDate : {
                                $eq : null
                            }
                        },
                        {
                            endDate : {
                                $gt : timecard.date.toDate
                            }
                        },
                        {
                            endDate : {
                                $between : [timecard.date.fromDate, timecard.date.toDate]
                            }
                        }]
                        
                    }).then(rs => 
                    {   
                        
                        if(!rs)
                        {
                            // let resp = commonMethods.catchError('timecards-controller/putSaveTimecards', err);
                            response = responseFormat.getResponseMessageByCodes(['errorText:ProjectEnded'], { code: 417 });
                            res.status(200).json(response);
                        }
                        else
                        {
                            done()
                        }
                    });

                },
                function(done)
                {
                    // get billingCycleId and upate in input data
                    crudOperationModel.findModelByCondition(ProjectBilling, { ProjectDetail_ID : timecard.project.projectId })
                    .then( rs => {
                        if(rs)
                        {
                            billingCycleID = rs.Billing_Cycle;
                            done()
                        }
                        else
                        {
                            done('no billing cycle found')
                        }
                    })
                    
                },
                function(done) 
                {
                    let weekRegHrs = 0;
                    let weekOtHrs = 0;
                    let weekDtHrs = 0;
                    let index = 1;
                    timecard.project.hoursDetail.forEach( item => { 
                        // console.log(item)
                        weekRegHrs += item.regHrs; 
                        weekOtHrs += item.otHrs; 
                        weekDtHrs += (typeof item.dtHrs == 'undefined') ? 0 : item.dtHrs; 
                        
                        if(new Date(item.day).getDay() == 0 || new Date(item.day).getDate() == moment(item.day).clone().endOf('month').format('DD'))
                        {
                            hoursData.push({
                                regHrs : weekRegHrs,
                                otHrs : weekOtHrs,
                                dtHrs : weekDtHrs,
                                weekEnd : item.day,
                                weekEndId : item.weekEndId,
                                employeeId : employeeDetailsId,
                                index : index
                            })
                            weekRegHrs = 0;
                            weekOtHrs = 0;
                            weekDtHrs = 0;
                        }
                        else if(timecard.project.hoursDetail.length < 7)
                        {
                            hoursData.push({
                                regHrs : weekRegHrs,
                                otHrs : weekOtHrs,
                                dtHrs : weekDtHrs,
                                weekEnd : moment(item.day).clone().endOf('isoWeek').format('YYYY-MM-DD'),
                                weekEndId : item.weekEndId,
                                employeeId : employeeDetailsId,
                                index : index
                            })
                            weekRegHrs = 0;
                            weekOtHrs = 0;
                            weekDtHrs = 0;
                        }

                        if(index == timecard.project.hoursDetail.length && new Date(item.day).getDay() != 0 && new Date(item.day).getDate() != moment(item.day).clone().endOf('month').format('DD'))
                        { 
                            hoursData.push({
                                regHrs : weekRegHrs,
                                otHrs : weekOtHrs,
                                dtHrs : weekDtHrs,
                                weekEnd : moment(item.day).clone().endOf('isoWeek').format('YYYY-MM-DD'),
                                weekEndId : item.weekEndId,
                                employeeId : employeeDetailsId,
                                index : index
                            })
                            weekRegHrs = 0;
                            weekOtHrs = 0;
                            weekDtHrs = 0;

                            // if(!item.detailId > 0)
                            // {
                            //     timecard.project.hoursDetail = timecard.project.hoursDetail.concat(timecardsModel.generateDaysWithStatus(moment(item.day).clone().add(1, 'days'), moment(item.day).clone().endOf('isoWeek').format('YYYY-MM-DD'), item.statusId))
                            // }

                        }

                        index++;
                    })

                    // console.log('hoursData', hoursData, timecard.project.hoursDetail)
                    
                    /* 
                    for (let i in hoursData) 
                    { 
                        //console.log('summary ',hoursData[i].weekEnd, ' - ',hoursData[i].weekEndId)
                        for(let a = i == 0 ? i : hoursData[i-1].index ; a < timecard.project.hoursDetail.length; a++)
                        {
                            
                            if(hoursData[i].weekEnd < timecard.project.hoursDetail[a].day)
                            {
                                continue;
                            }
                            //console.log('detail ', timecard.project.hoursDetail[a].day,' - ', timecard.project.hoursDetail[a].detailId)
                        }   
                    }
                    return  */
                    
                   done();
                },
                /*function(done)
                {
                    // get summary id for every weekend 
                    if(!hoursData.length)
                    {
                        done('Timecard not found, weekdata not found')
                    }
                    // get saved hours for each day for each project from timecardDetail and add new timecard
                    async.each(hoursData, function(item, cb)
                    {
                        // console.log(item)
                        if(!item.totalHours)
                        {
                            timecardsModel.getTimecardSummary(employeeDetailsId, item.weekEnd)
                            .then( rs => { 
                                // console.log(rs)
                                if(rs.length == 1 && rs[0].ProjectId != timecard.project.projectId)
                                {
                                    item.weekEndId = rs.length ? rs[0].TSEntery_ID : 0;
                                    item.regHrs = rs.length ? item.regHrs + rs[0].regHrs : 0;
                                    item.otHrs = rs.length ? item.otHrs + rs[0].otHrs : 0;
                                }
                                else if(rs.length == 1 && rs[0].ProjectId == timecard.project.projectId)
                                {
                                    item.weekEndId = rs.length ? rs[0].TSEntery_ID : 0;
                                    item.regHrs = rs.length ? rs[0].regHrs : 0;
                                    item.otHrs = rs.length ? rs[0].otHrs : 0;
                                }
                                else if(rs.length > 1)
                                {
                                    item.weekEndId =  rs[0].TSEntery_ID;
                                    rs.forEach( i => {
                                        
                                        if(i.ProjectId != timecard.project.projectId)
                                        {
                                            item.regHrs = item.regHrs + i.regHrs;
                                            item.otHrs = item.otHrs + i.otHrs;
                                        }
                                    })                                  
                                }

                                cb(null)
                            })
                        }
                        else
                        {
                            cb(null)
                        }
                    }, function(err)
                    {
                        if(err)
                        {
                            //console.log('-----------', err)
                            done(err)
                        }   
                        done()
                    })

                },*/
                function(done)
                {
                    // return
                    let totalRec = 0;
                    let total = [];

                    accountModel.getUserById(employeeDetailsId)
                    .then((isUsers) => {
                        if (isUsers) 
                        {
                            for (let i in hoursData) 
                            {                                    
                                let summaryItem = {
                                    EmployeeID: employeeDetailsId,
                                    WeekNumber: moment(new Date(hoursData[i].weekEnd), "YYYY-MM-DD").isoWeek(),
                                    // FromDate: fromDate,
                                    // ToDate: toDate,  
                                    TimesheetCycleId : 0,   
                                    BillingCycleID : billingCycleID,                                  
                                    EmployeeType: isUsers.Employee_Type,
                                    RegHrs: 0, //parseFloat(Number(hoursData[i].regHrs)).toFixed(2),
                                    OTHrs: 0,//parseFloat(Number(hoursData[i].otHrs)).toFixed(2),
                                    OT2Hrs: 0,//parseFloat(Number(hoursData[i].dtHrs)).toFixed(2),
                                    TotalHrs: 0,//parseFloat(Number(hoursData[i].regHrs) + Number(hoursData[i].otHrs)).toFixed(2),
                                    WeekEnd_Date: hoursData[i].weekEnd,
                                    SummaryComments: timecard.project.comment,
                                    // ProjectDetailId: timecard.project.projectId,
                                    Created_Date: new Date().toISOString(),
                                    Created_By: employeeDetailsId,
                                    IsDeleted: enums.timecard.isDeleted,
                                    InsertFromPage: enums.timecard.insertFromPage
                                };
                                
                                // let summaryCond = { EmployeeID: employeeDetailsId, WeekEnd_Date: hoursData[i].weekEnd, TSEntery_ID: hoursData[i].weekEndId };

                                let summaryCond = { EmployeeID: employeeDetailsId, WeekEnd_Date: hoursData[i].weekEnd };
                            
                                timecardsModel.saveInvoiceTimesheetEntrySummary(summaryItem, summaryCond)
                                .then(rs => {
                                    
                                    // totalRec += hoursData[i].hoursDetail.length;

                                    for(let a = i == 0 ? i : hoursData[i-1].index ; a < timecard.project.hoursDetail.length; a++)
                                    {
                                        
                                        if(hoursData[i].weekEnd < timecard.project.hoursDetail[a].day)
                                        {
                                            continue;
                                        }

                                        let detail =  timecard.project.hoursDetail[a]; 
                                    
                                        detail.dtHrs = (typeof detail.dtHrs == 'undefined') ? 0 : detail.dtHrs;
                                        let detailItem = {
                                            TSEntery_ID: rs.TSEntery_ID,
                                            EmployeeID: employeeDetailsId,
                                            ProjectID: timecard.project.projectId, 
                                            EntryDate: detail.day, 
                                            RegHrs: parseFloat(Number(detail.regHrs)),
                                            OT1Hrs: parseFloat(Number(detail.otHrs)),
                                            OT2Hrs: parseFloat(Number(detail.dtHrs)),
                                            TotalHrs: parseFloat(Number(detail.regHrs) + Number(detail.otHrs) + Number(detail.dtHrs)).toFixed(2),
                                            TSEntryStatus: detail.statusId,
                                            Created_Date: new Date().toISOString(),
                                            Created_By: employeeDetailsId,
                                            IsDeleted: enums.timecard.isDeleted,
                                            InsertFromPage: enums.timecard.insertFromPage
                                        };
                                        
                                        let detailCond = { EmployeeID: employeeDetailsId, ProjectID: timecard.project.projectId, EntryDate: detail.day };
                                        
                                        timecardsModel.saveInvoiceTimesheetEntryDetail(detailItem, detailCond)
                                        .then(rs1 => { 
                                            total.push(rs1.TSEnteryDetail_ID);
                                            if (total.length == timecard.project.hoursDetail.length) 
                                            {
                                                done()
                                                // response = responseFormat.getResponseMessageByCodes(['success:saved']);
                                                // res.status(200).json(response);
                                            }
                                        })

                                    }
                                })
                                .catch((error) => {
                                    let resp = commonMethods.catchError('timecards-controller/putSaveTimecards saveInvoiceTimesheetEntrySummary', error);
                                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                    res.status(resp.code).json(response);
                                })
                            }
                        }
                        else {
                            response = responseFormat.getResponseMessageByCodes(['invalidAuthToken'], { code: 417 });
                            res.status(200).json(response);
                        }

                    }).catch((error) => {
                        let resp = commonMethods.catchError('timecards-controller/putSaveTimecards', error);
                        response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                        res.status(resp.code).json(response);
                    })
                    
                    
                },
                function(done)
                {
                    async.each(hoursData, function(item, cb)
                    {
                        
                        timecardsModel.getTimecardSummary(employeeDetailsId, item.weekEnd)
                        .then( rs => { 
                            // console.log(rs)
                            if(rs.length)
                            {
                                // let summaryItem = {
                                //     RegHrs: rs[0].regHrs,
                                //     OTHrs: rs[0].otHrs,
                                //     TotalHrs: rs[0].totalHrs
                                // };

                                let summaryItem = {
                                    RegHrs: _.sumBy(rs,'regHrs'),
                                    OTHrs: _.sumBy(rs,'otHrs'),
                                    OT2Hrs: _.sumBy(rs,'dtHrs'),
                                    TotalHrs: _.sumBy(rs,'totalHrs')
                                };
                                
                                let summaryCond = { EmployeeID: employeeDetailsId, TSEntery_ID: rs[0].TSEntery_ID };
    
                                timecardsModel.saveInvoiceTimesheetEntrySummary(summaryItem, summaryCond)
                                .then(rs => {
                                    
                                })
                            }

                            cb(null)
                        })
                        
                    }, function(err)
                    {
                        if(err)
                        {
                            let resp = commonMethods.catchError('timecards-controller/putSaveTimecards', err);
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

            ],
                function (err, result) {
                    if (err) {
                        let resp = commonMethods.catchError('timecards-controller/putSaveTimecards', err);
                        response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                        res.status(resp.code).json(response);
                    }
                })
        }

    }

    createMannualTimecardPdf(req, res, next)
    {
        let html = fs.readFileSync(__dirname+'/../../Upload/timeSheet.html', 'utf8');
      
        let options = { 
            format: 'Letter', 
            paginationOffset: 1,
            "header": {
                "height": "10mm",
                //"contents": '<div style="text-align: center;">Author: Marc Bachmann</div>'
            },
            "footer": {
                "height": "15mm",
                "contents": {
                    default: '<div style="color: #444;text-align:center;"><span>{{page}}</span> of <span>{{pages}}</span>'
                            + '<br><span style="font-size:8px">'+moment(new Date()).format('ddd - MMM DD, YYYY HH:mm a')+'</span></div>', 
                }
            },
            "phantomPath": "./node_modules/phantomjs-1.9.8-linux-x86_64/bin/phantomjs"
        };

        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId,
            response = responseFormat.createResponseTemplate();
       
        let msgCode = [];
        let startDate = req.body.startDate;
        let endDate = req.body.endDate;
        let projectId = req.body.projectId;

        if(!startDate)
        {
            msgCode.push('startDate')
        }
        if(!endDate)
        {
            msgCode.push('endDate')
        }
        if(!projectId)
        {
            msgCode.push('projectId')
        }

        if(msgCode.length)
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else
        {
            let loggedUser = {};
            let projectDetails = {};
            async.series([
                function(done)
                {
                    // get user Details
                    crudOperationModel.findModelByCondition(EmployeeDetails, {employeeDetailsId : employeeDetailsId})
                    .then( rs => {
                        loggedUser = rs;
                        done()
                    })
                },
                function(done)
                {
                    // get client name
                    timecardsModel.getProjectDetails(employeeDetailsId, projectId)
                    .then( rs => { 
                        if(rs.length)
                        {
                            projectDetails = rs[0];
                            done()
                        }
                        else
                        {
                            done('project not found')
                        }
                    })
                },
                function(done)
                {
                    timecardsModel.getTimecardHoursDetail(employeeDetailsId, projectId, startDate, endDate)
                    .then((timesheet) => { 
                    
                        if(timesheet.length) 
                        {
                            let data = '';
                            let totalRow = '';
                            let totalRegHrs = 0;
                            let totalOtHrs = 0;
                        
                            for(let i = 0; i < timesheet[0].project.hoursDetail.length; i++)
                            {
                                let item = timesheet[0].project.hoursDetail[i];
                                data += '<tr>';
                                data += '<td style="padding: 5px;">'+moment(item.day).format('ddd - MMM DD, YYYY')+'</td>';
                                data += '<td style="padding: 5px;">'+projectDetails.projectName+'</td>';
                                data += '<td style="padding: 5px;">'+parseFloat(item.regHrs).toFixed(2)+'</td>';
                                data += '<td style="padding: 5px;">'+parseFloat(item.otHrs).toFixed(2)+'</td>';
                                data += '<td style="padding: 5px;">'+ parseFloat((item.regHrs + item.otHrs)).toFixed(2) +'</td>';
                                data += '</tr>';
                                totalRegHrs += item.regHrs;
                                totalOtHrs += item.otHrs;
                            }
                            
                            totalRow = '<tr><th style="padding: 5px;text-align: left;">&nbsp;</th><th style="padding: 5px;text-align: left;">Total</th><th style="padding: 5px;text-align: left;">'+parseFloat(totalRegHrs).toFixed(2)
                                        +'</th><th style="padding: 5px;text-align: left;">'+parseFloat(totalOtHrs).toFixed(2)
                                        +'</th><th style="padding: 5px;text-align: left;">'+parseFloat((totalRegHrs+totalOtHrs)).toFixed(2)+'</th></tr>';
                    
                            html = html.replace('{{data}}', data);
                            html = html.replace('{{totalRow}}', totalRow);
                            html = html.replace('{{empName}}', loggedUser.firstName + ' '+loggedUser.lastName);
                            html = html.replace('{{startDate}}', moment(startDate).format('MMM DD, YYYY'));
                            html = html.replace('{{endDate}}', moment(endDate).format('MMM DD, YYYY'));
                            html = html.replace('{{clientName}}', projectDetails.clientName);
                            html = html.replace('{{logoImage}}', 'file:///'+__dirname+'/../../Upload/images/big-Compunnel_Staffing.png');
                            
                            let mykey = crypto.createHash('md5').update(employeeDetailsId.toString()).digest('hex');
                            
                            let fileName = 'stafflineDocuments/' + mykey +'.pdf';
                
                            pdf.create(html, options).toFile(__dirname+'/../../'+fileName, function(err, response) {
                                if (err) 
                                {
                                    done(err)
                                }
                                else
                                {
                                    let rsp = [{filePath : config.apiHostUrl + '/' + fileName}]
                                    response = responseFormat.getResponseMessageByCodes('', { content: { dataList: rsp } });
                                    res.status(200).json(response);
                                }
                            });
                        }
                        else
                        {
                            response = responseFormat.getResponseMessageByCodes(['errorText:NoDataFound'], { code: 417 });
                            res.status(200).json(response);
                        }
            
                    })
                    .catch((error) => {
                        let resp = commonMethods.catchError('timecards-controller/createdPdf', error);
                        response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                        res.status(resp.code).json(response);
                    })
                }
            ],function(error, result){
                if(result)
                {
                    let resp = commonMethods.catchError('timecards-controller/createdPdf', error);
                        response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                        res.status(resp.code).json(response);
                }
            })
            

        }
 



    }


    getPayrollInfo(req, res, next)
    {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId,
            response = responseFormat.createResponseTemplate();
       
        let msgCode = [];
        let year = req.body.year;
        let month = req.body.month;

        if(!year)
        {
            msgCode.push('year')
        }
        if(!month)
        {
            msgCode.push('month')
        }

        if(msgCode.length)
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else
        {

            timecardsModel.getPayrollInformation(employeeDetailsId, year, month)
            .then((info) => {                 
                response = responseFormat.getResponseMessageByCodes('', { content: { dataList: info } });
                res.status(200).json(response);
            })
            .catch((error) => {
                let resp = commonMethods.catchError('timecards-controller/getPayrollInfo', error);
                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                res.status(resp.code).json(response);
            })
        }
 
    }

  

}


