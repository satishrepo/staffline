/**
 *  -------Import all classes and packages -------------
 */
import configContainer from "../../config/localhost";
import { dbContext, Sequelize } from "../../core/db";
import CommonMethods from "../../core/common-methods";
import { ProjectDetails } from "../../entities/myProjects/project-details";
import { UserLookups } from "../../entities/profileManagement/user-lookups";
import moment from 'moment';
import enums from '../../core/enums';
import { timecardLookups, timecardContentPage } from "../../entities/timecards/timecards";
import { Invoice_TimesheetEntryDetails } from "../../entities/timecards/invoice_timesheetentrydetails";
import { Invoice_TimesheetEntrySummary } from "../../entities/timecards/invoice_timesheetentrysummary";

import { Invoice_ClientTimeSheet } from "../../entities/timecards/invoice_clienttimesheet";
import { Invoice_UploadedClientTimeSheets } from "../../entities/timecards/invoice_uploadedclienttimesheets";
import path from 'path';
import async from 'async';
import _ from 'lodash';
import CrudOperationModel from "../common/crud-operation-model";
import { VacationRequests } from "../../entities/vacations/vacations";
// import { HolidayMaster } from "../../entities/holidays/holidays";

// import MyProjectsModel from '../../models/myProjects/my-projects-model';

/**
 *  -------Initialize global variabls-------------
 */

let config = configContainer.loadConfig();

let crudOperationModel = new CrudOperationModel();

// let myProjectsModel = new MyProjectsModel();
let commonMethods = new CommonMethods();

export default class TimecardssModel {

    constructor() {
        //
    }

    /**
     * Get all current project's year list
     * @param {*} employeeDetailsId : logged in employee details id
     * @param {*} isCurrentProject : status of project if it is current or not(0 or 1)
     */
    getEmployeeProjectYear(employeeDetailsId, isCurrentProject) {
        let query = "EXEC API_SP_GetEmployeeProjects @EmployeeDetailsId=\'" + employeeDetailsId + "\', @IsCurrentProject=\'" + isCurrentProject + "\' ";
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((proj) => {
                let projects = [], projectDetails = [], year = [], i, j, key;
                if (proj.length) {

                    projectDetails.push(new Date().getFullYear());
                    proj.forEach(function (item) {
                        if (item.Start_Date.getFullYear() != new Date().getFullYear()) {
                            projectDetails.push(
                                item.Start_Date.getFullYear()
                            )
                        }
                    });
                }
                return (projectDetails.sort()).reverse();
            })
    }

    /**
     * Get current projects of employee
     * @param {*} employeeDetailsId : logged in employee details id
     * @param {*} isCurrentProject : status of project if it is current or not(0 or 1) 
     */
    getEmployeeCurrentProject(employeeDetailsId, isCurrentProject) {
        let query = "EXEC API_SP_GetEmployeeProjects @EmployeeDetailsId=\'" + employeeDetailsId + "\', @IsCurrentProject=\'" + isCurrentProject + "\' ";
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((proj) => {
                let projects = [], projectDetails = [], year = [];
                if (proj.length) {
                    proj.forEach(function (item) {
                        projectDetails = {
                            projectDetailId: item.ProjectDetail_Id,
                            projectTitle: item.ProjectTitle
                        }
                        projects.push(
                            projectDetails,
                        );
                    });
                }
                return projects;

            })
    }

    /**
     *  Get all timecards list
     */
    getTimecardsPendingHours(employeeDetailsId) 
    {
        let defaultMonth = 6;
        let where = ' 1 = 1 ';

        // where += ' AND (TED.TSEntryStatus in(' + [enums.timecard.pendingApprovalStatusId, enums.timecard.draftStatusId] + ') OR TED.TSEntryStatus is null)';
        where += ' AND (TED.TSEntryStatus in(' + [enums.timecard.draftStatusId] + ') OR TED.TSEntryStatus is null )';
        
        // where += ' AND PW.we_date >= DATEADD(MONTH, -6, GETDATE())';

        where += ' AND PW.we_date >=  DATEADD(Month, Datediff(Month, 0, DATEADD(m, -'+(defaultMonth-1)+', current_timestamp)), 0) ';

        
        let query = "EXEC API_SP_GetAllTimeCardListByEmployeeId @EmployeeDetails_Id=\'" + employeeDetailsId + "\' "
            + ",@where=\'" + where + "\' ";
        
        // console.log(query);

        return new Promise( resolve => {
             ProjectDetails.findAll({where:
                {
                    employeeDetailsId : employeeDetailsId, 
                    $or : [
                        {
                            endDate: {
                                $eq : null
                            }
                        },
                        {
                            endDate: {
                                $gt : new Date()
                            }
                        },
                        
                    ] 
                }})
            .then(rs => { 
                if(!rs.length)
                {
                    return resolve([]);
                }
                else
                {
                        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
                        .then((details) => {
                            let timeSheets = [];
                            let data = {};
                            if (details.length) {
                                details.forEach(function (item) {
                                    let statusId = (item.statusIdStatus).split(':')[0];
                                    let statusValue = (item.statusIdStatus).split(':')[1];

                                    for (var i in enums.timecard.mappedStatus) {
                                        if ((item.statusIdStatus).split(':')[1] == enums.timecard.mappedStatus[i].key) {
                                            statusValue = enums.timecard.mappedStatus[i].value;
                                        }
                                    }

                                    let testd = moment(item.weekEndingDate);
                                    let testd1 = moment(item.weekEndingDate);
                                    let testd2 = moment(item.weekEndingDate);
                                    let startt = '';

                                    if (testd.startOf('isoweek').format('MM') != testd1.format('MM')) {
                                        startt = testd2.format('YYYY-MM-01');
                                    }
                                    else {
                                        startt = testd2.startOf('isoweek').format('YYYY-MM-DD');
                                    }
                                    
                                    let k = item.weekEndingDate;

                                    if (data[k]) {

                                        data[k].totalHours += parseFloat(item.totalHours);
                                        // data[k].dt = item.dt;
                                    }
                                    else {
                                        data[k] = {};

                                        data[k].dt = item.dt;
                                        data[k].year = item.year;
                                        data[k].weekStartDate = startt;
                                        data[k].weekEndingDate = item.weekEndingDate;
                                        data[k].tsEntryId = item.tsEntryId;
                                        data[k].totalHours = parseFloat(item.totalHours);
                                        data[k].uploadedBy = item.uploadedBy.trim();
                                        data[k].statusId = statusId;
                                        data[k].status = statusValue;
                                    }                        
                                });
                            
                                for(let i in data)
                                { 
                                    let item = data[i];
                                    timeSheets.push({
                                        weekStartDate: item.weekStartDate,
                                        weekEndingDate: item.weekEndingDate,
                                        totalHours: item.totalHours,
                                        tsEntryId: item.tsEntryId,
                                        statusId: item.statusId,                            
                                        status: item.status
                                    })
                                }
                            }
                            return resolve(timeSheets);
                        })
                }
            })
        })

       
    }



    getAllTimecards(employeeDetailsId, year, month, status) 
    {
        let defaultMonth = 6;
        let where = ' 1 = 1 ';

        if (status == 'submitted') {
            where += ' AND TED.TSEntryStatus in(' + enums.timecard.submittedStatusId + ')';
        }
        else if (status == 'pending') {
            where += ' AND TED.TSEntryStatus in(' + enums.timecard.pendingApprovalStatusId + ')';
        }
        else if (status == 'unsubmitted') {
            where += ' AND (TED.TSEntryStatus in(' + enums.timecard.draftStatusId + ')  OR TED.TSEntryStatus is null )';
        }


        where += (year ? ' AND Year(PW.we_date)= ' + year : ' AND PW.we_date >=  DATEADD(Month, Datediff(Month, 0, DATEADD(m, -'+(defaultMonth-1)+', current_timestamp)), 0) ')

        
        where += (month ? ' AND Month(PW.we_date)= ' + month : ' ')

        let query = "EXEC API_SP_GetAllTimeCardListByEmployeeId @EmployeeDetails_Id=\'" + employeeDetailsId + "\' "
            + ",@where=\'" + where + "\' ";

        console.log(query);

        let self = this;

        return new Promise( resolve => {

            // check if user has any active project then process

            ProjectDetails.findAll({where:
                {
                    employeeDetailsId : employeeDetailsId, 
                    $or : [
                        {
                            endDate: {
                                $eq : null
                            }
                        },
                        {
                            endDate: {
                                $gt : new Date()
                            }
                        },
                        
                    ] 
                }})
            .then(rs => { 
                if(!rs.length)
                {
                    return resolve([]);
                }
                else
                {
                    return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
                    .then((details) => {  
                        let data = {};
                        let out = [];
                        if (details.length) 
                        {
                            async.waterfall([
                                function(done)
                                {
                                    details.forEach(function (item) 
                                    {
                                        let statusId = (item.statusIdStatus).split(':')[0];
                                        let statusValue = (item.statusIdStatus).split(':')[1];

                                        for (var i in enums.timecard.mappedStatus) {
                                            if ((item.statusIdStatus).split(':')[1] == enums.timecard.mappedStatus[i].key) {
                                                statusValue = enums.timecard.mappedStatus[i].value;
                                            }
                                        }

                                        let testd = moment(item.weekEndingDate);
                                        let testd1 = moment(item.weekEndingDate);
                                        let testd2 = moment(item.weekEndingDate);
                                        let startt = '';

                                        if (testd.startOf('isoweek').format('MM') != testd1.format('MM')) {
                                            startt = testd2.format('YYYY-MM-01');
                                        }
                                        else {
                                            startt = testd2.startOf('isoweek').format('YYYY-MM-DD');
                                        }
                                        
                                        let k = item.weekEndingDate;

                                        if (data[k]) {

                                            data[k].totalHours += parseFloat(item.totalHours);
                                            // data[k].dt = item.dt;
                                        }
                                        else {
                                            data[k] = {};

                                            data[k].dt = item.dt;
                                            data[k].year = item.year;
                                            data[k].weekStartDate = startt;
                                            data[k].weekEndingDate = item.weekEndingDate;
                                            data[k].tsEntryId = item.tsEntryId;
                                            data[k].totalHours = parseFloat(item.totalHours);
                                            data[k].uploadedBy = item.uploadedBy.trim();
                                            data[k].statusId = statusId;
                                            data[k].status = statusValue;
                                        }

                                    });
                                    done(null, data)
                                },
                                function(arr, done)
                                {
                                    // get all vacations of user
                                    let vacations = [];
                                    self.getVacations(employeeDetailsId)
                                    .then( rs => {
                                        if(rs.length)
                                        {
                                            rs.forEach( item => {
                                                vacations.push(self.getDates(item.FromDate, item.ToDate))
                                            })
                                            vacations = _.uniqBy(_.flatten(vacations).sort());
                                            done(null, arr, vacations)
                                        }
                                        else 
                                        {
                                            done(null, arr, [])
                                        }
                                    })
                                },
                                function(arr, vacations, done)
                                {
                                    // remove entire week from data where user was on vacation (approved vacation)
                                    async.filter( arr , function(item, cb) 
                                    {
                                    
                                        let weekDays = self.getDates(item.weekStartDate, item.weekEndingDate);
                                        let difference = _.difference(weekDays, vacations);                   
                                        cb(null, difference.length)
                                    }, function(err, resultArr)
                                    { 
                                        if(!err)
                                        {   
                                            resultArr = _.orderBy(resultArr, ['weekStartDate'],['desc'])
                                            done(null, resultArr)
                                        }
                                    }) 
                                
                                   
                                }, 
                                function(data, done)
                                {
                                    async.map(data, function(item, cb)
                                    {    
                                        let k = item.dt; 

                                        self.getActiveProjects(employeeDetailsId, item.weekStartDate, item.weekEndingDate)
                                        .then(activePrjs => {                                        
                                            let data1  = {};
                                            if(activePrjs.length)
                                            {                                                                    
                                                cb(null, item)
                                            }                                               
                                        })
                                    },
                                    function (err, data) {                                     
                                        if (!err) 
                                        {
                                            let data1 = {};
                                            for(var j in data)
                                            {        
                                                let item = data[j];                        
                                                let k = item.dt;

                                    
                                                if (data1[k]) {

                                                    data1[k].totalHours += parseFloat(item.totalHours);

                                                    data1[k].hours.push({
                                                        weekStartDate : item.weekStartDate,
                                                        weekEndingDate : item.weekEndingDate,
                                                        totalHours : parseFloat(item.totalHours),
                                                        tsEntryId : item.tsEntryId,
                                                        statusId : item.statusId,
                                                        uploadedBy : item.uploadedBy.trim(),
                                                        status : item.status
                                                    })
                                                }
                                                else {
                                                    data1[k] = {};

                                                    data1[k].totalHours = parseFloat(item.totalHours);
                                                    data1[k].year = item.year;
                                                    data1[k].month = moment(item.weekEndingDate).format('MMMM'); 

                                                    data1[k].hours = [];
                                                    data1[k].hours.push({
                                                        weekStartDate : item.weekStartDate,
                                                        weekEndingDate : item.weekEndingDate,
                                                        totalHours : parseFloat(item.totalHours),
                                                        tsEntryId : item.tsEntryId,
                                                        statusId : item.statusId,
                                                        uploadedBy : item.uploadedBy.trim(),
                                                        status : item.status
                                                    })
                                                
                                                }
                                        
                                            }
                                            done(null, data1);
                                        }

                                    })
                                                                
                                },
                                function(arrObj, done)
                                {                                    
                                    if(!Object.keys(arrObj).length)
                                    {
                                        done(null, [])
                                    }
                                    else
                                    {
                                        for (let a in arrObj) 
                                        {   
                                            arrObj[a].totalHours = parseFloat(arrObj[a].totalHours).toFixed(2)
                                            out.push(arrObj[a]);
                                        }
                                        done(null, out)
                                    }
                                }
                            ],
                            function(err, result)
                            {
                                if(!err)
                                {                                 
                                    return resolve(result);
                                }
                                
                            })
                        
                        
                        }
                        else
                        {
                            return resolve([]);
                        }
                    
                    })
                }
            })

        })

    }




