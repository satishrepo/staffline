/**
 *  -------Import all classes and packages -------------
 */


import CrudOperationModel from '../../models/common/crud-operation-model';
import EmailModel from '../../models/emails/emails-model';
import SupportModel from '../../models/support/support-model';
import responseFormat from '../../core/response-format';
import configContainer from '../../config/localhost';
import logger from '../../core/logger';
import CommonMethods from '../../core/common-methods';
import enums from '../../core/enums';
import moment from 'moment';
import path from 'path';
import async from 'async';
import emailVars from '../../core/email-vars';


// call entities
// import { APP_REF_DATA } from "../../entities/common/app-ref-data";
// import { NotificationCenter } from "../../entities/settings/notification-center";
// import { MessageCenter } from "../../entities/settings/message-center";
// import { MessageCenterDocument } from "../../entities/settings/message-center-document";
// import { AlertNotificationSetting } from "../../entities/settings/alert-notification-setting";
import { EmployeeDetails } from "../../entities/profileManagement/employee-details";



/**
 *  -------Initialize variabls-------------
 */
let config = configContainer.loadConfig(),
    commonMethods = new CommonMethods(),
    crudOperationModel = new CrudOperationModel(),
    supportModel = new SupportModel(),
    emailModel = new EmailModel();
    // settingsValidation = new SettingsValidation();
    

export default class SupportController {
    constructor() { }

    
    /**
    * Get Contacts
    * @param {*} req : HTTP request argument
    * @param {*} res : HTTP response argument
    * @param {*} next : Callback argument
    */

    getContacts(req, res, next)
    {
        // let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;

        let response = responseFormat.createResponseTemplate();    
        let out = {
                    "phone" : [{
                                "default": [],
                                "other" : []}
                                ],
                    "email": [{
                            "default": [],
                            "other": []}]
                };    
        
        supportModel.getContacts()
        .then(rs=>{ 
          
            rs.contacts.forEach( item => {
                if(item.default == 'y')
                {
                    out.phone[0].default.push({
                        label : item.key,
                        value : item.value,
                        employeeOnly : (item.employeeOnly ? 'yes' : 'no')
                    })
                }
                else
                {
                    out.phone[0].other.push({
                        label : item.key,
                        value : item.value,
                        employeeOnly : (item.employeeOnly ? 'yes' : 'no')
                    })
                }
            })

            rs.emails.forEach( item => {
                 if(item.default == 'y')
                {
                    out.email[0].default.push({
                        label : item.key,
                        value : item.value,
                        employeeOnly : (item.employeeOnly ? 'yes' : 'no')
                    })
                }
                else
                {
                    out.email[0].other.push({
                        label : item.key,
                        value : item.value,
                        employeeOnly : (item.employeeOnly ? 'yes' : 'no')
                    })
                }
            })

            response = responseFormat.getResponseMessageByCodes('', { content: { dataList:[out]}});
            res.status(200).json(response);

        }).catch(err => {
            let resp = commonMethods.catchError('support-controller/getContacts', err);
            response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });                
            res.status(resp.code).json(response);
        })
        
    }


     /**
    * Report a Bug
    * @param {*} req : HTTP request argument
    * @param {*} res : HTTP response argument
    * @param {*} next : Callback argument
    */

    reportABug(req, res, next)
    {   
        let employeeDetailsId = req.tokenDecoded ? req.tokenDecoded.data.employeeDetailsId : 0; 
        
        let response = responseFormat.createResponseTemplate(); 
        let msgCode = [];

        let comment = req.body.comment ? req.body.comment.trim() : '';
        let userName = req.body.userName ? req.body.userName.trim() : '';
        let email = req.body.email ? req.body.email.trim() : '';
        let phone = req.body.phone ? req.body.phone.trim() : '';
        let url = req.body.url ? req.body.url.trim() : '';

        if(!comment || comment == '')
        {
            msgCode.push('comment');
        }

        if (msgCode.length) 
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else 
        {

            async.series([
                function(done)
                {
                    if(employeeDetailsId)
                    {
                        crudOperationModel.findModelByCondition(EmployeeDetails, {employeeDetailsId : employeeDetailsId})
                        .then(user => {
                            if(user)
                            {
                                userName = user.firstName + ' '+user.lastName;
                                email = user.emailId;
                                done();
                            }

                        }).catch(err => {                            
                            let resp = commonMethods.catchError('support-controller/reportABug', err);
                            response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });                
                            res.status(resp.code).json(response);
                        })
                    }
                    else
                    {
                        // apply validation for userName

                        if(!userName || userName == '')
                        {
                            msgCode.push('userName');
                        }
                        if(!email || email == '')
                        {
                            msgCode.push('email');
                        }

                        if (msgCode.length) 
                        {
                            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
                            res.status(200).json(response);
                        }
                        else 
                        {
                            done();
                        }
                    }
                },
                function(done)
                {
                    // send email
                    // let dataArray = [userName, email, phone, comment];
                    // let emailObj = emailVars.reportABug;
                    // let toEmail = config.reportABugToEmailId;

                    // emailModel.sendEmail(dataArray, emailObj, toEmail);
                
                    // done();

                    // Email to applicant candidate 
                    let date = moment(new Date());

                    let body = [
                        { name: "USERNAME", value: userName },
                        { name: "USEREMAILID", value: email },
                        { name: "DATE", value: date.tz("Asia/Kolkata").format('MM-DD-YYYY') },
                        { name: "TIME", value: date.tz("Asia/Kolkata").format('h:mma') },
                        { name: "URL", value: url },
                        { name: "MESSAGECONTENT", value: commonMethods.nl2br(comment)}
                    ];
                    let options = {
                        mailTemplateCode: enums.emailConfig.codes.reportABug.code,
                        toMail: [{ mailId: '', displayName: '', configKeyName:'SUPPORTMAILID' }],
                        placeHolders: body
                    };

                    emailModel.mail(options, 'support-controller/reportABug mail process.')
                    .then(rs => { })

                    done();
                            
                }
            ],
            function(err, response)
            {
                if(err)
                {
                    let resp = commonMethods.catchError('support-controller/reportABug', err);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });                
                    res.status(resp.code).json(response);
                }
                else
                {
                    response = responseFormat.getResponseMessageByCodes(['success:requestSubmitted']);
                    res.status(200).json(response);
                }
            })
        }
        
    }


}