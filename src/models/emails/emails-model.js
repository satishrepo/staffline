/**
 *  -------Import all classes and packages ------------
 */
import { dbContext, Sequelize } from "../../core/db";
import mailer from "../../core/nodemailer";
import configContainer from "../../config/localhost";
import request from 'request';
import CommonMethods from '../../core/common-methods';

/**
 *  -------Initialize global variables-------------
 */
let config = configContainer.loadConfig();
let commonMethods = new CommonMethods();

export default class EmailModel {

    constructor() {
        //
    }

    /**
     * Get EmailTemplate By EventName
     * @param {*} eventName : name of event calling the sendMail method
     */
    getEmailTemplateByEventName(eventName) {
        let query = "EXEC API_SP_GetEmailTemplateByEventName @EventName=\'" + eventName + "\' ";
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                return details;
            });
    }

    /**
     * Send Mail
     * @param {*} eventName : name of event calling the sendMail method
     * @param {*} name : first name of employee
     * @param {*} email : email id of employee
     * @param {*} password : account password
     * @param {*} msg : message sent to the employee 
     * @param {*} redirecturl : url to redirect
     * @param {*} otp : otp received in email
     * @param {*} content : content of contact us email
     * @param {*} lastName : last name of employee
     * @param {*} fromEmail : logged in employee email 
     * @param {*} activationLink : link to activate account
     */

    sendMail(eventName, name, email, password, msg, redirecturl, otp, content, lastName, fromEmail, activationLink, comments, requestType, mobileNo) {

        this.getEmailTemplateByEventName(eventName)
            .then((emailTemplate) => {
                let emailBody = emailTemplate[0].TemplateHtml;
                emailBody = emailBody.replace("[NAME]", name).replace("[URL]", config.uiHostUrl)
                    .replace("[USERNAME]", email).replace("[PASSWORD]", password)
                    .replace("[MSG]", msg).replace("[REDIRECTURL]", redirecturl)
                    .replace("[REDIRECTURL1]", redirecturl).replace("[REDIRECTURL2]", redirecturl)
                    .replace("[EMAIL]", email).replace("[OTP]", otp)
                    .replace("[BODY]", content)
                    .replace("[LASTNAME]", lastName)
                    .replace("[FROMEMAIL]", fromEmail)
                    .replace("[HREF]", activationLink)
                    .replace("[COMMENTS]", comments)
                    .replace("[REQUESTTYPE]", requestType)
                    .replace("[MOBILENO]", mobileNo);

                /**
                 * send mail
                 */

                let toEmail = process.env.NODE_ENV == 'production' ? email : config.testEnvToEmail;

                mailer.sendEmail({
                    to: toEmail,
                    subject: emailTemplate[0].EmailSubject,
                    html: emailBody
                });
            });
    }

    /**
     * Add email in Email Queue table for sending mail by scheduler
     * @param {*} reqData : data in request body
     */
    setEmailQueue(reqData) {
        let query = "EXEC API_SP_SetEmailQueue @To=\'" + reqData.to + "\', @Cc=\'" + reqData.cc + "\',@Subject=\'" + reqData.subject + "\',@Body=\'" + reqData.body + "\' ";
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                return details;
            });
    }

    /**
     * Send Email
     * @param {*} dataArray : Array of values to set in email template
     * @param {*} emailObj : Object from email-vars which will be used to pass template name for db
     * @param {*} toEmail : Email address of recipient
     */

    sendEmail(dataArray, emailObj, toEmail)
    {  
        this.getEmailTemplateByEventName(emailObj.eventName)
            .then((emailTemplate) => {
                
                let emailBody = emailTemplate[0].TemplateHtml;

                let body = this.renderTemplate(dataArray, emailObj.params, emailBody);
             
                let toEmail = process.env.NODE_ENV == 'production' ? toEmail : config.testEnvToEmail;
                
                try
                {
                     mailer.sendEmail({
                        to: toEmail,
                        subject: emailTemplate[0].EmailSubject,
                        html: body
                    });  
                    return body;
                }
                catch(e)
                {
                    console.log('Email Send Error : ' + e);
                }
               
            })

         
    }

    renderTemplate(array, obj, template)
    {
        Object.keys(obj).map( (item, k) => { 
            obj[item] = array[k];
        });

        let output = template.replace(/\[(.*?)\]/g, function(match,b){
            return obj[b];
        });

        return output;
    }


    mail(options, calledFrom)
    {
       
       let settings = {
            method: 'POST',
            url: config.thirdPartyEmailApiUrl,
            body: options,
            timeout: 30000,
            json: true
        };
        let response = {};
        return new Promise(resolve => {
            request(settings, function (error, resp, body) 
            {
                console.log('Email Send body : ', body)
                if (error || body.code !== 200) 
                {   
                    console.log(options);
                    commonMethods.catchError('Error has occurred in '+ calledFrom +' in Email Send API. : ', (error || JSON.stringify(body)));
                    response.isSuccess = false;
                    response.message = body.description;
                    return resolve(response);
                }                   
                else 
                {       
                    response.isSuccess = true;
                    return resolve(response);
                }

            });
        })
    }
}