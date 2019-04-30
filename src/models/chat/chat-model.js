/**
 *  -------Import all classes and packages -------------
 */
import configContainer from "../../config/localhost";
import { dbContext, Sequelize } from "../../core/db";
import CrudOperationModel from '../common/crud-operation-model';
import enums from '../../core/enums';
import { messageHeader } from '../../entities/chat/message-header';
import { messageParticipant } from '../../entities/chat/message-participants';
import { messageDetails } from '../../entities/chat/message-details';
import { UserSession } from '../../entities/accounts/user-session';

import moment from 'moment';

/**
 *  -------Initialize global variabls-------------
 */
let config = configContainer.loadConfig();
let crudOperationModel = new CrudOperationModel();

export default class ChatModel {

    constructor() {
        //
    }

    /**
     * get latest message 
     * @param {*} status 
    */

    getLatestMessageByChatId(chatId, messageId)
    {
        return crudOperationModel.findAllByCondition(messageDetails, { chatId:chatId,messageId : {$gt: messageId}}, ['chatId', 'messageId', 'postedBy', 'posterType', 'isForwardedMessage', 'messageBody', 'createdDate'],['messageId', 'ASC'])
        .then( rs =>{
            rs.forEach( item => {
                item.messageBody = JSON.parse(item.messageBody);
            });
            return rs;
        })
    }

    getUserStatus(employeeDetailsId, chatId)
    {
        return new Promise(resolve => {

            return crudOperationModel.findAllByCondition(UserSession, { EmployeeDetails_Id:employeeDetailsId },['Status'])
            .then( rs =>{
                if(rs.length)
                {
                    if(rs[0].Status == 1)
                    {
                        return resolve({status : 1});
                        
                        // check last activity time 
                        /* return crudOperationModel.findModelByCondition(messageParticipant, {chatId: chatId, userId: employeeDetailsId})
                        .then ( activity => { 
                            if(activity)
                            {
                                let activeDate = moment(activity.lastActive);
                                let duration = moment.duration(moment(new Date()).diff(activeDate));
                            
                                if(duration.asMinutes() > 15)
                                {
                                    return resolve({status : 0});
                                }
                                else 
                                {
                                    return resolve({status : 1});
                                }
                            }
                            else
                            {
                                return resolve({status : 0});
                            }
                        }) */
                    }
                    else
                    {
                        return resolve({status : 0});
                    }
                }
                else
                {
                    return resolve({status : 0});
                }
           
            })
        })

    }

    checkParticipent(chatId, employeeDetailsId)
    {
        return crudOperationModel.findModelByCondition(messageParticipant, { chatId: chatId, userId: employeeDetailsId })
        .then( rs =>{
            return rs;
        })
    }


    getGroups(employeeDetailsId) 
    {
        return new Promise(resolve => {

            let query = "EXEC API_SP_GetIMGroups @EmployeeDetails_Id = "+ employeeDetailsId;
            
            let userPictureVars = enums.uploadType.userPicture;

            return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((rs) => {
                
                let query = "EXEC API_S_uspGetRecruiterDetails @EmployeeDetails_Id='" + employeeDetailsId + "'";
                return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
                .then((rs1) => {
                    
                    let data = rs.filter( item => {
                            let color = item.colorCode.split('/');
                            item.profilePic = item.profilePic ? config.documentHostUrl + config.documentBasePath + userPictureVars.path + '/' + item.profilePic : '';
                        
                            item['colorCode'] =  color[0];
                            item['profileLetter'] = color[1];

                            if(item.groupId == enums.imChat.recruiterMsg.id && rs1.length)
                            {
                                item['recipientId'] = rs1[0].recruiterId
                                item['recipientName'] = rs1[0].firstName + ' ' + rs1[0].lastName;
                            }
                            return (item.groupId == enums.imChat.recruiterMsg.id && rs1.length) || item.groupId !== enums.imChat.recruiterMsg.id;
                    })
                    return resolve(data);

                })
            })
        })

    }

    getConversationByChatId(employeeDetailsId, groupId, searchStr, chatId, pageNum, pageSize)
    {
        // let where =  ' 1=1 '; 

        let where = '';

        if(groupId != 'all')
        {
            where += ' AND mh.SupportGroupId = '+ groupId;
        }
        
        if(searchStr)
        {
            where += ' AND MessageBody Like \'\'%'+searchStr+'%\'\' ';
        }

        if(chatId)
        {
            where += ' AND mh.MessageHeader_Id = '+ chatId;
        }

        return new Promise ( resolve => {

            let query = "EXEC API_S_GetChatConversations_paging @where = ' " +where+ " ', @employeeDetailsId='" + employeeDetailsId + "', @pageNum = " +pageNum+ ", @pageSize= "+ pageSize;
            // console.log(query)

            let userPictureVars = enums.uploadType.userPicture;
            
            return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                let resp = {
                        totalCount : 0,
                        pageNum : 1,
                        list : []
                };
                resp.totalCount = details[0].totalCount;
                resp.pageNum = details[1].currentPage;
                resp.list = details.splice(2); 

                resp.list.forEach( item => {
                    let color = item.colorCode.split('/');
                    item.profilePic = item.profilePic ? config.documentHostUrl + config.documentBasePath + userPictureVars.path + '/' + item.profilePic : '';
                   
                    try {
                        item.messageBody = item.messageBody.replace(/\\n/g, "\\n")
                            .replace(/\\'/g, "\\'")
                            .replace(/\\"/g, '\\"')
                            .replace(/\\&/g, "\\&")
                            .replace(/\\r/g, "\\r")
                            .replace(/\\t/g, "\\t")
                            .replace(/\\b/g, "\\b")
                            .replace(/\\f/g, "\\f");
                        // remove non-printable and other non-valid JSON chars
                        item.messageBody = item.messageBody.replace(/[\u0000-\u0019]+/g, "");
                        item.messageBody = JSON.parse(item.messageBody);
                    } catch (e) {
                        if (e instanceof SyntaxError) {
                            item.messageBody = {};
                        } else {
                            item.messageBody = JSON.parse(item.messageBody);
                        }
                    }
                    item['colorCode'] =  color[0];
                    item['profileLetter'] = color[1];

                    if(item.groupId != enums.imChat.jobMsg.id)
                    {
                        delete item.jobRefId;
                        delete item.jobTitle;
                    }

                })
                
                return resolve(resp);

            })
        })
        

    }


    validateGroupRecipient(employeeDetailsId, groupId, chatId)
    {
        // -- unused yet
        let query = 'API_SP_ValidateGroupRecipient @employeeDetailsId = '+employeeDetailsId+', @groupId ='+groupId +', @chatId='+ chatId;

        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
        .then((rs) => {
            return rs;
        })
    }

    getUnreadConversations(employeeDetailsId)
    {
        let query = "EXEC API_SP_GetUnreadConversations @EmployeeDetails_Id='" + employeeDetailsId + "'";
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
        .then((rs) => {
            let count =0;
            rs.map( i => {
                count += i.cnt
            })
            return {count:count};

        })
    }

    getRecruiterDetails(employeeDetailsId){
        let query = "EXEC API_S_uspGetRecruiterDetails @EmployeeDetails_Id='" + employeeDetailsId + "'";
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
        .then((rs) => {
            return rs;
        })
    }


}