/**
 *  -------Import all classes and packages -------------
 */
import responseFormat from '../../core/response-format';
import configContainer from '../../config/localhost';
import logger from '../../core/logger';
import EmailModel from '../../models/emails/emails-model';
import CommonMethods from '../../core/common-methods';
import ContactUsValidation from '../../validations/contactUs/contact-us-validation';
import enums from '../../core/enums';

/**
 *  -------Initialize global variabls-------------
 */
let config = configContainer.loadConfig(),
    commonMethods = new CommonMethods(),
    contactUsValidation = new ContactUsValidation();


export default class ContactUsController {
    constructor() {
        //
    }
    /**
         * Send contactUs Email
         * @param {*} req : HTTP request argument
         * @param {*} res : HTTP response argument
         * @param {*} next : Callback argument
         */
    postContactUs(req, res, next) {

        let response = responseFormat.createResponseTemplate(),
            requestType = req.body.requestType,
            firstName = req.body.firstName,
            lastName = req.body.lastName,
            fromEmail = req.body.email,
            mobileNo = req.body.mobileNo,
            comments = req.body.comments,
            msgCode = [];

        msgCode = contactUsValidation.contactUsValidation(req.body);
        if (msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        } else {

            const emailModel = new EmailModel();
            /**
             * send email
             */
            // emailModel.sendMail(enums.emailTemplateEvents.emailContactUs, firstName, config.contactUsToEmailId, null, null, null, null, null,
            //     lastName, fromEmail, null, comments.replace(/''/g, "'"), requestType, mobileNo);


            // email to HR about vacation request 
            let data_hr = [
                    {name : "TYPE", value : requestType},
                    {name : "USERNAME", value : (firstName+' '+lastName)},
                    {name : "USEREMAILID", value : fromEmail},
                    {name : "USERPHONE", value : commonMethods.toUSFormat(mobileNo)},
                    {name : "COMMENTS", value : comments}                   
                ];
            let options_hr = {        
                    mailTemplateCode : enums.emailConfig.codes.supportMails.support,
                    toMail : [{mailId : '', displayName : '',configKeyName : 'SUPPORTMAILID'}],                                                                    
                    placeHolders : data_hr,
                    replyToEmailid : fromEmail
            }
            
            emailModel.mail(options_hr, 'contact-us-controller/postContactUs support-mail')
            .then( rs =>{ })
            
            response = responseFormat.getResponseMessageByCodes(['success:contactUsSuccess']);
            res.status(200).json(response);
        }
    }
}