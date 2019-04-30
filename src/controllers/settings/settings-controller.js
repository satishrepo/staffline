/**
 *  -------Import all classes and packages -------------
 */

import SettingsModel from '../../models/settings/settings-model';
import CrudOperationModel from '../../models/common/crud-operation-model';
import responseFormat from '../../core/response-format';
import configContainer from '../../config/localhost';
import logger from '../../core/logger';
import CommonMethods from '../../core/common-methods';
import enums from '../../core/enums';
import SettingsValidation from '../../validations/settings/settings-validation';
import moment from 'moment';
import path from 'path';
import async from 'async';
import EmailModel from '../../models/emails/emails-model';
import JobsModel from '../../models/jobs/jobs-model';


// call entities
import { APP_REF_DATA } from "../../entities/common/app-ref-data";
import { NotificationCenter } from "../../entities/settings/notification-center";
import { MessageCenter } from "../../entities/settings/message-center";
import { MessageCenterDocument } from "../../entities/settings/message-center-document";
import { AlertNotificationSetting } from "../../entities/settings/alert-notification-setting";
import { EmployeeDetails } from "../../entities/profileManagement/employee-details";
import { MessageCenterActivity } from "../../entities/settings/message-center-activity";
import { JobResume } from '../../entities/jobs/job-resume';
import { ResumeMaster } from '../../entities';

/**
 *  -------Initialize variabls-------------
 */
let config = configContainer.loadConfig(),
    commonMethods = new CommonMethods(),
    crudOperationModel = new CrudOperationModel(),
    settingsModel = new SettingsModel(),
    settingsValidation = new SettingsValidation(),
    jobsModel = new JobsModel();

const emailModel = new EmailModel();

export default class SettingsController {
    constructor() { }

    /**
    * Get settings Lookup
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
    */

    lookupData(req, res, next) {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let response = responseFormat.createResponseTemplate();
        let messageTypes = [];
        let flagArr = [
                        {id:'archived',name:'Archived'},
                        {id:'flagged',name:'Flagged'},
                        {id:'priority',name:'Priority'},
                        {id:'unread',name:'Unread'}
                    ];

        crudOperationModel.findAllByCondition(APP_REF_DATA,
            {
                parentId: enums.appRefParentId.notificationParentId,
                keyId: { $ne: enums.appRefParentId.notificationParentId }
            }, [['keyId', 'id'], ['keyName', 'name'], ['Description', 'description']], ['keyName', 'ASC']
        ).then(rs => {
          
            crudOperationModel.findAllByCondition(APP_REF_DATA,
                {
                    parentId: enums.appRefParentId.alertFrequencyParentId,
                    keyId: { $ne: enums.appRefParentId.alertFrequencyParentId }
                }, [['keyId', 'id'], ['keyName', 'name']]
            ).then(rs1 => {

                crudOperationModel.findAllByCondition(APP_REF_DATA,
                    {
                        parentId: enums.appRefParentId.messageTypeParentId,
                        keyId: { $ne: enums.appRefParentId.messageTypeParentId }
                    }, [['keyId', 'id'], ['keyName', 'name']]
                ).then(rs2 => {
                    response = responseFormat.getResponseMessageByCodes('', {
                        content: {
                            dataList: [{
                                alertTypes: rs,
                                alertFrequency: rs1,
                                messageTypes: (flagArr.concat(rs2))
                            }]
                        }
                    });
                    res.status(200).json(response);
                })
            })


        }).catch(err => {

            let resp = commonMethods.catchError('settingsController/lookupData', err);
            response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
            res.status(resp.code).json(response);
        })

    }

    /**
    * Save/Update alert 
    * @param {*} req : HTTP request argument
    * @param {*} res : HTTP response argument
    * @param {*} next : Callback argument
    */

