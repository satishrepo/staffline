/**
 *  -------Import all classes and packages -------------
 */
import configContainer from "../../config/localhost";
import { dbContext, Sequelize } from "../../core/db";
import { VacationRequests } from "../../entities/vacations/vacations";
import CommonMethods from "../../core/common-methods";
import moment from 'moment';

/**
 *  -------Initialize global variabls-------------
 */

let config = configContainer.loadConfig();

export default class VacationsModel {

    constructor() {
        //
    }
    /**
     * Get all vacations list
     * @param {*} pjEmployeeId 
     */
    getAllVacationsRequests(pjEmployeeId) {
        let commonMethods = new CommonMethods();
        return VacationRequests.findAll({
            where: {

                CREATED_BY: pjEmployeeId,
                $and: [
                    {
                        CREATED_BY: {
                            $ne: ''
                        }
                    },
                    {
                        CREATED_BY: {
                            $ne: null
                        }
                    }
                ]
            },
            attributes: [
                ["CREATED_DATE", "requestedDate"],
                ["FromDate", "fromDate"],
                ["ToDate", "toDate"],
                ["Reason", "reason"],
                ["APPROVE_REJECT_COMMENTS", "approveRejectComments"],
                ["ContactInfo", "contactInfo"],
                ["Status", "status"],
                ["JoinSameClient", "joinSameClient"]
            ],
            order: [
                ['CREATED_DATE', 'DESC']
            ]
        }).then((results) => {
            let data = [];
            results.forEach((item) => {
                let fromDate = JSON.parse(JSON.stringify(item.dataValues.fromDate));
                data.push({
                    requestedDate: moment(new Date(item.dataValues.requestedDate)).format('YYYY-MM-DD'),
                    fromDate: moment(new Date(fromDate)).format('YYYY-MM-DD'),
                    approveRejectComments: item.dataValues.approveRejectComments,
                    toDate: moment(new Date(item.dataValues.toDate)).format('YYYY-MM-DD'),
                    numberOfDays: commonMethods.calcBusinessDays(item.dataValues.fromDate, item.dataValues.toDate),
                    reason: item.dataValues.reason,
                    contactInfo: item.dataValues.contactInfo,
                    status: commonMethods.getStatus(item.dataValues.status),
                    joinSameClient: item.dataValues.joinSameClient
                })
            })
            return data;
        })
    }
    /**
     * post vacation request
     * @param {*} pjEmployeeId 
     * @param {*} reqData 
     */
    postAddVacations(pjEmployeeId, reqData) {
        return VacationRequests.create({
            FromDate: reqData.fromDate,
            ToDate: reqData.toDate,
            Reason: reqData.reason,
            ContactInfo: reqData.contactInfo,
            JoinSameClient: reqData.joinSameClient,
            status: -1,
            CREATED_BY: pjEmployeeId,
            CREATED_DATE: new Date(),
            MODIFIED_BY: pjEmployeeId,
            MODIFIED_DATE: new Date()
        })
            .then((result) => {
                return result;
            })
            .catch((error) => {
                return error;
            })
    }
}