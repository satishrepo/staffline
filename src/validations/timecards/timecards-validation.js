/**
 * -------Import all classes and packages -------------
 */
import fieldsLength from '../../core/fieldsLength';
import CommonMethods from '../../core/common-methods';
import path from 'path';
import moment from 'moment';
import enums from '../../core/enums';

let commonMethods = new CommonMethods();

/**
 *  -------Initialize global variabls-------------
 */
export default class TimecardValidation {

    /**
     * validation in timecards list
     * @param {*} employeeDetailsId : logged in employee details id
     * @param {*} details : data in request body
     */
    postListTimecardsValidation(employeeDetailsId, details) {
        let reqBody = {
            employeeDetailsId: employeeDetailsId,
            year: details.year,
            month: details.month,
            statusId: details.statusId
        },
            err = [];
        if (!reqBody.employeeDetailsId) {
            err.push('invalidAuthToken');
        }
        if (!reqBody.year || !(commonMethods.isValidInteger(reqBody.year)) || reqBody.year.length > fieldsLength.timecards.year) {
            err.push('year');
        }
        if (reqBody.month && (!(commonMethods.isValidInteger(reqBody.month)) || parseInt(reqBody.month.length) > fieldsLength.timecards.month)) {
            err.push('month');
        }
        if (reqBody.statusId && !(commonMethods.isValidInteger(reqBody.statusId))) {
            err.push('statusId');
        }
        return err;
    }

    /**
     * validation in missing timecards 
     * @param {*} employeeDetailsId : logged in employee details id
     * @param {*} details : data in request body
     */
    postListMissingTimecards(employeeDetailsId, details) {
        let reqBody = {
            employeeDetailsId: employeeDetailsId,
            year: details.year,
            month: details.month
        },
            err = [];

        if (!reqBody.employeeDetailsId) {
            err.push('invalidAuthToken');
        }
        if (!reqBody.year || !(commonMethods.isValidInteger(reqBody.year)) || reqBody.year.toString().length > fieldsLength.timecards.year) {
            err.push('year');
        }
        if (reqBody.month && (!(commonMethods.isValidInteger(reqBody.month)) || parseInt(reqBody.month) > fieldsLength.timecards.month)) {
            err.push('month');
        }
        return err;
    }

    /**
     * validation in saved timecards 
     * @param {*} employeeDetailsId : logged in employee details id
     * @param {*} details : data in request body
     */
    postListSavedTimecards(employeeDetailsId, details) {
        let commonMethods = new CommonMethods();
        let reqBody = {
            employeeDetailsId: employeeDetailsId,
            fromDate: details.fromDate,
            toDate: details.toDate,
            projectDetailId: details.projectDetailId
        },
            err = [];
        if (!reqBody.employeeDetailsId) {
            err.push('invalidAuthToken');
        }
        if (!reqBody.fromDate || !(commonMethods.isValidDate(reqBody.fromDate))) {
            err.push('fromDate:date');
        }
        if (!reqBody.toDate || !(commonMethods.isValidDate(reqBody.toDate))) {
            err.push('toDate:date');
        }
        if (!reqBody.projectDetailId || !(commonMethods.isValidInteger(reqBody.projectDetailId))) {
            err.push('projectDetailId');
        }
        return err;
    }


    /**
     * validation in timecards getTimecardByDateRange dates
     * @param {*} employeeDetailsId : logged in employee details id
     * @param {*} startDate : startDate of range
     * @param {*} endDate : endDate of range
     */

    getTimecardByDateRange(employeeDetailsId, startDate, endDate) {

        let err = [];
        if (!employeeDetailsId) {
            err.push('invalidAuthToken');
        }
        if (!startDate || !commonMethods.isValidDate(startDate)) {
            err.push('fromDate:date');
        }
        if (!endDate || !commonMethods.isValidDate(endDate)) {
            err.push('toDate:date');
        }
        if (new Date(startDate).getTime() > new Date(endDate).getTime()) {
            err.push('toDate:invalidDateRange')
        }
        if ((new Date(endDate).getMonth() - new Date(startDate).getMonth() + (12 * (new Date(endDate).getFullYear() - new Date(startDate).getFullYear()))) > 2) {
            err.push('toDate:dateDifferenceErr')
        }
        if (new Date(endDate).getTime() > new Date().getTime()) {
            err.push('toDate:futureEndDate')
        }
        return err;
    }


    /**
     * validation in timecards addDocumentsValidation dates
     * @param {*} totalHours : total hours
     * @param {*} projectId : proejct Id
     * @param {*} fileName : name of file
     * @param {*} fileData : file Data
     */

