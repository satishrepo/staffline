import { dbContext, Sequelize } from "../../core/db";
import logger from '../../core/logger';
import enums from '../../core/enums';
import crypto from 'crypto';
import moment from 'moment';
import CommonMethods from '../../core/common-methods';
import configContainer from "../../config/localhost";

import CrudOperationModel from '../common/crud-operation-model';
import { CityList } from "../../entities/regions/regions";
import { ResumeMaster } from "../../entities/profileManagement/resume-master";
import { JobReferral } from "../../entities/jobs/job-referral";
import { JobResume } from "../../entities/jobs/job-resume";
import { EmployeeDetails } from "../../entities/profileManagement/employee-details";

let commonMethods = new CommonMethods(),
    crudOperationModel = new CrudOperationModel(),
    config = configContainer.loadConfig();

export default class JobsModel {
    constructor() { }


    /**
   * get job title By Search string
   * @param {*} searchString : input search string
   */
    getJobTitleSuggestion(searchString) {
        let query = "EXEC API_S_uspJobs_GetJobsTitleSuggestion @searchString='" + searchString.trim() + "' ";
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                return details;
            });
    }


    /**
      * Get getJobCountByUserLocation  
      */
    getJobCountByUserLocation(employeeDetailsId) {
        let query = "EXEC API_SP_Jobs_JobCountByLocationByEmpId @EmployeeDetails_Id=\'" + ~~employeeDetailsId + "\'";
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                return [{
                    localJobCount: details[0].localJobCount,
                    otherLocationJobCount: details[1].otherLocationJobCount,
                }];
            }).catch((error) => {
                logger.error('Error has occured in jobs-models/getJobCountByUserLocation process.', error);
                return [];
            });
    }

    /**
      * Get ProjectTypeCounts  
      */
    getProjectTypeCounts() {
        let query = "EXEC API_SP_Jobs_ProjectType";
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                return details;
            }).catch((error) => {
                logger.error('Error has occured in jobs-models/getProjectTypeCounts process.', error);
                return [];
            });
    }

    /**
    * Check duplicate record in last 5 data for job search 
    */
    isDuplicateJobSearchHistory(employeeDetailsId, searchParameterHashData) {
        let query = "SELECT DISTINCT TOP " + enums.jobs.defaultSearchHistoryCount + " JobSearchAlert_Id jobSearchAlertId, SearchName searchName,SearchParameter searchParameter , Created_Date createdDate FROM JobSearchAlert  WHERE Created_By=" + ~~employeeDetailsId + " AND isAlert=0 AND SearchParameter_HashData='" + searchParameterHashData + "' ORDER BY Created_Date DESC";

        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                return details;
            }).catch((error) => {
                return [];
            });
    }

    /**
      * Get job search history  and alert 
      */
    getJobSearchAlert(employeeDetailsId, isAlert) 
    {
        
        let query = "SELECT DISTINCT TOP " + enums.jobs.defaultSearchHistoryCount + " JobSearchAlert_Id jobSearchAlertId, SearchName searchName, SearchParameter searchParameter, Created_Date createdDate FROM JobSearchAlert  WHERE Created_By=" + ~~employeeDetailsId + " AND isAlert=" + ~~isAlert + " ORDER BY JobSearchAlert_Id DESC";
        
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                details.forEach(item => {
                    item.searchParameter = (item.searchParameter) ? JSON.parse(item.searchParameter) : '';
                    // item.searchParameter.jobCategory = (item.searchParameter.jobCategory) ? item.searchParameter.jobCategory.split(',') : [];
                    // item.searchParameter.jobAssignmentType = (item.searchParameter.jobAssignmentType) ? item.searchParameter.jobAssignmentType.split(',') : [];
                });
                return details;
            }).catch((error) => {
                logger.error('Error has occured in jobs-models/getJobSearchAlert process.', error);
                return [];
            });
    }

    getJobAlerts(employeeDetailsId, type) 
    {
        
        // let query = "SELECT DISTINCT TOP " + enums.jobs.defaultSearchHistoryCount + " JobSearchAlert_Id jobSearchAlertId, SearchName searchName, SearchParameter searchParameter, Created_Date createdDate FROM JobSearchAlert  WHERE Created_By=" + ~~employeeDetailsId + " AND isAlert=" + ~~isAlert + " ORDER BY JobSearchAlert_Id DESC";
        
        let alertType = type == 'jobs' ? enums.jobsSearchType.jobSearch : enums.jobsSearchType.matchingJob;
        
        let query = "SELECT TOP " + enums.jobs.defaultSearchHistoryCount + 
                    " SearchParameter_Id jobSearchAlertId, SearchName searchName, SearchParameter searchParameter, Created_Date createdDate " +
                    " FROM SearchParameter  WHERE Created_By=" + employeeDetailsId + " AND searchParamType=" + alertType + 
                    " ORDER BY SearchParameter_Id DESC"; 
        

        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                details.forEach(item => {
                    item.searchParameter = (item.searchParameter) ? JSON.parse(item.searchParameter) : '';
                });
                return details;
            }).catch((error) => {
                logger.error('Error has occured in jobs-models/getJobAlert process.', error);
                return [];
            });
    }


    /**
     * save job alert
     * @param {*} reqBody : request Body
     */
    saveJobAlert(reqBody) {
        
        let query = "EXEC API_S_uspJobs_InsertJobsAlert";

        query   += " @email='" + reqBody.email 
                + "' ,@employeeDetailsId =" + ~~reqBody.employeeDetailsId
                + " ,@searchName ='" + reqBody.searchName 
                + "' ,@searchParameter ='" + JSON.stringify(reqBody.searchParameter)
                + "' ,@searchParameterHashData ='" + reqBody.searchParameterHashData + "'";

        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                return details;
            }).catch((error) => {
                logger.error('Error has occured in jobs-models/saveJobAlert process.', error);
                return [];
            });
    }

    /**
     * return stored procedure params
     * @param {*} reqBody 
     */
    getSearchOrderByParams(reqBody) {
        let resp = {
            orderBy: "  ",
            sorting: {
                sortKey: "cjmPostingDate",
                sortType: "D"
            }
        }
        let orderBy = "  ";
        let sortDateDESC = '  ORDER BY cjmPostingDate DESC ',
            sortDateASC = '   ORDER BY cjmPostingDate ASC ',
            sortRelevanceQueryDESC = "  ORDER BY rank  DESC ",
            sortRelevanceQueryASC = "  ORDER BY rank ASC ",
            sortDistanceASC = ' ORDER BY distanceInMiles ASC ',
            sortDistanceDESC = ' ORDER BY distanceInMiles DESC ';
       
        // if(!reqBody.keyword){
        //     orderBy = sortDateASC;
        //     resp.sorting.sortKey = "cjmPostingDate";
        //     resp.sorting.sortType = "A";
        // }
        // else 
        // if ((reqBody.keyword && !reqBody.sortDate && !reqBody.sortRelevance) || (reqBody.keyword && reqBody.sortRelevance && reqBody.sortRelevance.toString().toLowerCase() == 'd')) {
        //     orderBy = sortRelevanceQueryDESC;
        //     resp.sorting.sortKey = "rank";
        //     resp.sorting.sortType = "D";
        // } 
        // else 
        if ((reqBody.sortDate) && reqBody.sortDate.toString().toLowerCase() == 'a') {
            orderBy = sortDateASC;
            resp.sorting.sortKey = "cjmPostingDate";
            resp.sorting.sortType = "A";
        }
        else if ((reqBody.sortDate) && reqBody.sortDate.toString().toLowerCase() == 'd') {
            orderBy = sortDateDESC;
            resp.sorting.sortKey = "cjmPostingDate";
            resp.sorting.sortType = "D";
        } else if ((reqBody.keyword && reqBody.sortRelevance) && reqBody.sortRelevance.toString().toLowerCase() == 'a') {
            orderBy = sortRelevanceQueryASC;
            resp.sorting.sortKey = "rank";
            resp.sorting.sortType = "A";
        } else if ((reqBody.keyword && reqBody.sortRelevance) && reqBody.sortRelevance.toString().toLowerCase() == 'd') {
            orderBy = sortRelevanceQueryDESC;
            resp.sorting.sortKey = "rank";
            resp.sorting.sortType = "D";
        } else if ((reqBody.sortDistance) && reqBody.sortDistance.toString().toLowerCase() == 'd') {
            orderBy = sortDistanceDESC;
            resp.sorting.sortKey = "distance";
            resp.sorting.sortType = "D";
        } else if ((reqBody.sortDistance) && reqBody.sortDistance.toString().toLowerCase() == 'a') {
            orderBy = sortDistanceASC;
            resp.sorting.sortKey = "distance";
            resp.sorting.sortType = "A";
        } 
        else 
        {
            // default sorting will be rank DESC
            orderBy = sortDateDESC;   
        }
        resp.orderBy = "\'" + orderBy + "\' ";
        return resp
    }
    /**
     * Get city lat long by condition
     * @param {*} city :city Name
     * @param {*} state : state Name
     */
    getCityMasterDetailsByCondition(location) {


        let cityState = commonMethods.getCityStateFromLocation(location);
        let query = "SELECT TOP 1 * FROM City_Master CM LEFT JOIN State_Master SM ON SM.State_IEU_Id =CM.State_Id WHERE CM.City_Name= '" + (cityState.city.trim() || '') + "' AND SM.State_Name='" + (cityState.state.trim() || '') + "'";
        if (cityState.city == cityState.state) {
            query = "SELECT TOP 1 * FROM City_Master CM LEFT JOIN State_Master SM ON SM.State_IEU_Id =CM.State_Id WHERE CM.City_Name= '" + (cityState.city.trim() || '') + "' OR SM.State_Name='" + (cityState.state.trim() || '') + "'";
        }
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((city) => {
                return (city.length) ? city[0] : {};
            }).catch((error) => {
                logger.error('Error has occured in jobs-models/getCityMasterDetailsByCondition process.', error);
                return {};
            });

    }

    /**
     * return stored procedure params
     * @param {*} reqBody 
     */
    getSearchWhereParams(reqBody, isDistanceFilter) 
    {   
        let params = "";
        let cityState = commonMethods.getCityStateFromLocation(reqBody.location.trim());

        let where = "  1=1 ";

        if ((reqBody.cjmJobIds && reqBody.cjmJobIds.length > 0) && (reqBody.jobListType == "" || reqBody.jobListType == enums.jobListType.localJobs || reqBody.jobListType == enums.jobListType.otherLocationJobs)) 
        {            
            where += "  AND Charindex(cast(cjmJobId as varchar(MAX)), ''" + reqBody.cjmJobIds.join(",") + "'') > 0  ";
        } 
        else 
        {

            // where += "  AND ( jobTitle LIKE ''%" + reqBody.keyword.trim() + "%''  OR  keywords LIKE ''%" + reqBody.keyword.trim() + "%'' ) ";

            //in case of simmilar jobs remove current job id from similar jobs list
            if (reqBody.cjmJobIds && reqBody.cjmJobIds.length > 0 && reqBody.jobListType == enums.jobListType.similarJobs) {
                where += " AND cjmJobId <>  " + reqBody.cjmJobIds[0];
            }

            // city and state having some values
            if (cityState.city && cityState.state) 
            {
                var condition = " AND ";
                if (isDistanceFilter) {
                    where = where;
                }
                else if (cityState.city == cityState.state) {
                    condition = " OR ";

                    where += " AND ((city = ''" + cityState.city.trim() + "'') " + condition + " (state = ''" + cityState.state.trim() + "'')) ";
                }
                else {
                    where += " AND (((city = ''" + cityState.city.trim() + "'') " + condition + " (state = ''" + cityState.state.trim() + "'')) "
                        + " OR  (distanceInMiles <= (CASE WHEN (EXISTS(SELECT * FROM #temp WHERE distanceInMiles <=50))  THEN CONVERT(VARCHAR(50)," + reqBody.miles + ")  ELSE 200 END) AND (ISNULL(cityId,0) > 0) ) )  ";
                }
            }

            if (reqBody.isHot == 1) {
                where += " AND ISNULL(isHot,0) = 1 ";
            }
            else if (reqBody.isHot == 0)
                where += " AND ISNULL(isHot,0) = 0 "

            if (reqBody.jobCategory != '')
                where += " AND Charindex(cast(projectTypeId as varchar(8000)),''" + reqBody.jobCategory + "'') > 0  "

            if (reqBody.jobAssignmentType != '')
                where += " AND Charindex(cast(cjmAssessmentTypeKey as varchar(8000)), ''" + reqBody.jobAssignmentType + "'') > 0  ";

            if(reqBody.resumeId && reqBody.resumeId > 0)
            {
                 where += ' AND cjmJobId NOT IN ( Select Distinct CJM_JOB_ID From Job_Resume Where CandidateResume_id = ' + reqBody.resumeId + ' And CJM_JOB_ID is not null ) ';
            }

            // for (let i in reqBody) {
            //   if (reqBody[i]) {
            //     if (i == 'location') {
            //       let cityState = commonMethods.getCityStateFromLocation(reqBody.location);
            //       if (cityState.city)
            //         params += ",@city =\'" + cityState.city + "\' ";
            //       if (cityState.state)
            //         params += ",@state =\'" + cityState.state + "\' ";
            //     } else {
            //       params += ",@" + i + " =\'" + reqBody[i] + "\' ";
            //     }
            //   }
            // }
        }

        return ("\'" + where + "\' ");

    }
    /**
      * Get Job search
      * @param {*} searchObject :search text 
      *@param {*} location :location text   
      */
    getJobsList(reqBody) {

        reqBody.miles = reqBody.miles ? reqBody.miles : enums.jobs.defaultMiles;
        let self = this;
        let orderByResp = self.getSearchOrderByParams(reqBody);
         
        /*let query = " EXEC API_S_uspJobs_GetJobsSearch @employeeDetailsId =\'" + ~~reqBody.employeeDetailsId + "\' ,@pageCount =\'" + ~~reqBody.pageCount + "\' ,@pageSize =\'" + ~~reqBody.pageSize + "\',@keyWords =\'" + reqBody.keyword + "\'";
        query = query + ' ,@latitude= ' + reqBody.latitude + ' ,@longitude= ' + reqBody.longitude;
        query = query + ' ,@where= ' + self.getSearchWhereParams(reqBody) + ' ,@orderBy= ' + orderByResp.orderBy + ', @jobObject'+reqBody.jobObject;*/

        let query = " EXEC API_S_uspJobs_GetJobsSearch_bkp @employeeDetailsId =\'" + ~~reqBody.employeeDetailsId + "\' ,@pageCount =\'" + ~~reqBody.pageCount + "\' ,@pageSize =\'" + ~~reqBody.pageSize + "\',@keyWords =\'" + reqBody.keyword + "\'";
        query = query + ' ,@latitude= ' + reqBody.latitude + ' ,@longitude= ' + reqBody.longitude;
        query = query + ' ,@where= ' + self.getSearchWhereParams(reqBody) + ' ,@orderBy= ' + orderByResp.orderBy ;


        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                
                let paging = {
                    totalCount: 0,
                    currentPage: enums.paging.pageCount,
                },
                jobResult = [];
    
                if (details) 
                {
                    paging.totalCount = (details[0].totalCount) ? details[0].totalCount : 0;
                    paging.currentPage = (details[1].currentPage) ? details[1].currentPage : enums.paging.pageCount;
                    jobResult = details.splice(2, details.length);
                }

                return {
                    paging: paging,
                    jobs: jobResult,
                    sorting: orderByResp.sorting
                };

            })
            .catch(error => {
                return {
                    paging: [],
                    jobs: [],
                    sorting: {
                        sortKey: "cjmPostingDate",
                        sortType: "D"
                    }
                };
            })

    }

    /**
      * Get Job Count ( Local and Non-Local Job)
      * @param {*} searchObject :search text 
      *@param {*} location :location text   
      */
    getJobsCount(reqBody) 
    {

        reqBody.miles = reqBody.miles ? reqBody.miles : enums.jobs.defaultMiles;
        let self = this;
        let orderByResp = self.getSearchOrderByParams(reqBody);
         
    
        let query = " EXEC API_S_uspJobs_GetJobsCounts @employeeDetailsId =\'" + ~~reqBody.employeeDetailsId + "\',@keyWords =\'" + reqBody.keyword + "\'";
        query = query + ' ,@latitude= ' + reqBody.latitude + ' ,@longitude= ' + reqBody.longitude;
        query = query + ' ,@where= ' + self.getSearchWhereParams(reqBody) ;


        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                return details.length ? details[0].totalCount : 0;  
            })

    }


    /**
     * Get Job search
     * @param {*} searchObject :search text 
     *@param {*} location :location text   
     */
    GetJobsDetailById(reqBody) {
        let query = "EXEC API_S_uspJobs_GetJobsDetailById @employeeDetailsId =\'" + ~~reqBody.employeeDetailsId + "\' ,@cjmJobId =\'" + ~~reqBody.cjmJobId + "\' ";

        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                return details;
            })
    }


    /**
      * Get Job alert count
      * @param {*} keyword :search text  
      *@param {*} location :location text  
     */
    getJobsCountByKeywordLocation(keyword, location) {
        let cityState = commonMethods.getCityStateFromLocation(location);
        keyword = keyword ? keyword : '';

        let query = "EXEC API_SP_Jobs_JobAlertCount @searchText =\'" + keyword + "\' ,@city =\'" + cityState.city + "\' ,@state =\'" + cityState.state + "\'";
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                return (details) ? details[0].totalCount : 0;
            })
    }

    /**
      * Get getJobsLocationsAndCount  
      */
    getJobsLocationsAndCount(reqBody) {//keyword, location) {
        reqBody.miles = reqBody.miles ? reqBody.miles : enums.jobs.defaultMiles;
        let query = "EXEC API_S_uspJobs_GetLocationAndCount @keyWords =\'" + reqBody.keyword + "\'";
        query = query + ', @latitude= ' + reqBody.latitude + ' ,@longitude= ' + reqBody.longitude + ' ,@where= ' + this.getSearchWhereParams(reqBody);


        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                return details;

            }).catch((error) => {
                logger.error('Error has occured in jobs-models/getJobsLocationsAndCount process.', error);
                return [];
            });
    }


    getJobLocationAndKeywordByJobId(jobId) {
        let query = "EXEC API_SP_GetJobLocationAndKeyword @jobId=\'" + jobId + "'";
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                return details;
            }).catch((error) => {
                logger.error('Error has occured in jobs-models/getJobLocationAndKeywordByJobId process.', error);
                return [];
            });
    }

    /**
     * Get getJobsTypeAndCount  
     */
    getJobsTypeAndCount(reqBody) {
        reqBody.miles = reqBody.miles ? reqBody.miles : enums.jobs.defaultMiles;
        let query = "EXEC API_S_uspJobs_GetJobTypeAndCount @keyWords=\'" + reqBody.keyword + "'";
        query = query + ' ,@latitude= ' + reqBody.latitude + ' ,@longitude= ' + reqBody.longitude + ' ,@where= ' + this.getSearchWhereParams(reqBody);

        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                if (details.length) {
                    let sum = 0;
                    details.forEach(function (item) {
                        sum += item.count;
                    });
                    details.push({
                        "isHot": enums.jobs.isHotDefaultValueForAllResult,
                        "title": "All Jobs",
                        "count": sum
                    });
                    return details;
                } else {
                    return [];
                }

            }).catch((error) => {
                commonMethods.catchError('Error has occured in jobs-models/getJobsTypeAndCount process', error);
                return [];
            });
    }

    /**
     * Get getJobsCategoryAndCount  
     */
    getJobsCategoryAndCount(reqBody) {
        reqBody.miles = reqBody.miles ? reqBody.miles : enums.jobs.defaultMiles;
        let query = "EXEC API_S_uspJobs_GetJobCategoryAndCount @keyWords=\'" + reqBody.keyword + "'";
        query = query + ' ,@latitude= ' + reqBody.latitude + ' ,@longitude= ' + reqBody.longitude + ',@where= ' + this.getSearchWhereParams(reqBody);

        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                return details;

            }).catch((error) => {
                logger.error('Error has occured in jobs-models/getJobsCategoryAndCount process.', error);
                return [];
            });
    }

    /**
     * Get getJobsAssignmentTypeAndCount  
     */
    getJobsAssignmentTypeAndCount(reqBody) {
        reqBody.miles = reqBody.miles ? reqBody.miles : enums.jobs.defaultMiles;
        let query = "EXEC API_S_uspJobs_GetJobAssignmentTypeAndCount @keyWords=\'" + reqBody.keyword + "'";
        query = query + ' ,@latitude= ' + reqBody.latitude + ' ,@longitude= ' + reqBody.longitude + ' ,@where= ' + this.getSearchWhereParams(reqBody);

        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                return details;
            }).catch((error) => {
                logger.error('Error has occured in jobs-models/getJobsAssignmentTypeAndCount process.', error);
                return [];
            });
    }

    /**
    * Check for Already Refer for any Job 
    * @param {*} email : email of user
    * @param {*} jobId : Job id client_job_master
    */

    checkJobReferral(email, jobId) {
        return new Promise(resolve => {
            EmployeeDetails.findOne({ where: { emailId: email } })
            .then(rs => {
                if (rs) {
                    //check user apply for this job aur not
                    JobResume.findOne({ where: { employeeDetailsId: rs.employeeDetailsId, cjmJobId: jobId } })
                    .then(jobResume => {
                        if (jobResume) {
                            return resolve(true);
                        } else {

                            //check user already reffer for this job aur not
                            JobReferral.findOne({ where: { resumeId: rs.resumeId, jobId: jobId } })
                            .then(rs1 => {
                                if (rs1) {
                                    return resolve(true);
                                }
                                else {
                                    return resolve(false);
                                }
                            })
                        }
                    })
                }
                else {
                    return resolve(false);
                }

            })
        })

    }

    checkJobReferralByUserId(userId, jobId) {
        return new Promise(resolve => {
            ResumeMaster.findOne({ where: { employeeDetailsId: userId } })
                .then(rs => {
                    if (rs) {
                        //check user apply for this job aur not
                        JobResume.findOne({ where: { employeeDetailsId: rs.employeeDetailsId, cjmJobId: jobId } })
                            .then(jobResume => {
                                if (jobResume) {
                                    return resolve(true);
                                } else {

                                    //check user already reffer for this job aur not
                                    JobReferral.findOne({ where: { resumeId: rs.resumeId, jobId: jobId } })
                                        .then(rs1 => {
                                            if (rs1) {
                                                return resolve(true);
                                            }
                                            else {
                                                return resolve(false);
                                            }
                                        })
                                }
                            })
                    }
                    else {
                        return resolve(false);
                    }

                })
        })

    }

    /**
   * Check for Already Refer for any Job 
   * @param {*} email : email of user
   * @param {*} jobId : Job id client_job_master
   */

    checkJobAppliedByEmail(email, jobId) {
        return new Promise(resolve => {
            ResumeMaster.findOne({ where: { emailId: email } })
            .then(rs => {
                if (rs) {
                    JobResume.findOne({ where: { candidateResumeId: rs.resumeId, cjmJobId: jobId } })
                    .then(rs1 => {
                        if (rs1) {
                            return resolve({employeeDetailsId : rs.employeeDetailsId, applied : true});
                        }
                        else {
                            return resolve({employeeDetailsId : rs.employeeDetailsId, applied : false});
                        }
                        })
                }
                else {
                    return resolve({employeeDetailsId : 0, applied : false});
                }

            })
        })

    }

    /**
    * Check for Already Refer for any Job 
    * @param {*} employeeDetailsId : id of loggedin user
    * @param {*} jobId : Job id client_job_master
    */

    checkJobAppliedByEmployeeDetailsId(employeeDetailsId, jobId) {
        return new Promise(resolve => {
            ResumeMaster.findOne({ where: { employeeDetailsId: employeeDetailsId } })
                .then(rs => {
                    if (rs) {
                        JobResume.findOne({ where: { candidateResumeId: rs.resumeId, cjmJobId: jobId } })
                            .then(rs1 => {
                                if (rs1) {
                                    return resolve(true);
                                }
                                else {
                                    return resolve(false);
                                }
                            })
                    }
                    else {
                        return resolve(false);
                    }

                })
        })

    }


    getResumeDocumentList(employeeDetailsId) {
        let resumeVars = enums.uploadType.userResume;
        let query = "EXEC API_S_uspGetResumeDocuments @EmployeeDetails_Id=\'" + employeeDetailsId + "\'";
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                if (details.length) {
                    details.forEach(item => {
                        item.resumeFile = (item.resumeFile) ? config.resumeHostUrl + config.documentBasePath + resumeVars.path + '/' + item.resumeFile : ''
                        let diff = commonMethods.getDifferenceInDays(new Date(item.createdDate), new Date());
                        item.uploaded = diff > 0 ? diff + ' days old' : 'Today';
                        delete item.createdDate;
                    })
                    return details;
                }
                else {
                    return details;
                }

            })
    }


    checkValidResumeId(employeeDetailsId, documentId) {
        let query = "EXEC API_S_uspGetDocumentDetailsById @EmployeeDetails_Id=" + employeeDetailsId + ", @DocumentDetails_Id = " + documentId;
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                return details;
            })
    }



    /**
    * Get getJobsDistanceAndCount  
    */
    getJobsDistanceAndCount(reqBody) {
        let orderByResp = this.getSearchOrderByParams(reqBody);
        let query = "EXEC API_S_uspJobs_GetDistanceAndCount @keyWords =\'" + reqBody.keyword + "\'";
        query = query + ' ,@latitude= ' + (reqBody.latitude || 0) + ' ,@longitude= ' + (reqBody.longitude || 0);
        query = query + ' ,@where= ' + this.getSearchWhereParams(reqBody, 1) + ' ,@orderBy= ' + orderByResp.orderBy;

        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                if ((!details.length) || (details.length && !(details[0].count0) && !(details[0].count10) && !(details[0].count20) && !(details[0].count50) && !(details[0].count200))) {
                    return [];
                } else {
                    let obj = details[0];
                    return [{
                        miles: obj.miles0,
                        count: obj.count0
                    },
                    {
                        miles: obj.miles10,
                        count: obj.count10
                    },
                    {
                        miles: obj.miles20,
                        count: obj.count20
                    },
                    {
                        miles: obj.miles50,
                        count: obj.count50
                    },
                    {
                        miles: obj.miles200,
                        count: obj.count200
                    }]

                }
            }).catch((error) => {
                logger.error('Error has occured in jobs-models/getJobsDistanceAndCount process.', error);
                return [];
            });
    }

    /**
    * Get User job applications list
    */

    getApplicationByEmployeeDetailsId(employeeDetailsId, applicationStatus) 
    {
        let where = ' ed.employeeDetails_Id = ' + employeeDetailsId;
        let where2 = ' ';
        
        // where += applicationStatus == 'active' ? ' AND ((jr.JR_STATUS_ID in (' + enums.interviewStatus.positive.join(',') + ') AND cjm.cjmStatus= \'\'A\'\')  OR ( em.Event_Type = 4 AND cjm.cjmStatus is null)) ' : ' AND (jr.JR_STATUS_ID in(' + enums.interviewStatus.negative.join(',') + ') OR cjm.cjmStatus <> \'\'A\'\')';

        if(applicationStatus == 'active')
        {
            where += ' AND ((jr.JR_STATUS_ID in (' + enums.interviewStatus.positive.join(',') + ') AND cjm.cjmStatus= \'\'A\'\')  OR ( em.Event_Type = 4 AND cjm.cjmStatus is null)) ';
            where2 += ' AND ((JR.status in (' + enums.interviewStatus.positive.join(',') + ') AND cjm.cjmStatus= \'\'A\'\')) '
        }
        else
        {
            where += ' AND (jr.JR_STATUS_ID in(' + enums.interviewStatus.negative.join(',') + ') OR cjm.cjmStatus <> \'\'A\'\')';
            where2 += ' AND (JR.status in(' + enums.interviewStatus.negative.join(',') + ') OR cjm.cjmStatus <> \'\'A\'\')';
        }

        let query = "EXEC API_S_uspGetUserJobApplications @where= '" + where + "',  @where2= '" + where2 + "', @employeeDetailsId = " + employeeDetailsId;
        


        let applicationStage = {
            'applied': 'no',
            'inprocess': 'no',
            'offer': 'no'
        };

        let sts = enums.interviewStatus;

        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                if (details.length) {
                    details.forEach(item => {
                        item.positiveStatus = enums.interviewStatus.positive.indexOf(item.jobStatusId) > -1 ? 'Y' : 'N';
                        item['applicationStage'] = {
                            'applied': 'no',
                            'inprocess': 'no',
                            'offer': 'no'
                        };

                        // item['applicationStage']['applied'] = ((sts.applied.success).indexOf(item.jobStatusId) > -1) ? 'wip' : ( ((sts.applied.failed).indexOf(item.jobStatusId) > -1) ? 'failed' : 'no' );
                        // item['applicationStage']['inprocess'] = ((sts.inprocess.success).indexOf(item.jobStatusId) > -1) ? 'wip' : ( ((sts.inprocess.failed).indexOf(item.jobStatusId) > -1) ? 'failed' : 'no' );
                        // item['applicationStage']['offer'] = ((sts.offer.success).indexOf(item.jobStatusId) > -1) ? 'wip' : ( ((sts.offer.failed).indexOf(item.jobStatusId) > -1) ? 'failed' : 'no' );  


                        // applied
                        if (sts.applied.success.indexOf(item.jobStatusId) > -1) {
                            item['applicationStage']['applied'] = 'wip';
                        }
                        else if (sts.applied.failed.indexOf(item.jobStatusId) > -1) {
                            item['applicationStage']['applied'] = 'failed';
                        }
                        else if ([].concat(sts.inprocess.failed, sts.inprocess.success, sts.offer.failed, sts.offer.success).indexOf(item.jobStatusId) > -1) {
                            item['applicationStage']['applied'] = 'yes';
                        }

                        // inprocess
                        if (sts.inprocess.success.indexOf(item.jobStatusId) > -1) {
                            item['applicationStage']['inprocess'] = 'wip';
                        }
                        else if (sts.inprocess.failed.indexOf(item.jobStatusId) > -1) {
                            item['applicationStage']['inprocess'] = 'failed';
                        }
                        else if ([].concat(sts.offer.failed, sts.offer.success).indexOf(item.jobStatusId) > -1) {
                            item['applicationStage']['inprocess'] = 'yes';
                        }

                        // offer
                        if (sts.offer.success.indexOf(item.jobStatusId) > -1) {
                            item['applicationStage']['offer'] = 'yes';
                        }
                        else if (sts.offer.failed.indexOf(item.jobStatusId) > -1) {
                            item['applicationStage']['offer'] = 'failed';
                        }

                    })
                    return details;
                }
                else {
                    return details;
                }

            })
    }


    /**
      * Job Apply user submission
      */

    applyAndRefferJobsSubmission(obj) {

        let query = "EXEC API_S_uspJobs_InsertApplyAndRefferJobs ";
        query = query + ' @JobId= ' + obj.jobId + 
                        ' ,@ApplicantEmployeeDetailsId= ' + obj.applicantEmployeeDetailsId + 
                        ' ,@ApplicantResumeId= ' + obj.applicantResumeId +
                        ' ,@loggedInEmployeeDetailsId= ' + obj.loggedInEmployeeDetailsId + 
                        ' ,@CandidateDocId= ' + obj.candidateDocId +
                        ' ,@isJobReferral= ' + ~~obj.isJobReferral + 
                        ' ,@source_id= ' + (obj.source || null) + 
                        ' ,@Entity_Group= ' + (obj.entity || null)+
                        ' ,@candidateEmail = \''+obj.candidateEmail+'\'';

        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                return details;
            })
    }

    /**
      * Get all referred jobs by employeeDetails_Id
      */

    getReferredJobByEmployeeDetailsId(employeeDetails_Id) {
        let query = "EXEC API_SP_usp_GetJobReferrals @employeeDetailsId = " + employeeDetails_Id;

        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                if (details.length) 
                {
                    let sts = enums.interviewStatus;

                    details.forEach(item => {
                        item.positiveStatus = enums.interviewStatus.positive.indexOf(item.jobStatusId) > -1 ? 'Y' : 'N';

                        item['applicationStage'] = {
                            'applied': 'no',
                            'inprocess': 'no',
                            'offer': 'no'
                        };


                        // applied
                        if (sts.applied.success.indexOf(item.jobStatusId) > -1) {
                            item['applicationStage']['applied'] = 'wip';
                        }
                        else if (sts.applied.failed.indexOf(item.jobStatusId) > -1) {
                            item['applicationStage']['applied'] = 'failed';
                        }
                        else if ([].concat(sts.inprocess.failed, sts.inprocess.success, sts.offer.failed, sts.offer.success).indexOf(item.jobStatusId) > -1) {
                            item['applicationStage']['applied'] = 'yes';
                        }

                        // inprocess
                        if (sts.inprocess.success.indexOf(item.jobStatusId) > -1) {
                            item['applicationStage']['inprocess'] = 'wip';
                        }
                        else if (sts.inprocess.failed.indexOf(item.jobStatusId) > -1) {
                            item['applicationStage']['inprocess'] = 'failed';
                        }
                        else if ([].concat(sts.offer.failed, sts.offer.success).indexOf(item.jobStatusId) > -1) {
                            item['applicationStage']['inprocess'] = 'yes';
                        }

                        // offer
                        if (sts.offer.success.indexOf(item.jobStatusId) > -1) {
                            item['applicationStage']['offer'] = 'yes';
                        }
                        else if (sts.offer.failed.indexOf(item.jobStatusId) > -1) {
                            item['applicationStage']['offer'] = 'failed';
                        }

                    })
                    return details;
                }
                else {
                    return details;
                }
            })
    }

    /**
      * Get all job refferd list by paging
      */

    getAllReferredJobByEmployeeDetailsId(employeeDetails_Id, pageCount, pageSize) {
        let query = "EXEC API_SP_usp_GetJobReferrals_new @employeeDetailsId = " + employeeDetails_Id + ",@pageNum=" + pageCount + ",@pageSize=" + pageSize;

        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                let paging = {
                    totalCount: 0,
                    currentPage: enums.paging.pageCount,
                },
                    data = [];

                if (details.length) {

                    paging.totalCount = (details[0].totalCount) ? details[0].totalCount : 0;
                    paging.currentPage = (details[1].currentPage) ? details[1].currentPage : enums.paging.pageCount;
                    data = details.splice(2, details.length);

                    data.forEach(item => {
                        item.positiveStatus = enums.interviewStatus.positive.indexOf(item.jobStatusId) > -1 ? 'Y' : 'N';
                     })
                }
                return [{
                    paging: paging,
                    data: data
                }];
            })
    }


    getDefaultJobRespose() {
        let dataList = [
            {
                "searchHistory": [],
                "paging": [{
                    "totalCount": 0,
                    "currentPage": 1
                }],
                "jobs": [],
                "locations": [],
                "jobType": [],
                "jobCategory": [],
                "jobAssignmentType": [],
                "distance": []
            }
        ]
        return dataList;
    }


    getRecruiterDetails(employeeDetailsId) {
        let query = "EXEC API_S_uspGetRecruiterDetails @EmployeeDetails_Id='" + employeeDetailsId + "'";
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((rs) => {
                return rs;
            })

    }

    getJobDetailsById(jobId, employeeDetailsId) {
        let query = "EXEC API_SP_GetJobRecruiterDetails @jobId='" + jobId + "', @employeeDetailsID = "+ employeeDetailsId;
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((rs) => {
                return rs;
            })

    }

    updateRecruiter(jobId, employeeDetailsId)
    {
        let self = this;
        return new Promise( resolve => {
            crudOperationModel.findAllByCondition(ResumeMaster, {employeeDetailsId : employeeDetailsId})
            .then( rdata => { 
                if(rdata.length)
                {
                    if(enums.defaultRecruiters.indexOf(rdata[0].recruiter) > -1 )
                    {
                        self.getJobDetailsById(jobId, employeeDetailsId)
                        .then( rs => {
                            crudOperationModel.saveModel(ResumeMaster, {recruiter: rs[0].recId}, {employeeDetailsId : employeeDetailsId}) 
                            .then ( rs1 => {
                                return resolve({recId : rs[0].recId, recName : rs[0].recFirstName + ' ' + rs[0].recLastName})
                            })
                        })
                    }
                    else
                    {
                        return resolve(true);
                    }
                    
                }
                else
                {
                    return resolve(true);
                }
            })
            
        })
    }

    /**
    * Get User interview applications list
    */

    getInteviewApplications(employeeDetailsId, applicationStatus) {
        let where = ' RM.FromEmployeeDetails_Id = ' + employeeDetailsId;
        // where += applicationStatus == 'active' ? ' AND jr.JR_STATUS_ID in (' + enums.interviewStatus.positive.join(',') + ') AND cjm.cjmStatus= \'\'A\'\' ' : ' AND (jr.JR_STATUS_ID in(' + enums.interviewStatus.negative.join(',') + ') OR cjm.cjmStatus <> \'\'A\'\')';

        if (applicationStatus == 'upcomming') {
            where += ' AND jr.JR_STATUS_ID in (19)  ';
        }

        where += ' AND em.Event_Type = 4 '; // 4 is interview scheduled

        where += applicationStatus == 'upcomming' ? " AND  CONVERT(DATETIME, CONVERT(CHAR(8), em.EventDate, 112) + '' '' + CONVERT(CHAR(8), ISNULL(em.EventTime, ''00:00:00.000''), 108)) >=  getDate() " : " AND CONVERT(DATETIME, CONVERT(CHAR(8), em.EventDate, 112) + '' '' + CONVERT(CHAR(8), em.EventTime, 108)) < getDate()";

        let query = "EXEC API_S_uspGetUserInterviews @where= '" + where + "'";


        let applicationStage = {
            'applied': 'no',
            'inprocess': 'no',
            'offer': 'no'
        };

        let sts = enums.interviewStatus;

        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                if (details.length) {
                    details.forEach(item => {
                     
                        item.positiveStatus = enums.interviewStatus.positive.indexOf(item.jobStatusId) > -1 ? 'Y' : 'N';
                        item['applicationStage'] = {
                            'applied': 'no',
                            'inprocess': 'no',
                            'offer': 'no'
                        };

                        // applied
                        if (sts.applied.success.indexOf(item.jobStatusId) > -1) {
                            item['applicationStage']['applied'] = 'wip';
                        }
                        else if (sts.applied.failed.indexOf(item.jobStatusId) > -1) {
                            item['applicationStage']['applied'] = 'failed';
                        }
                        else if ([].concat(sts.inprocess.failed, sts.inprocess.success, sts.offer.failed, sts.offer.success).indexOf(item.jobStatusId) > -1) {
                            item['applicationStage']['applied'] = 'yes';
                        }

                        // inprocess
                        if (sts.inprocess.success.indexOf(item.jobStatusId) > -1) {
                            item['applicationStage']['inprocess'] = 'wip';
                        }
                        else if (sts.inprocess.failed.indexOf(item.jobStatusId) > -1) {
                            item['applicationStage']['inprocess'] = 'failed';
                        }
                        else if ([].concat(sts.offer.failed, sts.offer.success).indexOf(item.jobStatusId) > -1) {
                            item['applicationStage']['inprocess'] = 'yes';
                        }

                        // offer
                        if (sts.offer.success.indexOf(item.jobStatusId) > -1) {
                            item['applicationStage']['offer'] = 'yes';
                        }
                        else if (sts.offer.failed.indexOf(item.jobStatusId) > -1) {
                            item['applicationStage']['offer'] = 'failed';
                        }

                    })
                    return details;
                }
                else {
                    return details;
                }

            })
    }

    getCandidateSkillAndLocation(employeeDetailsId) 
    {
        let query = "EXEC API_SP_GetSkillAndLocation @employeeDetails_id='" + employeeDetailsId + "'";
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
        .then((rs) => {
            return rs;
        })
    }

    getJobAndCandidateDetails(employeeDetailsID, jobId)
    {
        let query = "EXEC API_SP_GetJobAndCandidateDetails @employeeDetails_id='" + employeeDetailsId + "', @jobId='" + jobId + "'";
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
        .then((rs) => {
            return rs;
        })
    }
    

    getUserJobReferInfoByEmail(email, jobId) 
    {
        return new Promise(resolve => {
            ResumeMaster.findOne({ where: { emailId: email } })
            .then(rs => { 
                if (rs) 
                {
                    //check user apply for this job aur not
                    JobResume.findOne({ where: { candidateResumeId: rs.resumeId, cjmJobId: jobId } })
                    .then(jobResume => { 
                        if (jobResume) 
                        {
                            return resolve({
                                email : email, 
                                        name: rs.firstName +' '+rs.lastName, 
                                        firstName: rs.firstName, 
                                        lastName: rs.lastName, 
                                        applied: true, 
                                        reffered : true
                            });
                        } 
                        else 
                        {
                            //check user already reffer for this job aur not
                            JobReferral.findOne({ where: { candidateEmail: email, jobId: jobId } })
                            .then(rs1 => { 
                                if (rs1) 
                                {
                                    return resolve({
                                        email : email, 
                                        name: rs.firstName +' '+rs.lastName, 
                                        firstName: rs.firstName, 
                                        lastName: rs.lastName, 
                                        applied: false, 
                                        reffered : true
                                    });
                                }
                                else 
                                {
                                    return resolve({
                                        email : email, 
                                        name: rs.firstName +' '+rs.lastName, 
                                        firstName: rs.firstName, 
                                        lastName: rs.lastName, 
                                        applied: false, 
                                        reffered : false
                                    });
                                }
                            })
                        }
                    })
                }
                else 
                {
                    //check user already reffer for this job aur not
                    JobReferral.findOne({ where: { candidateEmail: email, jobId: jobId } })
                    .then(rs1 => { 
                        if (rs1) 
                        {
                            return resolve({
                                email : email, 
                                name: '', 
                                firstName: '', 
                                lastName: '', 
                                applied: false, 
                                reffered : true
                            });
                        }
                        else 
                        {
                            return resolve({
                                email : email, 
                                name: '', 
                                firstName: '', 
                                lastName: '', 
                                applied: false, 
                                reffered : false
                            });
                        }
                    })
                }

            })
        })

    }


    getInvitationActivity(employeeDetailsId, pageCount, pageSize, searchText)
    {
        let query = "EXEC API_SP_GetInvitationActivity @employeeDetailsId=" + employeeDetailsId
                    + ",@pageNum = "+ pageCount
                    + ",@pageSize = "+ pageSize
                    + ",@searchText = " + (searchText ? "'" + searchText + "'" : null) ;

        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
        .then((rs) => {
            if(rs.length)
            {
                let paging = {
                    totalCount : rs[0].totalCount,
                    currentPage : rs[1].currentPage
                }
                rs.splice(0,2)
                return [{paging : paging, data : rs}]
            }
            return [];
        })
    }

    getJobReferInfo(jobId, candidateEmail)
    {
        let query = "EXEC API_SP_GetJobReferInfo @candidateEmail='" + candidateEmail + "', @jobId=" + jobId;
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
        .then((rs) => {
            return rs.length ? rs[0] : [];
        })
    }



}