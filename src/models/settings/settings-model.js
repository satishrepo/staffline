/**
 *  -------Import all classes and packages -------------
 */
import configContainer from "../../config/localhost";
import { dbContext, Sequelize } from "../../core/db";
import CommonMethods from "../../core/common-methods";

import moment from 'moment';
import enums from '../../core/enums';
import path from 'path';
import async from 'async';

// call entities
import { APP_REF_DATA } from "../../entities/common/app-ref-data";
import { NotificationCenter } from "../../entities/settings/notification-center";
import { MessageCenterDocument } from "../../entities/settings/message-center-document";
import { MessageCenter } from "../../entities/settings/message-center";
import { MessageCenterActivity } from "../../entities/settings/message-center-activity";


/**
 *  -------Initialize global variabls-------------
 */

let config = configContainer.loadConfig();

export default class SettingsModel {

    constructor() {

    }

    getUserSettings(employeeDetailsId) {
        let query = "EXEC API_SP_GetUserSettings @employeeDetailsId=\'" + employeeDetailsId + "\' ";

        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                if (details.length) {

                    var customTypeAlert = [];
                    details.forEach(item => {

                        //==== this is for to set default frequency as Daily 
                        //===== if then is no frequency is set and alert status is ON
                        //========== this is only applicable for custom job alert, matching job alert (8009, 8008)
                            if(item.alertTypeId == 8009){
                                customTypeAlert.push(8009);
                                if (item.alertStatus == 1 && !item.alertFrequencyId) {
                                    item.alertFrequency =  "Daily";
                                    item.alertFrequencyId = 8081;
                                }
                            }else if(item.alertTypeId == 8008){
                                customTypeAlert.push(8008);
                                if (item.alertStatus == 1 && !item.alertFrequencyId) {
                                    item.alertFrequency =  "Daily";
                                    item.alertFrequencyId = 8081;
                                }
                            }
                        //===========================================================

                        if (item.alertStatus == 0) {
                            delete item.alertFrequencyId;
                            delete item.alertFrequency;
                        }
                        if (item.alertStatus == 1) {
                            delete item.switchOffStatus;
                            delete item.dateTo;
                        }
                        if (item.switchOffStatus == 0) {
                            delete item.dateTo;
                        }
                    });

                    if(customTypeAlert.indexOf(8008) <= -1){
                        details.push({
                            "notificationStatus": 1,
                            "alertTypeId": 8008,
                            "alertType": "Matching Job alerts",
                            "alertStatus": 1,
                            "alertFrequency": "Daily",
                            "alertFrequencyId": 8081
                        });
                    } 
                    if(customTypeAlert.indexOf(8009) <= -1){
                        details.push({
                            "notificationStatus": 1,
                            "alertTypeId": 8009,
                            "alertType": "Custom Job alerts",
                            "alertStatus": 1,
                            "alertFrequency": "Daily",
                            "alertFrequencyId": 8081
                        });
                    }

                    return details;
                }
                else {
                    details.push(
                        {
                            "notificationStatus": 1,
                            "alertTypeId": 8009,
                            "alertType": "Custom Job alerts",
                            "alertStatus": 1,
                            "alertFrequency": "Daily",
                            "alertFrequencyId": 8081
                        },
                        {
                            "notificationStatus": 1,
                            "alertTypeId": 8008,
                            "alertType": "Matching Job alerts",
                            "alertStatus": 1,
                            "alertFrequency": "Daily",
                            "alertFrequencyId": 8081
                        }
                    );

                    console.log(details)
                    return details;
                }
            });
    }

    getUserNotifications(employeeDetailsId) 
    {
        // let where = employeeDetailsId + (['0', '1', 0, 1].indexOf(readType) > -1 ? ' AND IsRead = ' + readType : '');

        let where = employeeDetailsId + ' AND Read_Date is NULL ';

        let query = "EXEC API_SP_GetUserNotifications @where='" + where + "' ";

        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                return details;
            });
    }



    /**
    * Mark message as Read
    * @param {*} employeeDetailsId : Logged In user id
    * @param {*} messageId : Message Id
    */

    markMessageAsRead(employeeDetailsId, messageId) {

        return NotificationCenter.update({
            isRead: 1,
        }, {
                where: {
                    messageId: {
                        $in: messageId
                    },
                    $and: { userId: employeeDetailsId }
                }
            });
    }



    /**
    * Get all use Message    
    * @param {*} employeeDetailsId : Logged In user id
    * @param {*} parentMsgId : null = will get only parent messages, 0 = will get only child messages
    * @param {*} msgTypes : Array of Message Type (eg. Hr, Job)
    * @param {*} unread : isRead messages 
    * @param {*} priority : isPriority messages
    * @param {*} flag : isFlag messages
    * @param {*} archive : isArchive messages
    * @param {*} searchText : Text to search message on subject and body 
    */



    getAllUserMessages_old(employeeDetailsId, typeArr, flagArr, searchText, pageNum, pageSize) 
    {

       let where = ''; 

        where += flagArr.indexOf('unread') > -1 ? ' AND IsRead = 0' : '';
        where += flagArr.indexOf('priority') > -1 ? ' AND IsPriority = 1' : '';
        where += flagArr.indexOf('flagged') > -1 ? ' AND IsFlag = 1' : '';
        where += flagArr.indexOf('archived') > -1 ? ' AND IsArchive = 1' : ' AND IsArchive = 0 ';
        
        if (searchText != '') {
            where += ' AND (Subject LIKE \'\'%' + searchText + '%\'\' OR MessageBody LIKE \'\'%' + searchText + '%\'\') ';
        }

        if (typeArr && typeArr.length) {
            where += ' AND MessageType in (' + typeArr + ') ';
        }

        // let query = "EXEC API_SP_uspGet_MessageCenter @loggedinEmpId=" +employeeDetailsId + ", @where='" + where + "' "; // without paging 

        let query = "EXEC API_SP_uspGet_MessageCenter_paging @loggedinEmpId=" +employeeDetailsId + ", @where='" + where + "', @pageNum = " +pageNum+ ", @pageSize= "+ pageSize;

        // console.log(query)

        return new Promise(resolve => {
            return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
                .then((details) => {
                    // console.log(details)
                    let resp = {
                            totalCount : 0,
                            pageNum : 1,
                            list : []
                        };
                    resp.totalCount = details[0].totalCount;
                    resp.pageNum = details[1].currentPage;
                    let msgArr = details.splice(2); 
                    if (msgArr.length) {
                        let i = 0;
                        msgArr.forEach(item => {                            
                            item.isSentByMe = ((item.createdBy == employeeDetailsId) ? 1 : 0);
                            this.getMessageAttachments(item.messageId)
                            .then(rs => { 
                                item['attachment'] = rs;
                                i++;
                                if (i == msgArr.length) {
                                    resp.list = msgArr; 
                                    return resolve(resp);
                                }
                            })
                        })
                    
                    }
                    else {
                        return resolve(resp);
                    }

                });
        })


    }

    getAllUserMessages(employeeDetailsId, typeArr, flagArr, searchText, pageNum, pageSize) 
    {

       let where = ''; 

        where += flagArr.indexOf('unread') > -1 ? ' AND IsRead = 0' : '';
        where += flagArr.indexOf('priority') > -1 ? ' AND IsPriority = 1' : '';
        where += flagArr.indexOf('flagged') > -1 ? ' AND IsFlag = 1' : '';
        where += flagArr.indexOf('archived') > -1 ? ' AND IsArchive = 1' : ' AND IsArchive = 0 ';
        
        if (searchText != '') {
            where += ' AND (Subject LIKE \'\'%' + searchText + '%\'\' OR MessageBody LIKE \'\'%' + searchText + '%\'\') ';
        }

        if (typeArr && typeArr.length) {
            where += ' AND MessageType in (' + typeArr + ') ';
        }

        // let query = "EXEC API_SP_uspGet_MessageCenter @loggedinEmpId=" +employeeDetailsId + ", @where='" + where + "' "; // without paging 

        let query = "EXEC API_SP_uspGet_MessageCenter_paging_new @loggedinEmpId=" +employeeDetailsId + ", @where='" + where + "', @pageNum = " +pageNum+ ", @pageSize= "+ pageSize;

        // console.log(query)

        let basePath = config.resumeHostUrl + config.documentBasePath;
        let msgCenterVars = enums.uploadType.messageCenter;

        return new Promise(resolve => {
            return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
                .then((details) => {
                  
                    let resp = {
                        totalCount : 0,
                        pageNum : 1,
                        list : []
                    };
                    
                    resp.totalCount = details[0].totalCount;
                    resp.pageNum = details[1].currentPage;
                    let allMssg = details.splice(2); 
                    
                    if (allMssg.length) 
                    {
                        let i = 0;
                        let msgArr = {};
                        let out = [];
                
                        for(let j in allMssg)
                        { 
                            let item = allMssg[j];
                            let k = item.messageId;                           
                            item.path = item.File_Name ? (basePath + msgCenterVars.path + '/' + item.File_Name) : '';
                            item.fileType = item.File_Name ? (path.extname(item.File_Name || '').substr(1)) : '';

                            if(msgArr[k])
                            {
                                // msgArr[k].messageId = item.messageId;
                               if(item.fileName && item.path)
                               {
                                   msgArr[k]['attachment']['list'].push({fileName:item.fileName,path:item.path,fileType:item.fileType});
                                   msgArr[k]['attachment']['count'] +=1;
                               }
                            }
                            else
                            {
                                msgArr[k] = {};
                               
                                msgArr[k].messageId = item.messageId;
                                msgArr[k].parentMessageId = item.parentMessageId;
                                msgArr[k].senderName = item.senderName;
                                msgArr[k].messageBody = item.messageBody;
                                msgArr[k].subject = item.subject;
                                msgArr[k].messageType = item.messageType;
                                msgArr[k].typeRefId = item.typeRefId;
                                msgArr[k].employeeDetailsId = item.employeeDetailsId;
                                msgArr[k].createdBy = item.createdBy;
                                msgArr[k].createdDate = item.createdDate;
                                msgArr[k].isRead = item.isRead;
                                msgArr[k].isFlag = item.isFlag;
                                msgArr[k].isPriority = item.isPriority;
                                msgArr[k].isArchive = item.isArchive;
                                msgArr[k].isRecipient = item.isRecipient;
                                msgArr[k].typeRef = item.typeRef;
                                msgArr[k].replyCount = item.replyCount;
                                msgArr[k].isSentByMe = ((item.createdBy == employeeDetailsId) ? 1 : 0);
                                
                                msgArr[k]['attachment'] = {count:0,list:[]};
                                if(item.fileName && item.path)
                                {
                                    msgArr[k]['attachment']['list'].push({fileName:item.fileName,path:item.path,fileType:item.fileType});
                                    msgArr[k]['attachment']['count'] +=1;
                                }
                            }
                            
                        }

                        for(let j in msgArr)
                        {
                            out.push(msgArr[j]);
                        }
                        
                        out.sort(function(a, b) {
                            return b.messageId - a.messageId
                        })
                        
                        resp.list = out; 
                        return resolve(resp);
                    
                    }
                    else {
                        return resolve(resp);
                    }

                });
        })


    }

    /**
    * Get all use Message    
    * @param {*} employeeDetailsId : Logged In user id
    * @param {*} typeArr : array of message type (e.g. 6001, 6002)
    * @param {*} flagArr : Array of Message Type (eg. flagged, archived)    
    * @param {*} searchText : Text to search message on subject and body 
    */

    getUserNotification_old(employeeDetailsId, typeArr, flagArr, searchText) {

        let where = employeeDetailsId;

        where += flagArr.indexOf('unread') > -1 ? ' AND IsRead = 1' : '';
        where += flagArr.indexOf('priority') > -1 ? ' AND IsPriority = 1' : '';
        where += flagArr.indexOf('flagged') > -1 ? ' AND IsFlag = 1' : '';
        where += flagArr.indexOf('archived') > -1 ? ' AND IsArchive = 1' : ' AND IsArchive = 0';

        if (searchText != '') {
            where += ' AND (Subject LIKE \'\'%' + searchText + '%\'\' OR MessageBody LIKE \'\'%' + searchText + '%\'\') ';
        }

         if (typeArr && typeArr.length) {
            where += ' AND MessageType in (' + typeArr + ') ';
        }

        let query = "EXEC API_SP_GetUserNotifications @where='" + where + "' ";
        
        console.log(query);

        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                return details;
            });
    }

    getUserNotification(employeeDetailsId, typeArr, flagArr, searchText, pageNum, pageSize) 
    {

        let where = employeeDetailsId;

        where += flagArr.indexOf('unread') > -1 ? ' AND Read_Date IS NULL ' : '';

        if (searchText != '') 
        {
            where += ' AND (Notification_Subject LIKE \'\'%' + searchText + '%\'\' OR Notification_Details LIKE \'\'%' + searchText + '%\'\') ';
        }

        // let query = "EXEC API_SP_GetUserNotifications @employeeDetailsId = "+ employeeDetailsId +", @where='" + where + "' ";
        let query = "EXEC API_SP_GetUserNotifications_paging @employeeDetailsId = "+ employeeDetailsId +", @where='" + where + "', @pageNum = " +pageNum+ ", @pageSize= "+ pageSize;
        
        // console.log(query);

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
               
                return resp;
            });
    }

    /**
    * Get all use Message    
    * @param {*} messageId : Primary id of message    
    */
    getMessageAttachments(messageId) {
        let basePath = config.resumeHostUrl + config.documentBasePath;
        let msgCenterVars = enums.uploadType.messageCenter;
        return MessageCenterDocument.findAll(
            {
                where: {
                    messageId: messageId
                },
                attributes: [['File_Name_Alias', 'fileName'], 'File_Name'], 
                raw: true

            })
            .then((data) => {
                // if(data.length)
                {
                    data.forEach(item => {
                        item.path = basePath + msgCenterVars.path + '/' + item.File_Name;
                        item.fileType = path.extname(item.File_Name).substr(1);
                        delete item.File_Name;
                    });
                    let output = {};
                    output.count = data.length;
                    output.list = data;
                    return output;
                }
                // return data;
            });
    }

    /**  
    * Get all use Message    
    * @param {*} employeeDetailsId : Logged In user id
    */

    getMessageCount(employeeDetailsId) {
        return new Promise(resolve => {
            async.parallel([
                function (done) {
                    MessageCenterActivity.findAll({
                        where: {
                            employeeDetailsId: employeeDetailsId,
                            isRead: 0,
                            isArchive: 0,
                            // parentMessageId: {
                            //     $eq: null
                            // }
                        },
                        attributes: [[Sequelize.fn('COUNT', Sequelize.col('Message_Id')), 'unread']],
                        raw: true
                    }).then(rs => {
                        done(null, rs[0])
                    })
                },
                function (done) {
                    MessageCenterActivity.findAll({
                        where: {
                            employeeDetailsId: employeeDetailsId,
                            // isRead: 0,
                            isArchive: 0,
                            // parentMessageId: {
                            //     $eq: null
                            // },
                            isPriority: 1
                        },
                        attributes: [[Sequelize.fn('COUNT', Sequelize.col('Message_Id')), 'priority']],
                        raw: true
                    }).then(rs => {
                        done(null, rs[0])
                    })
                },

                function (done) {
                    MessageCenterActivity.findAll({
                        where: {
                            employeeDetailsId: employeeDetailsId,
                            // isRead: 0,
                            isArchive: 0,
                            // parentMessageId: {
                            //     $eq: null
                            // },
                            isFlag: 1
                        },
                        attributes: [[Sequelize.fn('COUNT', Sequelize.col('Message_Id')), 'flagged']],
                        raw: true
                    }).then(rs => {
                        done(null, { flagged: rs[0].flagged })
                    })
                },
                function (done) {
                    MessageCenterActivity.findAll({
                        where: {
                            employeeDetailsId: employeeDetailsId,
                            // isRead: 0,
                            isArchive: 1,
                            // parentMessageId: {
                            //     $eq: null
                            // }
                        },
                        attributes: [[Sequelize.fn('COUNT', Sequelize.col('Message_Id')), 'archived']],
                        raw: true
                    }).then(rs => {
                        done(null, { archived: rs[0].archived })
                    })
                },
                function (done) {
                    APP_REF_DATA.findAll({
                        where: {
                            parentId: enums.appRefParentId.messageTypeParentId,
                            keyId: { $ne: enums.appRefParentId.messageTypeParentId }
                        }, attributes: ['keyId', 'keyName'], order: [['keyId', 'ASC']], raw: true
                    }).then(rs2 => {
                        async.map(rs2, function (id, cb) {
                            let ob = {};
                            MessageCenter.findAll({
                                where: {
                                    recipientId: employeeDetailsId,
                                    // isRead: 0,
                                    // IsArchive: 0,
                                    // parentMessageId: {
                                    //     $eq: null
                                    // },
                                    messageType: id.keyId
                                },
                                attributes: [[Sequelize.fn('COUNT', Sequelize.col('MessageType')), 'type']],
                                raw: true
                            }).then(rs => {
                                let a = rs2.filter(k => { return k.keyId == id.keyId })
                                ob['id'] = id.keyId;
                                ob['name'] = a[0].keyName;
                                ob['count'] = rs[0].type;
                                cb(null, ob)
                            })
                        },
                            function (err, result) {
                                // console.log(result)
                                if (!err) {
                                    done(null, result);
                                }

                            })
                    })

                }

            ],

                function (err, result) {
                    // console.log(result)
                    if (err) {
                        return resolve('');
                    }
                    return resolve(result);
                })
        })

    }

    /**
    * Get Notification by user id
    * @param {*} employeeDetailsId : Logged In user id
    */

    getNotificationCount(employeeDetailsId) {
        return new Promise(resolve => {
            async.parallel([
                function (done) {
                    NotificationCenter.findAll({
                        where: {
                            userId: employeeDetailsId,
                            isRead: 0,
                            IsArchive: 0
                        },
                        attributes: [[Sequelize.fn('COUNT', Sequelize.col('Message_Id')), 'unread']],
                        raw: true
                    }).then(rs => {
                        done(null, rs[0])
                    })
                },
                function (done) {
                    NotificationCenter.findAll({
                        where: {
                            userId: employeeDetailsId,
                            isRead: 0,
                            IsArchive: 0,
                            isPriority: 1
                        },
                        attributes: [[Sequelize.fn('COUNT', Sequelize.col('Message_Id')), 'priority']],
                        raw: true
                    }).then(rs => {
                        done(null, rs[0])
                    })
                },
                function (done) {
                    NotificationCenter.findAll({
                        where: {
                            userId: employeeDetailsId,
                            isRead: 0,
                            IsArchive: 0,
                            isFlag: 1
                        },
                        attributes: [[Sequelize.fn('COUNT', Sequelize.col('Message_Id')), 'flagged']],
                        raw: true
                    }).then(rs => {
                        done(null, { flagged: rs[0].flagged })
                    })
                },
                function (done) {
                    NotificationCenter.findAll({
                        where: {
                            userId: employeeDetailsId,
                            isRead: 0,
                            IsArchive: 1
                        },
                        attributes: [[Sequelize.fn('COUNT', Sequelize.col('Message_Id')), 'archived']],
                        raw: true
                    }).then(rs => {
                        done(null, { archived: rs[0].archived })
                    })
                },
                function (done) {
                    APP_REF_DATA.findAll({
                        where: {
                            parentId: enums.appRefParentId.notificationParentId,
                            keyId: { $ne: enums.appRefParentId.notificationParentId }
                        }, attributes: ['keyId', 'keyName'], order: [['keyId', 'ASC']], raw: true
                    }).then(rs2 => {

                        async.map(rs2, function (id, cb) {
                            let ob = {};
                            NotificationCenter.findAll({
                                where: {
                                    userId: employeeDetailsId,
                                    isRead: 0,
                                    IsArchive: 0,
                                    messageType: id.keyId
                                },
                                attributes: [[Sequelize.fn('COUNT', Sequelize.col('MessageType')), 'type']],
                                raw: true
                            }).then(rs => {
                                let a = rs2.filter(k => { return k.keyId == id.keyId })
                                ob['id'] = id.keyId;
                                ob['name'] = a[0].keyName;
                                ob['count'] = rs[0].type;
                                cb(null, ob)
                            })
                        },
                            function (err, result) {
                                // console.log(result)
                                if (!err) {
                                    done(null, result);
                                }

                            })
                    })

                }

            ],

                function (err, result) {
                    // console.log(result)
                    if (err) {
                        return resolve('');
                    }
                    return resolve(result);
                })
        })

    }


    /**
    * Get Message details by Id
    * @param {*} employeeDetailsId : Logged In user id
    * @param {*} messageId : Primary id of message    
    */
    getMessageDetails(employeeDetailsId, messageId) {
        
        // let query = "EXEC API_SP_uspMessage_GetMessageCenterReplyList @loggedinEmpId=" + employeeDetailsId + ", @Message_Id= " + messageId + ", @ParentMessage_Id = " +parentMessageId;

        let query = "EXEC API_SP_uspGet_MessageCenterDetails @messageId= " + messageId + ", @loggedinEmpId=" + employeeDetailsId ;
        
        // console.log(query);

        return new Promise( resolve => {
            return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => { 
                // return resolve(details);
                if(details.length)
                {
                    let i = 0;
                    details.forEach(item => {                        
                        item.isSentByMe = (item.createdBy == employeeDetailsId ? 1 : 0);                        
                        this.getMessageAttachments(item.messageId)
                            .then(rs => { 
                                item['attachment'] = rs;
                                i++;
                                if (i == details.length) {
                                    return resolve(details);
                                }
                        })
                    })
                }
                else {
                    return resolve(details);
                }
            })
         
        })
        
    }

    /**
    * Get Message Reply by Id
    * @param {*} employeeDetailsId : Logged In user id
    * @param {*} messageId : Primary id of message    
    */
    getMessageReply(messageId) {


        return MessageCenter.findAll({
                where: {
                    parentMessageId: messageId
                },
                attributes:[ ['Message_Id', 'messageId']], 
                raw: true
            }).then(rs => {
                return rs;
            })

    }


    getRecruiter(employeeDetailsId)
    {
        let query = "SELECT [dbo].API_FN_GetRecruiterIdByEmployeeDetailsId("+employeeDetailsId+")  AS RecruiterId ";
        
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
        .then((details) => { 
            return details;
        })
    }


    markMessage(messageId, employeeDetailsId, flagObj)
    {
        let query = "EXEC API_SP_uspGet_MessageCenterThread @messageId= " + messageId ;
        console.log(query);
        return new Promise( (resolve, reject) => {

            return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((msg) => { 
                if(msg.length)
                {
                    let messages = msg.map(i=>{return i.message_id});
                    
                    MessageCenterActivity.update(flagObj, 
                        {
                            where: { messageId: messages, employeeDetailsId: employeeDetailsId }
                        })
                    .then(rs => {
                        resolve({success:true})
                    }).catch(error => {
                        reject({success:false,message:error})
                    })
                }
                else
                {
                    resolve({success:false,message:'InvalidId'})
                }
            })
        })
    }
   


}