    /**
     * Get all timecards list
     * @param {*} parentId : parent id of APP_REF_DATA
     */
    getAllStatusLookup(parentId) {
        return UserLookups.findAll({
            where: {
                ParentID: parentId,
                KeyID: { $ne: parentId }
            },
            raw: true,
            attributes: [
                ["KeyID", "keyId"],
                ["KeyName", "keyName"],
                ["ParentID", "parentId"],
                ["Description", "description"],
                ["Value", "value"]
            ],
            order: [
                ['KeyName', 'ASC']
            ]
        })
            .then((AuthorizationStatus) => {
                return AuthorizationStatus;
            });
    }


    /**
     * Get all weekendingdate list
     * @param {*} fromDate : startDate of the date range
     * @param {*} toDate : endDate of the date range
     */

    getAllWeekEndingDates(fromDate, toDate) {
        let query = "EXEC API_SP_GetAllTimeCardWeekEndingDatesByDateRange @StartDate=\'" + fromDate + "\'"
            + ",@EndDate=\'" + toDate + "\'";
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                let weekends = [], weekendDates = [];
                if (details.length) {
                    details.forEach(function (item) {
                        weekendDates.push(item.we_date)
                    });
                    weekends.push({
                        weekendDates: weekendDates
                    });
                }
                return (weekends.sort()).reverse();
            })
    }
    /**
     * Get all previous saved timecard list
     * @param {*} employeeDetailsId : logged in employee details id 
     * @param {*} fromDate : startDate of the date range
     * @param {*} toDate : endDate of the date range
     * @param {*} projectDetailId 
     */
    getTimecardsDocumentList(employeeDetailsId, fromDate, toDate, projectDetailId) {

        if (!projectDetailId || typeof projectDetailId == 'undefined') {
            projectDetailId = null;
        }

        let query = "EXEC API_SP_GetAllTimeCardDocumentsByDateRange @EmployeeDetails_Id=\'" + employeeDetailsId + "\'"
            + ",@StartDate=\'" + fromDate + "\'"
            + ",@EndDate=\'" + toDate + "\'";
   
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                return details;
            })

    }

    /**
    * Get all previous saved timecard list OR return new blank timecard for entry  
    * @param {*} startDate : startDate of the date range
    * @param {*} endDate : endDate of the date range   
    */


    getTimeCardByDateRange(employeeDetailsId, startDate) {

        return new Promise(resolve => {

            let testd = moment(startDate);
            let testd1 = moment(startDate);
            let testd2 = moment(startDate);
            let end = '';

            if (testd.endOf('isoweek').format('MM') != testd1.format('MM')) {
                end = testd2.endOf('Month').format('YYYY-MM-DD');
            }
            else {
                end = testd2.endOf('isoweek').format('YYYY-MM-DD')
            }

            let query = "EXEC API_SP_TimeCardByDateRange @employeeDetailsId=\'" + employeeDetailsId + "\'"
                + ", @startDate=\'" + startDate + "\'"
                + ", @endDate=\'" + end + "\'";
            
            console.log(query);

            return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
                .then((details) => {

                    // console.log(details)

                    this.getActiveProjects(employeeDetailsId, startDate, end)
                        .then(activePrjs => {

                            let act = {};
                            activePrjs.map(ac => {
                                act[ac.projectDetailId] = { startDate: ac.startDate, endDate: ac.endDate };
                            })

                            let out = {
                                date: {
                                    startDate: startDate,
                                    endDate: end
                                },
                                projects: []
                            };

                            let data = {};


                            for (let i = 0; i < details.length; i++) {
                                let item = details[i];
                                let k = item.projectId;

                                let statusId = (item.statusIdStatus).split(':')[0];
                                let statusValue = (item.statusIdStatus).split(':')[1];

                                for (var x in enums.timecard.mappedStatus) {
                                    if ((item.statusIdStatus).split(':')[1] == enums.timecard.mappedStatus[x].key) {
                                        statusValue = enums.timecard.mappedStatus[x].value;
                                    }
                                }


                                if (k) {

                                    if (act[k].endDate && moment(item.EntryDate).isAfter(act[k].endDate, 'day')) {
                                        break;
                                    }

                                    if (data[k]) {
                                        data[k].hoursDetail.push({
                                            day: item.EntryDate,
                                            regHrs: item.RegHrs,
                                            otHrs: item.OT1Hrs,
                                            statusId: item.statusIdStatus.split(':')[0]
                                        });
                                    }
                                    else {

                                        data[k] = {};
                                        data[k].hoursDetail = [];
                
                                        if (item.EntryDate != null && item.EntryDate != '') {
                                            data[k].hoursDetail.push({
                                                day: item.EntryDate,
                                                regHrs: item.RegHrs,
                                                otHrs: item.OT1Hrs,
                                                statusId: item.statusIdStatus.split(':')[0]

                                            });

                                            data[k].totalRegHrs = item.smRegHrs;
                                            data[k].totalOtHrs = item.OTHrs;
                                            data[k].comment = item.SummaryComments;
                                            data[k].projectId = item.projectId;
                                            data[k].projectName = item.projectName;
                                            data[k].statusId = statusId;
                                            data[k].status = statusValue;
                                        }
                                    }
                                }
                            }


                            for (let i in data) {
                                out.projects.push({
                                    totalRegHrs: data[i].totalRegHrs,
                                    totalOtHrs: data[i].totalOtHrs,
                                    comment: data[i].comment,
                                    projectId: data[i].projectId,
                                    projectName: data[i].projectName,
                                    statusId: data[i].statusId,
                                    status: data[i].status,
                                    hoursDetail: data[i].hoursDetail
                                })
                            }

                            let timesheetPrjs = Object.keys(data);

                            for (let j = 0; j < activePrjs.length; j++) {
                                let prj = activePrjs[j];                         
                                if (act[prj.projectDetailId].endDate && moment(startDate).isAfter(act[prj.projectDetailId].endDate, 'day')) {
                                    break;
                                }
                                if (timesheetPrjs.indexOf((prj.projectDetailId).toString()) < 0) 
                                {                                    
                                    out.projects.push({
                                        totalRegHrs: 0,
                                        totalOtHrs: 0,
                                        comment: '',
                                        projectId: prj.projectDetailId,
                                        projectName: prj.projectName,
                                        statusId: '',
                                        status: 'Pending',
                                        hoursDetail: this.generateDays(startDate, end, act[prj.projectDetailId].endDate)
                                    })

                                }
                            }

                            // console.log(out.projects);
                            return resolve({ userTimecard: out });
                        })
                })
        })
    }

    generateDays(startDate, endDate, maxDate) {
        let out = [];
        let currentDate = moment(startDate);
        let stopDate = moment(endDate);

        while (currentDate <= stopDate) {
            if (maxDate && moment(currentDate).isAfter(maxDate, 'day')) {
                break;
            }

            if (moment(currentDate).isAfter(moment(new Date()), 'day')) {
                out.push({
                    day: moment(currentDate).format('YYYY-MM-DD'),
                    regHrs: 0,
                    otHrs: 0,
                    dtHrs: 0,
                    statusId: 9999,
                    status: 'Pending',
                    detailId: 0,
                    weekEndId: 0,
                    vacation : 0,
                    weekEnd : moment(currentDate).day() == 0 || moment(currentDate).day() == 6  ? 1 : 0,
                    holiday : 0
                })
            }
            else
            {
                out.push({
                    day: moment(currentDate).format('YYYY-MM-DD'),
                    regHrs: moment(currentDate).day() == 0 || moment(currentDate).day() == 6 ? 0 : 8,
                    otHrs: 0,
                    dtHrs: 0,
                    statusId: 0,
                    status: 'Pending',
                    detailId: 0,
                    weekEndId: 0,
                    vacation : 0,
                    weekEnd : moment(currentDate).day() == 0 || moment(currentDate).day() == 6  ? 1 : 0,
                    holiday : 0
                })
            }

            
            currentDate = moment(currentDate).add(1, 'days');
        }
        return out;
    }

    generateDaysWithStatus(startDate, endDate, statusId) {
        let out = [];
        let currentDate = moment(startDate);
        let stopDate = moment(endDate);

        while (currentDate <= stopDate) {
           
            if (moment(currentDate).isAfter(moment(new Date()), 'day')) {
                out.push({
                    day: moment(currentDate).format('YYYY-MM-DD'),
                    regHrs: 0,
                    otHrs: 0,
                    statusId: statusId,
                    detailId: 0,
                    weekEndId: 0
                })
            }
            else
            {
                out.push({
                    day: moment(currentDate).format('YYYY-MM-DD'),
                    regHrs: 0,
                    otHrs: 0,
                    statusId: statusId,
                    detailId: 0,
                    weekEndId: 0
                })
            }

            currentDate = moment(currentDate).add(1, 'days');
        }
        return out;
    }


    /**
     * Get all previous saved timecard list   
     * @param {*} entryId : TSEntry Id   
     */

    getTimeCardByTSEntryId(employeeDetailsId, entryId) {
        entryId = ~~entryId;

        let query = "EXEC API_SP_TimeCardBySummaryId @employeeDetailsId=\'" + employeeDetailsId + "\', @entryId=\'" + entryId + "\'";

        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {

                let data = {};

                if (!details.length) {
                    return false;
                }

                let status = {};

                details.forEach((item, x) => {
                    let k = item.k;

                    status[item.TSEntryStatus] = item.KeyName;

                    if (data[k]) {

                        data[k].weekDays.push({
                            id: item.detailId,
                            day: item.EntryDate,
                            regHrs: item.RegHrs,
                            totHrs: item.TotalHrs,
                            otHrs: item.OT1Hrs,
                            projectId: item.projectId,
                            projectName: item.projectName,
                            tsEntryStatus: item.TSEntryStatus,
                            entryStatus: item.KeyName,
                            modifyDate: item.Modified_Date
                        });
                    }
                    else {
                        data[k] = {};
                        data[k].weekDays = [];

                        data[k].weekDays.push({
                            id: item.detailId,
                            day: item.EntryDate,
                            regHrs: item.RegHrs,
                            totHrs: item.TotalHrs,
                            otHrs: item.OT1Hrs,
                            projectId: item.projectId,
                            projectName: item.projectName,
                            tsEntryStatus: item.TSEntryStatus,
                            entryStatus: item.KeyName,
                            modifyDate: item.Modified_Date
                        });

                        data[k].id = item.weekEndId;
                        data[k].weekEnd = item.dateFormat;
                        data[k].regHrs = item.smRegHrs;
                        data[k].totHrs = item.smTotHrs;
                        data[k].otHrs = item.OTHrs;
                        data[k].comment = item.SummaryComments;

                    }
                });

                let output = [];

                let outObj = {};

                for (let i in data) {
                    output.push({
                        weekEnd: data[i].weekEnd,
                        weekEndKey: i,
                        regHrs: data[i].regHrs,
                        totHrs: data[i].totHrs,
                        otHrs: data[i].otHrs,
                        comment: data[i].comment,
                        weekDays: data[i].weekDays
                    })
                }

                let statusStr = Object.keys(status).length > 1 ? 'Partial Approved:' + '0' : status[Object.keys(status)[0]] + ':' + Object.keys(status)[0];

                let timeCardStatus = { statusId: statusStr.split(':')[1], status: statusStr.split(':')[0] };

                return { weekEnding: Object.keys(data), timeCard: output, timeCardStatus: timeCardStatus };
            })
    }



    /**
     * get timecard content page
     * @param {*} employeeDetailsId 
     * @param {*} parentId 
     */
    getStaticContentPage(pageReferenceId) {
        let query = "EXEC API_SP_GetStaticPageContent @PageReferenceId=\'" + pageReferenceId + "\' ";
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                let pageContent = [];
                if (details.length) {
                    details.forEach(function (item) {
                        pageContent.push({
                            staticContentsId: item.StaticContents_Id,
                            //pageReferenceId: item.PageReference_Id,
                            pageContentsEmployee: item.PageContents_Employee,
                            pageContentsAdminPortal: item.PageContents_AdminPortal,
                            specialNotes: item.SpecialNotes,
                            // status: item.Status,
                            // createdBy: item.Created_By,
                            // createdDate: item.Created_Date,
                            // modifedBy: item.Modified_By,
                            // modifiedData: item.Modified_Data,
                        })
                    });
                }
                return pageContent;
            })
    }

    /**
    * save or updatee data in Invoice_TimesheetEntryDetails 
    * @param {*} data : object of data to save 
    * @param {*} condition : object of condition to match
    */


    saveInvoiceTimesheetEntryDetail(data, condition) {
        return new Promise( resolve => {
            
            if( typeof data.TSEntryStatus != 'undefined' && (data.TSEntryStatus > 3304 ))
            {
                return resolve({TSEnteryDetail_ID : data.TSEntryStatus})
            }
            return Invoice_TimesheetEntryDetails
                .findOne({ where: condition })
                .then(function (item) {
                    if (item) {
                        return resolve(item.update(data));
                    }
                    else {
                        return resolve(Invoice_TimesheetEntryDetails.create(data));
                    }
                })
        })
    }

    /**
    * save or updatee data in Invoice_TimeSheetEntrySummary
    * @param {*} data : object of data to save 
    * @param {*} condition : object of condition to match
    */

    saveInvoiceTimesheetEntrySummary(data, condition) {

        return Invoice_TimesheetEntrySummary
            .findOne({ where: condition })
            .then(function (item) {
                if (item) {
                    return item.update(data);
                }
                else {
                    return Invoice_TimesheetEntrySummary.create(data);
                }
            })
    }

    /**
    * save or updatee data in Invoice_ClientTimeSheet 
    * @param {*} data : object of data to save 
    * @param {*} condition : object of condition to match
    */

    saveInvoiceClientTimesheet(data, condition) {

        return Invoice_ClientTimeSheet
            .findOne({ where: condition })
            .then(function (item) {
                if (item) {
                    return item.update(data);
                }
                else {
                    return Invoice_ClientTimeSheet.create(data);
                }
            })
    }

    /**
    * save or updatee data in Invoice_UploadedClientTimeSheets 
    * @param {*} data : object of data to save 
    * @param {*} condition : object of condition to match
    */

    saveInvoiceUploadClientTimesheet(data, condition) {

        return Invoice_UploadedClientTimeSheets
            .findOne({ where: condition })
            .then(function (item) {
                if (item) {
                    return item.update(data);
                }
                else {
                    return Invoice_UploadedClientTimeSheets.create(data);
                }
            })
    }

    /**
    * delete data from Invoice_UploadedClientTimeSheets 
    * @param {*} invoiceId : primary key id of table
    */

    deleteClientTimesheetInvoice(invoiceId) {
        return Invoice_UploadedClientTimeSheets.destroy({
            where: {
                UploadedTimeSheet_Id: invoiceId
            }
        })
    }

    /**
    * get data of weekend by date and empoyee if 
    * @param {*} date : date of weekend
    * @param {*} employeeId : logged in userid
    */

    getClientTimeSheetByDateAndEmployeeId(date, employeeId) {
        employeeId = ~~employeeId;

        let query = "EXEC API_SP_GetDocumentByWeekDay @EmployeeDetails_Id = \'" + employeeId + "\' "
            + ",@weekDate=\'" + date + "\'";

        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {

                if (details.length) {
                    details.forEach(item => {
                        item.uploadedTimeSheetLocation = config.apiHostUrl + '/' + config.imageFolder + item.uploadedTimeSheetLocation;
                    })
                }

                return details;
            })
    }


    /**
    * Get all timecards list
    * @param {*} parentId : parent id of APP_REF_DATA
    */
    gettimecardExpenseStatus(parentId) {
        return UserLookups.findAll({
            where: {
                ParentID: parentId
            },
            raw: true,
            attributes: [
                ["KeyID", "keyId"],
                ["KeyName", "keyName"],
                ["ParentID", "parentId"],
                ["Description", "description"],
                ["Value", "value"]
            ]
        })
            .then((AuthorizationStatus) => {
                return AuthorizationStatus;
            });
    }

    /**
    * Check Client Approved Timecard for Project within Date Range
    * @param {*} employeeDetailsId : loggedin user id
    * @param {*} projectId : projectId 
    * @param {*} fromDate : from date of date range
    * @param {*} toDaet : to date of date range
    */

    checkClientTimesheet(employeeDetailsId, projectId, fromDate, toDate) {
        let query = "EXEC API_SP_CheckTimesheet @employeeDetailsId = \'" + employeeDetailsId + "\' "
            + ",@projectId=\'" + projectId + "\'"
            + ",@fromDate=\'" + fromDate + "\'"
            + ",@toDate=\'" + toDate + "\'";
            
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => { 
                return details.length;
            })
    }

    getActiveProjects(employeeDetailsId, startDate, endDate) {
        let query = "EXEC API_SP_GetEmployeeProjectsWithDate @employeeDetailsId = \'" + employeeDetailsId + "\' "
            + ", @startDate=\'" + startDate + "\'"
            + ", @endDate=\'" + endDate + "\'";

        // console.log(query)

        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                return details;
            })
    }


    getActiveProjectsWithHOurs(employeeDetailsId, startDate, endDate) {
        let query = "EXEC API_SP_GetActiveProjectsByDateRange @EmployeeDetails_Id = \'" + employeeDetailsId + "\' "
            + ", @startDate=\'" + startDate + "\'"
            + ", @endDate=\'" + endDate + "\'";

        // console.log(query)

        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                return details;
            })
    }


    getClientApprovedTimecardList_backup(employeeDetailsId, year, month) 
    {
        let defaultMonth = 6;
        let where = ' 1 = 1 AND ICT.EmployeeID = ' + employeeDetailsId;

        // where += (year ? ' AND Year(ICT.TSFromDate)= ' + year : ' AND ICT.TSFromDate >= DATEADD(MONTH, -'+defaultMonth+', GETDATE()) ')

        where += (year ? ' AND Year(ICT.TSFromDate)= ' + year : ' AND ICT.TSFromDate >= Dateadd(Month, Datediff(Month, 0, DATEADD(m, -'+(defaultMonth-1)+', current_timestamp)), 0) ')

        where += (month ? ' AND Month(ICT.TSFromDate)= ' + month : ' ')

        let query = "EXEC API_SP_GetClientApprovedTimeCardList @where=\'" + where + "\' ";
        
        // console.log(query)

        let self = this;

        return new Promise(resolve => {
            return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
                .then((details) => {

                    let timesheet = {};
                    let out = [];
                    let out1 = [];
                    let out2 = [];
                    let lastDate = [];
                    let filledMonths = {};
                    let projectStartDate = '';
                    async.series([
                        function(done)
                        {
                            if (details.length) 
                            {
                                lastDate = details[0].dt.split('-');

                                for (let i = 0; i < details.length; i++) 
                                {
                                    let item = details[i];
                                    let k = item.dt;
                                    filledMonths[k] = '';
                                    if (timesheet[k]) 
                                    {
                                        timesheet[k].totalHours += parseFloat(item.totalHours);
                                        timesheet[k].hours.push({
                                            startDate: item.startDate,
                                            endDate: item.endDate,
                                            // year : item.endDate,
                                            totalHours: item.totalHours,
                                            uploadedBy: item.uploadedBy,
                                            status: enums.timecard.clientApprovedTimecard[item.status].map
                                        })
                                    }
                                    else 
                                    {
                                        timesheet[k] = {};
                                        timesheet[k].hours = [];
                                        timesheet[k].hours.push({
                                            startDate: item.startDate,
                                            endDate: item.endDate,
                                            // year : item.endDate,
                                            totalHours: item.totalHours,
                                            uploadedBy: item.uploadedBy,
                                            status: enums.timecard.clientApprovedTimecard[item.status].map
                                        });
                                        timesheet[k].month = moment(item.endDate).format('MMMM');
                                        timesheet[k].year = moment(item.endDate).format('YYYY');
                                        // timesheet[k].isProject = 1;
                                        timesheet[k].totalHours = parseFloat(item.totalHours);
                                        timesheet[k].startDate = item.endDate;
                                        timesheet[k].filledDays = item.endDate;
                                        timesheet[k].totalDays = moment(item.endDate, "YYYY-MM").daysInMonth();

                                    }
                                }

                                for (let j in timesheet) 
                                {
                                    // calculate days and Add 1 (since it return differnce of days)
                                    
                                    // let differ = (commonMethods.getDifferenceInDays(timesheet[j].hours[timesheet[j].hours.length - 1].startDate, timesheet[j].hours[0].endDate) + 1);
                                    
                                    // let differ = (commonMethods.getDifferenceInDays(timesheet[j].hours[timesheet[j].hours.length - 1].startDate, timesheet[j].hours[0].endDate) + 1);
                      
                                    let differ = 0;

                                    // console.log(timesheet[j].hours[timesheet[j].hours.length - 1].startDate, timesheet[j].hours[0].endDate)
                                    
                                    // console.log(new Date(timesheet[j].hours[0].endDate).getDate() , timesheet[j].totalDays, new Date(timesheet[j].hours[0].endDate).getDate() < timesheet[j].totalDays)


                                    if(new Date(timesheet[j].hours[timesheet[j].hours.length - 1].startDate).getMonth() < new Date(timesheet[j].hours[0].endDate).getMonth())
                                    {
                                        differ = new Date(timesheet[j].hours[0].endDate).getDate();
                                    }
                                    else
                                    {
                                        differ = (commonMethods.getDifferenceInDays(timesheet[j].hours[timesheet[j].hours.length - 1].startDate, timesheet[j].hours[0].endDate) + 1);
                                    }


                                    let left = 1; 
                                    let uploadDate = moment(timesheet[j].hours[0].endDate).add(1, 'days').format('YYYY-MM-DD');

                                    if(moment(timesheet[j].hours[0].endDate).isSameOrAfter(new Date(), 'days'))
                                    {
                                        left = 0;
                                        uploadDate = '';
                                    }
                                    else if (timesheet[j].totalDays - differ < 1) 
                                    { 
                                        left = 0;
                                        uploadDate = '';
                                    }
                                    
                                    
                                    /*
                                    // commented because overlapping month timecard submission enabled
                                    else if (moment(timesheet[j].hours[0].endDate).format('MM') > moment(timesheet[j].hours[0].startDate).format('MM')) {
                                        left = 0;
                                        uploadDate = ''; 
                                        console.log('2',moment(timesheet[j].hours[0].endDate).format('MM') , moment(timesheet[j].hours[0].startDate).format('MM'))
                                    }
                                    else if (moment(timesheet[j].hours[0].endDate).format('DD') >= moment(timesheet[j].hours[0].endDate).endOf('Month').format('DD')) {
                                        left = 0;
                                        uploadDate = '';
                                        console.log('3',moment(timesheet[j].hours[0].endDate).format('DD'), moment(timesheet[j].hours[0].endDate).endOf('Month').format('DD'))
                                    }
                                    */

                                    // console.log('----------------left-------------------', left)

                                    out.push({
                                        num: ~~moment(new Date(timesheet[j].hours[0].endDate)).format('YYYYMM'),
                                        month: timesheet[j].month,
                                        year: timesheet[j].year,
                                        totalHours: parseFloat(timesheet[j].totalHours).toFixed(2),
                                        startDate: uploadDate,
                                        filledDays: differ,
                                        totalDays: timesheet[j].totalDays,
                                        uploadFlag: (left > 0 ? 1 : 0),
                                        // isproject: 1,
                                        hours: timesheet[j].hours
                                    })
                                }
                            }
                            else 
                            {
                                lastDate = year ? [year, '01'] : [new Date().getFullYear(), (new Date().getMonth() + 1) - 3]
                            }
                            done();
                        },
                        function(done)
                        {
                            // get StartDate of Project(s) for unsubmitted timecard 
                            crudOperationModel.findAllByCondition(ProjectDetails, 
                                {
                                    employeeDetailsId : employeeDetailsId,
                                    $or : [
                                        {
                                            endDate : null
                                        },
                                        {
                                            endDate : {
                                                $gt : new Date()
                                            }
                                        }
                                    ]
                                },
                                ['startDate'],
                                ['startDate', 'ASC']
                            )
                            .then( rs => {
                                if(!rs.length)
                                {
                                    return resolve([]);
                                }
                                projectStartDate = rs[0].startDate;
                                done();
                            })
                        },
                        function(done)
                        {   
                                                        
                            let startMonth = year ? '12' : new Date().getMonth();
                            let loopDate = year ? new Date(year,'01', '01'): new Date();
                            loopDate.setMonth(startMonth)
               
                            let x = 1;
                            let end = year ? '13' : defaultMonth;
                        
                            while( x <= end)
                            {
                                let d = (moment(new Date(loopDate)).format('YYYY') + '-' + moment(new Date(loopDate)).format('M')).toString();
                                
                                if (Object.keys(filledMonths).indexOf(d) == -1) 
                                {   
                                    let date = moment(loopDate);
                                 
                                    out1.unshift({
                                        num: date.format('YYYYMM'),
                                        month: date.format('MMMM'),
                                        year: date.format('YYYY'),
                                        totalHours: 0,
                                        startDate: date.format('YYYY-MM-01'),
                                        startDate_check: projectStartDate > date ? date.format('YYYY-MM-01') : projectStartDate, 
                                        startDate: projectStartDate < date ? date.format('YYYY-MM-01') : moment(projectStartDate).format('YYYY-MM-DD'), 
                                        filledDays: 0,
                                        totalDays: moment(date, "YYYY-MM").daysInMonth(),
                                        uploadFlag: 1,
                                        hours: []
                                    })
                                }
                                loopDate.setMonth(loopDate.getMonth() - 1);
                                x++;
                            }

                            // remove top month from array if year is provided
                            if(year)
                            {
                                out1.pop();
                            }
                            
                            async.filter(out1, function(item, cb)
                            {  
                                // self.getActiveProjects(employeeDetailsId, item.startDate, moment(item.startDate).clone().endOf('month').format('YYYY-MM-DD'))
                                self.getActiveProjects(employeeDetailsId, 
                                    moment(item.startDate_check).clone().format('YYYY-MM-DD'), 
                                    moment(item.startDate_check).clone().endOf('month').format('YYYY-MM-DD'))
                                .then( rs => { 
                                    delete item.startDate_check;
                                    cb(null, rs.length); 
                                    
                                })
                            },function(err, rss)
                            {  
                                if(!err)
                                {
                                    out2 = rss;
                                    done();
                                }
                            })
                        },
                        function(done)
                        {
                            Array.prototype.push.apply(out, out2); 
                            out.sort(function (a, b) {
                                return parseFloat(b.num) - parseFloat(a.num);
                            });
                            // return resolve(out);
                            done()
                        }
                    ],function(err, result)
                    {
                        if(!err)
                        {
                            return resolve(out);
                        }
                    })
                
                })

        })
    }

    getClientApprovedTimecardList(employeeDetailsId, year, month) 
    {
        let defaultMonth = 6;
        let where = ' 1 = 1 AND ICT.EmployeeID = ' + employeeDetailsId;

        // where += (year ? ' AND Year(ICT.TSFromDate)= ' + year : ' AND ICT.TSFromDate >= DATEADD(MONTH, -'+defaultMonth+', GETDATE()) ')

        where += (year ? ' AND Year(ICT.TSFromDate)= ' + year : ' AND ICT.TSFromDate >= Dateadd(Month, Datediff(Month, 0, DATEADD(m, -'+(defaultMonth-1)+', current_timestamp)), 0) ')

        where += (month ? ' AND Month(ICT.TSFromDate)= ' + month : ' ')

        let query = "EXEC API_SP_GetClientApprovedTimeCardList @where=\'" + where + "\' ";
        
        console.log(query)

        let self = this;

        return new Promise(resolve => {
            return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
                .then((details) => {

                    let timesheet = {};
                    let out = [];
                    let out1 = [];
                    let out2 = [];
                    let lastDate = [];
                    let filledMonths = {};
                    let projectStartDate = '';
                    async.series([
                        function(done)
                        {
                            if (details.length) 
                            {
                                lastDate = details[0].dt.split('-');

                                for (let i = 0; i < details.length; i++) 
                                {
                                    let item = details[i];
                                    let k = item.dt;
                                    filledMonths[k] = '';
                                    if (timesheet[k]) 
                                    {
                                        timesheet[k].totalHours += parseFloat(item.totalHours);
                                        timesheet[k].hours.push({
                                            startDate: item.startDate,
                                            endDate: item.endDate,
                                            // year : item.endDate,
                                            totalHours: item.totalHours,
                                            uploadedBy: item.uploadedBy,
                                            status: enums.timecard.clientApprovedTimecard[item.status].map
                                        })
                                    }
                                    else 
                                    {
                                        timesheet[k] = {};
                                        timesheet[k].hours = [];
                                        timesheet[k].hours.push({
                                            startDate: item.startDate,
                                            endDate: item.endDate,
                                            // year : item.endDate,
                                            totalHours: item.totalHours,
                                            uploadedBy: item.uploadedBy,
                                            status: enums.timecard.clientApprovedTimecard[item.status].map
                                        });
                                        timesheet[k].month = moment(item.endDate).format('MMMM');
                                        timesheet[k].year = moment(item.endDate).format('YYYY');
                                        // timesheet[k].isProject = 1;
                                        timesheet[k].totalHours = parseFloat(item.totalHours);
                                        timesheet[k].startDate = item.endDate;
                                        timesheet[k].filledDays = item.endDate;
                                        timesheet[k].totalDays = moment(item.endDate, "YYYY-MM").daysInMonth();

                                    }
                                }

                                for (let j in timesheet) 
                                {
                                    // calculate days and Add 1 (since it return differnce of days)
                                    
                                    // let differ = (commonMethods.getDifferenceInDays(timesheet[j].hours[timesheet[j].hours.length - 1].startDate, timesheet[j].hours[0].endDate) + 1);
                                    
                                    // let differ = (commonMethods.getDifferenceInDays(timesheet[j].hours[timesheet[j].hours.length - 1].startDate, timesheet[j].hours[0].endDate) + 1);
                      
                                    let differ = 0;

                                    // console.log(timesheet[j].hours[timesheet[j].hours.length - 1].startDate, timesheet[j].hours[0].endDate)
                                    
                                    // console.log(new Date(timesheet[j].hours[0].endDate).getDate() , timesheet[j].totalDays, new Date(timesheet[j].hours[0].endDate).getDate() < timesheet[j].totalDays)


                                    if(new Date(timesheet[j].hours[timesheet[j].hours.length - 1].startDate).getMonth() < new Date(timesheet[j].hours[0].endDate).getMonth())
                                    {
                                        differ = new Date(timesheet[j].hours[0].endDate).getDate();
                                    }
                                    else
                                    {
                                        differ = (commonMethods.getDifferenceInDays(timesheet[j].hours[timesheet[j].hours.length - 1].startDate, timesheet[j].hours[0].endDate) + 1);
                                    }


                                    let left = 1; 
                                    let uploadDate = moment(timesheet[j].hours[0].endDate).add(1, 'days').format('YYYY-MM-DD');

                                    if(moment(timesheet[j].hours[0].endDate).isSameOrAfter(new Date(), 'days'))
                                    {
                                        left = 0;
                                        uploadDate = '';
                                    }
                                    else if (timesheet[j].totalDays - differ < 1) 
                                    { 
                                        left = 0;
                                        uploadDate = '';
                                    }
                                    
                                    
                                    /*
                                    // commented because overlapping month timecard submission enabled
                                    else if (moment(timesheet[j].hours[0].endDate).format('MM') > moment(timesheet[j].hours[0].startDate).format('MM')) {
                                        left = 0;
                                        uploadDate = ''; 
                                        console.log('2',moment(timesheet[j].hours[0].endDate).format('MM') , moment(timesheet[j].hours[0].startDate).format('MM'))
                                    }
                                    else if (moment(timesheet[j].hours[0].endDate).format('DD') >= moment(timesheet[j].hours[0].endDate).endOf('Month').format('DD')) {
                                        left = 0;
                                        uploadDate = '';
                                        console.log('3',moment(timesheet[j].hours[0].endDate).format('DD'), moment(timesheet[j].hours[0].endDate).endOf('Month').format('DD'))
                                    }
                                    */

                                    // console.log('----------------left-------------------', left)

                                    out.push({
                                        num: ~~moment(new Date(timesheet[j].hours[0].endDate)).format('YYYYMM'),
                                        month: timesheet[j].month,
                                        year: timesheet[j].year,
                                        totalHours: parseFloat(timesheet[j].totalHours).toFixed(2),
                                        startDate: uploadDate,
                                        filledDays: differ,
                                        totalDays: timesheet[j].totalDays,
                                        uploadFlag: (left > 0 ? 1 : 0),
                                        // isproject: 1,
                                        hours: timesheet[j].hours
                                    })
                                }
                            }
                            else 
                            {
                                lastDate = year ? [year, '01'] : [new Date().getFullYear(), (new Date().getMonth() + 1) - 3]
                            }
                            done();
                        },
                        function(done)
                        {
                            // get StartDate of Project(s) for unsubmitted timecard 
                            crudOperationModel.findAllByCondition(ProjectDetails, 
                                {
                                    employeeDetailsId : employeeDetailsId,
                                    $or : [
                                        {
                                            endDate : null
                                        },
                                        {
                                            endDate : {
                                                $gt : new Date()
                                            }
                                        }
                                    ]
                                },
                                ['startDate'],
                                ['startDate', 'ASC']
                            )
                            .then( rs => {
                                if(!rs.length)
                                {
                                    return resolve([]);
                                }
                                projectStartDate = rs[0].startDate;
                                done();
                            })
                        },
                        function(done)
                        {   
                                                        
                            let startMonth = year ? '12' : new Date().getMonth();
                            let loopDate = year ? new Date(year,'01', '01'): new Date();
                            loopDate.setMonth(startMonth)
               
                            let x = 1;
                            let end = year ? '13' : defaultMonth;
                        
                            while( x <= end)
                            {
                                let d = (moment(new Date(loopDate)).format('YYYY') + '-' + moment(new Date(loopDate)).format('M')).toString();
                                
                                if (Object.keys(filledMonths).indexOf(d) == -1) 
                                {   
                                    let date = moment(loopDate);
                                 
                                    out1.unshift({
                                        num: date.format('YYYYMM'),
                                        month: date.format('MMMM'),
                                        year: date.format('YYYY'),
                                        totalHours: 0,
                                        startDate: date.format('YYYY-MM-01'),
                                        startDate_check: projectStartDate > date ? date.format('YYYY-MM-01') : projectStartDate, 
                                        startDate: projectStartDate < date ? date.format('YYYY-MM-01') : moment(projectStartDate).format('YYYY-MM-DD'), 
                                        filledDays: 0,
                                        totalDays: moment(date, "YYYY-MM").daysInMonth(),
                                        uploadFlag: 1,
                                        hours: []
                                    })
                                }
                                loopDate.setMonth(loopDate.getMonth() - 1);
                                x++;
                            }

                            // remove top month from array if year is provided
                            if(year)
                            {
                                out1.pop();
                            }
                            
                            async.filter(out1, function(item, cb)
                            {  
                                // self.getActiveProjects(employeeDetailsId, item.startDate, moment(item.startDate).clone().endOf('month').format('YYYY-MM-DD'))
                                self.getActiveProjects(employeeDetailsId, 
                                    moment(item.startDate_check).clone().format('YYYY-MM-DD'), 
                                    moment(item.startDate_check).clone().endOf('month').format('YYYY-MM-DD'))
                                .then( rs => { 
                                    delete item.startDate_check;
                                    cb(null, rs.length); 
                                    
                                })
                            },function(err, rss)
                            {  
                                if(!err)
                                {
                                    out2 = rss;
                                    done();
                                }
                            })
                        },
                        function(done)
                        {
                            Array.prototype.push.apply(out, out2); 
                            out.sort(function (a, b) {
                                return parseFloat(b.num) - parseFloat(a.num);
                            });
                            // return resolve(out);
                            done()
                        }
                    ],function(err, result)
                    {
                        if(!err)
                        {
                            return resolve(out);
                        }
                    })
                
                })

        })
    }
    

    createBlankClientSheet(startDate, endDate) {
        return new Promise(resolve => {
            this.getAllWeekEndingDates(startDate, endDate)
                .then(d => {

                    let out = [];
                    let weekEnds = d[0].weekendDates;

                    for (let i = 0; i < weekEnds.length; i++) {
                        let we_1 = moment(weekEnds[i]);
                        let we_2 = moment(weekEnds[i]);
                        let endDate = moment(weekEnds[i]).format('YYYY-MM-DD');
                        let startDate = '';

                        if (we_1.startOf('isoweek').format('MM') != we_2.format('MM')) {
                            startDate = we_2.format('YYYY-MM-01');
                        }
                        else {
                            startDate = we_2.startOf('isoweek').format('YYYY-MM-DD');
                        }

                        if (moment(endDate).isAfter(new Date(), 'day')) {
                            break;
                        }

                        out.push({
                            startDate: startDate,
                            endDate: endDate,
                            totalHours: 0,
                            uploadedBy: '',
                            status: enums.timecard.clientApprovedTimecard['0']

                        })
                    }

                    return resolve(out);
                })

        })

    }

    getVacations(employeeDetailsId)
    {
        let query = "EXEC API_SP_getVacations @employeeDetailsId =" + employeeDetailsId;
        // console.log(query)

        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                return details;
            })
    } 
    
    getDates(startDate, stopDate) 
    {
        var dateArray = [];
        var currentDate = moment(startDate);
        var stopDate = moment(stopDate);
        while (currentDate <= stopDate) 
        {
            if(currentDate, currentDate.day() % 6 != 0)
            {
                dateArray.push( moment(currentDate).format('YYYY-MM-DD') )
            }
            currentDate = moment(currentDate).add(1, 'days');
        }
        return dateArray;
    }

    getMannualTimecardRange_BACKUP(employeeDetailsId, projectId, startDate, endDate) 
    {
        
        return new Promise(resolve => {

            let weekStartDate = moment(startDate).clone().startOf('isoWeek').format('YYYY-MM-DD');
            let weekEndDate = moment(endDate).clone().endOf('isoWeek').format('YYYY-MM-DD');

            let query = "EXEC API_SP_TimeCardByDateRange_new @employeeDetailsId=\'" + employeeDetailsId + "\'"
                + ", @projectId=" + projectId + ""
                + ", @startDate=\'" + weekStartDate + "\'"
                + ", @endDate=\'" + weekEndDate + "\'";
            
            console.log(query);

            return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {

                // console.log(details)

                // this.getActiveProjects(employeeDetailsId, weekStartDate, weekEndDate)
                // .then(activePrjs => {
                
                crudOperationModel.findModelByCondition(ProjectDetails, {projectDetailId : projectId})
                .then(activePrjs => {
                    
                    let out = {
                        date: {
                            startDate: weekStartDate,
                            endDate: weekEndDate
                        },
                        project:{
                            projectId : projectId,
                            projectName : activePrjs.projectName
                        },
                        weeks: []
                    };

                    let data = {};


                    for (let i = 0; i < details.length; i++) 
                    {
                        let item = details[i];
                        // let k = item.projectId;
                        let k = item.dt;

                        let statusId = (item.statusIdStatus).split(':')[0];
                        let statusValue = (item.statusIdStatus).split(':')[1];

                        for (var x in enums.timecard.mappedStatus) {
                            if ((item.statusIdStatus).split(':')[1] == enums.timecard.mappedStatus[x].key) {
                                statusValue = enums.timecard.mappedStatus[x].value;
                            }
                        }


                        if(k) 
                        {

                            if (activePrjs.endDate && moment(item.k).isAfter(activePrjs.endDate, 'day')) {
                                break;
                            }

                            if (data[k]) 
                            {
                                data[k].hoursDetail.push({
                                    day: item.EntryDate,
                                    regHrs: item.RegHrs,
                                    otHrs: item.OT1Hrs,
                                });
                            }
                            else 
                            {

                                data[k] = {};
                                data[k].hoursDetail = [];
        
                                if (item.EntryDate != null && item.EntryDate != '') 
                                {
                                    data[k].hoursDetail.push({
                                        day: item.EntryDate,
                                        regHrs: item.RegHrs,
                                        otHrs: item.OT1Hrs,
                                    });

                                    data[k].weDate = item.we_date;
                                    data[k].totalRegHrs = item.smRegHrs;
                                    data[k].totalOtHrs = item.OTHrs;
                                    data[k].comment = item.SummaryComments;
                                    data[k].statusId = statusId;
                                    data[k].status = statusValue;
                                }
                                else
                                {
                                    data[k].weDate = item.we_date;
                                    data[k].totalRegHrs = 0;
                                    data[k].totalOtHrs = 0;
                                    data[k].comment = '';
                                    data[k].statusId = 0;
                                    data[k].status = '';
                                }
                                
                            }
                        }
                    }

                    for (let i in data)
                    { 
                        out.weeks.push({
                            totalRegHrs: data[i].totalRegHrs,
                            totalOtHrs: data[i].totalOtHrs,
                            comment: data[i].comment,
                            statusId: data[i].statusId,
                            status: data[i].status, 
                            num : parseFloat(data[i].weDate.replace(/-/g,'')),
                            hoursDetail: data[i].hoursDetail.length ? data[i].hoursDetail : this.generateDays(moment(data[i].weDate).clone().startOf('isoWeek').format('YYYY-MM-DD').toString(), (data[i].weDate).toString(), activePrjs.endDate)
                        })
                    }
                    
                    out.weeks = _.orderBy(out.weeks, ['num'],['asc'])
      
                    // console.log('final',out.projects);
                    return resolve({ userTimecard: out });
                })
            })
        })
    }


    getClientApprovedTimecardList_New(employeeDetailsId) 
    {
  
        let self = this;

        return new Promise(resolve => {

            let query = "EXEC API_SP_GetClientApprovedTimeCardListWithPendingHours @employeeDetailsId=\'" + employeeDetailsId + "\'";
            
            console.log(query);

            return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((detaildata) => {

 
                let details = [];
                let vacations = [];
                let final = [];

                async.series([
                    function(done)
                    {
                        if(detaildata.length)
                        {
                            details = detaildata.filter ( item => {
                                        return !item.totalHours
                                    })
                            done()
                        }
                        else
                        { 
                            done('blank')
                        }
                    },  
                    function(done)
                    {
                        if(details.length)
                        {
                            details.forEach( item => {

                                item.startDate = moment(item.weekEndDate).clone().startOf('isoWeek').format('YYYY-MM-DD');
                                if (moment(item.weekEndDate).clone().startOf('isoWeek').format('MM') != moment(item.weekEndDate).clone().format('MM')) 
                                {
                                    item.startDate = moment(item.weekEndDate).clone().format('YYYY-MM-01');
                                }

                                item.endDate = moment(item.weekEndDate).clone().format('YYYY-MM-DD');  
                                item['mannual'] = 0;
                                item['status'] = 'Pending';
                                item['statusId'] = 0;

                                
                            })
                            // console.log(details)
                            done();
                        }
                        else
                        {
                            done('blank') // error 
                        }
                    },
                    function(done)
                    {
                        async.each(details, function(item, cb)
                        {
                            // console.log(item)
                            if(!item.totalHours)
                            {
                                self.getTimeTotalHoursByWeekEnd(employeeDetailsId, item.endDate)
                                .then( rs => {
                                    item.totalHours = rs.length ? rs[0].totalHours : 0;
                                    item['mannual'] = rs.length ? 1 : 0;
                                    item['status'] = rs.length ? 'Draft' : 'Pending';
                                    item['statusId'] = rs.length ? 3301 : 0;

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
                                console.log('-----------', err)
                                done(err)
                            }   
                            done()
                        })
                    },
                    function(done)
                    {
                        // get all vacations of user
                        
                        self.getVacations(employeeDetailsId)
                        .then( rs => { 
                            if(rs.length)
                            {
                                rs.forEach( item => {
                                    vacations.push(self.getDates(item.FromDate, item.ToDate))
                                })
                                vacations = _.uniqBy(_.flatten(vacations).sort());
                                
                                done()
                            }
                            else 
                            {
                                done()
                            }
                        })
                    },
                    function(done)
                    {
                        // remove entire week from data where user was on vacation (approved vacation)
                        async.filter( details , function(item, cb) 
                        {
                            let weekDays = self.getDates(item.startDate, item.endDate);
                            let difference = _.difference(weekDays, vacations);         
                            cb(null, difference.length)
                        }, function(err, resultArr)
                        { 
                            if(!err)
                            {   
                                // resultArr = _.orderBy(resultArr, ['weekStartDate'],['desc'])
                                final = resultArr;
                                done(null, resultArr)
                            }
                        }) 
                    
                        
                    }, 
                ],function(err, result)
                {
                    if(!err)
                    { 
                        return resolve(final);
                        // return resolve(details);
                    }
                    else
                    {
                        console.log('error occurred at timecard :', err)
                        return resolve([])
                    }
                })

                

                })
            })

        // })
        
    }


    getWeekends( NoMonthsFromNow )
    {
        let query = 'Select we_date FROM pjweek where we_date >= DATEADD(MONTH, -'+NoMonthsFromNow+', GETDATE()) and month(we_date) <= month(getdate()) order by we_date desc';

        // console.log(query);

        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((rs) => {
                return rs;
            })

    }


    getTimeTotalHoursByWeekEnd( employeeDetailsId, weekEndDate )
    {
        let query = "EXEC API_SP_TimeCardTotalByWeekEnd @employeeDetailsId = " + employeeDetailsId + ", @weekEndDate = '" + weekEndDate + "'" ;

        // console.log(query);

        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((rs) => {
                return rs;
            })

    }


    getClientApprovedStatus( employeeDetailsId, status, startDate, endDate )
    {
        let query = "EXEC API_SP_GetClientApprovedTimeCard @employeeDetailsId = " + employeeDetailsId 
        + ", @status = '" + status + "'" 
        + (startDate ? ", @startDate = '" + startDate + "'": ", @startDate = " + null + "") 
        + (endDate ? ", @endDate = '" + endDate + "'" : ", @endDate = " + null + "") ;

        // console.log(query);

        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((rs) => {
                if(rs.length)
                {
                    rs.forEach( item => {
                        item['mannual'] = 0
                        item['statusId'] = item.status
                        item['status'] = enums.timecard.clientApprovedTimecard[item.status].map

                    })
                    return rs;
                }
                else
                {
                    return [];
                }
            })

    }


    /******************************** New Methods for Timecard ********************************/

    createDateRange_backup(startDate, endDate, cycle, cyclePeriod)
    {
       
        let out = [];
        let currentDate = moment(startDate);
        let stopDate = moment(endDate);

        let period = cycle == enums.timecard.frequency.semimonthly ? 15 : cyclePeriod;

        if(cycle == enums.timecard.frequency.daterange)
        {
            out.push( {
                startDate : moment(currentDate).clone().format('YYYY-MM-DD'),
                endDate : moment(endDate).clone().format('YYYY-MM-DD')
            })
   
        }
        else
        { 
            while (currentDate <= stopDate) 
            {
                // if (maxDate && moment(currentDate).isAfter(maxDate, 'day')) {
                //     break;
                // }
                if(cycle == enums.timecard.frequency.monthly)
                {
                    out.push( {
                        startDate : moment(currentDate).format('YYYY-MM-DD'),
                        endDate : moment(currentDate).endOf('month').format('YYYY-MM-DD')
                    })
    
                    currentDate = moment(currentDate).endOf('month').add(1, 'days');
                }
                else if(cycle == enums.timecard.frequency.semimonthly)
                { 
    
                    let dt = moment(new Date(currentDate.clone().format('YYYY')+'-'+(currentDate.clone().format('MM'))+'-'+15));
                    
                    if( currentDate < dt )
                    {
                   
                        out.push({
                            startDate : moment(currentDate).format('YYYY-MM-DD'),
                            endDate : dt.format('YYYY-MM-DD')
                        })
                        currentDate = moment(dt.add(1, 'days').format('YYYY-MM-DD'))
                    }
                    else
                    {
                        out.push({
                            startDate : moment(currentDate).format('YYYY-MM-DD'),
                            endDate : dt.endOf('month').format('YYYY-MM-DD')
                        })
                        currentDate = moment(currentDate.endOf('month').add(1, 'days').format('YYYY-MM-DD'))
                    }
                }
                else if(cycle == enums.timecard.frequency.specialcycle)
                {
                 
                    if( moment(currentDate).clone().format('MM') != moment(currentDate).clone().add(period, 'days').format('MM') )
                    {
                        out.push( {
                            startDate : moment(currentDate).format('YYYY-MM-DD'),
                            endDate : moment(currentDate).endOf('month').format('YYYY-MM-DD')
                        })
        
                        currentDate = moment(currentDate).endOf('month').add(1, 'days');
                    }
                    else
                    {
                        out.push( {
                            startDate : moment(currentDate).format('YYYY-MM-DD'),
                            endDate : moment(currentDate).clone().add(period, 'days').format('YYYY-MM-DD')
                        })
        
                        currentDate = moment(currentDate).add(period+1, 'days');
                    }
                    
                }
                else if(cycle == enums.timecard.frequency.biweekly) 
                {
                    out.push( {
                        startDate : moment(currentDate).format('YYYY-MM-DD'),
                        endDate : moment(currentDate).endOf('isoWeek').add(1, 'days').endOf('isoWeek').format('YYYY-MM-DD')
                    })
                    currentDate = moment(currentDate).endOf('isoWeek').add(1, 'days').endOf('isoWeek').add(1, 'days');
                }
                else if(cycle == enums.timecard.frequency.weekly) 
                {
                    if( moment(currentDate).clone().format('MM') != moment(currentDate).clone().endOf('isoWeek').add(1, 'days').format('MM') )
                    {
                        out.push( {
                            startDate : moment(currentDate).format('YYYY-MM-DD'),
                            endDate : moment(currentDate).endOf('month').format('YYYY-MM-DD')
                        })
        
                        currentDate = moment(currentDate).endOf('month').add(1, 'days');
                    }
                    else
                    {
                        out.push( {
                            startDate : moment(currentDate).format('YYYY-MM-DD'),
                            endDate : moment(currentDate).endOf('isoWeek').format('YYYY-MM-DD')
                        })
                        currentDate = moment(currentDate).endOf('isoWeek').add(1, 'days');
                    }
                }
                else
                {
                    out.push([])
                }
            }
        }


        return  _.orderBy(out, ['startDate'],['desc']);
    
    }

    createDateRange(startDate, endDate, cycle, cyclePeriod)
    {
       
        let out = [];
        let currentDate = moment(startDate);
        let stopDate = moment(endDate);

        let period = cycle == enums.timecard.frequency.semimonthly ? 15 : cyclePeriod;

        if(cycle == enums.timecard.frequency.daterange)
        {
            out.push( {
                startDate : moment(currentDate).clone().format('YYYY-MM-DD'),
                endDate : moment(endDate).clone().format('YYYY-MM-DD')
            })
   
        }
        else
        { 
            while (currentDate <= stopDate) 
            {
              
                if(cycle == enums.timecard.frequency.monthly)
                {
                    out.push( {
                        startDate : moment(currentDate).format('YYYY-MM-DD'),
                        endDate : moment(currentDate).endOf('month').format('YYYY-MM-DD')
                    })
    
                    currentDate = moment(currentDate).endOf('month').add(1, 'days');
                }
                else if(cycle == enums.timecard.frequency.semimonthly)
                { 
    
                    let dt = moment(new Date(currentDate.clone().format('YYYY')+'-'+(currentDate.clone().format('MM'))+'-'+15));
                    
                    if( currentDate < dt )
                    {
                   
                        out.push({
                            startDate : moment(currentDate).format('YYYY-MM-DD'),
                            endDate : dt.format('YYYY-MM-DD')
                        })
                        currentDate = moment(dt.add(1, 'days').format('YYYY-MM-DD'))
                    }
                    else
                    {
                        out.push({
                            startDate : moment(currentDate).format('YYYY-MM-DD'),
                            endDate : dt.endOf('month').format('YYYY-MM-DD')
                        })
                        currentDate = moment(currentDate.endOf('month').add(1, 'days').format('YYYY-MM-DD'))
                    }
                }
                else if(cycle == enums.timecard.frequency.specialcycle)
                {
                 
                    if( moment(currentDate).clone().format('MM') != moment(currentDate).clone().add(period, 'days').format('MM') )
                    {
                        out.push( {
                            startDate : moment(currentDate).format('YYYY-MM-DD'),
                            endDate : moment(currentDate).endOf('month').format('YYYY-MM-DD')
                        })
        
                        currentDate = moment(currentDate).endOf('month').add(1, 'days');
                    }
                    else
                    {
                        out.push( {
                            startDate : moment(currentDate).format('YYYY-MM-DD'),
                            endDate : moment(currentDate).clone().add(period, 'days').format('YYYY-MM-DD')
                        })
        
                        currentDate = moment(currentDate).add(period+1, 'days');
                    }
                    
                }
                else if(cycle == enums.timecard.frequency.biweekly) 
                {
                    out.push( {
                        startDate : moment(currentDate).format('YYYY-MM-DD'),
                        endDate : moment(currentDate).endOf('isoWeek').add(1, 'days').endOf('isoWeek').format('YYYY-MM-DD')
                    })
                    currentDate = moment(currentDate).endOf('isoWeek').add(1, 'days').endOf('isoWeek').add(1, 'days');
                }
                else if(cycle == enums.timecard.frequency.weekly) 
                {
                    // if( moment(currentDate).clone().format('MM') != moment(currentDate).clone().endOf('isoWeek').add(1, 'days').format('MM') )
                    // {
                    //     out.push( {
                    //         startDate : moment(currentDate).format('YYYY-MM-DD'),
                    //         endDate : moment(currentDate).endOf('month').format('YYYY-MM-DD')
                    //     })
        
                    //     currentDate = moment(currentDate).endOf('month').add(1, 'days');
                    // }
                    // else
                    // {
                        out.push( {
                            startDate : moment(currentDate).format('YYYY-MM-DD'),
                            endDate : moment(currentDate).endOf('isoWeek').format('YYYY-MM-DD')
                        })
                        currentDate = moment(currentDate).endOf('isoWeek').add(1, 'days');
                    // }
                }
                else
                {
                    out.push([])
                }
            }
        }


        return  _.orderBy(out, ['startDate'],['desc']);
    
    }

    getTimeSheetByDates(employeeDetailsId, projectId, startDate, endDate)
    {
        // let query = "SELECT TSUpload_Id FROM Invoice_ClientTimeSheet WHERE EmployeeId = " + employeeDetailsId + 
        //             " AND projectId = " + projectId + 
        //             " AND TSFromDate >= '" + startDate + "' "+
        //             " AND TSToDate <= '" + endDate + "'" ;

        // return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
        // .then((rs) => {
        //     return rs;
        // })
        
        let query = "EXEC API_SP_CheckTimesheet @employeeDetailsId = \'" + employeeDetailsId + "\' "
                + ",@projectId=\'" + projectId + "\'"
                + ",@fromDate=\'" + startDate + "\'"
                + ",@toDate=\'" + endDate + "\'";
                
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
                .then((details) => { 
                    return details;
                })
        // console.log(query);

      
    }

    getTimeCardSumByDate(employeeDetailsId, projectId, startDate, endDate)
    {
        let query = "SELECT SUM(TotalHrs) as totalHours, MIN(TSEntryStatus) AS statusId " +
                    //"(SELECT [dbo].API_FN_GetTimecardStatusByTsEntryIdAndEmployeeId(" + employeeDetailsId +", "+tsEntryId+"))  AS statusIdStatus "+
                    " FROM Invoice_TimesheetEntryDetails "+ 
                    " WHERE EmployeeId = " + employeeDetailsId +
                    " AND ProjectID = " + projectId +
                    " AND EntryDate BETWEEN '" + startDate + "' AND '" + endDate + "' ";
                    //" GROUP BY [dbo].API_FN_GetTimecardStatusByTsEntryIdAndEmployeeId(" + employeeDetailsId +", "+tsEntryId+") ";

        // console.log(query);

        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((rs) => {
                if(rs.length)
                {
                    return rs;
                }
                else
                {
                    return false;
                }
            })
    }

    // get Pending ClientTimeSheet OR submitted hours with timesheet

    getPendingTimeSheet(employeeDetailsId)
    {
        let self = this;

        return new Promise(resolve => {

            let query = "EXEC API_SP_GetEmployeeProjects @EmployeeDetailsId=\'" + employeeDetailsId + "\', @IsCurrentProject=\'" + 2 + "\' ";
            
            // console.log(query);

            return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((projectsData) => {
                
                let projects = [];
                let vacations = [];
                if(!projectsData.length)
                {
                    resolve([]);
                }
                else
                {
                    projects = projectsData.map( p => {
                        return {
                            projectDetailId : p.projectDetailId,
                            timeSheetCycle : p.timeSheetCycle,
                            timeSheetCycleId : p. timeSheetCycleId,
                            nextBillDate : p.nextBillDate,
                            projectName : p.projectName,
                            clientName : p.clientName,
                            startDate : p.startDate,
                            endDate : p.endDate,
                            billingFrom : p.billingFrom,
                            billingTo : p.billingTo,
                            specialbillingPriod : p.specialbillingPriod
                        }
                    })
                }

                async.series([
                    function(done)
                    {
                        // create date range for cycle 
                        
                        // let dateRangeMonth = self.createDateRange('2018-05-16', '2018-07-31',322);
       
                        projects.forEach( prj => { 
                            
                            let period = prj.timeSheetCycleId == enums.timecard.frequency.specialcycle ? prj.specialbillingPriod : "0";
                            let fromDate = prj.timeSheetCycleId == enums.timecard.frequency.daterange ? prj.billingFrom : prj.nextBillDate;
                            let toDate = prj.timeSheetCycleId == enums.timecard.frequency.daterange ? prj.billingTo : !prj.endDate ? new Date() : prj.endDate;
                            
                            prj['hoursDetail'] = self.createDateRange(fromDate, toDate, prj.timeSheetCycleId, period);
                        })

                        done();
                    },
                    function(done)
                    {
                        // remove dates for which timesheet is uploaded
                        // console.log('original data', projects)
                        async.each(projects, function(item, cb)
                        {
                            async.filter(item.hoursDetail, function(dt, cbin)
                            {
                                self.getTimeSheetByDates(employeeDetailsId, item.projectDetailId, dt.startDate, dt.endDate)
                                .then ( rs => {
                                    cbin(null, !rs.length)
                                })
                            }, function(err, resultArr)
                            { 
                                if(!err)
                                {   
                                    item.hoursDetail = resultArr;
                                    cb(null, resultArr)
                                }
                            }) 
                        }, function(err)
                        {
                            if(err)
                            {
                                console.log('-----------', err)
                                done(err)
                            }   
                            
                            done()
                        })

                    },
                    function(done)
                    {
                       
                       // get all vacations of user
                       
                       self.getVacations(employeeDetailsId)
                       .then( rs => { 
                           if(rs.length)
                           {
                               rs.forEach( item => {
                                   vacations.push(self.getDates(item.FromDate, item.ToDate))
                               })
                               vacations = _.uniqBy(_.flatten(vacations).sort());
                               
                               done()
                           }
                           else 
                           {
                               done()
                           }
                       })
                    },
                    function(done)
                    {
                        async.each(projects, function(it, ocb)
                        {   
                            // remove entire week from data where user was on vacation (approved vacation)
                            async.filter( it.hoursDetail , function(item, cb) 
                            { 
                                let weekDays = self.getDates(item.startDate, item.endDate);
                                let difference = _.difference(weekDays, vacations); 
                                cb(null, difference.length)
                            }, function(err, resultArr)
                            { 
                                if(!err)
                                {   
                                    // resultArr = _.orderBy(resultArr, ['weekStartDate'],['desc'])
                                    it.hoursDetail = resultArr;
                                    ocb(null)
                                }
                            })  
                        }, function(err1)
                        {
                            if(err1)
                            {
                                console.log('-----------', err1)
                                // done(err1)
                            }   
                            done()
                        })

                        
                    }, 
                    function(done)
                    {
                        async.each(projects, function(item, cb)
                        {
                            async.each(item.hoursDetail, function(i, cbb)
                            { 
                                self.getTimeCardSumByDate(employeeDetailsId, item.projectDetailId, i.startDate, i.endDate)
                                .then( rs => { 
                                    i.totalHours = rs ? rs[0].totalHours || 0 : 0;
                                    i['statusId'] = rs ? rs[0].statusId || 0 : 0;
                                    i['status'] = rs ? enums.timecard.timecardStatus[rs[0].statusId || 0].value : 'Pending';
                                    
                                    cbb(null) 
                                })
                            }, function(err)
                            {
                                if(err)
                                {
                                    console.log('-----------', err)
                                    // cb(err)
                                }   
                                cb()
                            })
                                
                        }, function(err1)
                        {
                            if(err1)
                            {
                                console.log('-----------', err1)
                                done(err1)
                            }   
                            done()
                        })
                    },
                    
                ],function(err, result)
                {
                    if(!err)
                    { 
                        return resolve(projects);
                    }
                    else
                    {
                        console.log('error occurred at timecard :', err)
                        return resolve([])
                    }
                })

                })
            })

        // })
    }

    // get Hours Details of user

    getTimecardHoursDetail(employeeDetailsId, projectId, startDate, endDate)
    {
        let query = "EXEC API_SP_TimeCard_GetHoursDetail @employeeDetailsId = " + employeeDetailsId 
        + ", @projectId = '" + projectId + "'" 
        + ", @startDate = '" + startDate + "'"
        + ", @endDate = '" + endDate + "'";

        // console.log(query);--EXEC API_SP_TimeCard_GetHoursDetail @employeeDetailsId = 17084, @projectId = '23047', @startDate = '2018-11-16', @endDate = '2018-11-30'

        let self = this;
        let vacations = [];
        let holidays = [];

        return new Promise( resolve => {

        return  dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
                .then((rs) => {
                    
                    let out = {
                        date: {
                            startDate: startDate,
                            endDate: endDate
                        },
                        project: {}
                    };

                    async.series([
                        function(done)
                        {
                            let k = projectId;
                            out.project[k] = {};
                            out.project[k].hoursDetail = [];

                            let totalRegHrs = 0;
                            let totalOtHrs = 0;
                            let totalDtHrs = 0;

                            if(rs.length)
                            {
                                rs.forEach( item => {

                                    totalRegHrs += item.regHours;
                                    totalOtHrs += item.otHours;
                                    totalDtHrs += item.dtHours;

                                    out.project[k].hoursDetail.push({
                                        day: item.entryDate,
                                        regHrs: item.regHours,
                                        otHrs: item.otHours,
                                        dtHrs: item.dtHours,
                                        // statusId: item.statusIdStatus.split(':')[0],
                                        // status: item.statusIdStatus.split(':')[1],
                                        statusId: item.TSEntryStatus,
                                        status: enums.timecard.timecardStatus[item.TSEntryStatus].value,
                                        detailId: item.detailId,
                                        weekEndId: item.weekEndId,
                                        vacation : 0,
                                        weekEnd : new Date(item.entryDate).getDay() == 0 || new Date(item.entryDate).getDay() == 6 ? 1 : 0,
                                        holiday : 0
                                    });
    
                                    out.project[k].totalRegHrs = totalRegHrs;
                                    out.project[k].totalOtHrs = totalOtHrs;
                                    out.project[k].totalDtHrs = totalDtHrs;
                                    out.project[k].comment = item.summaryComments;
                                    out.project[k].projectId = item.projectId;
                                    out.project[k].projectName = item.projectName;
                                    out.project[k].weekEndId = item.weekEndId;
                                    
                                })
    
                            }
                            else
                            {
                                out.project[k].totalRegHrs = 0;
                                out.project[k].totalOtHrs = 0;
                                out.project[k].totalDtHrs = 0;
                                out.project[k].comment = '';
                                out.project[k].projectId = projectId;
                                out.project[k].projectName = '';
                                out.project[k].weekEndId = 0;

                            }
                            out.project = out.project[projectId];
                            
                            done();
                             
                        },
                        function(done)
                        {
                            let fromDate = rs.length ? moment(rs[rs.length-1].entryDate).add(1, 'days') : startDate;
                            let projectEndDate = rs.length ? rs[0].projectEndDate : null;

                            let pendingHours = self.generateDays(fromDate, endDate, projectEndDate); 

                            out.project.hoursDetail = out.project.hoursDetail.concat(pendingHours);

                            // console.log(project);
                           
                            done();
                        },
                        function(done)
                        {
                            // get all vacations of user   
                            self.getVacations(employeeDetailsId)
                            .then( rs => { 
                                if(rs.length)
                                {
                                    rs.forEach( item => {
                                        vacations.push(self.getDates(item.FromDate, item.ToDate))
                                    })
                                    vacations = _.uniqBy(_.flatten(vacations).sort());
                                    
                                    done()
                                }
                                else 
                                {
                                    done()
                                }
                            })
                        },
                        function(done)
                        {
                            // get holiday list
                            self.getHolidays(new Date())
                            .then( rs => {
                                holidays = rs;
                                done();
                            })
                        },
                        function(done)
                        {
                            // set vacation status and vacation on hoursdetails data

                            if(vacations.length || holidays.length)
                            {
                                out.project.hoursDetail.forEach( item => {
                                    if(vacations.indexOf(item.day) > -1)
                                    {
                                        item.vacation = 1
                                        item.regHrs = item.statusId > 0 && item.statusId < 9999 ? item.regHrs : 0;
                                    } 
                                    if(holidays.indexOf(item.day) > -1)
                                    {
                                        item.holiday = 1;
                                        item.regHrs = item.statusId > 0 && item.statusId < 9999 ? item.regHrs : 0;
                                    }
                                })
                             
                                done()
                            }
                            else
                            {
                                done()
                            }
                            
                        },
                        
                    ],function(err, result)
                    {
                        if(!err)
                        { 
                            return resolve([out]);
                        }
                        else
                        {
                            console.log('error occurred at timecard :', err)
                            return resolve([])
                        }
                    })

                })
            })
    }

    // get timecard summary 
    getTimecardSummary(employeeDetailsId, weekendDate)
    {
        let query = "SELECT TSEntery_ID, RegHrs, OTHrs, TotalHrs FROM Invoice_TimesheetEntrySummary WHERE EmployeeId = " + employeeDetailsId 
                    + " AND CAST(WeekEnd_Date AS DATE) = '" + weekendDate + "'" ;

        // console.log(query);

        return new Promise( resolve => {
            return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((rs) => {

                let query1 = " select sum(RegHrs) as regHrs, sum(OT1Hrs) as otHrs, sum(TotalHrs) as totalHrs, ProjectId, TSEntery_ID "
                            + " from Invoice_TimesheetEntryDetails where EmployeeId = " + employeeDetailsId 
                            + " AND TSEntery_ID = " + (rs.length ? rs[0].TSEntery_ID : 0)
                            + " Group by ProjectId, TSEntery_ID" ;

                // console.log(query1);

                return dbContext.query(query1, { type: dbContext.QueryTypes.SELECT })
                    .then((rs1) => {

                        resolve(rs1)
                    })

                return rs;
            })
        })

        
    }

    // get timesheet

    getTimesheetHoursDetail(employeeDetailsId, status, startDate, endDate)
    {
        let query = "EXEC API_SP_TimeSheet_GetHoursDetail @employeeDetailsId = " + employeeDetailsId 
                    + ", @status = '" + status + "'" 
                    + (startDate ? ", @startDate = '" + startDate + "'": ", @startDate = " + null + "") 
                    + (endDate ? ", @endDate = '" + endDate + "'" : ", @endDate = " + null + "") ;

        // console.log(query);

        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
                .then((rs) => {

                    if(rs.length)
                    {
                        let out = [];
                        let data = {};
                        rs.forEach( item => {
                            let k = item.projectDetailId;
                            if(data[k])
                            {
                                data[k].hoursDetail.push({
                                    "startDate": item.startDate,
                                    "endDate": item.endDate,
                                    "totalHours": item.totalHours,
                                    "statusId": enums.timecard.clientApprovedTimecard[item.status].map,
                                    "status": item.status
                                })
                            }
                            else
                            {
                                data[k]= {};
                                data[k]['hoursDetail'] = [];
                                data[k].projectDetailId = item.projectDetailId;
                                data[k].projectName = item.projectName;
                                data[k].timeSheetCycle = item.timeSheetCycle;
                                data[k].hoursDetail.push({
                                    "startDate": item.startDate,
                                    "endDate": item.endDate,
                                    "totalHours": item.totalHours,
                                    "statusId": enums.timecard.clientApprovedTimecard[item.status].map,
                                    "status": item.status
                                })
                            }
                        })
                        for(let i in data)
                        {
                            out.push(data[i])
                        }

                        let sorted = out.sort( (a,b) => b.projectDetailId - a.projectDetailId )

                        return sorted;
                    }
                    else
                    {
                        return [];
                    }
                })
    }

    // get holiday list of current year

    getHolidays(currentYear) {
        let query = "SELECT HOLIDAY_ID AS holidayId,HOLIDAY_DATE AS holidayDate, DATENAME(weekday, HOLIDAY_DATE) AS holidayDay,HOLIDAY_DETAIL AS holidayDetail FROM Holiday_Master WHERE YEAR(HOLIDAY_DATE)=YEAR(GETDATE()) ORDER BY HOLIDAY_DATE ASC";
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                return details.length ? details.map( item => { return moment(item.holidayDate).format('YYYY-MM-DD') }) : [];
            })
    }

    getProjectDetails(employeeDetailsId, projectDetailId)
    {
        let query = "EXEC API_SP_GetEmployeeProjects @EmployeeDetailsId=\'" + employeeDetailsId + "\', @IsCurrentProject=\'" + 1 + "\' ";
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
        .then((details) => { 
            if(details.length)
            {
                let projectDetail = details.filter( item => {
                    if(item.projectDetailId == projectDetailId)
                    {
                        return item;
                    }
                })

                return projectDetail;
            }
            else
            {
                return [];
            }
        })
    }


    getEmployeeDetails(employeeDetailsId)
    {
        let query = "EXEC API_SP_getEmployeeDetails @employeeDetailsId =" + employeeDetailsId 
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
        .then((details) => {
            return details;
        })
    }

    getPayrollInformation(employeeDetailsId, year, month)
    {
        let query = "EXEC API_SP_GetInvoice_SalaryDetailReport @intEmployeeDetails_Id =" + employeeDetailsId + ", @intYear = "+ year +", @intMonth = "+month;
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
        .then((details) => {
            return details;
        })
    }



}