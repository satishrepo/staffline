/**
 * -------Import all classes and packages -------------
 */
import MailProviderModel from '../../models/mailprovider/mailprovider-model';

import responseFormat from '../../core/response-format';
import configContainer from '../../config/localhost';
import logger from '../../core/logger';
import enums from '../../core/enums';
import async from 'async';
import CommonMethods from '../../core/common-methods';
import ip from 'ip';
import EmailModel from '../../models/emails/emails-model';

import { APP_REF_DATA } from "../../entities/common/app-ref-data";
import CrudOperationModel from '../../models/common/crud-operation-model';
import { EmployeeDetails, ResumeMaster } from '../../entities';
import { UserSession } from '../../entities/accounts/user-session';

import { mailProviderEventsHistory } from '../../entities/mailprovider/MailProviderEventsHistory';
import { mailTemplateReqestDataTemp } from '../../entities/mailprovider/MailTemplateReqestDataTemp';

/**
 *  -------Initialize variabls-------------
 */
let config = configContainer.loadConfig(),
    commonMethods = new CommonMethods(),
    mailProviderModel = new MailProviderModel(),
    crudOperationModel = new CrudOperationModel();

const emailModel = new EmailModel();

export default class MailProviderController {
    constructor() {
        //
    }

    saveResponse(req, res, next)
    {
        let response = responseFormat.createResponseTemplate();
        let eventBody = req.body;
        let self = this;


        let data = [
            {
               "email":"rahul@test.com",
               "timestamp":1513299569,
               "smtp-id":"<14c5d75ce93.dfd.64b469@ismtpd-555>",
               "event":"dropped",
               "category":"cat facts",
               "sg_event_id":"zmzJhfJgAfUSOW80yEbPyw==",
               "sg_message_id":"nm6h8KpvTv2-_TzUd7-J7Q",
               "reason":"Bounced Address",
               "status":"5.0.0"
            }
         ];
         console.log(typeof data);
         console.log(data.length);
        if(data)
        {
            async.series([

                function(done)
                {
                    // 1. save fistory
                    let history = {
                        messageId : data[0].sg_message_id,
                        eventType : data[0].event,
                        rawResponse : data,
                        createdOn : new Date()
                    };
                    
                    crudOperationModel.saveModel(mailProviderEventsHistory, history, {historyId : 0})
                    .then( chatres => {
                        done();
                    }).catch( err => {
                        let resp = commonMethods.catchError('mailProviderController/saveResponse mailProviderEventsHistory', err);
                        // response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                        // res.status(resp.code).json(response);
                        res.status(200).send(eventBody);
                    })
                },
                function(done)
                {
                    if(typeof data[0].event == 'string' && data[0].event == 'dropped')
                    {
                        crudOperationModel.findModelByCondition(mailTemplateReqestDataTemp, {mailServiceProviderMessageId : data[0].sg_message_id})
                        .then ( rs => {
                            if(rs)
                            {
                                // 1. Update data if hard bounse
                                let updateData = {
                                    isHardBounce : true,
                                    createddate : new Date()
                                };
                                
                                crudOperationModel.saveModel(mailTemplateReqestDataTemp, updateData, {historyId : rs.historyId})
                                .then( ress => {
                                    done();
                                }).catch( err => {
                                    let resp = commonMethods.catchError('mailProviderController/saveResponse mailTemplateReqestDataTemp', err);
                                    // response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                    // res.status(resp.code).json(response);
                                    res.status(200).send(eventBody);
                                })
                            }
                            else
                            {
                                let resp = commonMethods.catchError('mailProviderController/saveResponse mailTemplateReqestDataTemp', err);
                                // response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                // res.status(resp.code).json(response);
                                res.status(200).send(eventBody);
                            }
                        });
                    }
                    else
                    {
                        done();
                        res.status(200).send(eventBody);
                    }
                }
            ]);

        }
        else 
        {
            commonMethods.catchError('employeeonboarding-controller/saveEvents [UNHANDLED EVENT TRACK] - ', eventBody);
            res.status(200).send(eventBody);
        }
      
    }

    

}