    addDocumentsValidation(data, allowedExt) 
    {
        let err = [];
        let totalDays = commonMethods.getDifferenceInDays(data.fromDate, data.toDate) + 1;

        let regEx = /^\d{4}-\d{2}-\d{2}$/;

        if (!data.fromDate  || !(commonMethods.isValidDate(data.fromDate))) {
            err.push('fromDate:date');
        }

        if (!data.toDate || !(commonMethods.isValidDate(data.toDate))) {
            err.push('toDate');
        }

        if (new Date(data.fromDate).getTime() > new Date(data.toDate).getTime()) {
            err.push('toDate:invalidDateRange')
        }

        // if (new Date(data.fromDate).getTime() > new Date().getTime() || new Date(data.toDate).getTime() > new Date().getTime()) {
        //     err.push('toDate:futureDateRange')
        // }

        if (!data.projects || !Array.isArray(data.projects) || !data.projects.length) {
            err.push('projects');
        }
        if (Array.isArray(data.projects) && data.projects.length) 
        {
            for (let i = 0; i < data.projects.length; i++) 
            {
                let reqBody = {
                    projectId: data.projects[i].projectId,
                    legalDocName: data.projects[i].fileName,
                    legalDocument: data.projects[i].fileData,
                    totalHours: data.projects[i].totalHours,
                    uploadedTimeSheetId: data.projects[i].uploadedTimeSheetId || 0 ,
                    tsUploadId: data.projects[i].tsUploadId || 0 
                }

                if (!reqBody.totalHours || isNaN(reqBody.totalHours)) {
                    err.push('totalHours');
                }
        
                if(reqBody.totalHours && reqBody.totalHours > (totalDays*enums.timecard.dailyHours) || reqBody.totalHours < 1)
                {
                    err.push('totalHours:invalidTotalHours');
                }

                if (!reqBody.projectId) {
                    err.push('projectId');
                }
                // if (!reqBody.legalDocName || (!commonMethods.validateFileType(reqBody.legalDocument, reqBody.legalDocName, allowedExt))) {
                //     err.push('fileName:file');
                // }

                if(reqBody.uploadedTimeSheetId == 0 && (!reqBody.legalDocName || !commonMethods.validateFileType(reqBody.legalDocument, reqBody.legalDocName, allowedExt)) )
                {
                    err.push('fileName:file');
                }
            }
        }

        let unique = err.filter((v, i, s) => { return s.indexOf(v) === i });

        return unique;
    }

    timeCardDetailEntryValidation(input) {
        let err = [];
        let oerr = [];
        let itemKey = {};

        if (!input || input.length < 1) {
            err.push('error:blankRequest');
            return err;
        }

        let sdate = moment(input.date.startDate);
        //  let sdate1 = moment(req.body.fromDate);

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

        if (new Date(input.date.startDate).getDay() != 1 && sdate.format('DD') != '01') {
            oerr.push('startDate');
        }


        if (!input.status || input.status == undefined) {
            oerr.push('status');
        }

        if (input.projects == undefined) {
            err.push('projects:projectData');
        }

        for (let i = 0; i < input.projects.length; i++) {

            if (input.projects[i].totalRegHrs == undefined || input.projects[i].totalRegHrs < 0) {
                err.push('totalRegHrs');
            }
            if (input.projects[i].totalOtHrs == undefined || input.projects[i].totalOtHrs < 0) {
                err.push('totalOtHrs');
            }
            if (input.projects[i].totalDtHrs == undefined || input.projects[i].totalDtHrs < 0) {
                err.push('totalDtHrs');
            }

            if (input.projects[i].projectId == undefined) {
                err.push('projectId');
            }

            if (input.projects[i].hoursDetail == undefined) {
                err.push('hoursDetail');
            }
            else {
                input.projects[i]['totalHours'] = 0;
                input.projects[i]['totalOt'] = 0;
                input.projects[i]['totalReg'] = 0;
                input.projects[i].hoursDetail.forEach(detail => {

                    if (detail.regHrs == undefined) {
                        err.push('regHrs');
                    }
                    if (detail.otHrs == undefined) {
                        err.push('otHrs');
                    }
                    if (detail.dtHrs == undefined) {
                        err.push('dtHrs');
                    }

                    // calculating and adding total hours property in 
                    detail.totHrs = parseFloat(Number(detail.otHrs)) + parseFloat(Number(detail.regHrs)) +  parseFloat(Number(detail.dtHrs));
                    input.projects[i]['totalHours'] += detail.totHrs;
                    input.projects[i]['totalOt'] += parseFloat(Number(detail.otHrs));
                    input.projects[i]['totalReg'] += parseFloat(Number(detail.regHrs));
                    input.projects[i]['totalDt'] += parseFloat(Number(detail.DtHrs));

                    if (detail.day == '' || !commonMethods.isValidDate(detail.day) || !(moment(detail.day).isBetween(input.date.startDate, endDate, 'days', '[]'))) {
                        err.push('day');
                    }

                    if (itemKey[detail.day]) { 
                        itemKey[detail.day].tot += parseFloat(Number(detail.totHrs));
                    }
                    else {
                        itemKey[detail.day] = { 
                            tot: parseFloat(Number(detail.totHrs))
                        };
                    }

                })
            }


        }
        
        for (let i in itemKey) {
            if (isNaN(itemKey[i].tot) ) {
                err.push('errorText:totalHours');
            }
            if (isNaN(itemKey[i].tot) && itemKey[i].tot > enums.timecard.dailyHours) {
                err.push('errorText:invalidTotalHours');
            }
        }

        let unique = err.filter((v, i, s) => { return s.indexOf(v) === i });

        return unique.concat(oerr);
    }



