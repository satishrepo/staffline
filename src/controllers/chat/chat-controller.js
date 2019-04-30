/**
 * -------Import all classes and packages -------------
 */
import ChatModel from '../../models/chat/chat-model';
import responseFormat from '../../core/response-format';
import configContainer from '../../config/localhost';
import logger from '../../core/logger';
import enums from '../../core/enums';
import async from 'async';
import CommonMethods from '../../core/common-methods';
import ip from 'ip';
import AccountsModel from '../../models/accounts/accounts-model';
import JobsModel from '../../models/jobs/jobs-model';
import EmailModel from '../../models/emails/emails-model';

import { messageHeader } from '../../entities/chat/message-header';
import { messageParticipant } from '../../entities/chat/message-participants';
import { messageSupportIssueType } from '../../entities/chat/message-support-issue-type';
import { messageTransaction } from '../../entities/chat/message-transaction';
import { messageDetails } from '../../entities/chat/message-details';
import { APP_REF_DATA } from "../../entities/common/app-ref-data";
import CrudOperationModel from '../../models/common/crud-operation-model';
import { EmployeeDetails, ResumeMaster } from '../../entities';
import { UserSession } from '../../entities/accounts/user-session';

/**
 *  -------Initialize variabls-------------
 */
let config = configContainer.loadConfig(),
    chatModel = new ChatModel(),
    commonMethods = new CommonMethods(),
    jobsModel = new JobsModel(),
    crudOperationModel = new CrudOperationModel();

const emailModel = new EmailModel();

export default class ChatController {
    constructor() {
        //
    }

    /**
     * Create New Chat
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
    */

