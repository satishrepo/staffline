/**
 *  -------Import all classes and packages -------------
*/
import configContainer from "../../config/localhost";
import { dbContext, Sequelize } from "../../core/db";
import { CountryList, StateList, CityList } from "../../entities/regions/regions";
import enums from '../../core/enums';

/**
 *  -------Initialize global variabls-------------
 */
let config = configContainer.loadConfig();

export default class SmeModel {

    constructor() {
        //
    }
    
    getSmeAvailability(employeeDetailsId) 
    {       
        let query = "EXEC API_SP_getSmeAvailability @EmployeeDetails_Id=" + employeeDetailsId + " ";
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
        .then((details) => {
            
            let data = {0:[],1:[],2:[],3:[],4:[],5:[],6:[]};
            
            if(details.length)
            {
                for(let i in details)
                {
                    let k = details[i].weekDay;

                    if(data[k])
                    {
                        data[k].push({
                            availabilityId : details[i].availabilityId,
                            fromTime : details[i].fromTime,
                            toTime : details[i].toTime,
                        })
                    }
                }
            }
            return data;
        });
    }


    getInterviews(employeeDetailsId) 
    {       
        let query = "EXEC API_SP_getPendingInterviews @EmployeeDetails_Id=" + employeeDetailsId + " ";
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
        .then((details) => {
            
            if(details.length)
            {
                let out = [];
                let data = {};
                for(let i in details)
                {
                    let item = details[i];
                    let k = item.dt;

                    if(data[k])
                    {
                        data[k].details.push(item)
                    }
                    else
                    {
                        data[k] = {};
                        data[k].details = [];
                        data[k].interviewDate = item.interviewDate;
                        data[k].details.push(item);
                    }
                }
                for(let i in data)
                {
                    out.push(data[i])
                }
                return out;
            }
            else
                return [];
        });
    }

    getInterviewDetails(interviewRequestId) 
    {       
        let query = "EXEC API_SP_getInterviewSchedule @interviewRequestId =" + interviewRequestId + " ";
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
        .then((details) => {
            
            if(details.length)
            {
                let out = [];
                let data = {};
                let resumeVars = enums.uploadType.userResume;
                for(let i in details)
                {
                    let item = details[i];
                    let k = item.interviewRequestId;

                    if(data[k])
                    {
                        data[k].schedule.push({
                            fromTime : item.interviewFrom,
                            toTime : item.interviewTo,
                            availabilityId : item.availabilityId
                        })
                    }
                    else
                    {
                        data[k] = {};
                        data[k].schedule = [];
                        data[k].schedule.push({
                            fromTime : item.interviewFrom,
                            toTime : item.interviewTo,
                            availabilityId : item.availabilityId
                        });
                        data[k].interviewId = item.interviewId;
                        data[k].interviewRequestId = item.interviewRequestId;
                        data[k].interviewDate = item.interviewDate;
                        data[k].jobTitle = item.jobTitle;
                        data[k].jobId = item.jobId;
                        data[k].isFeedback = item.isFeedback;
                        data[k].isHired = item.isHired;
                        data[k].interviewTitle = item.interviewTitle;
                        data[k].interviewType = item.interviewType;
                        data[k].interviewInstructions = item.interviewInstructions;
                        data[k].smeRequestStatusId = item.smeRequestStatusId;
                        data[k].smeRequestStatus = item.smeRequestStatus;
                        data[k].resumeName = item.fileName;
                        data[k].resumePath = (item.filePath) ? config.documentHostUrl + config.documentBasePath + resumeVars.path + '/' + item.filePath : '';
                    }
                }
                for(let i in data)
                {
                    out.push(data[i])
                }
                return out;
            }
            else
                return [];
        });
    }


    getCompensations(employeeDetailsId) 
    {       
        let query = "EXEC API_SP_getCompansations @EmployeeDetails_Id=" + employeeDetailsId + " ";
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
        .then((details) => {
            
            if(details.length)
            {
                let out = [];
                let data = {};
                for(let i in details)
                {
                    let item = details[i];
                    let k = item.dt;

                    if(data[k])
                    {
                        data[k].details.push(item)
                    }
                    else
                    {
                        data[k] = {};
                        data[k].details = [];
                        data[k].interviewDate = item.interviewDate;
                        data[k].details.push(item);
                    }
                }
                for(let i in data)
                {
                    out.push(data[i])
                }
                return out;
            }
            else
                return [];
        });
    }

    getCompensationDetails(interviewId) 
    {       
        let query = "EXEC API_SP_getCompansationDetails @interviewId=" + interviewId + " ";
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
        .then((details) => {
            let resumeVars = enums.uploadType.userResume;
            if(details.length)
            {
                details[0]['resumeName'] = details[0].resumeName;
                details[0]['resumePath'] = (details[0].resumePath) ? config.documentHostUrl + config.documentBasePath + resumeVars.path + '/' + details[0].resumePath : '';
                return details;
            }
            else
                return [];
        });
    }

}