/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from "../../core/db";
import logger from "../../core/logger";
import configContainer from "../../config/localhost";
import { EmployeeContactDetails } from "../../entities/dashboard/employee-contact-details";
import { AccountSignIn } from "../../entities/accounts/account-signin";
import enums from '../../core/enums';


/**
 *  -------Initialize global variabls-------------
 */
let config = configContainer.loadConfig();


export default class DashboardModel {

    constructor() {
        AccountSignIn.hasOne(EmployeeContactDetails, { foreignKey: "EmployeeDetails_Id" });
        EmployeeContactDetails.belongsTo(AccountSignIn, { foreignKey: "EmployeeDetails_Id" });
    }

    /**
     * Get Dashboard Data
     * @param {*} employeeDetailsId : logged in employee details id
     */
    getDashboardData(employeeDetailsId) {
        let dashBoardDate = {
            employeeId: null,
            employeeTypeId: null,
            employeeType: null,
            recruiterDetails:
            {
                firstName: null,
                lastName: null,
                profilePicture: null,
                emailId: null,
                contactNumber: null,
            }
        }

        let query = "EXEC API_SP_GetUserDashboardById @EmployeeDetails_Id=\'" + employeeDetailsId + "\' ";
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                if (details.length) {
                    dashBoardDate = [{
                        employeeId: details[0].employeeId,
                        employeeTypeId: details[0].employeeTypeId,
                        employeeType: details[0].employeeType,
                        modifiedDate: details[0].modifiedDate,
                        recruiterDetails: null
                    }];
                    if (details[0].recruiterId) {
                        dashBoardDate[0].recruiterDetails =
                            {
                                firstName: details[0].recFirstName,
                                lastName: details[0].recLastName,
                                emailId: details[0].recEmailId,
                                profilePicture: (details[0].recProfilePicture) ? config.apiHostUrl + '/' + config.imageFolder + details[0].recProfilePicture : '',
                                contactNumber: details[0].recContactNumber,
                            }
                    } else {
                        dashBoardDate[0].recruiterDetails = {};
                    }
                    return dashBoardDate;
                }
                return dashBoardDate;
            })


        // return AccountSignIn.findOne({
        //     attributes: ["EmployeeDetails_Id"], where: { EmployeeDetails_Id: employeeId },
        //     include: [{ model: EmployeeContactDetails, attributes: ["Address1", "Country"] }],
        //     raw: true

        // })
        //     .then((result) => {
        //         // .spread((result, created) => {
        //         return result;
        //     })
        //     .catch((error) => {
        //         return error;
        //     });
    }

    /**
     * Get Dashboard Time Card Data
     * @param {*} employeeDetailsId : logged in employee details id
     * @param {*} fromDate : start date of the date range
     * @param {*} toDate : end date of the date range
     */
    getDashboardTimeCardData(employeeDetailsId, fromDate, toDate) {
        let query = "EXEC API_SP_GetUserDashboardTimeCard @EmployeeDetails_Id=\'" + employeeDetailsId + "\' "
            + ",@FromDate=\'" + fromDate + "\' "
            + ",@ToDate=\'" + toDate + "\' ";
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                return details;
            })
    }


    /**
     * Get Broadcast message 
     * @param {*} employeeDetailsId : logged in employee details id
     */
    getBroadcastMessages(employeeDetailsId, messageTypeId) 
    {
        
        let query = "EXEC API_SP_getBroadtcastMessages @employeeDetails_Id=" + employeeDetailsId + ", @messageType_Id = " + messageTypeId;
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                let out = {
                    news: [],
                    jobs: []
                }
                if(details.length)
                {
                    details.forEach( item => {
                        if(item.messageTypeId == enums.broadCast.newsId)
                        {
                            delete item.jobId;
                            out.news.push(item)
                        }
                        else
                        {
                            out.jobs.push(item)
                        }
                    })
                    return out;
                }
                else 
                {
                    return out;
                }
                // return details;
            })
    }


    checkIsNewLogin(employeeDetailsId)
    {
        let query = "EXEC API_SP_GetIsNewLogin @employeeDetailsId =" + employeeDetailsId;
        return  dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
                .then((details) => {
                    if(details.length)
                    {
                        if(details[0].isNewLogin == enums.newLogin.atsUser || details[0].isNewLogin == enums.newLogin.proUser || details[0].isNewLogin == enums.newLogin.newJobSeeker)
                        {
                            return true
                        }
                        else
                        {
                            return false;
                        }
                    }
                    else
                    {
                        return false;
                    }
                })
    }

    

}