    createChat(req, res, next) 
    {
        let response = responseFormat.createResponseTemplate();
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let msgCode = [];

        let input = {
            chatId : req.body.chatId,
            messageId : req.body.messageId,
            recipientId : 0, //req.body.recipientId,
            groupId : req.body.groupId,
            issueType: req.body.issueType,
            severity: req.body.severity,
            jobId : req.body.jobId,
            messageBody : (req.body.messageBody ? req.body.messageBody.trim() : '')
        };

        let responseData = {
            chatId : 0,
            lastMessageId : 0,
            memberStatus : [],
            messages : [],
            severityId: enums.severityType.Urgent,
            severity: enums.severityTypeLabel.Urgent,
            issueType: 'Other',
            issueTypeId: 0
        }
        // frontend = 1, backend = 0
        let issueTypeDetail = {};
        
        if(isNaN(input.chatId))
        {
            msgCode.push('chatId')
        }
        // if(input.chatId == 0 && (!input.recipientId || ~~input.recipientId < 1) && input.groupId != enums.imChat.jobMsg.id ) 
        // {
        //     msgCode.push('recipientId')
        // }
        if(input.chatId == 0 && (!input.groupId || ~~input.groupId < 1) )
        {
            msgCode.push('groupId')
        }
        if( (!input.issueType || ~~input.issueType < 1) )
        {
            msgCode.push('issueType')
        }
        if( (!input.severity || ~~input.severity < 1) )
        {
            msgCode.push('severity')
        }
        if(!input.messageBody || input.messageBody == '')
        {
            msgCode.push('messageBody')
        }
        if(input.chatId > 0 && (!input.messageId || input.messageId < 1))
        {
            msgCode.push('messageId')
        }
        if(input.groupId == enums.imChat.jobMsg.id && (!input.jobId || ~~input.jobId < 1))
        {
            msgCode.push('jobId')
        }

     
        if(msgCode.length)
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else
        {
         
            // create new chat
            async.series([
                function(done)
                {
                    if(input.chatId == 0)
                    {
                        crudOperationModel.findModelByCondition(messageSupportIssueType, {supportId : input.issueType})
                        .then( itDetail => {
                            if(itDetail)
                            {
                                issueTypeDetail = itDetail;
                                input.recipientId = itDetail.responsiblePerson;
                                done();
                            }
                            else
                            {
                                msgCode.push('issueType')
                                response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
                                res.status(200).json(response);
                            }
                        });
                    }
                    else
                    {
                        //====== creating new message
                        done();
                    }
                },
                function(done)
                {
                    if(input.groupId == enums.imChat.recruiterMsg.id)
                    {
                        chatModel.getRecruiterDetails(employeeDetailsId)
                        .then( rs => {
                            if(rs.length)
                            {
                                input.recipientId = rs[0].recruiterId;
                                issueTypeDetail.responsiblePerson = rs[0].recruiterId;
                                done()
                            }
                            else
                            {
                                response = responseFormat.getResponseMessageByCodes(['errorText:inavalidParticipent'], { code: 417 });
                                res.status(200).json(response);
                            }
                        })
                    }
                    else if(input.jobId && input.groupId == enums.imChat.jobMsg.id)
                    {
                        // get job recruiter and make is recipient
                        jobsModel.getJobDetailsById(input.jobId, employeeDetailsId)
                        .then( job => { 
                            if(job.length)
                            {
                                input.recipientId = job[0].recId;
                                issueTypeDetail.responsiblePerson = job[0].recId;
                                if(input.chatId == 0 && job[0].jobStatus != 'A')
                                {
                                    response = responseFormat.getResponseMessageByCodes(['jobClosed:inactiveJob'], { code: 417 });
                                    res.status(200).json(response);
                                }
                                else
                                {
                                    done();
                                }
                            }
                            else
                            {
                                response = responseFormat.getResponseMessageByCodes(['jobClosed:inactiveJob'], { code: 417 });
                                res.status(200).json(response);
                            }
                                
                        })
                    }
                    else
                    {
                        // ==== other than job and recruiter
                        done();
                    }
                },
                function(done)
                {
                    if(input.chatId == 0)
                    {
                        // 1. save header and create chat-id
                        let chat = {
                            ownerType : 1,
                            ownerId : employeeDetailsId,
                            title : '',
                            groupId : input.groupId,
                            refId : input.jobId && input.groupId == enums.imChat.jobMsg.id ? input.jobId : input.recipientId,
                            severity: input.severity,
                            issueType: input.issueType
                        };
                        
                        crudOperationModel.saveModel(messageHeader, chat, {chatId : 0})
                        .then( chatres => {
                            responseData.chatId = chatres.chatId;
                            responseData.severityId = chatres.severity;
                            responseData.issueTypeId = chatres.issueType;
                            done();
                        }).catch( err => {
                            let resp = commonMethods.catchError('chatController/createChat messsage-header', err);
                            response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                            res.status(resp.code).json(response);
                        })
                    }
                    else
                    {
                        // update messageHeader table and mark converstion isComplete = 0 
                        crudOperationModel.saveModel(messageHeader, {isComplete : 0}, {chatId : input.chatId})
                        .then(rs =>{
                            responseData.chatId = input.chatId;
                            done()
                        })
                    }
                },
                function(done)
                {
                    if(input.chatId == 0)
                    {
                        // 2. save header and create chat-id
                        let transactionHistory = {
                            chatId : responseData.chatId,
                            responseTimeInHours: issueTypeDetail.responseTime,
                            responsiblePerson: issueTypeDetail.responsiblePerson,
                            responseLevel: 1 // we will start conversation with level 1
                        };
                        
                        crudOperationModel.saveModel(messageTransaction, transactionHistory, {supportId : 0})
                        .then( res => {
                            done();
                        }).catch( err => {
                            let resp = commonMethods.catchError('chatController/createChat messsage-transactionHistory', err);
                            response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                            res.status(resp.code).json(response);
                        })
                    }
                    else
                    {
                        done();
                    }
                    
                },
                function(done)
                {
                    if(input.chatId == 0)
                    {
                        // 2. save data for sender and recipient data
                        let participants = [
                            {
                                chatId : responseData.chatId,
                                userId : employeeDetailsId,
                                userType : 1,
                                participantStatus : null, // not using for now 
                                readStatus : 1,
                                lastActive : new Date()
                            },
                            {
                                chatId : responseData.chatId,
                                userId : input.recipientId,
                                userType : 0,
                                participantStatus : null, // not using for now
                                readStatus : 0,
                                lastActive : new Date()
                            }
                        ];
    
                        crudOperationModel.bulkSave(messageParticipant, participants)
                        .then( partres => {
                            done();
                        }).catch( err => {
                            let resp = commonMethods.catchError('chatController/createChat message-pariticipients', err);
                            response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                            res.status(resp.code).json(response);
                        })
                    }
                    else
                    {
                        // update readStatus to 1 for self chat 
                        crudOperationModel.saveModel(messageParticipant, {readStatus : 1}, {userId:employeeDetailsId, chatId:input.chatId})
                        .then( rs => {
                            
                            // update readStatus to 0 for opposit chat persion (support group)
                            crudOperationModel.saveModel(messageParticipant, {readStatus : 0}, {userId:input.recipientId, chatId:input.chatId})
                            .then( rs => {
        
                            })
                        });
                        done();
                    }
                   
                },
                function(done)
                {
                    // 3. Save message Details 
                    let message = {
                        chatId : responseData.chatId,
                        postedBy : employeeDetailsId,
                        posterType : 1, // frontend
                        isForwardedMessage: 0,
                        messageBody : JSON.stringify({"type":"content", "content": input.messageBody}),
                        createdDate : new Date(),
                        ip : ip.address()
                    };
    
                    crudOperationModel.saveModel(messageDetails, message, { messageId : 0 })
                    .then( msgres => {
                        responseData.lastMessageId = msgres.messageId;
                        done()                        
                    }).catch( err => {
                        let resp = commonMethods.catchError('chatController/createChat message-detail', err);
                        response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                        res.status(resp.code).json(response);
                    })
                },
                function(done)
                {
                    // 4. get status of recipient 
                    chatModel.getUserStatus(input.recipientId, input.chatId)
                    .then( statusData => {
                        responseData.memberStatus.push({ recipientId : input.recipientId, status: statusData.status});

                        // email to recruiter/participant
                        // get logged user info
                        crudOperationModel.findModelByCondition(EmployeeDetails, {employeeDetailsId : employeeDetailsId})
                        .then( emp => {
                            if(emp)
                            {
                                if(input.groupId == enums.imChat.jobMsg.id || input.groupId == enums.imChat.recruiterMsg.id)
                                {
                                    // get participant info 
                                   
                                    crudOperationModel.findModelByCondition(EmployeeDetails, {employeeDetailsId : input.recipientId})
                                    .then( recip => { 
                                        if(recip)
                                        {
                                            let data = [
                                                    {name : "USERNAME", value : emp.firstName+' '+emp.lastName},  
                                                    {name : "RECRUITERFIRSTNAME", value : recip.firstName},
                                                    {name : "MESSAGECONTENT", value : commonMethods.nl2br(input.messageBody) }
                                            ];
                                            let options = {        
                                                    mailTemplateCode : enums.emailConfig.codes.messageToRecruiter.code,
                                                    toMail : [{mailId : recip.emailId, displayName : recip.firstName, employeeId : recip.employeeDetailsId}],                                                                    
                                                    placeHolders : data                                       
                                            }
                                            
                                            emailModel.mail(options, 'chat-controller/createChat')
                                            .then( rs =>{ })
                                        }
                                    })
                                }
                                else
                                {

                                    // get participant info 
                                    crudOperationModel.findModelByCondition(APP_REF_DATA, {keyId : input.groupId})
                                    .then( recip => {
                                        if(recip && recip.description)
                                        {
                                            let toEmails = recip.description.split(',');
                                            let ccMail = [];
                                            let toEmail = toEmails.shift();
                                            if(toEmails.length)
                                            {
                                                toEmails.forEach( i => {
                                                    ccMail.push({
                                                        mailId : i, displayName : '', configKeyName : null
                                                    })
                                                })
                                            }
                                            let data = [
                                                    {name : "USERNAME", value : emp.firstName+' '+emp.lastName},  
                                                    {name : "RECRUITERFIRSTNAME", value : ''},
                                                    {name : "MESSAGECONTENT", value : commonMethods.nl2br(input.messageBody) }
                                            ];
                                            let options = {        
                                                    mailTemplateCode : enums.emailConfig.codes.messageToRecruiter.code,
                                                    toMail : [{mailId : toEmail, displayName : '', employeeId : null}],                                                                    
                                                    placeHolders : data ,
                                                    cccMail : ccMail 
                                            }
                                            
                                            emailModel.mail(options, 'chat-controller/createChat')
                                            .then( rs =>{ })
                                        }
                                    })
                                }
                            }
                        })
    
                        done()
                    })
                },  
                function(done)
                {
                    // 5. return message data and status of recipient in response
                    chatModel.getLatestMessageByChatId(responseData.chatId, input.messageId)
                    .then( rs => {
                        responseData.messages = rs;
                        done()
                    })
    
                    // done();
                }
            ],function (err, response) {
                if (err) {
                    let resp = commonMethods.catchError('chatController/createChat', err);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                }
                else {
                    response = responseFormat.getResponseMessageByCodes('', { content: { dataList: [responseData] , messageList:{success:'Message sent successfully.'} }}); 
                    res.status(200).json(response);
                }
            })
        }


    }