    getTimeCardBySummaryId(summaryId) {
        //let commonMethods = new CommonMethods();

        let err = [];

        if (!summaryId || summaryId == undefined) {
            err.push('tsEntryId');
        }


        return err;
    }

    timeSheetInvoiceDeteleValidation(invoiceId) {
        //let commonMethods = new CommonMethods();

        let err = [];

        if (!invoiceId || invoiceId == undefined) {
            err.push('invoiceId');
        }


        return err;
    }



    saveTimecardHoursValidation(timecard)
    {
        let err = [];

        if(!timecard || (typeof timecard.project == 'undefined' || !timecard.project))
        {
            err.push('errorText:blankRequest');
        }
        else if(typeof timecard.project.projectId == 'undefined' || timecard.project.projectId < 1)
        {
            err.push('errorText:projectId');
        }
        else if(typeof timecard.project.hoursDetail == 'undefined' || timecard.project.hoursDetail.length < 1)
        {
            err.push('errorText:hoursDetailMissing');
        }
        else 
        {

            for(let i in timecard.project.hoursDetail)
            {   
                if(typeof timecard.project.hoursDetail[i].dtHrs == 'undefined')
                {
                    if(
                        timecard.project.hoursDetail[i].regHrs < 1 && timecard.project.hoursDetail[i].otHrs > 0 && 
                        timecard.project.hoursDetail[i].holiday == 0 && timecard.project.hoursDetail[i].weekEnd == 0 &&
                        timecard.project.hoursDetail[i].vacation == 0
                    )
                    {
                        err.push('errorText:noRegHrs')
                    }

                    if( [0, 0.25, 0.5, 0.75, '0', '0.25', '0.5', '0.75'].indexOf(timecard.project.hoursDetail[i].regHrs % 0.25) != 0 || 
                        [0, 0.25, 0.5, 0.75, '0', '0.25', '0.5', '0.75'].indexOf(timecard.project.hoursDetail[i].otHrs % 0.25) != 0 
                    ){
                        err.push('errorText:invalidHours');
                    }
                    if(timecard.project.hoursDetail[i].regHrs < 0 || timecard.project.hoursDetail[i].otHrs < 0 )
                    {
                        err.push('errorText:invalidHours');
                    }
                    let totalHrs = parseFloat(Number(timecard.project.hoursDetail[i].regHrs) + Number(timecard.project.hoursDetail[i].otHrs) ).toFixed(2);
                    if(totalHrs > enums.timecard.dailyHours)
                    {
                        err.push('errorText:invalidHours');
                    }
                }
                else
                {
                    if(
                        timecard.project.hoursDetail[i].regHrs < 1 && 
                        (timecard.project.hoursDetail[i].otHrs > 0 || timecard.project.hoursDetail[i].dtHrs > 0)  && 
                        timecard.project.hoursDetail[i].holiday == 0 && timecard.project.hoursDetail[i].weekEnd == 0 &&
                        timecard.project.hoursDetail[i].vacation == 0
                    )
                    {
                        err.push('errorText:noRegHrs')
                    }

                    if( [0, 0.25, 0.5, 0.75, '0', '0.25', '0.5', '0.75'].indexOf(timecard.project.hoursDetail[i].regHrs % 0.25) != 0 || 
                        [0, 0.25, 0.5, 0.75, '0', '0.25', '0.5', '0.75'].indexOf(timecard.project.hoursDetail[i].otHrs % 0.25) != 0 ||
                        [0, 0.25, 0.5, 0.75, '0', '0.25', '0.5', '0.75'].indexOf(timecard.project.hoursDetail[i].dtHrs % 0.25) != 0
                    ){
                        err.push('errorText:invalidHours');
                    }
                    if(timecard.project.hoursDetail[i].regHrs < 0 || timecard.project.hoursDetail[i].otHrs < 0 || timecard.project.hoursDetail[i].dtHrs < 0)
                    {
                        err.push('errorText:invalidHours');
                    }
                    let totalHrs = parseFloat(Number(timecard.project.hoursDetail[i].regHrs) + Number(timecard.project.hoursDetail[i].otHrs) + Number(timecard.project.hoursDetail[i].dtHrs)).toFixed(2);
                    if(totalHrs > enums.timecard.dailyHours)
                    {
                        err.push('errorText:invalidHours');
                    }
                }
                
            }
        }

        return err;
    }

}