    saveAlert_Backup(req, res, next) {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;

        let settingObj = {
            alertNotificationSettingId: req.body.alertNotificationSettingId,
            notificationStatus: req.body.notificationStatus,
            alertTypeId: req.body.alertTypeId,
            alertStatus: req.body.alertStatus,
            switchOffStatus: req.body.switchOffStatus,
            alertFrequencyId: req.body.alertFrequencyId,
            dateTo: req.body.dateTo || null
        };

        let response = responseFormat.createResponseTemplate();
        let msgCode = settingsValidation.alert(settingObj);

        if (msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else 
        {
            if (settingObj.notificationStatus == 0) {
                crudOperationModel.saveModel(EmployeeDetails, { receiveNotification: 0 }, { employeeDetailsId: employeeDetailsId })
                    .then(emp => {
                        response = responseFormat.getResponseMessageByCodes(['success:saved']);
                        res.status(200).json(response);
                    })
            }
            else 
            {

                crudOperationModel.saveModel(EmployeeDetails, { receiveNotification: 1 }, { employeeDetailsId: employeeDetailsId })
                .then(emp => {
                    settingObj.employeeDetailsId = employeeDetailsId;

                    let condition = { employeeDetailsId: employeeDetailsId, alertTypeId: settingObj.alertTypeId };

                    crudOperationModel.findAllByCondition(AlertNotificationSetting, condition)
                    .then(data => {
                        if (data) 
                        {
                            settingObj.modifiedDate = new Date();
                            settingObj.modifiedBy = employeeDetailsId;
                            crudOperationModel.saveModel(AlertNotificationSetting, settingObj, condition)
                            .then(setting => {
                                response = responseFormat.getResponseMessageByCodes(['success:saved']);
                                res.status(200).json(response);
                            })
                        }
                        else {
                            settingObj.createdDate = new Date();
                            settingObj.createdBy = employeeDetailsId;

                            crudOperationModel.saveModel(AlertNotificationSetting, settingObj, condition)
                            .then(setting => {
                                response = responseFormat.getResponseMessageByCodes(['success:saved']);
                                res.status(200).json(response);
                            })
                        }
                    })
                })

            }

        }

    }

    saveAlert(req, res, next) 
    {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        
        let inputObj = { 
            alertTypeId: req.body.alertTypeId,
            alertStatus: req.body.alertStatus,            
            dateTo: req.body.dateTo || null,
            alertFrequencyId : req.body.alertFrequencyId || null
        };

        let response = responseFormat.createResponseTemplate();
        
        let msgCode = settingsValidation.alert(inputObj);

        if (msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else 
        {        
            crudOperationModel.saveModel(EmployeeDetails, { receiveNotification: 1 }, { employeeDetailsId: employeeDetailsId })
            .then(emp => {
                inputObj.employeeDetailsId = employeeDetailsId;

                let condition = { employeeDetailsId: employeeDetailsId, alertTypeId: inputObj.alertTypeId };

                inputObj.dateTo = inputObj.alertStatus == 0 ? inputObj.dateTo : null;

                crudOperationModel.findAllByCondition(AlertNotificationSetting, condition)
                .then(data => {
                    if (data) 
                    {
                        inputObj.modifiedDate = new Date();
                        inputObj.modifiedBy = employeeDetailsId;
                        crudOperationModel.saveModel(AlertNotificationSetting, inputObj, condition)
                        .then(setting => {
                            response = responseFormat.getResponseMessageByCodes(['success:saved']);
                            res.status(200).json(response);
                        })
                    }
                    else {
                        inputObj.createdDate = new Date();
                        inputObj.createdBy = employeeDetailsId;

                        crudOperationModel.saveModel(AlertNotificationSetting, inputObj, condition)
                        .then(setting => {
                            response = responseFormat.getResponseMessageByCodes(['success:saved']);
                            res.status(200).json(response);
                        })
                    }
                })
            })
        }

    }


    /**
    * Get user alerts 
    * @param {*} req : HTTP request argument
    * @param {*} res : HTTP response argument
    * @param {*} next : Callback argument
    */

    getAlert(req, res, next) {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let response = responseFormat.createResponseTemplate();

        settingsModel.getUserSettings(employeeDetailsId)
            .then(rs => {
                if (!rs.length) {
                    rs.push({ notificationStatus: 0 });
                }
                response = responseFormat.getResponseMessageByCodes('', { content: { dataList: rs } });
                res.status(200).json(response);
            }).catch(err => {
                let resp = commonMethods.catchError('settingsController/getAlert', err);
                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                res.status(resp.code).json(response);
            })

    }

    /**
    * Get Notifications for user
    * @param {*} req : HTTP request argument
    * @param {*} res : HTTP response argument
    * @param {*} next : Callback argument
    */

    getNotifications(req, res, next) 
    {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        // let readType = typeof req.body.readType != 'undefined' ? req.body.readType : '';
        let response = responseFormat.createResponseTemplate();
        let msgCode = [];
        
        // if (enums.notifications.readTypes.indexOf(readType) < 0) {
        //     msgCode.push('readType');
        // }

        if (msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else {
            // readType = typeof readType === undefined ? '' : readType;

            settingsModel.getUserNotifications(employeeDetailsId)
                .then(rs => {
                    response = responseFormat.getResponseMessageByCodes('', { content: { dataList: rs } });
                    res.status(200).json(response);
                }).catch(err => {
                    let resp = commonMethods.catchError('settingsController/getNotifications', err);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                })
        }
    }


    /**
    * Mark notification as read
    * @param {*} req : HTTP request argument
    * @param {*} res : HTTP response argument
    * @param {*} next : Callback argument
    */

    markAsRead(req, res, next) {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let messageId = req.body.messageId;
        let response = responseFormat.createResponseTemplate();
        let msgCode = [];
        if (!Array.isArray(messageId) || !messageId.length) {
            msgCode.push('messageId');
        }

        if (msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else {
            settingsModel.markMessageAsRead(employeeDetailsId, messageId)
                .then(rs => {
                    response = responseFormat.getResponseMessageByCodes(['success:saved']);
                    res.status(200).json(response);
                }).catch(err => {
                    let resp = commonMethods.catchError('settingsController/marAsRead', err);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);

                })
        }
    }


    message(req, res, next) {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let type = req.body.type;

        let response = responseFormat.createResponseTemplate();
        let searchText = (req.body.searchText ? req.body.searchText.trim() : '');

        let flagArr = [];
        let typeArr = [];

        if (req.body.messageType && Array.isArray(req.body.messageType) && req.body.messageType.length) {
            for (let k = 0; k < req.body.messageType.length; k++) {
                if (isNaN(req.body.messageType[k])) {
                    flagArr.push(req.body.messageType[k])
                }
                else {
                    typeArr.push(req.body.messageType[k])
                }
            }
        }

        let pageNum = req.body.pageNum ? req.body.pageNum : enums.paging.pageCount;
        let pageSize = req.body.pageSize ? req.body.pageSize : enums.paging.pageSize;

        let msgCode = [];

        if (enums.message.types.indexOf(type) < 0) {
            msgCode.push('type');
        }

        if (msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else {
            if (type == 'message') {          
                this.messageCenter(employeeDetailsId, flagArr, typeArr, searchText, pageNum, pageSize, function (response) {
                    res.status(response.statusCode).json(response.responseFormat);
                })
            }
            else if (type == 'notification') {         
                this.getNotification(employeeDetailsId, flagArr, typeArr, searchText, pageNum, pageSize, function (response) {
                    res.status(response.statusCode).json(response.responseFormat);
                })
            }
        }
    }

    /**
    * Message Center
    * @param {*} req : HTTP request argument
    * @param {*} res : HTTP response argument
    * @param {*} next : Callback argument
    */

    messageCenter(employeeDetailsId, flagArr, typeArr, searchText, pageNum, pageSize, next) {
        let resp = {
            statusCode: 400,
            responseFormat: responseFormat.createResponseTemplate()
        };

        let msgCode = [];

        // if(enums.notifications.readTypes.indexOf(messageObj.unread) < 0)
        // {
        //     msgCode.push('unread');
        // }
        // if(enums.notifications.readTypes.indexOf(messageObj.priority) < 0)
        // {
        //     msgCode.push('priority');
        // }

        if (msgCode.length) {
            resp.statusCode = 200;
            resp.responseFormat = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            next(resp);
        }
        else {

            settingsModel.getAllUserMessages(employeeDetailsId, typeArr, flagArr, searchText, pageNum, pageSize)
                .then(rs => {
                    if (rs) {
                        
                        resp.statusCode = 200;
                        resp.responseFormat = responseFormat.getResponseMessageByCodes('', {
                            content: {
                                dataList: [
                                    {
                                        message: rs,
                                        counts: []
                                    }]
                            }
                        });
                        next(resp);
                        /*
                        settingsModel.getMessageCount(employeeDetailsId)
                        .then(count => {
                            
                            let counts = [
                                {
                                    id: "unread",
                                    name: "Unread",
                                    count: count[0].unread
                                },
                                {
                                    id: "priority",
                                    name: "Priority",
                                    count: count[1].priority
                                },
                                {
                                    id: "flagged",
                                    name: "Flagged",
                                    count: count[2].flagged
                                },
                                {
                                    id: "archived",
                                    name: "Archived",
                                    count: count[3].archived
                                },
                            ];


                            Array.prototype.push.apply(counts, count[4])

                            resp.statusCode = 200;
                            resp.responseFormat = responseFormat.getResponseMessageByCodes('', {
                                content: {
                                    dataList: [
                                        {
                                            message: rs,
                                            counts: counts
                                        }]
                                }
                            });
                            next(resp);
                        })
                        */

                    }
                    else {
                        resp.statusCode = 200;
                        resp.responseFormat = responseFormat.getResponseMessageByCodes('', { content: { dataList: [] } });
                        next(resp);
                    }

                }).catch(err => {

                    let respo = commonMethods.catchError('settingsController/messageCenter', err);
                    resp.responseFormat = responseFormat.getResponseMessageByCodes(respo.message, { code: respo.code });
                    next(resp);
                })
        }
    }


    /**
    * Mark Message 
    * @param {*} req : HTTP request argument
    * @param {*} res : HTTP response argument
    * @param {*} next : Callback argument
    */

    getNotification(employeeDetailsId, flagArr, typeArr, searchText, pageNum, pageSize, next) {
        let resp = {
            statusCode: 400,
            responseFormat: responseFormat.createResponseTemplate()
        };

        let msgCode = [];

        // if(enums.notifications.readTypes.indexOf(messageObj.unread) < 0)
        // {
        //     msgCode.push('unread');
        // }
        // if(enums.notifications.readTypes.indexOf(messageObj.priority) < 0)
        // {
        //     msgCode.push('priority');
        // }

        if (msgCode.length) {
            resp.statusCode = 200;
            resp.responseFormat = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            next(resp);
        }
        else {
            
            settingsModel.getUserNotification(employeeDetailsId, typeArr, flagArr, searchText, pageNum, pageSize)
                .then(rs => {
                    if (rs) {
                        /*
                        // remove count/filters from notification as discussed with ajay sir
                        settingsModel.getNotificationCount(employeeDetailsId)
                            .then(count => {
                 
                                let counts = [
                                    {
                                        id: "unread",
                                        name: "Unread",
                                        count: count[0].unread
                                    },
                                    {
                                        id: "priority",
                                        name: "Priority",
                                        count: count[1].priority
                                    },
                                    {
                                        id: "flagged",
                                        name: "Flagged",
                                        count: count[2].flagged
                                    },
                                    {
                                        id: "archived",
                                        name: "Archived",
                                        count: count[3].archived
                                    },
                                ];


                                Array.prototype.push.apply(counts, count[4])

                                resp.statusCode = 200;
                                resp.responseFormat = responseFormat.getResponseMessageByCodes('', {
                                    content: {
                                        dataList: [
                                            {
                                                message: rs,
                                                counts: counts
                                            }]
                                    }
                                });
                                next(resp);
                            })
                            */
                            resp.statusCode = 200;
                            resp.responseFormat = responseFormat.getResponseMessageByCodes('', {
                                content: {
                                    dataList: [{message: rs}]
                                }
                            });
                            next(resp);

                    }
                    else {
                        resp.statusCode = 200;
                        resp.responseFormat = responseFormat.getResponseMessageByCodes('', { content: { dataList: [] } });
                        next(resp);
                    }

                }).catch(error => {
                    let response = commonMethods.catchError('settingsController/getNotification.', error);
                    resp.responseFormat = responseFormat.getResponseMessageByCodes(response.message, { code: response.code });
                    resp.statusCode = response.code;
                    next(resp);

                })
        }
    }

    /**
    * Mark Message 
    * @param {*} req : HTTP request argument
    * @param {*} res : HTTP response argument
    * @param {*} next : Callback argument
    */

    markMessage(req, res, next) {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let messageType = req.body.messageType;
        let type = req.body.type;
        let flag = typeof req.body.flag != 'undefined' ? req.body.flag : '';
        let messageId = req.body.messageId;

        let response = responseFormat.createResponseTemplate();
        let msgCode = [];

        if (enums.message.types.indexOf(messageType) < 0) {
            msgCode.push('messageType');
        }
        if (enums.message.actions.indexOf(type) < 0) {
            msgCode.push('type');
        }
        if (enums.message.boolean.indexOf(flag) < 0) {
            msgCode.push('flag');
        }
        if (!messageId || messageId < 1) {
            msgCode.push('messageId');
        }

        if (msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else {
            let dataObj = {};

            if (type == 'flag') {
                dataObj = { isFlag: flag }
            }
            else if (type == 'archive') {
                dataObj = { isArchive: flag }
            }


            // check recepient of message (only recepient can mark message)
            /*crudOperationModel.findAllByCondition(MessageCenter, { messageId: messageId }, ['employeeDetailsId'])
                .then(msg => {

                    if (msg[0].employeeDetailsId == employeeDetailsId) {*/

                        if (messageType == 'message') {
                         
                                settingsModel.markMessage(messageId, employeeDetailsId, dataObj)
                                .then(msg => { 
                                    if(msg.success)
                                    {                                    
                                        response = responseFormat.getResponseMessageByCodes(['saved'], { code: 200 });
                                        res.status(200).json(response);                                       
                                    }
                                    else
                                    {
                                        response = responseFormat.getResponseMessageByCodes(['messageId:messageId'], { code: 417 });
                                        res.status(200).json(response);
                                    }
                                                                      
                                }).catch(error => {
                                    let resp = commonMethods.catchError('settingsController/markMessage', error);
                                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                    res.status(resp.code).json(response);
                                })

                        }
                        else if (messageType == 'notification') {
                            crudOperationModel.saveModel(NotificationCenter, dataObj, { messageId: messageId })
                                .then(rs => {
                                    response = responseFormat.getResponseMessageByCodes(['saved'], { code: 200 });
                                    res.status(200).json(response);
                                })
                        }
                        else
                        {
                            response = responseFormat.getResponseMessageByCodes(['invalidMessageType'], { code: 200 });
                            res.status(200).json(response);
                        }

                   /* }
                    else {
                        response = responseFormat.getResponseMessageByCodes(['failed:invalidUpdate'], { code: 417 });
                        res.status(200).json(response);
                    }
                })*/


        }
    }

    /**
    * Mark Message 
    * @param {*} req : HTTP request argument
    * @param {*} res : HTTP response argument
    * @param {*} next : Callback argument
    */

    getMessageDetails(req, res, next) {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let messageId = ~~req.params.messageid;

        let response = responseFormat.createResponseTemplate();
        let msgCode = [];

        if (!messageId || messageId < 1) {
            msgCode.push('messageId');
        }

        if (msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else {
            
            crudOperationModel.findAllByCondition(MessageCenter, { messageId: messageId }, ['ParentMessage_Id'])
            .then(msg => {
                if (msg.length) {

                    settingsModel.getMessageDetails(employeeDetailsId, messageId)
                        .then(result => {
                            response = responseFormat.getResponseMessageByCodes('', { content: { dataList: result } });
                            res.status(200).json(response);
                        })
                }
                else {
                    response = responseFormat.getResponseMessageByCodes('', { content: { dataList: [] } });
                    res.status(200).json(response);
                }
            }).catch(err => {
                let resp = commonMethods.catchError('settingsController/getMessageDetails', err);
                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                res.status(resp.code).json(response);
            });

        }
    }

    /**
    * Reply of Message 
    * @param {*} req : HTTP request argument
    * @param {*} res : HTTP response argument
    * @param {*} next : Callback argument
    */

    replyMessage(req, res, next) {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let messageTypeId = req.body.messageTypeId || 0;
        let jobId = req.body.jobId;
        let recruiterId = req.body.recruiterId;
        let messageId = req.body.messageId;
        let message = req.body.message ? req.body.message.trim() : '';        
        let attachments = req.body.attachments;

        let response = responseFormat.createResponseTemplate();
        let msgCode = [];

        let parentMessage = {
            id: null,
            employeeDetailsId: 0,
            subject: null
        };

        let newMessageId = 0;
        let respObj = {
            messageId: 0,
            messageBody: message,            
            createdDate: '',
            isSentByMe: 1,
            messageIndex : req.body.messageIndex,
            attachments: {
                list : []
            }
        };
        let isAttachment = 0;

        let messageCenterVars = enums.uploadType.messageCenter;

        if (!message || message == '') {
            msgCode.push('message');
        }
        if(messageTypeId && messageTypeId == enums.messageType.jobId && !jobId)
        {
            msgCode.push('jobId');
        }
        
        if(attachments && attachments.length)
        {
            isAttachment = 1;            
            for(let i=0; i<attachments.length; i++)
            {
                if(!attachments[i].fileName || !attachments[i].fileData)
                {
                    attachments.splice(i,1);
                    break;
                }
                if (attachments[i].fileName && (!commonMethods.validateFileType(attachments[i].fileData, attachments[i].fileName, messageCenterVars.allowedExt))) 
                {
                    msgCode.push('fileName:messageCenterFile');
                }
            }
        }

        if (msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            response.content.messageList['messageIndex'] = req.body.messageIndex;
            res.status(200).json(response);
        }
        else {
           
            async.series([
                function (done) {
                    if (!messageId) {
                        // get Recruiter Id of Employee
                        settingsModel.getRecruiter(employeeDetailsId)
                        .then(emp => {
                            if (emp[0].RecruiterId) {                                
                                parentMessage.recipientId = emp[0].RecruiterId;
                                done();
                            }
                            else {
                                response = responseFormat.getResponseMessageByCodes(['errorText:noRecruiter'], { code: 417 });
                                response.content.messageList['messageIndex'] = req.body.messageIndex;
                                res.status(200).json(response);
                            }
                        })
                    }
                    else {
                        crudOperationModel.findAllByCondition(MessageCenter, { messageId: messageId })
                        .then(msg => { 
                            if (msg.length) {
                                parentMessage.id = msg[0].parentMessageId || msg[0].messageId;
                                parentMessage.subject = msg[0].subject;
                                parentMessage.recipientId = (employeeDetailsId == msg[0].createdBy ? msg[0].recipientId : msg[0].createdBy);
                                // parentMessage.recipientId = msg[0].recipientId;
                                done();
                            }
                            else {
                                response = responseFormat.getResponseMessageByCodes(['messageId'], { code: 417 });
                                response.content.messageList['messageIndex'] = req.body.messageIndex;
                                res.status(200).json(response);
                            }
                        })
                    }
                },                
                function (done) {
                    let messageData = {
                        parentMessageId: parentMessage.id,
                        subject: parentMessage.subject,
                        messageBody: message,
                        messageType: messageTypeId,                        
                        typeRefId: 0,                        
                        createdBy: employeeDetailsId,
                        createdDate: new Date(),
                        recipientId: parentMessage.recipientId
                    };
                    crudOperationModel.saveModel(MessageCenter, messageData, { messageId: 0 })
                        .then(rs => {
                            newMessageId = rs.messageId;
                            respObj.messageId = newMessageId;
                            respObj.createdDate = rs.createdDate;
                            done();
                        })
                },
                function (done) {
                    if (isAttachment) 
                    {                    
                        async.map(attachments, function(item, cb)
                        {
                            commonMethods.fileUpload(item.fileData, item.fileName, messageCenterVars.docTypeId)
                            .then((docFileUpload) => {
                                if (docFileUpload.isSuccess) 
                                {
                                    let documentData = {
                                        messageId: newMessageId,
                                        fileName: docFileUpload.fileName,
                                        createdBy: employeeDetailsId,
                                        createdDate: new Date(),
                                        fileNameAlias: item.fileName
                                    };
                                    
                                    respObj.attachments.list.push({
                                        fileName : docFileUpload.fileName,
                                        path : config.resumeHostUrl + config.documentBasePath + messageCenterVars.path + '/' + docFileUpload.fileName
                                    })

                                    crudOperationModel.saveModel(MessageCenterDocument, documentData, { messageCenterDocId: 0 })
                                    .then(rs1 => {                                                                         
                                        cb(null, rs1);
                                    })
                                }
                                else {
                                    response = responseFormat.getResponseMessageByCodes(['fileName:' + docFileUpload.msgCode[0]], { code: 417 });
                                    response.content.messageList['messageIndex'] = req.body.messageIndex;
                                    res.status(200).json(response);
                                }
                            })
                        },function(err, result)
                        {
                            if(!err)
                            {
                                done();
                            }
                        })
                    }
                    else {
                        done();
                    }
                },
                function(done){

                    let activityData =  [{
                        messageId: newMessageId,
                        employeeDetailsId: employeeDetailsId,
                        isRead: 1,
                        isFlag: 0,
                        isPriority: 0,
                        isArchive: 0,
                        isRecipient: 0
                    },
                    {
                        messageId: newMessageId,
                        employeeDetailsId: parentMessage.recipientId,
                        isRead: 0,
                        isFlag: 0,
                        isPriority: 0,
                        isArchive: 0,
                        isRecipient: 1
                    }];
                    crudOperationModel.bulkSave(MessageCenterActivity, activityData)
                    .then(rs => {

                        // if messageid not available then message to recuiter and send mail to recruiter 
                        if (!messageId && parentMessage.recipientId && !jobId && !recruiterId) 
                        {
                            // get user info
                            crudOperationModel.findAllByCondition(EmployeeDetails, {employeeDetailsId:employeeDetailsId})
                            .then( userData => {
                                
                                // get recruiter info
                                crudOperationModel.findAllByCondition(EmployeeDetails, {employeeDetailsId:parentMessage.recipientId})
                                .then( recData => {
                                    if(recData.length)
                                    {
                                        // email to recruiter 
                                        let data = [
                                                {name : "USERNAME", value : (userData[0].firstName + ' '+ userData[0].lastName)},
                                                {name : "RECRUITERFIRSTNAME", value : recData[0].firstName},
                                                {name : "MESSAGECONTENT", value : commonMethods.nl2br(message) }
                                            ];
                                        let options = {        
                                                mailTemplateCode : enums.emailConfig.codes.messageToRecruiter.code,
                                                toMail : [{mailId : recData[0].emailId, displayName : recData[0].firstName, employeeId : employeeDetailsId}],                                                                    
                                                placeHolders : data                                       
                                        }
                                        
                                        emailModel.mail(options, 'setting-controller/replyMessage')
                                        .then( rs =>{ })
                                    }
                                })
                            })
                            
                        }
                        else if(jobId)
                        {
                            // if jobId is sent with parameter then send email to job-recruiter
                            // get job-recruiter info
                            jobsModel.GetJobsDetailById( {employeeDetailsId : employeeDetailsId, cjmJobId : jobId})
                            .then( jobData => {
                                if(jobData.length)
                                {
                                    // email to recruiter 
                                    let data = [
                                            {name : "RECRUITERFIRSTNAME", value : jobData[0].recruiterFirstName},
                                            {name : "JOBTITLE", value : jobData[0].jobTitle },
                                            {name : "JOBREFERENCEID", value : jobId},
                                            {name : "CLIENTNAME", value : jobData[0].clientName},
                                            {name : "LOCATION", value : jobData[0].state},
                                            {name : "MESSAGECONTENT", value : commonMethods.nl2br(message)}
                                        ];
                                    let options = {        
                                            mailTemplateCode : enums.emailConfig.codes.adminMails.message,
                                            toMail : [{mailId : jobData[0].recruiterEmailId, displayName : jobData[0].recruiterFirstName}],                                                                    
                                            placeHolders : data                                       
                                    }
                                    
                                    emailModel.mail(options, 'setting-controller/replyMessage job-recruiter-mail')
                                    .then( rs =>{ })
                                } 
                            })
                        }
                        else if(recruiterId)
                        {
                            // if recruiter-id is passed in parameter then send message to that recruiter 
                            // get user info
                            crudOperationModel.findAllByCondition(EmployeeDetails, {employeeDetailsId:employeeDetailsId})
                            .then( userData => {
                                
                                // get recruiter info
                                crudOperationModel.findAllByCondition(EmployeeDetails, {employeeDetailsId:recruiterId})
                                .then( recData => {
                                    if(recData.length)
                                    {
                                        // email to recruiter 
                                        let data = [
                                                {name : "USERNAME", value : (userData[0].firstName + ' '+ userData[0].lastName)},
                                                {name : "RECRUITERFIRSTNAME", value : recData[0].firstName},
                                                {name : "MESSAGECONTENT", value : commonMethods.nl2br(message) }
                                            ];
                                        let options = {        
                                                mailTemplateCode : enums.emailConfig.codes.messageToRecruiter.code,
                                                toMail : [{mailId : recData[0].emailId, displayName : recData[0].firstName, employeeId : employeeDetailsId}],                                                                    
                                                placeHolders : data                                       
                                        }
                                        
                                        emailModel.mail(options, 'setting-controller/replyMessage')
                                        .then( rs =>{ })
                                    }
                                })
                            })
                        }

                        // response = responseFormat.getResponseMessageByCodes(['success:saved'], { code: 200 });
                        response = responseFormat.getResponseMessageByCodes('', { content: { dataList: [respObj] , messageList:{success:'Message sent successfully.'} }}); 
                        res.status(200).json(response);
                    })
                }
            ], function (err, reponse) {
                    if (err) {
                        let resp = commonMethods.catchError('settingsController/replyMessage', err);
                        response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                        response.content.messageList['messageIndex'] = req.body.messageIndex;
                        res.status(resp.code).json(response);

                    }
                    else {
                        response = responseFormat.getResponseMessageByCodes(['success:messageSent'], { code: 200 });
                        res.status(200).json(response);
                    }
                })

        }
    }

    /**
    * Get Message Counts
    * @param {*} req : HTTP request argument
    * @param {*} res : HTTP response argument
    * @param {*} next : Callback argument
    */

    getMessageCounts(req, res, next) {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;

        let response = responseFormat.createResponseTemplate();

        settingsModel.getMessageCount(employeeDetailsId)
            .then(count => {

                let counts = {
                    unread: count[0].unread,
                    priority: count[1].priority,
                    flagged: count[2].flagged,
                    archived: count[3].archived,
                    // type : count[4]
                };

                count[4].forEach(it => {
                    counts[it.name.toLowerCase()] = it.count
                })

                // console.log('finale',counts)

                response = responseFormat.getResponseMessageByCodes('', { content: { dataList: [counts] } });
                res.status(200).json(response);

            }).catch(err => {
                let resp = commonMethods.catchError('settingsController/getMessageCounts', err);
                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                res.status(resp.code).json(response);
            })

    }

    getMessageCountWithId(req, res, next) 
    {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;

        let response = responseFormat.createResponseTemplate();

        settingsModel.getMessageCount(employeeDetailsId)
        .then(count => {
            
            let counts = [
                {
                    id: "unread",
                    name: "Unread",
                    count: count[0].unread
                },
                {
                    id: "priority",
                    name: "Priority",
                    count: count[1].priority
                },
                {
                    id: "flagged",
                    name: "Flagged",
                    count: count[2].flagged
                },
                {
                    id: "archived",
                    name: "Archived",
                    count: count[3].archived
                },
            ];


            Array.prototype.push.apply(counts, count[4])

            response = responseFormat.getResponseMessageByCodes('', {content: {dataList: counts}});
            res.status(200).json(response)
        
                
        }).catch(err => {
            let respo = commonMethods.catchError('settingsController/messageCenter', err);
            resp.responseFormat = responseFormat.getResponseMessageByCodes(respo.message, { code: respo.code });
            res.status(200).json(resp)
        })

    }

    test(req, res, next) {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;

        let response = responseFormat.createResponseTemplate();

        try {
            throw 'myException';
        } catch (err) {
            let resp = commonMethods.catchError('settingsController/getMessageCounts', err);
            response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
            res.status(resp.code).json(response);
        }
    }



}