    startCoversation(req, res, next) 
    {
        let response = responseFormat.createResponseTemplate();
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let msgCode = [];

        let input = {
            recipientId : req.body.recipientId,
            groupId : req.body.groupId,
            jobId : req.body.jobId,
            issueType: req.body.issueType,
            severity: req.body.severity,
            messageBody : (req.body.messageBody ? req.body.messageBody.trim() : '')
        };

        let responseData = {
            chatId : 0,
            lastMessageId : 0,
            memberStatus : [],
            messages : [],
            severityId: enums.severityType.Urgent,
            severity: enums.severityTypeLabel.Urgent,
            issueType: 'Other',
            issueTypeId: 0
        }
            
        let issueTypeDetail = {};
        // frontend = 1, backend = 0

        
        if( (!input.groupId || ~~input.groupId < 1) )
        {
            msgCode.push('groupId')
        }
        if( (!input.issueType || ~~input.issueType < 1) )
        {
            msgCode.push('issueType')
        }
        if( (!input.severity || ~~input.severity < 1) )
        {
            msgCode.push('severity')
        }
        if(!input.messageBody || input.messageBody == '')
        {
            msgCode.push('messageBody')
        }
        if(input.groupId == enums.imChat.jobMsg.id && (!input.jobId || ~~input.jobId < 1))
        {
            msgCode.push('jobId')
        }

     
        if(msgCode.length)
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else
        {

            // create new chat
            async.series([

                function(done)
                {
                    crudOperationModel.findModelByCondition(messageSupportIssueType, {supportId : input.issueType})
                    .then( itDetail => {
                        if(itDetail)
                        {
                            issueTypeDetail = itDetail;
                            input.recipientId = itDetail.responsiblePerson;
                            done();
                        }
                        else
                        {
                            msgCode.push('issueType')
                            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
                            res.status(200).json(response);
                        }
                    });
                },
                function(done)
                {
                    if(input.groupId == enums.imChat.recruiterMsg.id)
                    {
                        chatModel.getRecruiterDetails(employeeDetailsId)
                        .then( rs => {
                            if(rs.length)
                            {
                                input.recipientId = rs[0].recruiterId;
                                issueTypeDetail.responsiblePerson = rs[0].recruiterId;
                                done()
                            }
                            else
                            {
                                response = responseFormat.getResponseMessageByCodes(['errorText:inavalidParticipent'], { code: 417 });
                                res.status(200).json(response);
                            }
                        })
                    }
                    else if(input.jobId && input.groupId == enums.imChat.jobMsg.id)
                    {
                        // get job recruiter and make is recipient
                        jobsModel.getJobDetailsById(input.jobId, employeeDetailsId)
                        .then( job => { 
                            if(job.length)
                            {
                                input.recipientId = job[0].recId;
                                issueTypeDetail.responsiblePerson = job[0].recId;
                                if(input.chatId == 0 && job[0].jobStatus != 'A')
                                {
                                    response = responseFormat.getResponseMessageByCodes(['jobClosed:inactiveJob'], { code: 417 });
                                    res.status(200).json(response);
                                }
                                else
                                {
                                    done();
                                }
                            }
                            else
                            {
                                response = responseFormat.getResponseMessageByCodes(['jobClosed:inactiveJob'], { code: 417 });
                                res.status(200).json(response);
                            }
                                
                        })
                    }
                    else
                    {
                        // ==== other than job and recruiter
                        done();
                    }
                },
                function(done)
                {
                    // recipient validate 
                    AccountsModel.getUserById(input.recipientId)
                    .then( rec => { 
                        if(rec)
                        {
                            done();
                        }
                        else
                        {
                            response = responseFormat.getResponseMessageByCodes(['recipientId:inavalidParticipent'], { code: 417 });
                            res.status(200).json(response);
                        }
                    })
                },       
                function(done)
                {
                    // 1. save header and create chat-id
                    let chat = {
                        ownerType : 1,
                        ownerId : employeeDetailsId,
                        title : '',
                        groupId : input.groupId,
                        refId : input.jobId && input.groupId == enums.imChat.jobMsg.id ? input.jobId : input.recipientId,
                        severity: input.severity,
                        issueType: input.issueType
                    };
                    
                    crudOperationModel.saveModel(messageHeader, chat, {chatId : 0})
                    .then( chatres => {
                        responseData.chatId = chatres.chatId;
                        responseData.severityId = chatres.severity;
                        responseData.issueTypeId = chatres.issueType;
                        done();
                    }).catch( err => {
                        let resp = commonMethods.catchError('chatController/createChat messsage-header', err);
                        response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                        res.status(resp.code).json(response);
                    })
                    
                },
                function(done)
                {
                    // 2. save header and create chat-id
                    let transactionHistory = {
                        chatId : responseData.chatId,
                        responseTimeInHours: issueTypeDetail.responseTime,
                        responsiblePerson: issueTypeDetail.responsiblePerson,
                        responseLevel: 1 // we will start conversation with level 1
                    };
                    
                    crudOperationModel.saveModel(messageTransaction, transactionHistory, {transactionId : 0})
                    .then( res => {
                        done();
                    }).catch( err => {
                        let resp = commonMethods.catchError('chatController/createChat messsage-transactionHistory', err);
                        response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                        res.status(resp.code).json(response);
                    })
                    
                },
                function(done)
                {
                    // 3. save data for sender and recipient data
                    let participants = [
                        {
                            chatId : responseData.chatId,
                            userId : employeeDetailsId,
                            userType : 1,
                            participantStatus : null, // not using for now 
                            readStatus : 1,
                            lastActive : new Date()
                        },
                        {
                            chatId : responseData.chatId,
                            userId : input.recipientId,
                            userType : 0,
                            participantStatus : null, // not using for now
                            readStatus : 0,
                            lastActive : new Date()
                        }
                    ];

                    crudOperationModel.bulkSave(messageParticipant, participants)
                    .then( partres => {
                        done();
                    }).catch( err => {
                        let resp = commonMethods.catchError('chatController/createChat message-pariticipients', err);
                        response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                        res.status(resp.code).json(response);
                    })
                    
                   
                },
                function(done)
                {
                    // 4. Save message Details 
                    let message = {
                        chatId : responseData.chatId,
                        postedBy : employeeDetailsId,
                        posterType : 1, // frontend
                        isForwardedMessage: 0,
                        messageBody : JSON.stringify({"type":"content", "content": input.messageBody}),
                        createdDate : new Date(),
                        ip : ip.address()
                    };
    
                    crudOperationModel.saveModel(messageDetails, message, { messageId : 0 })
                    .then( msgres => {
                        responseData.lastMessageId = msgres.messageId;
                        done()                        
                    }).catch( err => {
                        let resp = commonMethods.catchError('chatController/createChat message-detail', err);
                        response = responseFormat.getRes72121ponseMessageByCodes(resp.message, { code: resp.code });
                        res.status(resp.code).json(response);
                    })
                },
                function(done)
                {
                    // 5. get status of recipient 
                    chatModel.getUserStatus(input.recipientId, input.chatId)
                    .then( statusData => {

                        responseData.memberStatus.push({ recipientId : input.recipientId, status: statusData.status});
    

                        // email to recruiter/participant
                        // get logged user info
                        crudOperationModel.findModelByCondition(EmployeeDetails, {employeeDetailsId : employeeDetailsId})
                        .then( emp => {
                            if(emp)
                            {
                                if(input.groupId == enums.imChat.jobMsg.id || input.groupId == enums.imChat.recruiterMsg.id)
                                {
                                    // get participant info 
                                    crudOperationModel.findModelByCondition(EmployeeDetails, {employeeDetailsId : input.recipientId})
                                    .then( recip => { 
                                        if(recip)
                                        {
                                            let data = [
                                                    {name : "USERNAME", value : emp.firstName+' '+emp.lastName},  
                                                    {name : "RECRUITERFIRSTNAME", value : recip.firstName},
                                                    {name : "MESSAGECONTENT", value : commonMethods.nl2br(input.messageBody) }
                                            ];
                                            let options = {        
                                                    mailTemplateCode : enums.emailConfig.codes.messageToRecruiter.code,
                                                    toMail : [{mailId : recip.emailId, displayName : recip.firstName, employeeId : recip.employeeDetailsId}],                                                                    
                                                    placeHolders : data                                       
                                            }
                                            
                                            emailModel.mail(options, 'chat-controller/createChat')
                                            .then( rs =>{ })
                                        }
                                    })
                                }
                                else
                                {

                                    // get participant info 
                                    crudOperationModel.findModelByCondition(EmployeeDetails, {employeeDetailsId : input.recipientId})
                                    .then( recip => {
                                        if(recip && recip.emailId)
                                        {
                                            let data = [
                                                    {name : "USERNAME", value : emp.firstName+' '+emp.lastName},  
                                                    {name : "RECRUITERFIRSTNAME", value : ''},
                                                    {name : "MESSAGECONTENT", value : commonMethods.nl2br(input.messageBody) }
                                            ];
                                            let options = {        
                                                    mailTemplateCode : enums.emailConfig.codes.messageToRecruiter.code,
                                                    toMail : [{mailId : recip.emailId, displayName :  recip.firstName+' '+recip.lastName, employeeId : null}],                                                                    
                                                    placeHolders : data
                                            }
                                            
                                            emailModel.mail(options, 'chat-controller/createChat')
                                            .then( rs =>{ })
                                        }
                                    })
                                }
                            }
                        })
    
                        done()
                    })
                }
            ],function (err, response) {
                if (err) {
                    let resp = commonMethods.catchError('chatController/createChat', err);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                }
                else {
                    response = responseFormat.getResponseMessageByCodes('', { content: { dataList: [responseData] , messageList:{success:'Thanks for reaching us. One of our support representative will reach you back within 24 hours.'} }}); 
                    res.status(200).json(response);
                }
            })
        }


    }

