import { dbContext, Sequelize } from "../../core/db";
import logger from '../../core/logger';
import enums from '../../core/enums';
import crypto from 'crypto';
import CommonMethods from '../../core/common-methods';
import configContainer from "../../config/localhost";

import CrudOperationModel from '../common/crud-operation-model';

import { CandidateReferral } from "../../entities/referrals/candidate-referral";
import { LegalRequest } from "../../entities/immigrations/legal-request";

let commonMethods = new CommonMethods(),
  crudOperationModel = new CrudOperationModel(),
  config = configContainer.loadConfig();

export default class SummaryModel {
  constructor() { }

  /**
    * Get Matching job and counts  
    */
  getMatchingJobs(employeeDetailsId) {
    let query = "EXEC API_S_uspGetMatchingJobs";// @EmployeeDetails_Id=\'" + ~~employeeDetailsId + "\'";
    return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
      .then((details) => {
        return [{
          localJobs: {
            list: details,
            count: details.length
          },
          otherJobs: {
            list: details,
            count: details.length
          }
        }];
      })
  }

  /**
    * Get Recruiter Details by employeeDetailsID
    */

  getRecruiterDetails(employeeDetailsId) {
    let query = "EXEC API_S_uspGetRecruiterDetails @EmployeeDetails_Id='" + employeeDetailsId + "'"; 
    return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
      .then((rs) => {
        if(rs.length)
        {
          let details = rs[0];
          let profileVars = enums.uploadType.userPicture;
          details.profilePicture = details.profilePicture ? (config.documentHostUrl + config.documentBasePath + profileVars.path +'/'+ details.profilePicture) : '';
          return details.recruiterId ? [details] : [];
        }
        else
        {
          return rs;
        }


      })

  }

  /**
    * Get Active Applications count  
    */

  getActiveApplicationsCount(employeeDetailsId) {
    let query = "EXEC API_S_uspGetActiveApplicationsCount @EmployeeDetails_Id='" + employeeDetailsId + "'";
    return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
      .then((details) => {
        if (details[0].openApplications || details[1].referredApplications) {
          return {
            /*openApplications: details[0].openApplications,
            interviewScheduled: details[1].interviewScheduled*/
            openApplications: { "count": (details[0].openApplications + details[1].referredApplications), "message": "" },
            interviewScheduled: { "count": details[2].interviewScheduled, "message": "" }
          };
        }
        return {
          /*openApplications: 0, interviewScheduled: 0*/
          openApplications: { "count": 0, "message": "" },
          interviewScheduled: { "count": 0, "message": "" }
        };

      })

  }

  getLatestInterview(employeeDetailsId)
  {
      let query = "EXEC API_S_uspGetLatestInverview @EmployeeDetails_Id='" + employeeDetailsId + "'";
      return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
      .then((rs) => { 
          let result = {interviewDate : ''}  
          if(rs.length)
          {
              result.interviewDate = rs[0].eventTime;
          }   
            
          return result;

      })
  }

  /**
    * Get Active Applications count  
    */

  getReferralsCount(employeeDetailsId) {
    return CandidateReferral.findAll(
      {
        attributes: [[Sequelize.fn('COUNT', Sequelize.col('Resume_Id')), 'count']],
        where: {
          employeeDetailsId: employeeDetailsId
        },
        raw: true

      }).then(rs => {
        if (rs[0].count) {
          return [{
            peopleReferred: rs[0].count,
            bountyEarned: 0
          }];
        }

        return [];
      })

  }

  getLegalRequestCount(employeeDetailsId, status) 
  {
    return LegalRequest.findAll(
      {
        attributes: [[Sequelize.fn('COUNT', Sequelize.col('legalAppId')), 'count']],
        where: {
          EmployeeDetail_id: employeeDetailsId,
          APP_STATUS : status
        },
        raw: true

      }).then(rs => {
        if (rs[0].count) {
          return rs[0].count;
        }

        return 0;
      })
  }



}