    getLatestMessageByChatId(req, res, next)
    {
        let response = responseFormat.createResponseTemplate();
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let chatId = req.body.chatId ? Number(req.body.chatId) : 0;
        let messageId = req.body.messageId;

        let severity = 0;
        let issueType = 0;
        let msgCode = [];
        
        if(!chatId || chatId < 1 || isNaN(chatId))
        {
            msgCode.push('chatId');
        }

        if(msgCode.length)
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else
        {
            async.series([
                function(done)
                {
                    // get message header detail
                    crudOperationModel.findModelByCondition(messageHeader, {chatId: chatId} , ['chatId', 'severity', 'issueType'])
                    .then( mh =>{
                        if(mh)
                        {
                            severity = mh.severity;
                            issueType = mh.issueType;
                            done();
                        }
                        else
                        {
                            msgCode.push('chatId');
                            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
                            res.status(200).json(response);
                        }
                    })
                },
                function(done)
                {
                    // update readStatus =1 for self in chat participient
                    let data = {
                        readStatus : 1,
                        lastActive : new Date()
                    };
                    crudOperationModel.saveModel(messageParticipant, data, {chatId: chatId, userId: employeeDetailsId})
                    .then( rs =>{
                        done();
                    })
                },
                function(done)
                {
                    
                    if(!messageId)
                    {
                        crudOperationModel.findAllByCondition(messageDetails, { chatId:chatId }, ['chatId', 'messageId', 'posterType', 'postedBy', 'isForwardedMessage', 'messageBody', 'createdDate' ],['messageId', 'ASC'])
                        .then( rs =>{
                            rs.filter( item => {
                                item.severity = severity;
                                item.issueType = issueType;
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
                            });
                            response = responseFormat.getResponseMessageByCodes('', { content: { dataList: rs } });
                            res.status(200).json(response);
                        })
                    }
                    else
                    {
                        crudOperationModel.findAllByCondition(messageDetails, { chatId:chatId, messageId : {$gt: messageId}}, ['chatId', 'messageId', 'posterType', 'postedBy', 'isForwardedMessage', 'messageBody', 'createdDate' ],['messageId', 'ASC'])
                        .then( rs =>{
                            rs.filter( item => {
                                item.severity = severity;
                                item.issueType = issueType;
                                try {
                                    item.messageBody = JSON.parse(item.messageBody);
                                } catch (e) {
                                    if (e instanceof SyntaxError) {
                                        console.log(e, true)
                                        item.messageBody = {};
                                    } else {
                                        item.messageBody = JSON.parse(item.messageBody);
                                    }
                                }
                            });
                            response = responseFormat.getResponseMessageByCodes('', { content: { dataList: rs } });
                            res.status(200).json(response);
                        })
                    }
                }
            ],function (err, responseData) {
                if (err) {
                    let resp = commonMethods.catchError('chatController/getLatestMessageByChatId', err);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                }
                else {
                    response = responseFormat.getResponseMessageByCodes('', { content: { dataList: [responseData] }}); 
                    res.status(200).json(response);
                }
            })
        
        }
    }

    checkUserStatus(req, res, next)
    {
        let response = responseFormat.createResponseTemplate();
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let recipientId = req.body.recipientId;
        // let messageId = req.body.messageId;
        let msgCode = [];

        if(!recipientId || recipientId < 1 || isNaN(recipientId))
        {
            msgCode.push('recipientId');
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else
        {
            crudOperationModel.findAllByCondition(UserSession, { EmployeeDetails_Id:employeeDetailsId },[['Status','status']])
            .then( rs =>{
                response = responseFormat.getResponseMessageByCodes('', { content: { dataList: rs } });
                res.status(200).json(response);
            })
            
        }
    }

    getChatGroups(req, res, next) 
    {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let response = responseFormat.createResponseTemplate();
        let messageTypes = [];
        let empType = 0;
        let authorisationStatusId = 0;
        let outdata = [];

        async.series([
            function(done)
            {
                // get logged employee Type
                crudOperationModel.findModelByCondition(EmployeeDetails, {employeeDetailsId : employeeDetailsId})
                .then( rs => {
                    empType = rs.employeeTypeId;
                    done();
                })
            },
            function(done)
            {
                // get logged authorisation Status Id
                crudOperationModel.findModelByCondition(ResumeMaster, {employeeDetailsId : employeeDetailsId})
                .then( empDt => {
                    authorisationStatusId = parseInt(empDt.authorisationStatusId);
                    done();
                })
            },
            function(done)
            {
                chatModel.getGroups(employeeDetailsId)
                .then( rs => {
                    
                    outdata = rs.filter( item => {
                        //==== if emp is Us citizen then do don't show immigration support group ==========//
                            if([1,2].indexOf(authorisationStatusId) > -1 && item.groupId == enums.imChat.immigrationMsg.id){
                                return false;
                            }else{

                                //== for recruiter profileLetter will first letter of recruiter name =====//
                                if(item.groupId == enums.imChat.recruiterMsg.id){
                                    item.profileLetter = item.recipientName.charAt(0);
                                }
                                //========================================================================//
        
                                return enums.chatGroupAccess[empType].indexOf(item.groupId) > -1 
                            }
                        //==================================================================================//
                    })

            
                    response = responseFormat.getResponseMessageByCodes('', { content: { dataList: outdata } });
                    res.status(200).json(response);
                })
            }
        ],function (err, responseData) {
            if (err) {
                let resp = commonMethods.catchError('chatController/getChatGroups', err);
                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                res.status(resp.code).json(response);
            }
            else {
                response = responseFormat.getResponseMessageByCodes('', { content: { dataList: [responseData] }}); 
                res.status(200).json(response);
            }
        })

        
    }

    getCoversationByChat(req, res, next)
    {
        let response = responseFormat.createResponseTemplate();
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let msgCode = [];
        
        let groupId = req.body.groupId;
        let chatId = req.body.chatId || 0;
        let searchStr = req.body.searchText ? req.body.searchText.trim() : '';
        let pageNum = req.body.pageNum ? req.body.pageNum : enums.paging.pageCount;
        let pageSize = req.body.pageSize ? req.body.pageSize : enums.paging.pageSize;

        if(!groupId || groupId == '' || groupId == 0)
        {
            groupId = 'all';
        }

        chatModel.getConversationByChatId(employeeDetailsId, groupId, searchStr, chatId, pageNum, pageSize)
        .then( rs => {
            //== for recruiter profileLetter will first letter of recruiter name =====//
                if(groupId == enums.imChat.recruiterMsg.id){
                    for(let i = 0; i < rs.list.length; i++)
                    {
                        rs.list[i]['profileLetter'] = rs.list[i]['recipientName'].charAt(0);
                    }
                }
            //========================================================================//
            response = responseFormat.getResponseMessageByCodes('', { content: { dataList: [rs] } });
            res.status(200).json(response);
        })
        
    }

    getUnreadConversations(req, res, next)
    {
        let response = responseFormat.createResponseTemplate();
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let msgCode = [];
  
        chatModel.getUnreadConversations(employeeDetailsId)
        .then( rs => {
            response = responseFormat.getResponseMessageByCodes('', { content: { dataList: [rs] } });
            res.status(200).json(response);
        })
    }
    

    saveHistory(req, res, next)
    {
        
        let response = responseFormat.createResponseTemplate();
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let msgCode = [];

        let input = {
            groupId : req.body.groupId,
            messages : req.body.messages,
            severity: enums.severityType.Urgent,
            issueType: 0
        };

        let responseData = {
            chatId : 0,
            lastMessageId : 0,
            memberStatus : [],
            messages : [],
            severityId: enums.severityType.Urgent,
            severity: enums.severityTypeLabel.Urgent,
            issueType: 'Other',
            issueTypeId: 0
        }
        let issueTypeDetail = {};


        if(!input.messages || !input.messages.length)
        {
            msgCode.push('errorText:blankRequest')
        }
        if( !input.groupId || ~~input.groupId < 1 || input.groupId == enums.imChat.jobMsg.id)
        {
            msgCode.push('groupId')
        }

     
        if(msgCode.length)
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else
        {
            async.series([

                function(done)
                {
                    if(input.groupId == enums.imChat.hrMsg.id)
                    {
                        input.issueType = enums.imChat.hrMsg.defaultIssueType;
                    }
                    else if(input.groupId == enums.imChat.immigrationMsg.id)
                    {
                        input.issueType = enums.imChat.immigrationMsg.defaultIssueType;
                    }
                    else if(input.groupId == enums.imChat.payrollMsg.id)
                    {
                        input.issueType = enums.imChat.payrollMsg.defaultIssueType;
                    }
                    else if(input.groupId == enums.imChat.jobMsg.id)
                    {
                        input.issueType = enums.imChat.jobMsg.defaultIssueType;
                    }
                    else if(input.groupId == enums.imChat.recruiterMsg.id)
                    {
                        input.issueType = enums.imChat.recruiterMsg.defaultIssueType;
                    }
                    else if(input.groupId == enums.imChat.timesheetMsg.id)
                    {
                        input.issueType = enums.imChat.timesheetMsg.defaultIssueType;
                    }
                    else if(input.groupId == enums.imChat.accountPayableMsg.id)
                    {
                        input.issueType = enums.imChat.accountPayableMsg.defaultIssueType;
                    }
                    done();
                },
                function(done)
                {
                    crudOperationModel.findModelByCondition(messageSupportIssueType, {supportId : input.issueType})
                    .then( itDetail => {
                        if(itDetail)
                        {
                            issueTypeDetail = itDetail;
                            input.recipientId = itDetail.responsiblePerson;
                            done();
                        }
                        else
                        {
                            msgCode.push('issueType')
                            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
                            res.status(200).json(response);
                        }
                    });
                },
                function(done)
                {
                    if(input.groupId == enums.imChat.recruiterMsg.id)
                    {
                        chatModel.getRecruiterDetails(employeeDetailsId)
                        .then( rs => {
                            if(rs.length)
                            {
                                input.recipientId = rs[0].recruiterId;
                                issueTypeDetail.responsiblePerson = rs[0].recruiterId;
                                done()
                            }
                            else
                            {
                                response = responseFormat.getResponseMessageByCodes(['errorText:inavalidParticipent'], { code: 417 });
                                res.status(200).json(response);
                            }
                        })
                    }
                    else if(input.jobId && input.groupId == enums.imChat.jobMsg.id)
                    {
                        // get job recruiter and make is recipient
                        jobsModel.getJobDetailsById(input.jobId, employeeDetailsId)
                        .then( job => { 
                            if(job.length)
                            {
                                input.recipientId = job[0].recId;
                                issueTypeDetail.responsiblePerson = job[0].recId;
                                if(input.chatId == 0 && job[0].jobStatus != 'A')
                                {
                                    response = responseFormat.getResponseMessageByCodes(['jobClosed:inactiveJob'], { code: 417 });
                                    res.status(200).json(response);
                                }
                                else
                                {
                                    done();
                                }
                            }
                            else
                            {
                                response = responseFormat.getResponseMessageByCodes(['jobClosed:inactiveJob'], { code: 417 });
                                res.status(200).json(response);
                            }
                                
                        })
                    }
                    else
                    {
                        // ==== other than job and recruiter
                        done();
                    }
                },
                function(done)
                {
                    // recipient validate 
                    AccountsModel.getUserById(input.recipientId)
                    .then( rec => { 
                        if(rec)
                        {
                            done();
                        }
                        else
                        {
                            response = responseFormat.getResponseMessageByCodes(['recipientId:inavalidParticipent'], { code: 417 });
                            res.status(200).json(response);
                        }
                    })
                }, 
                function(done)
                {
                    // 1. save header and create chat-id
                    let chat = {
                        ownerType : 1,
                        ownerId : employeeDetailsId,
                        title : '',
                        groupId : input.groupId,
                        refId : input.recipientId,
                        severity: input.severity,
                        issueType: input.issueType
                    };
                    
                    crudOperationModel.saveModel(messageHeader, chat, {chatId : 0})
                    .then( chatres => {
                        responseData.chatId = chatres.chatId;
                        done();
                    }).catch( err => {
                        let resp = commonMethods.catchError('chatController/saveHistory messsage-header', err);
                        response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                        res.status(resp.code).json(response);
                    })
                    
                },
                function(done)
                {
                    // 2. save header and create chat-id
                    let transactionHistory = {
                        chatId : responseData.chatId,
                        responseTimeInHours: issueTypeDetail.responseTime,
                        responsiblePerson: issueTypeDetail.responsiblePerson,
                        responseLevel: 1 // we will start conversation with level 1
                    };
                    
                    crudOperationModel.saveModel(messageTransaction, transactionHistory, {transactionId : 0})
                    .then( res => {
                        done();
                    }).catch( err => {
                        let resp = commonMethods.catchError('chatController/createChat messsage-transactionHistory', err);
                        response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                        res.status(resp.code).json(response);
                    })
                    
                },
                function(done)
                {
                    // 3. save data for sender and recipient data
                    let participants = [
                        {
                            chatId : responseData.chatId,
                            userId : employeeDetailsId,
                            userType : 1,
                            participantStatus : null, // not using for now 
                            readStatus : 1,
                            lastActive : new Date()
                        },
                        {
                            chatId : responseData.chatId,
                            userId : input.recipientId,
                            userType : 0,
                            participantStatus : null, // not using for now
                            readStatus : 0,
                            lastActive : new Date()
                        }
                    ];

                    crudOperationModel.bulkSave(messageParticipant, participants)
                    .then( partres => {
                        done();
                    }).catch( err => {
                        //let resp = commonMethods.catchError('chatController/saveHistory message-pariticipients', err);
                        response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                        res.status(resp.code).json(response);
                    })
                },
                function(done)
                {
                    var processItems = function(x){
                        if( x < input.messages.length ) {

                            let messageBody = '';
                            let item = input.messages[x];
                            if(item.type == 'content'){

                                item.content = item.content.replace(/\\n/g, "\\n")
                                        .replace(/\\'/g, "\\'")
                                        .replace(/\\"/g, '\\"')
                                        .replace(/\\&/g, "\\&")
                                        .replace(/\\r/g, "\\r")
                                        .replace(/\\t/g, "\\t")
                                        .replace(/\\b/g, "\\b")
                                        .replace(/\\f/g, "\\f");
                                // remove non-printable and other non-valid JSON chars
                                item.content = item.content.replace(/[\u0000-\u0019]+/g, "");

                                messageBody = JSON.stringify({"type": item.type, content: item.content})
                                
                            }else if(item.type == 'card'){
                                messageBody = JSON.stringify({"type": item.type, card: item.card})
                            }else if(item.type == 'chip'){
                                messageBody = JSON.stringify({"type": item.type, chip: item.chip})
                            }else if(item.type == 'grid'){
                                messageBody = JSON.stringify({"type": item.type, grid: item.grid})
                            }else if(item.type == 'carousel'){
                                messageBody = JSON.stringify({"type": item.type, carousel: item.carousel})
                            }else if(item.type == 'link'){
                                messageBody = JSON.stringify({"type": item.type, link: item.link})
                            }else if(item.type == 'media'){
                                messageBody = JSON.stringify({"type": item.type, media: item.media})
                            }else if(item.type == 'download'){
                                messageBody = JSON.stringify({"type": item.type, download: item.download})
                            }
                                
                            if(messageBody){
                                // 4. Save message Details 
                                let message = {
                                    chatId : responseData.chatId,
                                    postedBy : item.sentBy.toLowerCase() == 'bot' ?  -1 : employeeDetailsId,
                                    isForwardedMessage: 1,
                                    posterType : item.sentBy.toLowerCase() == 'bot' ?  0 : 1, 
                                    messageBody : messageBody,//item.messageType
                                    createdDate : new Date(),
                                    ip : ip.address()
                                };
                
                                crudOperationModel.saveModel(messageDetails, message, { messageId : 0 })
                                .then( msgres => {
                                    responseData.lastMessageId = msgres.messageId;
                                    processItems(x+1);
                                }).catch( err => {
                                    let resp = commonMethods.catchError('chatController/saveHistory message-detail', err);
                                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                    res.status(resp.code).json(response);
                                })
                            }
                        }
                        if(input.messages.length == x){
                            done();
                        }
                    };
                      
                    processItems(0);
                },
                function(done)
                {
                    // 5. get status of recipient 
                    chatModel.getUserStatus(input.recipientId, input.chatId)
                    .then( statusData => {

                        responseData.memberStatus.push({ recipientId : input.recipientId, status: statusData.status});
                        done()
                    })
                },  
                function(done)
                {
                    // 6. return message data and status of recipient in response
                    chatModel.getLatestMessageByChatId(responseData.chatId, 0)
                    .then( rs => {
                        responseData.issueTypeId = input.issueType;
                        responseData.issueType = 'Other';
                        responseData.messages = rs;
                        done()
                    })
                }

            ],function (err, response) {
                if (err) {
                    let resp = commonMethods.catchError('chatController/saveHistory', err);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                }
                else {
                    response = responseFormat.getResponseMessageByCodes('', { content: { dataList: [responseData] , messageList:{success:'Message saved successfully.'} }}); 
                    res.status(200).json(response);
                }
            })
        }
    }

    getIssueTypeByGroupId(req, res, next)
    {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let groupId = ~~req.params.groupId;

        let response = responseFormat.createResponseTemplate();
        let msgCode = [];

        if (!groupId || groupId < 1) {
            msgCode.push('groupId');
        }

        if (msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else 
        {
            crudOperationModel.findAllByCondition(messageSupportIssueType, { parentId: groupId }, ['supportId', 'issueName', 'responsiblePerson'], ['MessageSupportIssue_Id', 'ASC'])
            .then(resp => {
                if (resp.length) {
                    resp.forEach( item => {
                        item.keyId = item.supportId;
                        item.keyName = item.issueName;
                        item.recipientId = item.responsiblePerson;

                        delete item.supportId;
                        delete item.issueName;
                        delete item.responsiblePerson;
                    });
                    response = responseFormat.getResponseMessageByCodes('', { content: { dataList: resp } });
                    res.status(200).json(response);
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

}