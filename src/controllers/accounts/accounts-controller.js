/**
 *  -------Import all classes and packages -------------
 */
import accountModel from '../../models/accounts/accounts-model';
import ProfileManagementModel from '../../models/profileManagement/profile-management-model';
import CrudOperationModel from '../../models/common/crud-operation-model';
import { AccountSignUp } from '../../entities/accounts/account-signup';
import { JobReferral } from '../../entities/jobs/job-referral';
import EmailModel from '../../models/emails/emails-model';
import responseFormat from '../../core/response-format';
import configContainer from '../../config/localhost';
import jwt from 'jsonwebtoken';
import OTPLib from '../../core/otp';
import request from 'request';
import google from 'googleapis';
import logger from '../../core/logger';
import PasswordPolicy from '../../core/pwd-policy';
import CoreUtils from '../../core/core-utils';
import CommonMethods from '../../core/common-methods';
import AccountValidation from '../../validations/accounts/accounts-validation';
import fieldsLength from '../../core/fieldsLength';
import enums from '../../core/enums';
import path from 'path';
import async from 'async';
import fs from 'fs';
import https from 'https';

import { AccountSignIn } from "../../entities/accounts/account-signin";
import { UserLoginDetail } from "../../entities/accounts/user-login-detail";
import { CandidateContact } from "../../entities/jobs/candidate-contact";
import { ResumeMaster } from "../../entities/profileManagement/resume-master";
import { EmployeeDetails } from '../../entities';

/** 
 * -------Initialize global variabls-------------
 */
let OAuth2 = google.auth.OAuth2,
    plus = google.plus('v1'),
    coreUtils = new CoreUtils(),
    config = configContainer.loadConfig(),
    commonMethods = new CommonMethods(),
    crudOperationModel = new CrudOperationModel(),
    profileManagementModel = new ProfileManagementModel(),
    accountValidation = new AccountValidation();

const emailModel = new EmailModel();


class AccountController {

    /**
     * Generate otp for 2 factor authentication
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */
    generateOTP(req, res, next) {
        let response = responseFormat.createResponseTemplate();
        if (req.body.userName) {

            if ((req.body.userName.toString()).length > fieldsLength.accounts.userName) {

                response = responseFormat.getResponseMessageByCodes(['userName'], { code: 417 });
                res.status(200).json(response);

            } else {
                accountModel.getUserByUserName(req.body.userName)
                    .then((user) => {
                        if (user && user.length) {
                            if (user[0].isAccountActivated == 1 && user[0].emp_status == enums.empStatus.status) {
                                response = responseFormat.getResponseMessageByCodes(['userName:deActivateAccount'], { code: 417 });
                                res.status(200).json(response);
                            } else {
                                accountModel.createOTP(user[0].EmployeeDetails_Id)
                                    .then((createResult) => {
                                        if (createResult) {
                                            /**
                                             * Send email
                                             */     
                          
                                            emailModel.sendMail(enums.emailTemplateEvents.emailEventOtp, user[0].First_Name, user[0].Email_Id, null, null, null, createResult);

                                            response = responseFormat.getResponseMessageByCodes(['success:otpSentSuccess']);
                                            res.status(200).json(response);
                                        } else {
                                            response = responseFormat.getResponseMessageByCodes(['common400'], { code: 400 });
                                            res.status(400).json(response);
                                        }

                                    })
                                    .catch((error) => {
                                        let resp = commonMethods.catchError('accounts-controller/generateOTP', error);
                                        response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                        res.status(resp.code).json(response);
                                    });
                            }
                        } else {
                            response = responseFormat.getResponseMessageByCodes(['userName'], { code: 417 });
                            res.status(200).json(response);
                        }
                    })
            }
        } else {
            response = responseFormat.getResponseMessageByCodes(['userName'], { code: 417 });
            res.status(200).json(response);
        }
    }

    /**
     * Get employee details after sign in
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */
    signIn(req, res, next) {
        let response = responseFormat.createResponseTemplate(),
            userName = req.body.userName,
            password = req.body.password ? req.body.password.replace(/'/g, "''") : '',
            msgCode = [];
        msgCode = accountValidation.signinValidation(req.body);

        if (msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        } else {
            this.getSignInDetails(userName, password, enums.signInType.normalSignIn)
            .then((resp) => { 
                if (resp.status == 200 && resp.response.code == 200) 
                {
                    let deviceId = (req.headers.deviceId || req.headers.DeviceId || req.headers.Deviceid || req.headers.deviceid);
                    crudOperationModel.updateAll(UserLoginDetail, {isDeviceLogin : 0}, {deviceId:deviceId})
                    .then( info => { 
                        // update database with device login info
                        commonMethods.addUserDevice(req.headers, resp.response.content.dataList[0].employeeDetailsId, 1, function(rs) { })
                    })
                }
                
                res.status(resp.status).json(resp.response);
            })
        }
    }

    /**
     * Re-Generate auth key for user before expires
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */
    routerPostGenerateAuth(req, res, next){
        let response = responseFormat.createResponseTemplate() 
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        if (employeeDetailsId) {
            accountModel.getUserById(employeeDetailsId)
            .then((userDetail) => {
                if(userDetail) {
                    accountModel.signIn(userDetail.Email_Id, userDetail.password)
                    .then((users) => { 
                        if (users && users.length) 
                        {
                            let token = jwt.sign({ data: { employeeDetailsId: users[0].employeeDetailsId } }, config.jwtSecretKey, {
                                expiresIn: '5d'
                            });
                            users[0].userAuthToken = token;
                            users[0].expiresOn = (new Date().getTime() + 60 * 60 * 120 * 1000);
                            response = responseFormat.getResponseMessageByCodes('', { content: { dataList: users } });
                            res.status(200).json(response)
                        } 
                        else 
                        {
                            let response = responseFormat.getResponseMessageByCodes(['common400'], { code: 400 });
                            res.status(200).json(response)
                        }
                    })
                }
            }).catch(err => {
                let resp = commonMethods.catchError('accounts-controller/routerPostGenerateAuth', err);
                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                res.status(resp.code).json(response);
            });
        }
    }

    /**
     * Employee sign out
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */
    signOut(req, res, next) {
        let response = responseFormat.createResponseTemplate();
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        if (employeeDetailsId) {
            accountModel.getUserById(employeeDetailsId)
            .then((isUsers) => {
                if (isUsers) {
                    accountModel.signOut(employeeDetailsId)
                    .then((users) => {

                        // update database with device login info
                        commonMethods.addUserDevice(req.headers, employeeDetailsId, 0, function(rs) { })
                        
                        response = responseFormat.getResponseMessageByCodes(['success:logOutSuccess']);
                        res.status(200).json(response);

                    }).catch((error) => {
                        let resp = commonMethods.catchError('accounts-controller/signOut', error);
                        response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                        res.status(resp.code).json(response);
                    })
                } else {
                    response = responseFormat.getResponseMessageByCodes(['invalidAuthToken'], { code: 417 });
                    res.status(200).json(response);
                }

            }).catch((error) => {
                let resp = commonMethods.catchError('accounts-controller/signOut', error);
                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                res.status(resp.code).json(response);
            })

        } else {
            response = responseFormat.getResponseMessageByCodes(['invalidAuthToken'], { code: 417 });
            res.status(200).json(response);
        }

    }


    resetPassword(req, res, next)
    {
        let response = responseFormat.createResponseTemplate(),
            code = req.body.code,
            newPassword = req.body.newPassword ? req.body.newPassword.replace(/'/g, "''") : '',
            confirmPassword = req.body.confirmPassword,
            msgCode = [];

        msgCode = accountValidation.resetPasswordValidation(req.body);

        if (msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        } else {

            /**
             * check password policy.
             */
            let pwdPolicy = this.checkPasswordPolicy(newPassword);
            if (!pwdPolicy.isSuccess) {
                response = responseFormat.getResponseMessageByCodes(['newPassword:password'], { code: 417 });
                res.status(200).json(response);
            } 
            else 
            {               
                commonMethods.decrypt(code)
                .then( dec => {
                    if(dec)
                    {
                        let userData = dec.split('||');
                        let timeDiff = (new Date().getTime() - userData[3])/(60*60*1000); 

                        if(userData[0] == 'PASSWORD' && timeDiff <= enums.activationCodeExpiraionTime)
                        {
                            accountModel.getUserByUserName(userData[2])
                            .then((data) => { 
                                if (data && data.length) 
                                {
                                    accountModel.changePassword({employeeDetailsId : data[0].EmployeeDetails_Id, newPassword : newPassword})
                                    .then((users) => {

                                        // let encKey = commonMethods.encrypt('SIGNUP||'+data[0].EmployeeDetails_Id+'||'+data[0].Email_Id+'||'+new Date().getTime());
                                        
                                        let body = [
                                            {name : "USERFIRSTNAME", value : data[0].First_Name},
                                            // {name : "USEREMAILID", value : data[0].Email_Id},
                                            // {name : "UNIQUECODE", value : encKey}
                                        ];

                                        let options = {        
                                            mailTemplateCode : enums.emailConfig.codes.passwordChanged.code,
                                            toMail : [{mailId : data[0].Email_Id, displayName : data[0].First_Name}],    
                                            placeHolders : body,
                                            fromName : enums.emailConfig.codes.passwordChanged.fromName,
                                            replyToEmailid : 'SUPPORTMAILID'                                         
                                        }
                                     
                                        emailModel.mail(options, 'account-controller/resetPassword')
                                        .then( rs =>{ })
                                                        
                                        this.getSignInDetails(data[0].Email_Id, newPassword, enums.signInType.normalSignIn)
                                        .then((resp) => {  
                                            if (resp.status == 200 && resp.response.code == 200) 
                                            {
                                                let deviceId = (req.headers.deviceId || req.headers.DeviceId || req.headers.Deviceid || req.headers.deviceid);
                                                crudOperationModel.updateAll(UserLoginDetail, {isDeviceLogin : 0}, {deviceId:deviceId})
                                                .then( info => { 
                                                    // update database with device login info
                                                    commonMethods.addUserDevice(req.headers, resp.response.content.dataList[0].employeeDetailsId, 1, function(rs) { })
                                                })
                                            }                                      
                                            res.status(resp.status).json(resp.response);
                                        })

                                    }).catch((error) => {
                                        let resp = commonMethods.catchError('accounts-controller/resetPassword', error);
                                        response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                        res.status(resp.code).json(response);
                                    })
                                }
                                else
                                {
                                    response = responseFormat.getResponseMessageByCodes(['errorText:code'], { code: 417 });
                                    res.status(200).json(response);
                                }
                            }).catch((error) => {
                                let resp = commonMethods.catchError('accounts-controller/resetPassword', error);
                                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                res.status(resp.code).json(response);
                            })
                        }
                        else
                        {
                            response = responseFormat.getResponseMessageByCodes(['codeExpired:expiredCode'], { code: 417 });
                            res.status(200).json(response);
                        }
                    }
                    else
                    {
                        response = responseFormat.getResponseMessageByCodes(['errorText:code'], { code: 417 });
                        res.status(200).json(response);
                    }
                   
                    
                })
            }
        }
    }

    /**
     * Crate Passowrd
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */
    postCreatePassword(req, res, next) {

        let response = responseFormat.createResponseTemplate(),
            msgCode = [],
            reqId = req.body.id,
            reqPassword = req.body.password ? req.body.password.replace(/'/g, "''") : '';


        msgCode = accountValidation.createPasswordValidation(req.body);

        if (msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        } else {

            let pwdPolicy = this.checkPasswordPolicy(reqPassword);
            if (!pwdPolicy.isSuccess) {
                response = responseFormat.getResponseMessageByCodes(['password:invalidPasswordRules'], { code: 417 });
                res.status(200).json(response);
            } else {

                // let employeeDetailsId = new Buffer(reqId.toString(), 'base64').toString('ascii');
                // let employeeDetailsId = commonMethods.decrypt(reqId.toString());

                commonMethods.decrypt(reqId.toString())
                    .then((decryptValue) => {

                        if ((!decryptValue) || isNaN(decryptValue)) {
                            response = responseFormat.getResponseMessageByCodes(['id'], { code: 417 });
                            res.status(200).json(response);
                        } else {
                            let employeeDetailsId = parseInt(decryptValue);
                            accountModel.getUserById(employeeDetailsId)
                                .then((data) => {
                                    if (data) {
                                        if (data.password && data.password != "null") {
                                            response = responseFormat.getResponseMessageByCodes(['password:passwordAlreadyCreated'], { code: 417 });
                                            res.status(200).json(response);
                                        } else {
                                            accountModel.updatePassword(employeeDetailsId, reqPassword)
                                                .then((id) => {
                                                    response = responseFormat.getResponseMessageByCodes(['success:passwordCreatedSuccess']);
                                                    res.status(200).json(response);
                                                })
                                                .catch((error) => {
                                                    let resp = commonMethods.catchError('accounts-controller/updatePassword', error);
                                                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                                    res.status(resp.code).json(response);
                                                })
                                        }
                                    } else {
                                        response = responseFormat.getResponseMessageByCodes(['id'], { code: 417 });
                                        res.status(200).json(response);
                                    }
                                })
                        }
                    })
                    .catch((error) => {
                        let resp = commonMethods.catchError('accounts-controller/updatePassword', error);
                        response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                        res.status(resp.code).json(response);
                    })

            }

        }

    }

    /**
     * Change password after login
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    changePassword(req, res, next) {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let response = responseFormat.createResponseTemplate(),
            // userName = req.body.userName,
            oldPassword = req.body.oldPassword,
            newPassword = req.body.newPassword ? req.body.newPassword.replace(/'/g, "''") : '',
            confirmPassword = req.body.confirmPassword,
            msgCode = [];
        msgCode = accountValidation.changePasswordValidation(req.body);

        if (msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else {
            /**
             * check password policy.
             */
            let pwdPolicy = this.checkPasswordPolicy(newPassword);

            if (!pwdPolicy.isSuccess) {
                response = responseFormat.getResponseMessageByCodes(['newPassword:password'], { code: 417 });
                res.status(200).json(response);
            }
            else {
                accountModel.checkOldPassword({ employeeDetailsId: employeeDetailsId, oldPassword: oldPassword })
                    .then((usersDetails) => {
                        if (usersDetails && usersDetails.length) {
                            accountModel.changePassword({ employeeDetailsId: employeeDetailsId, newPassword: newPassword })
                                .then((users) => {

                                    /**
                                     * send email
                                     */
                                    
                                    let body = [
                                        {name : "USERFIRSTNAME", value : usersDetails[0].First_Name}
                                    ];
                                    
                                    let options = {        
                                        mailTemplateCode : enums.emailConfig.codes.passwordChanged.code,
                                        toMail : [{mailId : usersDetails[0].Email_Id, displayName : usersDetails[0].First_Name, employeeId:employeeDetailsId}],    
                                        placeHolders : body,
                                        fromName : enums.emailConfig.codes.passwordChanged.fromName,
                                        replyToEmailid : 'SUPPORTMAILID'                                         
                                    };
                                    
                                    emailModel.mail(options, 'account-controller/resetPassword')
                                    .then( rs =>{ })
                                    
                                    response = responseFormat.getResponseMessageByCodes(['success:passwordChangedSuccess']);
                                    res.status(200).json(response);

                                }).catch((error) => {
                                    let resp = commonMethods.catchError('accounts-controller/changePassword', error);
                                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                    res.status(resp.code).json(response);
                                })
                        } else {
                            response = responseFormat.getResponseMessageByCodes(['oldPassword:invalidOldPassword'], { code: 417 });
                            res.status(200).json(response);
                        }
                    }).catch((error) => {
                        let resp = commonMethods.catchError('accounts-controller/changePassword', error);
                        response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                        res.status(resp.code).json(response);
                    })
            }
        }
    }

    /**
      * Employee sign in with linked in account
      * @param {*} req : HTTP request argument
      * @param {*} res : HTTP response argument
      * @param {*} next : Callback argument
      
      */
    linkedinSignIn(req, res, next) {
        let self = this;
        let response = responseFormat.createResponseTemplate(),
            msgCode = [], accessToken = req.body.accessToken, email = req.body.email;

        msgCode = accountValidation.socialSigninValidation(req.body);

        if ((msgCode).length > 0) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else {
            /**
             * get linkedin basic info
             */
            var reqUrl = {
                url: 'https://api.linkedin.com/v1/people/~:(id,emailAddress,firstName,lastName,public-profile-url,formatted-name,headline,industry,location,num-connections,summary,specialties,positions,picture-url,picture-urls::(original))?format=json',
                headers: {
                    'authorization': 'Bearer ' + accessToken,
                    'connection': 'Keep-Alive'
                }
            };
            request(reqUrl, function (error, responseProfile, rawBodyProfile) {
                if (responseProfile.statusCode == 401) {
                    response = responseFormat.getResponseMessageByCodes(['accessToken'], { code: 417 });
                    res.status(200).json(response);
                } else {
                    if (responseProfile.statusCode == 200) {
                        let bodyProfile = JSON.parse(rawBodyProfile),
                            details = {
                                email: bodyProfile.emailAddress,
                                firstName: bodyProfile.firstName,
                                lastName: bodyProfile.lastName
                            };


                        if (details.email) {
                            /**
                             * check request email with social media email
                             */
                            if (details.email == email) {
                                /**
                                 * sign in user
                                 */
                                self.socialSignIn(details, enums.socialMediaType.linkedin, (bodyProfile.pictureUrl || ''))
                                    .then((signInResp) => {
                                        if (signInResp.status) {
                                            res.status(200).json(signInResp.resp);
                                        }
                                        else {
                                            response = responseFormat.getResponseMessageByCodes(signInResp.msgCode, { code: 417 });
                                            res.status(200).json(response);
                                        }
                                    })
                                    .catch((response) => {
                                        response = responseFormat.getResponseMessageByCodes(signInResp.msgCode, { code: 417 });
                                        res.status(200).json(response);
                                    })
                            } else {
                                response = responseFormat.getResponseMessageByCodes(['email:emailNotMatchWithSocailEmail'], { code: 417 });
                                res.status(200).json(response);
                            }

                        } else {
                            response = responseFormat.getResponseMessageByCodes(['accessToken:socialEmailRequired'], { code: 417 });
                            res.status(200).json(response);
                        }
                    } else {
                        response = responseFormat.getResponseMessageByCodes(['accessToken:accessTokenExpired'], { code: 417 });
                        res.status(200).json(response);
                    }
                }
            })
        }
    }

    /**
   * Employee sign in with facebook in account
   * @param {*} req : HTTP request argument
   * @param {*} res : HTTP response argument
   * @param {*} next : Callback argument
   
   */

    facebookSignIn(req, res, next) {
        let self = this;
        let response = responseFormat.createResponseTemplate(),
            msgCode = [], accessToken = req.body.accessToken, email = req.body.email;

        msgCode = accountValidation.socialSigninValidation(req.body);

        if ((msgCode).length > 0) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else {
            let reqUrl = "https://graph.facebook.com/v2.9/me?fields=id,name,first_name,middle_name,last_name,email,gender,picture.width(100).height(100)&access_token=" + accessToken;

            request(reqUrl, function (errorProfile, responseProfile, rawBodyProfile) {

                // console.log('responseProfile', responseProfile)

                if (responseProfile.statusCode == 401 || responseProfile.statusCode == 400) {
                    response = responseFormat.getResponseMessageByCodes(['accessToken'], { code: 417 });
                    res.status(200).json(response);
                } else {
                    if (responseProfile.statusCode == 200) {

                        let bodyProfile = JSON.parse(rawBodyProfile),
                            details = {
                                email: bodyProfile.email,
                                firstName: bodyProfile.first_name,
                                lastName: bodyProfile.last_name
                            };


                        if (details.email) {
                            /**
                             * check request email with social media email
                             */
                            if (details.email == email) {
                                self.socialSignIn(details, enums.socialMediaType.facebook, bodyProfile.picture.data.url)
                                    .then((signInResp) => {
                                        if (signInResp.status) {
                                            res.status(200).json(signInResp.resp);
                                        }
                                        else {
                                            response = responseFormat.getResponseMessageByCodes(signInResp.msgCode, { code: 417 });
                                            res.status(200).json(response);
                                        }
                                    })
                                    .catch((response) => {
                                        response = responseFormat.getResponseMessageByCodes(signInResp.msgCode, { code: 417 });
                                        res.status(200).json(response);
                                    })

                            } else {
                                response = responseFormat.getResponseMessageByCodes(['email:emailNotMatchWithSocailEmail'], { code: 417 });
                                res.status(200).json(response);
                            }

                        } else {
                            response = responseFormat.getResponseMessageByCodes(['accessToken:socialEmailRequired'], { code: 417 });
                            res.status(200).json(response);
                        }
                    } else {
                        response = responseFormat.getResponseMessageByCodes(['accessToken:accessTokenExpired'], { code: 417 });
                        res.status(200).json(response);
                    }
                }
            });
        }
    }

    /**
    * Employee sign in with google in account
    * @param {*} req : HTTP request argument
    * @param {*} res : HTTP response argument
    * @param {*} next : Callback argument    
    */

    googleSignIn(req, res, next) {
        let self = this;
        let response = responseFormat.createResponseTemplate(),
            msgCode = [], accessToken = req.body.accessToken, email = req.body.email;

        msgCode = accountValidation.socialSigninValidation(req.body);

        if ((msgCode).length > 0) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else {
            let reqUrl = "https://www.googleapis.com/oauth2/v1/userinfo?access_token=" + accessToken;
            request(reqUrl, function (errorProfile, responseProfile, rawBodyProfile) {

                if (responseProfile.statusCode == 401) {
                    response = responseFormat.getResponseMessageByCodes(['accessToken'], { code: 417 });
                    res.status(200).json(response);
                } else {
                    if (responseProfile.statusCode == 200) {
                        let bodyProfile = JSON.parse(rawBodyProfile),
                            details = {
                                id: bodyProfile.id,
                                email: bodyProfile.email,
                                firstName: bodyProfile.given_name,
                                lastName: bodyProfile.family_name,
                                picture: bodyProfile.picture,
                                gender: bodyProfile.gender,
                                domain: bodyProfile.domain,
                                link: bodyProfile.link,
                            };

                        if (details.email) {
                            /**
                             * check request email with social media email
                             */
                            if (details.email == email) {

                                /**
                                 * sign in user
                                 */
                                self.socialSignIn(details, enums.socialMediaType.google, bodyProfile.picture)
                                    .then((signInResp) => {
                                        if (signInResp.status) {
                                            res.status(200).json(signInResp.resp);
                                        }
                                        else {
                                            response = responseFormat.getResponseMessageByCodes(signInResp.msgCode, { code: 417 });
                                            res.status(200).json(response);
                                        }
                                    })
                                    .catch((response) => {
                                        response = responseFormat.getResponseMessageByCodes(signInResp.msgCode, { code: 417 });
                                        res.status(200).json(response);
                                    })
                            } else {
                                response = responseFormat.getResponseMessageByCodes(['email:emailNotMatchWithSocailEmail'], { code: 417 });
                                res.status(200).json(response);
                            }

                        } else {
                            response = responseFormat.getResponseMessageByCodes(['accessToken:socialEmailRequired'], { code: 417 });
                            res.status(200).json(response);
                        }
                    } else {
                        response = responseFormat.getResponseMessageByCodes(['accessToken:accessTokenExpired'], { code: 417 });
                        res.status(200).json(response);
                    }
                }
            });
        }
    }


    googleSignIn1(req, res, next) {
        let self = this;
        let response = responseFormat.createResponseTemplate();
        if (req.body.code) {
            let oauth2Client = new OAuth2(config.googleConfig.googleClientID, config.googleConfig.googleClientSecret, config.googleConfig.redirect_url),
                code = req.body.code;

            oauth2Client.getToken(code, (error, tokens) => {
                if (!error) {

                    //console.log('tokens:', tokens);

                    let reqUrl = "https://www.googleapis.com/oauth2/v1/userinfo?access_token=" + tokens.access_token;  // "https://graph.facebook.com/v2.9/me?fields=id,name,first_name,middle_name,last_name,email,gender,picture.type(large)&access_token=" + accessToken;

                    request(reqUrl, function (errorProfile, responseProfile, rawBodyProfile) {
                        if (responseProfile.statusCode == 200) {
                            let bodyProfile = JSON.parse(rawBodyProfile);
                            //console.log('bodyProfileascasv:', bodyProfile);
                        }
                    });
                    return;
                    oauth2Client.setCredentials(tokens);

                    plus.people.get({ userId: 'me', auth: oauth2Client }, (error, response) => {
                        if (!error) {

                            let profileData = {
                                id: response.id,
                                emailAddress: (response.emails && response.emails.length > 0) ? response.emails[0].value : "",
                                firstName: response.name.givenName,
                                lastName: response.name.familyName,
                                full_name: response.displayName,
                                gender: response.gender,
                                domain: response.domain
                            }

                            if (profileData.emailAddress) {
                                /**
                                 * Check user is exist or not
                                 */
                                accountModel.checkEmailExist(profileData.emailAddress)
                                    .then((user) => {
                                        if (!user || user.length < 1) {
                                            let reqBody = {
                                                firstName: profileData.firstName, lastName: profileData.lastName, email: profileData.emailAddress, password: null, empStatus: 'A'
                                                , isAccountActivated: 1
                                                , sourceId: enums.employeeDefaultValues.defaultSourceId
                                                , entityGroup: enums.employeeDefaultValues.defaultEntityGroup
                                                , resumeMasterStatus: enums.resumeMasterStatus.Active
                                                , companyMasterId: enums.compnayMaster.default
                                            }
                                            accountModel.signUp(reqBody)
                                                .then((users) => {
                                                    if (users && users[0].EmployeeDetails_Id > 0) {

                                                        /**
                                                         * Generate OTP
                                                         */
                                                        accountModel.createOTP(users[0].EmployeeDetails_Id)
                                                            .then((createResult) => {
                                                                if (createResult) {
                                                                    /**
                                                                     * send mail 
                                                                     */
                                                                    let redirectUrl = config.uiHostUrl + config.socialMediaPasswordChange;
                                                         
                                                                    emailModel.sendMail(enums.emailTemplateEvents.emailEventWelcomeSocialMedia, reqBody.firstName, reqBody.email, null, null, redirectUrl, createResult);
                                                                }
                                                                else {
                                                                    logger.error('Error has occured in account-controller/googleSignIn  createOTP value null.');
                                                                    response = responseFormat.getResponseMessageByCodes(['common400'], { code: 400 });
                                                                    res.status(400).json(response);
                                                                }
                                                            })
                                                            .catch((error) => {
                                                                let resp = commonMethods.catchError('accounts-controller/googleSignIn createOTP', error);
                                                                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                                                res.status(resp.code).json(response);
                                                            });

                                                        /**
                                                         * user login
                                                         */
                                                        self.getSignInDetails(reqBody.email, null, enums.signInType.socialSignIn)
                                                            .then((resp) => {
                                                                res.status(resp.status).json(resp.response);
                                                            })
                                                            .catch((error) => {
                                                                let resp = commonMethods.catchError('accounts-controller/googleSignIn createOTP', error);
                                                                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                                                res.status(resp.code).json(response);
                                                            })

                                                    } else {
                                                        let resp = commonMethods.catchError('account-controller/googleSignIn EmployeeDetails_Id not found', error);
                                                        response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                                        res.status(resp.code).json(response);
                                                    }
                                                }).catch((error) => {
                                                    let resp = commonMethods.catchError('accounts-controller/googleSignIn', error);
                                                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                                    res.status(resp.code).json(response);
                                                })
                                        } else {
                                            /**
                                             * user login
                                             */
                                            self.getSignInDetails(profileData.emailAddress, null, enums.signInType.socialSignIn)
                                                .then((resp) => {
                                                    res.status(resp.status).json(resp.response);
                                                })
                                                .catch((error) => {
                                                    let resp = commonMethods.catchError('accounts-controller/googleSignIn', error);
                                                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                                    res.status(resp.code).json(response);
                                                })
                                        }

                                    }).catch((error) => {
                                        let resp = commonMethods.catchError('accounst-controller/googleSignIn', error);
                                        response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                        res.status(resp.code).json(response);
                                    })
                            }
                            else {
                                response = responseFormat.getResponseMessageByCodes(['code:socialEmailRequired'], { code: 417 });
                                res.status(200).json(response);
                            }

                        } else {
                            response = responseFormat.getResponseMessageByCodes(['code:accessTokenExpired'], { code: 417 });
                            res.status(200).json(response);
                        }
                    });
                } else {
                    logger.error('Error has occured in account-controller/googleSignIn check gmail code', error);
                    response = responseFormat.getResponseMessageByCodes(['code:invalidCode'], { code: 417 });
                    res.status(200).json(response);

                }
            });
        } else {
            response = responseFormat.getResponseMessageByCodes(['code:requestCodeRequired'], { code: 417 });
            res.status(200).json(response);
        }
    }


    getProfilePicture(sourceUrl) {
        return new Promise((resolve, reject) => {
            if (!sourceUrl) {
                return resolve({ success: true, message: null })
            }

            let r = request.defaults({ encoding: null });
           
            r.get(sourceUrl, function (error, response, body) { 
                if (!error && response.statusCode == 200) 
                {
                    let encodedBody = body.toString('base64');
                    let fileName = 'profile.jpg';
                    let pictureVars = enums.uploadType.userPicture;

                    commonMethods.imageProcess(encodedBody)
                    .then( dt => 
                    {
                        if(dt.success)
                        {
                            commonMethods.fileUpload(dt.fileData, fileName, pictureVars.docTypeId)
                            .then((docFileUpload) => {

                                if (docFileUpload.isSuccess) {
                                    return resolve({ success: true, message: docFileUpload.fileName });
                                }
                                else {
                                    return resolve({ success: false, message: docFileUpload.msgCode[0] });
                                }
                            }).catch(error => {
                                return reject(error);
                            })
                        }
                        else
                        {
                            return reject(dt.error);
                        }
                    });
                }
                else {
                    return resolve({ success: true, message: null })
                }
            })
        })

    }


    /**
    * 
    * @param {*} details :Request body
    * @param {*} socialMediaType :socialMediaType
    */
    socialSignIn(details, socialMediaType, sourceUrl) {
        let self = this;
        return new Promise((resolve, reject) => {
            let email = details.email,
                firstName = details.firstName,
                lastName = details.lastName,
                profilePicture = (details.profilePicture || null),
                msgResp = {
                    status: false,
                    msgCode: [],
                    resp: responseFormat.createResponseTemplate()
                }
            accountModel.checkEmailExist(email)
            .then((user) => {
                if (!user || user.length < 1) 
                {
                    let reqBody = {
                        firstName: firstName,
                        lastName: lastName,
                        email: email,
                        password: null,
                        empStatus: 'A',
                        isAccountActivated: 1,
                        sourceId: enums.employeeDefaultValues.defaultSourceId,
                        entityGroup: enums.employeeDefaultValues.defaultEntityGroup,
                        resumeMasterStatus: enums.resumeMasterStatus.Unverified,
                        companyMasterId: enums.compnayMaster.default
                    }


                    self.getProfilePicture(sourceUrl)
                    .then(rs => { 
                        if (rs.success) {
                            reqBody.profilePicture = rs.message || null;

                            accountModel.signUp(reqBody)
                            .then((users) => { 
                                if (users && users[0].EmployeeDetails_Id > 0) 
                                {
                                
                                    /**
                                     * send mail
                                     */

                                    let encKey = commonMethods.encrypt('SIGNUP||'+users[0].EmployeeDetails_Id+'||'+email+'||'+new Date().getTime());

                                    let data = [
                                            {name : "USERFIRSTNAME", value :firstName},
                                            //{name : "USEREMAILID", value : email},
                                            //{name : "UNIQUECODE", value : encKey}
                                        ];
                                    let options = {        
                                        mailTemplateCode : enums.emailConfig.codes.socialSignup.code,
                                        toMail : [{mailId : email, displayName : firstName}],                                                                    
                                        placeHolders : data,
                                        replyToEmailid : 'SUPPORTMAILID'                                         
                                    };
                                
                                    emailModel.mail(options, 'account-controller/socialSignIn')
                                    .then( rs =>{ })
                                                
                                                
                                    /**
                                     * user login
                                     */
                                    self.getSignInDetails(reqBody.email, null, enums.signInType.socialSignIn)
                                        .then((resp) => { 
                                            resp.response.content.dataList[0]['isSignup'] = 'y';
                                            msgResp.status = true;
                                            msgResp.resp = resp.response;
                                            resolve(msgResp);
                                        })
                                        .catch((error) => {
                                            logger.error('Error has occured in accounts-controller/' + socialMediaType, error);
                                            msgResp.msgCode.push('common400');
                                            reject(msgResp);
                                        })
                                } else {
                                    logger.error('Error has occured in accounts-controller/' + socialMediaType + ' EmployeeDetails_Id not found.', error);
                                    msgResp.msgCode.push('common400');
                                    reject(msgResp);
                                }

                            }).catch((error) => {
                                logger.error('Error has occured in account-controller/' + socialMediaType + ' signUp process.', error);
                                msgResp.msgCode.push('common400');
                                reject(msgResp);
                            })
                        }
                        else {
                            // response = responseFormat.getResponseMessageByCodes(['fileName:'+rs.message], { code: 417 });
                            // res.status(200).json(response);
                            logger.error('Error has occured in account-controller/' + socialMediaType + ' signUp process.', rs.message);
                            msgResp.msgCode.push('common400');
                            reject(msgResp);
                        }

                    }).catch(error => {
                        let resp = commonMethods.catchError('accounts-controller/getProfilePicture', error);
                        let response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                        msgResp.msgCode = response.message;
                        reject(msgResp);
                    })



                } 
                else 
                {
                    /**
                     * user login
                     */
                    
                        async.series([
                            function(done)
                            {
                            // check if user profile-picture is not set then get it from social site

                            if(!user.ProfilePicture)
                            {
                                self.getProfilePicture(sourceUrl)
                                .then(rs => {
                                        if (rs.success) 
                                        {
                                        let upData = {ProfilePicture : (rs.message || null) };

                                        crudOperationModel.saveModel(AccountSignIn, upData, {EmployeeDetails_Id : user.EmployeeDetails_Id}) 
                                        .then( rs1 => {
                                            done();
                                        })
                
                                    }
                                    else {                                           
                                        logger.error('Error has occured in account-controller/' + socialMediaType + ' signUp process.', rs.message);
                                        msgResp.msgCode.push('common400');
                                        reject(msgResp);
                                    }
                                })
                            }
                            else
                            {
                                done();
                            }
                            },
                            function(done)
                            {
                            self.getSignInDetails(email, null, enums.signInType.socialSignIn)
                            .then((resp) => {
                                // console.log(resp.response.content.dataList[0])
                                resp.response.content.dataList[0]['isSignup'] = 'n';
                                msgResp.status = true;
                                msgResp.resp = resp.response;
                                resolve(msgResp);
                            })
                            .catch((error) => {
                                logger.error('Error has occured in account-controller/' + socialMediaType, error);
                                msgResp.msgCode.push('common400');
                                reject(msgResp);
                            })
                            }
                        ], function(error, response)
                        {
                            if(error)
                            {
                            logger.error('Error has occured in account-controller/' + socialMediaType + ' signUp process.', error);
                            msgResp.msgCode.push('common400');
                            reject(msgResp);
                            }
                            else
                            {
                            msgResp.status = true;
                            msgResp.resp = resp.response;
                            resolve(msgResp);
                            }
                        })

                }
            }).catch((error) => {
                logger.error('Error has occured in account-controller/' + socialMediaType + ' signUp process.', error);
                msgResp.msgCode.push('common400');
                reject(msgResp);
            })
        })
    }



    loginWithCode(req, res, next)
    {
        // this is created for login from ATS where user-active check is being removed
        let code = req.body.code;
        let response = responseFormat.createResponseTemplate();
        let msgCode = [];
        let self = this;

        if (!code) {
            msgCode.push('errorText:code');
        }
        
        if (msgCode.length) 
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else
        {        
            commonMethods.decrypt(code)
            .then( dec => {
                if(dec)
                {
                    let userData = dec.split('||');
                    let employeeDetailsId = userData[1];
                    let email = userData[2];
                    let timeDiff = (new Date().getTime() - userData[3])/(60*60*1000);

                    crudOperationModel.findAllByCondition(AccountSignIn, {EmployeeDetails_Id : employeeDetailsId, Email_Id: email})
                    .then( rs => { 
                        if(rs.length)
                        { 
                            if(userData[0] == 'LOGIN' && timeDiff <= enums.activationCodeExpiraionTime)
                            {
                                // if(rs[0].emp_status == 'A' && rs[0].isAccountActivated == 1)
                                // {
                                    // return login details for autologin process
                                    self.getSignInDetails(email, rs[0].password, enums.signInType.normalSignIn)
                                    .then((resp) => { 
                                        if (resp.status == 200 && resp.response.code == 200) 
                                        {
                                            let deviceId = (req.headers.deviceId || req.headers.DeviceId || req.headers.Deviceid || req.headers.deviceid);
                                            crudOperationModel.updateAll(UserLoginDetail, {isDeviceLogin : 0}, {deviceId:deviceId})
                                            .then( info => { 
                                                // update database with device login info
                                                commonMethods.addUserDevice(req.headers, resp.response.content.dataList[0].employeeDetailsId, 1, function(rs) { })
                                            })
                                        }                                    
                                        res.status(resp.status).json(resp.response);
                                    })
                                // }
                                // else
                                // {
                                //     response = responseFormat.getResponseMessageByCodes(['errorText:inactiveAccount'], { code: 417 });
                                //     res.status(200).json(response);
                                // }
                            }
                            else
                            {
                                response = responseFormat.getResponseMessageByCodes(['codeExpired:expiredCode'], { code: 417 });
                                res.status(200).json(response);
                            }
                            
                        }
                        else
                        { 
                            response = responseFormat.getResponseMessageByCodes(['codeExpired:invalidCode'], { code: 417 });
                            res.status(200).json(response);
                        }
                    })
                }
                else
                {
                    response = responseFormat.getResponseMessageByCodes(['codeExpired:invalidCode'], { code: 417 });
                    res.status(200).json(response);
                }
                
            })

        }
    }
    
    privilegeAccess(req, res, next)
    {
        // this is created for login from ATS where user-active check is being removed
        let code = req.body.code;
        let response = responseFormat.createResponseTemplate();
        let msgCode = [];
        let self = this;

        if (!code) {
            msgCode.push('errorText:code');
        }
        
        if (msgCode.length) 
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else
        {        
            commonMethods.decrypt(code)
            .then( dec => {
                if(dec)
                {
                    let userData = dec.split('||');
                    let employeeDetailsId = userData[1];
                    let email = userData[2];
                    let timeDiff = (new Date().getTime() - userData[3])/(60*60*1000);

                    crudOperationModel.findAllByCondition(AccountSignIn, {EmployeeDetails_Id : employeeDetailsId, Email_Id: email})
                    .then( rs => { 
                        if(rs.length)
                        { 
                            if(userData[0] == 'LOGIN' && timeDiff <= enums.activationCodeExpiraionTime)
                            {
                                // return login details for autologin process
                                self.getSignInDetails4PrivilegeAccess(email, rs[0].password, enums.signInType.normalSignIn)
                                .then((resp) => { 
                                    if (resp.status == 200 && resp.response.code == 200) 
                                    {
                                        let deviceId = (req.headers.deviceId || req.headers.DeviceId || req.headers.Deviceid || req.headers.deviceid);
                                        crudOperationModel.updateAll(UserLoginDetail, {isDeviceLogin : 0}, {deviceId:deviceId})
                                        .then( info => { 
                                            // update database with device login info
                                            commonMethods.addUserDevice(req.headers, resp.response.content.dataList[0].employeeDetailsId, 1, function(rs) { })
                                        })
                                    }                                    
                                    res.status(resp.status).json(resp.response);
                                });
                            }
                            else
                            {
                                response = responseFormat.getResponseMessageByCodes(['codeExpired:expiredCode'], { code: 417 });
                                res.status(200).json(response);
                            }
                        }
                        else
                        { 
                            response = responseFormat.getResponseMessageByCodes(['codeExpired:invalidCode'], { code: 417 });
                            res.status(200).json(response);
                        }
                    })
                }
                else
                {
                    response = responseFormat.getResponseMessageByCodes(['codeExpired:invalidCode'], { code: 417 });
                    res.status(200).json(response);
                }
                
            })

        }
    }
    __Backup_autoLoginWithCode(req, res, next)
    {
        // this is created for login from ATS where user-active check is being removed
        let code = req.body.code;
        let response = responseFormat.createResponseTemplate();
        let msgCode = [];
        let self = this;

        if (!code) {
            msgCode.push('errorText:code');
        }
        
        if (msgCode.length) 
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else
        {        
            commonMethods.decrypt(code)
            .then( dec => {
                if(dec)
                {
                    let userData = dec.split('||');
                    let employeeDetailsId = userData[1];
                    let email = userData[2];
                    let timeDiff = (new Date().getTime() - userData[3])/(60*60*1000);

                    crudOperationModel.findAllByCondition(AccountSignIn, {EmployeeDetails_Id : employeeDetailsId, Email_Id: email})
                    .then( rs => { 
                        if(rs.length)
                        { 
                            if(userData[0] == 'LOGIN' && timeDiff <= 500)
                            {
                                if(rs[0].emp_status == 'A' && rs[0].isAccountActivated == 1)
                                {
                                    // return login details for autologin process
                                    self.getSignInDetails(email, rs[0].password, enums.signInType.normalSignIn)
                                    .then((resp) => {  
                                        if (resp.status == 200 && resp.response.code == 200) 
                                        {
                                            let deviceId = (req.headers.deviceId || req.headers.DeviceId || req.headers.Deviceid || req.headers.deviceid);
                                            crudOperationModel.updateAll(UserLoginDetail, {isDeviceLogin : 0}, {deviceId:deviceId})
                                            .then( info => { 
                                                // update database with device login info
                                                commonMethods.addUserDevice(req.headers, resp.response.content.dataList[0].employeeDetailsId, 1, function(rs) { })
                                            })
                                        }                                   
                                        res.status(resp.status).json(resp.response);
                                    })
                                }
                                else
                                {
                                    response = responseFormat.getResponseMessageByCodes(['errorText:inactiveAccount'], { code: 417 });
                                    res.status(200).json(response);
                                }
                            }
                            else
                            {
                                response = responseFormat.getResponseMessageByCodes(['codeExpired:invalidCode'], { code: 417 });
                                res.status(200).json(response);
                            }
                            
                        }
                        else
                        { 
                            response = responseFormat.getResponseMessageByCodes(['codeExpired:invalidCode'], { code: 417 });
                            res.status(200).json(response);
                        }
                    })
                }
                else
                {
                    response = responseFormat.getResponseMessageByCodes(['codeExpired:invalidCode'], { code: 417 });
                    res.status(200).json(response);
                }
                
            })

        }
    }

    /**
     * Common methods for get employee details on signin
     * @param {*} userName : email or employeeDetailsId
     * @param {*} password : account password
     */
    getSignInDetails(userName, password, signinType) {
        let resp = { status: 200, response: responseFormat.createResponseTemplate() },
            isSelfRegisterd = false;
        return accountModel.getUserByUserName(userName)
            .then((isUser) => { 
                if (isUser && isUser.length) 
                {
                    if (signinType == enums.signInType.normalSignIn && isUser[0].loginAccess == -1) 
                    {
                        resp.response = responseFormat.getResponseMessageByCodes(['deActivateAccount', 'Signin:deActivateAccount'], { code: 417 });
                        return resp;

                    }
                    else if (signinType == enums.signInType.normalSignIn && isUser[0].isAccountActivated == 0) 
                    {
                        //check user is self registered or not
                        if (isUser[0].Password && isUser[0].Password != null && isUser[0].Password != "null")
                        { 
                            isSelfRegisterd = true; 
                        }
                        resp.response = responseFormat.getResponseMessageByCodes(['accountNotActivated'], { code: 417, content: { dataList: [{ isSelfRegisterd: isSelfRegisterd }] } });
                        return resp;

                    }
                    

                    return accountModel.signIn(userName, password)
                    .then((users) => { 
                        if (users && users.length) 
                        {
                            let token = jwt.sign({ data: { employeeDetailsId: users[0].employeeDetailsId } }, config.jwtSecretKey, {
                                expiresIn: '1d'
                            });
                            users[0].userAuthToken = token;
                            users[0].expiresOn = (new Date().getTime() + 60 * 60 * 24 * 1000);
                            resp.response = responseFormat.getResponseMessageByCodes('', { content: { dataList: users } });
                            return resp;
                        } 
                        else 
                        {
                            let responseNormal = responseFormat.getResponseMessageByCodes(['Signin:invalidUserNamePassword'], { code: 417 });
                            let responseSocial = responseFormat.getResponseMessageByCodes(['common400'], { code: 400 });
                            resp.status = (signinType == enums.signInType.normalSignIn) ? 200 : 400;
                            resp.response = (signinType == enums.signInType.normalSignIn) ? responseNormal : responseSocial;
                            return resp;
                        }
                    })
                } 
                else 
                {
                    resp.response = responseFormat.getResponseMessageByCodes(['Signin:invalidUserNamePassword'], { code: 417 });
                    return resp;
                }
            })

    }
    getSignInDetails4PrivilegeAccess(userName, password, signinType) {

        let resp = { status: 200, response: responseFormat.createResponseTemplate() },
            isSelfRegisterd = false;
        return accountModel.getUserByUserName(userName)
            .then((isUser) => { 
                if (isUser && isUser.length) 
                {
                    /**
                     * check user is activated
                     */
                    // if (signinType == enums.signInType.normalSignIn && isUser[0].loginAccess == -1) 
                    // {
                    //     resp.response = responseFormat.getResponseMessageByCodes(['Signin:deActivateAccount'], { code: 417 });
                    //     return resp;

                    // }
                    // else if (signinType == enums.signInType.normalSignIn && isUser[0].isAccountActivated == 0) 
                    // {
                    //     //check user is self registered or not
                    //     if (isUser[0].Password && isUser[0].Password != null && isUser[0].Password != "null")
                    //     { 
                    //         isSelfRegisterd = true; 
                    //     }
                    //     resp.response = responseFormat.getResponseMessageByCodes(['accountNotActivated'], { code: 417, content: { dataList: [{ isSelfRegisterd: isSelfRegisterd }] } });
                    //     return resp;

                    // }
                    

                    return accountModel.signIn(userName, password)
                    .then((users) => { 
                        if (users && users.length) 
                        {
                            let token = jwt.sign({ data: { employeeDetailsId: users[0].employeeDetailsId } }, config.jwtSecretKey, {
                                expiresIn: '1d'
                            });
                            users[0].userAuthToken = token;
                            users[0].expiresOn = (new Date().getTime() + 60 * 60 * 24 * 1000);
                            resp.response = responseFormat.getResponseMessageByCodes('', { content: { dataList: users } });
                            return resp;
                        } 
                        else 
                        {
                            let responseNormal = responseFormat.getResponseMessageByCodes(['Signin:invalidUserNamePassword'], { code: 417 });
                            let responseSocial = responseFormat.getResponseMessageByCodes(['common400'], { code: 400 });
                            resp.status = (signinType == enums.signInType.normalSignIn) ? 200 : 400;
                            resp.response = (signinType == enums.signInType.normalSignIn) ? responseNormal : responseSocial;
                            return resp;
                        }
                    })
                } 
                else 
                {
                    resp.response = responseFormat.getResponseMessageByCodes(['Signin:invalidUserNamePassword'], { code: 417 });
                    return resp;
                }
            })

    }
    __Backup__getSignInDetails(userName, password, signinType) {
        let resp = { status: 200, response: responseFormat.createResponseTemplate() },
            isSelfRegisterd = false;
        return accountModel.getUserByUserName(userName)
            .then((isUser) => { 
                if (isUser && isUser.length) 
                {
                    /**
                     * check user is activated
                     */
                    if (isUser[0].emp_status == "I") 
                    {
                        if (signinType == enums.signInType.normalSignIn && isUser[0].isAccountActivated == 1) 
                        {
                            resp.response = responseFormat.getResponseMessageByCodes(['Signin:deActivateAccount'], { code: 417 });
                            return resp;
                        } 
                        else if (signinType == enums.signInType.normalSignIn && isUser[0].isAccountActivated == 0) 
                        {
                            //check user is self registered or not
                            if (isUser[0].Password && isUser[0].Password != null && isUser[0].Password != "null")
                            { 
                                isSelfRegisterd = true; 
                            }
                            resp.response = responseFormat.getResponseMessageByCodes(['accountNotActivated'], { code: 417, content: { dataList: [{ isSelfRegisterd: isSelfRegisterd }] } });
                            return resp;
                        }
                        else {
                            /**
                             * activate user and blank password if login with social login
                             */
                            accountModel.activateUserAfterSocialLogin(isUser[0].EmployeeDetails_Id);
                        }
                    }

                    return accountModel.signIn(userName, password)
                        .then((users) => { 
                            if (users && users.length) 
                            {
                                let token = jwt.sign({ data: { employeeDetailsId: users[0].employeeDetailsId } }, config.jwtSecretKey, {
                                    expiresIn: '1d'
                                });
                                users[0].userAuthToken = token;
                                users[0].expiresOn = (new Date().getTime() + 60 * 60 * 24 * 1000);
                                resp.response = responseFormat.getResponseMessageByCodes('', { content: { dataList: users } });
                                return resp;
                            } 
                            else 
                            {
                                let responseNormal = responseFormat.getResponseMessageByCodes(['Signin:invalidUserNamePassword'], { code: 417 });
                                let responseSocial = responseFormat.getResponseMessageByCodes(['common400'], { code: 400 });
                                resp.status = (signinType == enums.signInType.normalSignIn) ? 200 : 400;
                                resp.response = (signinType == enums.signInType.normalSignIn) ? responseNormal : responseSocial;
                                return resp;
                            }
                        })
                } 
                else 
                {
                    resp.response = responseFormat.getResponseMessageByCodes(['Signin:invalidUserNamePassword'], { code: 417 });
                    return resp;
                }
            })

    }

    /**
     * common methods for check password policy.
     * @param {*} password : Account password
     */
    checkPasswordPolicy(password) {

        let passwordPolicy = new PasswordPolicy();
        let msgCode = [],
            returnResp = {
                isSuccess: true,
                response: null,
                messages: []
            }

        let pwdPolicyMsg = passwordPolicy.validate(password);

        if (pwdPolicyMsg.issues && pwdPolicyMsg.issues.length) {
            returnResp.isSuccess = false;

            for (let i = 0; i < pwdPolicyMsg.issues.length; i++) {
                returnResp.messages.push(pwdPolicyMsg.issues[i].reason);
            }

            // returnResp.response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            return returnResp;
        }
        return returnResp;
    }

    /**
     * User account activation after sign up.
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */
    accountActivate(req, res, next) {
        let response = responseFormat.createResponseTemplate(),
            msgCode = [],
            userName = req.body.userName,
            otpCode = req.body.otpCode;
        msgCode = accountValidation.accountActivate(req.body);
        if (msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else {
            // reqId=reqId.toString();
            accountModel.getUserByUserName(userName)
                .then((data) => {

                    if (data && data.length) {
                        /**
                         * verify otp
                         */
                        accountModel.verifyOTP(data[0].EmployeeDetails_Id, otpCode)
                            .then((success) => {
                                if (success.expire) {
                                    response = responseFormat.getResponseMessageByCodes(['otpCode:otpExpired'], { code: 417 });
                                    res.status(200).json(response);
                                } else if (success.valid) {
                                    if ((data[0].isAccountActivated) && data[0].isAccountActivated == 1) {
                                        // response = responseFormat.getResponseMessageByCodes(['userName:accountAlreadyActivated'], { code: 417 });
                                        // res.status(200).json(response);

                                        this.getSignInDetails(userName, data[0].Password, enums.signInType.normalSignIn)
                                            .then((resp) => {
                                                if (resp.status == 200 && resp.response.code == 200) 
                                                {
                                                    let deviceId = (req.headers.deviceId || req.headers.DeviceId || req.headers.Deviceid || req.headers.deviceid);
                                                    crudOperationModel.updateAll(UserLoginDetail, {isDeviceLogin : 0}, {deviceId:deviceId})
                                                    .then( info => { 
                                                        // update database with device login info
                                                        commonMethods.addUserDevice(req.headers, resp.response.content.dataList[0].employeeDetailsId, 1, function(rs) { })
                                                    })
                                                } 
                                                res.status(resp.status).json(resp.response);
                                            })

                                    } else {
                                        accountModel.emailActivate(data[0].EmployeeDetails_Id)
                                            .then((id) => {
                                                this.getSignInDetails(userName, data[0].Password, enums.signInType.normalSignIn)
                                                .then((resp) => {
                                                    if (resp.status == 200 && resp.response.code == 200) 
                                                    {
                                                        let deviceId = (req.headers.deviceId || req.headers.DeviceId || req.headers.Deviceid || req.headers.deviceid);
                                                        crudOperationModel.updateAll(UserLoginDetail, {isDeviceLogin : 0}, {deviceId:deviceId})
                                                        .then( info => { 
                                                            // update database with device login info
                                                            commonMethods.addUserDevice(req.headers, resp.response.content.dataList[0].employeeDetailsId, 1, function(rs) { })
                                                        })
                                                    }
                                                    res.status(resp.status).json(resp.response);
                                                })
                                            })
                                            .catch((error) => {
                                                let resp = commonMethods.catchError('accounts-controller/accountActivate', error);
                                                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                                res.status(resp.code).json(response);
                                            })
                                    }
                                } else {
                                    response = responseFormat.getResponseMessageByCodes(['otpCode'], { code: 417 });
                                    res.status(200).json(response);
                                }
                            })
                            .catch((error) => {
                                let resp = commonMethods.catchError('accounts-controller/accountActivate account verification', error);
                                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                res.status(resp.code).json(response);
                            })
                    } else {
                        response = responseFormat.getResponseMessageByCodes(['userName'], { code: 417 });
                        res.status(200).json(response);
                    }
                })
        }
    }


    /**
     * 
     */

    postResendEmail(req, res, next) {
        let response = responseFormat.createResponseTemplate(),
            msgCode = [];
        if (req.body.userName) {
            if ((req.body.userName.toString()).length > fieldsLength.accounts.userName) {
                response = responseFormat.getResponseMessageByCodes(['userName'], { code: 417 });
                res.status(200).json(response);
            } else {
                accountModel.getUserByUserName(req.body.userName)
                    .then((user) => {
                        if (user && user.length) {
                            if (user[0].emp_status == 'A' && user[0].isAccountActivated == 1) {
                                response = responseFormat.getResponseMessageByCodes(['userName:accountAlreadyActivated'], { code: 417 });
                                res.status(200).json(response);
                            } else {
                                accountModel.createOTP(user[0].EmployeeDetails_Id)
                                    .then((createResult) => {
                                        if (createResult) {
                                           
                                            let accActivate = config.uiHostUrl + config.accountActivationUrl;
                                            emailModel.sendMail(enums.emailTemplateEvents.emailEventAccountActivate, user[0].First_Name, user[0].Email_Id, null, null, accActivate, createResult, null, null, null, null);
                                            response = responseFormat.getResponseMessageByCodes(['success:accountActivatelink']);
                                            res.status(200).json(response);
                                        } else {
                                            response = responseFormat.getResponseMessageByCodes(['common400'], { code: 400 });
                                            res.status(400).json(response);
                                        }

                                    })
                                    .catch((error) => {
                                        let resp = commonMethods.catchError('accounts-controller/postResendEmail', error);
                                        response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                        res.status(resp.code).json(response);
                                    });
                            }

                        } else {
                            response = responseFormat.getResponseMessageByCodes(['userName'], { code: 417 });
                            res.status(200).json(response);
                        }
                    })
            }
        } else {
            response = responseFormat.getResponseMessageByCodes(['userName'], { code: 417 });
            res.status(200).json(response);
        }
    }


    /**
     * Methods for model validation testing 
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     
     */


    signUp(req, res, next) { 
        let response = responseFormat.createResponseTemplate(),
            firstName = req.body.firstName,
            lastName = req.body.lastName,
            email = req.body.email,
            password = req.body.password,
            reCaptchaCode = req.body.reCaptchaCode,
            termsAndConditions = req.body.termsAndConditions,
            resumeFileName = req.body.resumeFileName,
            resumeFile = req.body.resumeFile,
            uid = req.body.uid,
            msgCode = [],
            self = this; 

        let resumeVars = enums.uploadType.userResume;
        let newUserInfo = {};

        msgCode = accountValidation.signupValidation(req.body, resumeVars.allowedExt);

        if (msgCode && msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else {
            /**
             * check password policy.
             */
            let pwdPolicy = self.checkPasswordPolicy(password);
            if (!pwdPolicy.isSuccess) {
                response = responseFormat.getResponseMessageByCodes(['password'], { code: 417 });
                res.status(200).json(response);
            }
            else {
                async.waterfall([
                    function (done) {
                        accountModel.checkEmailExist(email)
                            .then((data) => {
                                if (data) {
                                    response = responseFormat.getResponseMessageByCodes(['email:emailExists'], { code: 417 });
                                    res.status(200).json(response);
                                }
                                else {
                                    done();
                                }
                            })
                    },
                    function (done) {
                        if (typeof reCaptchaCode == 'undefined') {
                            done();
                        }
                        else {
                            /**
                             * check catcha validate req.connection.remoteAddress will provide IP address of connected user.
                             */
                            var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret="
                                + config.reCaptcha.secretKey + "&response=" + reCaptchaCode + "&remoteip=" + req.connection.remoteAddress;

                            /**
                             *  Hitting GET request to the URL, Google will respond with success or error scenario.
                             */
                            request(verificationUrl, function (error, response, body) {
                                body = JSON.parse(body);
                                /**
                                 *  Success will be true or false depending upon captcha validation.
                                 */
                                if (body.success !== undefined && !body.success) {
                                    response = responseFormat.getResponseMessageByCodes(['reCaptchaCode'], { code: 417 });
                                    res.status(200).json(response);
                                }
                                else {

                                    done();
                                }
                            })
                        }
                    },  
                    function(done) {
                        // invitation table entry
                        // if invitation present 
                        if(uid)
                        {
                            commonMethods.decrypt(uid)
                            .then( dec => {
                                if(dec)
                                { 
                                    let userData = dec.split('||'); 
                                    let referrerInvite = false;
                                    
                                    let diffInDays = (new Date().getTime() - userData[3])/(24*60*60*1000); 
                                    
                                    // check if user referred job and applying for self reffered job 
                                    
                                    if(userData[0] == 'JOBSHAREDBY' && diffInDays <= enums.referValidity)
                                    {   
                                        crudOperationModel.findModelByCondition(CandidateContact, {
                                            contactEmail : email, 
                                            invitationDate : { $ne : null },
                                            status : { $ne : null},
                                        }).then( inv => {
                                            if(inv)
                                            { 
                                                // check if invitation if 90 days older 
                                                let diff = (new Date().getTime() - new Date(inv.invitationDate).getTime())/(24*60*60*1000); 
    
                                                if(diff > enums.referValidity)
                                                {
                                                    // create invitation by referrer
                                                    referrerInvite = true
                                                }
                                                
                                            }
                                            else
                                            {
                                                //create invitation by referrer
                                                referrerInvite = true
                                            }

                                            if(referrerInvite)
                                            {   
                                                // get referrer resumeId
                                                crudOperationModel.findModelByCondition( ResumeMaster, {employeeDetailsId : userData[1]})
                                                .then( r => {

                                                    let inviteData = {
                                                        candidateResumeId : r.resumeId,
                                                        contactName : firstName + ' ' + lastName || '',
                                                        contactEmail : email,
                                                        invitationDate : new Date(),
                                                        status : enums.contactStatus.invited,
                                                        createdDate : new Date(),
                                                        isSocialShare : 1, 
                                                        jobId : userData[2],
                                                        applicableBonus : enums.sponsoreBonus
                                                    }

                                                    crudOperationModel.saveModel(CandidateContact, inviteData, {candidateResumeId : userData[1], contactEmail : email})
                                                    .then( inv1 => {
                                                        done()
                                                    })
                                                })
                                            }
                                            else
                                            {
                                                done()
                                            }
                                        })
                                    }
                                    else
                                    {
                                        done()
                                    }
                                }
                                else
                                {
                                    done()
                                }
                            })
                        }
                        else
                        {
                            done()
                        }
                    },               
                    function (done) {
                        req.body.empStatus = enums.empStatus.activeStatus;
                        req.body.isAccountActivated = enums.empStatus.inActive;
                        req.body.sourceId = enums.employeeDefaultValues.defaultSourceId;
                        req.body.entityGroup = enums.employeeDefaultValues.defaultEntityGroup;
                        req.body.resumeMasterStatus = enums.resumeMasterStatus.Unverified;
                        req.body.jobSearchStatus = enums.employeeDefaultValues.defaultRefferedJobSearchStatus;
                        req.body.companyMasterId = enums.compnayMaster.default;

                        accountModel.signUp(req.body)
                        .then((users) => {
                            if (users && users[0].EmployeeDetails_Id > 0) {

                                newUserInfo = users[0];

                                if (req.body.resumeFile && req.body.resumeFileName) {

                                    commonMethods.fileUpload(req.body.resumeFile, req.body.resumeFileName, resumeVars.docTypeId)
                                    .then((docFileUpload) => {
                                        if (docFileUpload.isSuccess) {

                                            let resumeDoc = {
                                                resumeId: users[0].resumeId,
                                                filePath: docFileUpload.fileName, //resumeVars.path +
                                                fileName: req.body.resumeFileName,
                                                isPrimary: 1,
                                                docType: enums.doc.type.resume,
                                                createdBy: users[0].EmployeeDetails_Id,
                                                createdDate: new Date()
                                            };

                                            profileManagementModel.updateCandidateResume(resumeDoc)
                                                .then(rs => {

                                                    // call Resume-Parser API 
                                                    accountModel.parseResume(resumeDoc.resumeId, req.body.resumeFileName, req.body.resumeFile, 'accounts-controller/signUp')
                                                    .then(parse => { })
                                                    
                                                    done(null, users);
                                                }).catch(error => {
                                                    let resp = commonMethods.catchError('accounts-controller/signUp', error);
                                                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                                    res.status(resp.code).json(response);
                                                })

                                        }
                                        else {
                                            response = responseFormat.getResponseMessageByCodes(['resumeFileName:' + docFileUpload.msgCode[0]], { code: 417 });
                                            res.status(200).json(response);
                                        }
                                    }).catch(error => {
                                        let resp = commonMethods.catchError('accounts-controller/signUp file-upload', error);
                                        response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                        res.status(resp.code).json(response);
                                    })

                                }
                                else {
                                    done(null, users);
                                    // response = responseFormat.getResponseMessageByCodes(['resumeFile:invalidDocType'], { code: 417 });
                                    // res.status(400).json(response);
                                }

                            }
                            else {

                                response = responseFormat.getResponseMessageByCodes(['common400'], { code: 400 });
                                res.status(400).json(response);
                            }
                        }).catch((error) => {
                            let resp = commonMethods.catchError('accounts-controller/signUp file-upload', error);
                            response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                            res.status(resp.code).json(response);
                        })
                    },
                    function(user, done)
                    { 
                        let encKey = commonMethods.encrypt('SIGNUP||'+user[0].EmployeeDetails_Id+'||'+email+'||'+new Date().getTime());
                     
                        let data = [
                                {name : "USERFIRSTNAME", value : firstName},
                                {name : "USEREMAILID", value : email},
                                {name : "UNIQUECODE", value : encKey}
                            ];
                        let options = {        
                                mailTemplateCode : enums.emailConfig.codes.signup.code,
                                toMail : [{mailId : email, displayName : firstName}],                              
                                placeHolders : data,
                                replyToEmailid : 'SUPPORTMAILID'
                        }

                        emailModel.mail(options, 'account-controller/signup')
                        .then( rs =>{ })
                        
                        done();
                    },

                ], function (err, result) {

                    if (err) {
                        if (err == 'resumeFile') {
                            response = responseFormat.getResponseMessageByCodes(['resumeFileName'], { code: 417 });
                            res.status(400).json(response);
                        }
                        else if (err == 'email') {
                            response = responseFormat.getResponseMessageByCodes(['email:emailExists'], { code: 417 });
                            res.status(200).json(response);
                        }
                        else {
                            let resp = commonMethods.catchError('accounts-controller/signUp file-upload', error);
                            response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                            res.status(resp.code).json(response);
                        }
                    }
                    else {
                        let result = {
                            employeeDetailsId : newUserInfo.EmployeeDetails_Id 
                        }
                        // response = responseFormat.getResponseMessageByCodes(['success:accountActivatelink']);
                        response = responseFormat.getResponseMessageByCodes('', { content: 
                                { 
                                    dataList: [result] , 
                                    messageList:{success:'An email with the account activation link has been sent to your email ID.'} 
                                }}); 

                        res.status(200).json(response);
                    }
                });
            }
        }
    }


    /* Account verification And Activate account and return login data 
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */


    accountVerifyAndActivate(req, res, next)
    {
        let code = req.body.code;
        let response = responseFormat.createResponseTemplate();
        let msgCode = [];

        if (!code) {
            msgCode.push('errorText:code');
        }
        
        if (msgCode.length) 
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else
        {        
            commonMethods.decrypt(code)
            .then( dec => {
                if(dec)
                {
                    let userData = dec.split('||');
                    let employeeDetailsId = userData[1];
                    let email = userData[2];
                    let timeDiff = (new Date().getTime() - userData[3])/(60*60*1000); 

                    crudOperationModel.findAllByCondition(AccountSignIn, {EmployeeDetails_Id : employeeDetailsId, Email_Id: email})
                    .then( rs => { 
                        if(rs.length)
                        { 
                            if (rs[0].emp_status == 'A' && rs[0].isAccountActivated == 1) 
                            {
                                response = responseFormat.getResponseMessageByCodes(['alreadyActivated:accountAlreadyActivated'], { code: 417 });
                                res.status(200).json(response);
                            }
                            else
                            {
                                if(userData[0] == 'SIGNUP' && timeDiff <= enums.activationCodeExpiraionTime)
                                {
                                    accountModel.emailActivate(employeeDetailsId)
                                    .then((success) => {
                                        if(success)
                                        { 
                                            // return login details for autologin process
                                            this.getSignInDetails(email, rs[0].password, enums.signInType.normalSignIn)
                                            .then((resp) => {        
                                                if (resp.status == 200 && resp.response.code == 200) 
                                                {
                                                    let deviceId = (req.headers.deviceId || req.headers.DeviceId || req.headers.Deviceid || req.headers.deviceid);
                                                    crudOperationModel.updateAll(UserLoginDetail, {isDeviceLogin : 0}, {deviceId:deviceId})
                                                    .then( info => { 
                                                        // update database with device login info
                                                        commonMethods.addUserDevice(req.headers, resp.response.content.dataList[0].employeeDetailsId, 1, function(rs) { })
                                                    })
                                                }                             
                                                res.status(resp.status).json(resp.response);
                                            })
                                        }
                                        else
                                        {
                                            response = responseFormat.getResponseMessageByCodes(['codeExpired:invalidCode'], { code: 417 });
                                            res.status(200).json(response);
                                        }
                                    })
                                    .catch((error) => {
                                        let resp = commonMethods.catchError('accounts-controller/accountActivate', error);
                                        response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                        res.status(resp.code).json(response);
                                    })
                                }
                                else
                                {
                                    response = responseFormat.getResponseMessageByCodes(['codeExpired:expiredCode'], { code: 417 });
                                    res.status(200).json(response);
                                }
                            }
                        }
                        else
                        { 
                            response = responseFormat.getResponseMessageByCodes(['codeExpired:invalidCode'], { code: 417 });
                            res.status(200).json(response);
                        }
                    })
                }
                else
                {
                    response = responseFormat.getResponseMessageByCodes(['codeExpired:invalidCode'], { code: 417 });
                    res.status(200).json(response);
                }
                
            })

        }
    }

    /* Forgot password - Send Activation Link to reset password
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */

    forgotPassword(req, res, next)
    {
        let userName = req.body.userName ? req.body.userName.trim() : '';
        let response = responseFormat.createResponseTemplate();
        let msgCode = [];

        if(!userName)
        {
            msgCode.push('userName');
        }
        
        if (msgCode.length) 
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else
        {
            accountModel.getUserByUserName(userName)
            .then( user => {  
                if(user.length)
                {
                    let encKey = commonMethods.encrypt('PASSWORD||'+user[0].EmployeeDetails_Id+'||'+user[0].Email_Id+'||'+new Date().getTime());
                    let data = [
                                {name : "USERFIRSTNAME", value : user[0].First_Name},
                                {name : "USEREMAILID", value : user[0].Email_Id},
                                {name : "UNIQUECODE", value : encKey}
                        ];
                    let options = {        
                            mailTemplateCode : enums.emailConfig.codes.forgotPassword.code,
                            toMail : [{mailId : user[0].Email_Id, displayName : user[0].First_Name}],                            
                            placeHolders : data,
                            fromName : enums.emailConfig.codes.forgotPassword.fromName,
                            replyToEmailid : 'SUPPORTMAILID'
                    }

                    emailModel.mail(options, 'account-controller/forgotPassword')
                    .then( rs =>{ })

                    response = responseFormat.getResponseMessageByCodes(['success:resetPasswordMail']);
                    res.status(200).json(response);
                }
                else
                {
                    // send email to Non-Registered email Id
                    if(userName && commonMethods.validateEmailid(userName))
                    {
                        let data = [
                                    // {name : "USERFIRSTNAME", value : user[0].First_Name},
                                    {name : "USEREMAILID", value : userName},
                                    // {name : "UNIQUECODE", value : encKey}
                            ];
                        let options = {        
                                mailTemplateCode : enums.emailConfig.codes.forgotPasswordUnreg.code,
                                toMail : [{mailId : userName, displayName : userName}],  
                                placeHolders : data,
                                fromName : enums.emailConfig.codes.forgotPasswordUnreg.fromName,                     
                                replyToEmailid : 'SUPPORTMAILID'
                        }
                        
                        emailModel.mail(options, 'account-controller/forgotPassword non-registered')
                        .then( rs =>{ })
                    }

                    response = responseFormat.getResponseMessageByCodes(['success:resetPasswordMail']);
                    res.status(200).json(response);
                }
            })
        }
    }

    resendActivationMail(req, res, next)
    {
        let userName = req.body.userName;
        let code = req.body.code;
        let utmParams = req.body.utmParams || {};

        let response = responseFormat.createResponseTemplate();
        let msgCode = [];

        if (msgCode.length) 
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else
        {
            let qString = '';
            // if(Array.isArray(utmParams) && utmParams.length)
            // {
            //     for(let a in utmParams)
            //     { 
            //         qString += '&'+(Object.keys(utmParams[a]))+ '='+ utmParams[a][Object.keys(utmParams[a])] 
            //     }
            // }

            if(Object.keys(utmParams).length)
            {
                for(var i in utmParams)
                {
                    qString += '&'+i+'='+utmParams[i]
                }
            }

            
            if(userName)
            {
                accountModel.getUserByUserName(userName)
                .then( user => {  
                    if(user.length)
                    {
                        if (user[0].emp_status == 'A' && user[0].isAccountActivated == 1) 
                        {
                            response = responseFormat.getResponseMessageByCodes(['userName:accountAlreadyActivated'], { code: 417 });
                            res.status(200).json(response);
                        }
                        else
                        {
                            let encKey = commonMethods.encrypt('SIGNUP||'+user[0].EmployeeDetails_Id+'||'+user[0].Email_Id+'||'+new Date().getTime());
                            let data = [
                                        {name : "USERFIRSTNAME", value : user[0].First_Name},
                                        {name : "USEREMAILID", value : user[0].Email_Id},
                                        {name : "UNIQUECODE", value : encKey}
                                ];
                            let options = {        
                                    mailTemplateCode : enums.emailConfig.codes.signup.code,
                                    toMail : [{mailId : user[0].Email_Id, displayName : user[0].First_Name}],                            
                                    placeHolders : data,
                                    replyToEmailid : 'SUPPORTMAILID'                                         
                            }

                            emailModel.mail(options, 'account-controller/resendActivationMail')
                            .then( rs =>{ })

                            let rsp = {
                                emailId: user[0].Email_Id
                            };

                            response = responseFormat.getResponseMessageByCodes(['success:accountActivatelink'], { content: { dataList: [rsp] } });
                            res.status(200).json(response);
                                
                        }
                    }
                    else
                    {
                        response = responseFormat.getResponseMessageByCodes(['errorText:userName'], { code: 417 });
                        res.status(200).json(response);
                    }
                })
            }
            else if(code)
            {
                commonMethods.decrypt(code)
                .then( dec => { 
                    if(dec)
                    {
                        let userData = dec.split('||');
                        let employeeDetailsId = userData[1];
                        let email = userData[2];
                        let timeDiff = (new Date().getTime() - userData[3])/(60*60*1000); 
  
                        accountModel.getUserByUserName(email)
                        .then( user => {  
                            if(user.length)
                            {    
                                if(userData[0] == 'SIGNUP' ) //&& timeDiff > enums.activationCodeExpiraionTime
                                {
                                   
                                    if (user[0].emp_status == 'A' && user[0].isAccountActivated == 1) 
                                    {
                                        response = responseFormat.getResponseMessageByCodes(['errorText:accountAlreadyActivated'], { code: 417 });
                                        res.status(200).json(response);
                                    }
                                    else
                                    {
                                        let encKey = commonMethods.encrypt('SIGNUP||'+user[0].EmployeeDetails_Id+'||'+user[0].Email_Id+'||'+new Date().getTime());
                                        let data = [
                                                    {name : "USERFIRSTNAME", value : user[0].First_Name},
                                                    {name : "USEREMAILID", value : user[0].Email_Id},
                                                    {name : "UNIQUECODE", value : encKey+qString}
                                            ];
                                        let options = {        
                                                mailTemplateCode : enums.emailConfig.codes.signup.code,
                                                toMail : [{mailId : user[0].Email_Id, displayName : user[0].First_Name}],                            
                                                placeHolders : data,
                                                replyToEmailid : 'SUPPORTMAILID'                                         
                                        }

                                        emailModel.mail(options, 'account-controller/resendActivationMail')
                                        .then( rs =>{ })

                                        let rsp = {
                                            emailId: user[0].Email_Id
                                        };

                                        response = responseFormat.getResponseMessageByCodes(['success:accountActivatelink'], { content: { dataList: [rsp] } });
                                        res.status(200).json(response);
                                            
                                    }
                               
                                }
                                else if(userData[0] == 'PASSWORD')
                                {
                                    let encKey = commonMethods.encrypt('PASSWORD||'+user[0].EmployeeDetails_Id+'||'+user[0].Email_Id+'||'+new Date().getTime());
                                    let data = [
                                                {name : "USERFIRSTNAME", value : user[0].First_Name},
                                                {name : "USEREMAILID", value : user[0].Email_Id},
                                                {name : "UNIQUECODE", value : encKey}
                                        ];
                                    let options = {        
                                            mailTemplateCode : enums.emailConfig.codes.forgotPassword.code,
                                            toMail : [{mailId : user[0].Email_Id, displayName : user[0].First_Name}],                            
                                            placeHolders : data,
                                            fromName : enums.emailConfig.codes.forgotPassword.fromName, 
                                            replyToEmailid : 'SUPPORTMAILID'                                         
                                    }

                                    emailModel.mail(options, 'account-controller/forgotPassword')
                                    .then( rs =>{ })

                                    let rsp = {
                                        emailId: user[0].Email_Id
                                    };

                                    response = responseFormat.getResponseMessageByCodes(['success:resetPasswordMail'], { content: { dataList: [rsp] } });
                                    res.status(200).json(response);
                                }
                                else
                                {
                                    response = responseFormat.getResponseMessageByCodes(['errorText:invalidCode'], { code: 417 });
                                    res.status(200).json(response);
                                }
                            }
                            else
                            {
                                response = responseFormat.getResponseMessageByCodes(['errorText:invalidCode'], { code: 417 });
                                res.status(200).json(response);
                            
                            }
                        })

                    }
                    else
                    {
                        response = responseFormat.getResponseMessageByCodes(['errorText:invalidCode'], { code: 417 });
                        res.status(200).json(response);
                    }
                })
            }
            else
            {
                response = responseFormat.getResponseMessageByCodes(['errorText:codeORusername'], { code: 417 });
                res.status(200).json(response);
            }
        }
    }


    verifyCode(req, res, next)
    {
        let code = req.body.code;
        let response = responseFormat.createResponseTemplate();
        let msgCode = [];

        if (!code) {
            msgCode.push('code');
        }
        
        if (msgCode.length) 
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else
        {        
            commonMethods.decrypt(code)
            .then( dec => {
                if(dec)
                {
                    let userData = dec.split('||');
                    let employeeDetailsId = userData[1];
                    let email = userData[2];
                    let timeDiff = (new Date().getTime() - userData[3])/(60*60*1000); 
                    
                    if((userData[0] == 'SIGNUP' || userData[0] == 'PASSWORD') && timeDiff <= enums.activationCodeExpiraionTime)
                    {
                        response = responseFormat.getResponseMessageByCodes(['success:validCode']);
                        res.status(200).json(response);
                    }
                    else
                    {
                        response = responseFormat.getResponseMessageByCodes(['code:expiredCode'], { code: 417 });
                        res.status(200).json(response);
                    }
                }
                else
                {
                    response = responseFormat.getResponseMessageByCodes(['code:invalidCode'], { code: 417 });
                    res.status(200).json(response);
                }
                
            })

        }
    }

    createPassword(req, res, next) {

        let response = responseFormat.createResponseTemplate(),
            employeeDetailsId = req.tokenDecoded.data.employeeDetailsId,
            msgCode = [],            
            reqPassword = req.body.password,
            reqConfirmPassword = req.body.confirmPassword;


        if(!reqPassword || reqPassword == '')
        {
            msgCode.push('password')
        }
        if(!reqConfirmPassword || reqConfirmPassword == '')
        {
            msgCode.push('confirmPassword')
        }
        else if(reqPassword != reqConfirmPassword)
        {
            msgCode.push('confirmPassword:passwordMismatch')
        }
       
        if (msgCode.length) 
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        } 
        else 
        {

            let pwdPolicy = this.checkPasswordPolicy(reqPassword);
            
            if (!pwdPolicy.isSuccess) 
            {
                response = responseFormat.getResponseMessageByCodes(['password'], { code: 417 });
                res.status(200).json(response);
            } 
            else 
            {
  
                accountModel.getUserById(employeeDetailsId)
                .then((data) => { 
                    if (data) 
                    {
                        if (data.password && data.password != "null") 
                        {
                            response = responseFormat.getResponseMessageByCodes(['password:passwordAlreadyExists'], { code: 417 });
                            res.status(200).json(response);
                        } 
                        else 
                        {
                            accountModel.updatePassword(employeeDetailsId, reqPassword)
                            .then((id) => {
                                response = responseFormat.getResponseMessageByCodes(['success:passwordCreated']);
                                res.status(200).json(response);
                            })
                            .catch((error) => {
                                let resp = commonMethods.catchError('accounts-controller/updatePassword', error);
                                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                res.status(resp.code).json(response);
                            })
                        }
                    } 
                    else 
                    {
                        response = responseFormat.getResponseMessageByCodes(['id'], { code: 417 });
                        res.status(200).json(response);
                    }
                })
            
            }

        }

    }

    createCode(req, res, next)
    {
        let response = responseFormat.createResponseTemplate();
        let id = req.body.id;
        let email = req.body.email;
        let type = req.body.type;
        let msgCode = [];

        let typeArr = ['acActivate', 'jobNotLooking', 'login'];

        if(!id || id =='')
        {
            msgCode.push('id:userId')
        }
        if(!email || email  =='')
        {
            msgCode.push('email')
        }
        if(typeArr.indexOf(type) < 0)
        {
            msgCode.push('type')
        }

        if(msgCode.length)
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else
        {
            let encKey = '';
            if(type == 'acActivate')
            {
                encKey = commonMethods.encrypt('SIGNUP||'+id+'||'+email+'||'+new Date().getTime());
            }
            else if(type == 'jobNotLooking')
            {
                encKey = commonMethods.encrypt('JOBNOTLOOKING||'+id+'||'+email+'||'+new Date().getTime());
            }
            else if(type == 'login')
            {
                encKey = commonMethods.encrypt('LOGIN||'+id+'||'+email+'||'+new Date().getTime());
            }

            let data = {code: encKey};
            response = responseFormat.getResponseMessageByCodes('', { content: { dataList: [data] } });
            res.status(200).json(response);
        }

    }

    updateUserJobSearchStatus(req, res, next)
    {
        let code = req.body.code;
        let response = responseFormat.createResponseTemplate();
        let msgCode = [];

        if (!code) {
            msgCode.push('errorText:code');
        }
        
        if (msgCode.length) 
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else
        {        
            commonMethods.decrypt(code)
            .then( dec => {
                if(dec)
                {
                    let userData = dec.split('||');
                    let employeeDetailsId = userData[1];
                    let email = userData[2];
                    let timeDiff = (new Date().getTime() - userData[3])/(60*60*1000); 

                    crudOperationModel.findAllByCondition(AccountSignIn, {EmployeeDetails_Id : employeeDetailsId, Email_Id: email})
                    .then( rs => { 
                        if(rs.length)
                        { 
                           
                            if(userData[0] == 'JOBNOTLOOKING' && timeDiff <= enums.activationCodeExpiraionTime)
                            {
                                accountModel.updateUserJobSearchStatus(employeeDetailsId)
                                .then((success) => {
                                    if(success)
                                    { 
                                        response = responseFormat.getResponseMessageByCodes(['success:jobStatusUpdated']);
                                        res.status(200).json(response);
                                    }
                                    else
                                    {
                                        response = responseFormat.getResponseMessageByCodes(['codeExpired:invalidCode'], { code: 417 });
                                        res.status(200).json(response);
                                    }
                                })
                                .catch((error) => {
                                    let resp = commonMethods.catchError('accounts-controller/accountActivate', error);
                                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                    res.status(resp.code).json(response);
                                })
                            }
                            else
                            {
                                response = responseFormat.getResponseMessageByCodes(['codeExpired:expiredCode'], { code: 417 });
                                res.status(200).json(response);
                            }
                  
                        }
                        else
                        { 
                            response = responseFormat.getResponseMessageByCodes(['codeExpired:invalidCode'], { code: 417 });
                            res.status(200).json(response);
                        }
                    })
                }
                else
                {
                    response = responseFormat.getResponseMessageByCodes(['codeExpired:invalidCode'], { code: 417 });
                    res.status(200).json(response);
                }
                
            })

        }
    }

    notInterestedForJob(req, res, next)
    {
        let code = req.body.code;
        let response = responseFormat.createResponseTemplate();
        let msgCode = [];
        let candidateEmail = '';


        if (!code) {
            msgCode.push('errorText:code');
        }
        
        if (msgCode.length) 
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else
        {        
            commonMethods.decrypt(code)
            .then( dec => {
                if(dec)
                {
                    let userData = dec.split('||');
                    let jobReferralId = userData[1];
                    let jobId = userData[2];
                    let timeDiff = (new Date().getTime() - userData[3])/(60*60*1000); 

                    if(userData[0] == 'NOTINTERESTED' && timeDiff <= enums.activationCodeExpiraionTime)
                    {
                        crudOperationModel.findModelByCondition(JobReferral, {jobId : jobId, jobReferralId : jobReferralId  })
                        .then( isExist => {
                            if(isExist){
                                //========= verify candidate ==========================//
                                    accountModel.getUserByUserName(isExist.candidateEmail)
                                    .then(user => {
                                        if(user && user.length) {
                                            accountModel.emailActivate(user[0].employeeDetailsId)
                                            .then((success) => {
                                                
                                            });
                                        }
                                    });
                                //====================================================//
                                if(isExist.status > enums.jobReferStatus.referred){
                                    response = responseFormat.getResponseMessageByCodes(['alreadyTookAction:alreadyTookAction'], { code: 417 });
                                    res.status(200).json(response);
                                }else{
                                    //======= update not Interested status ================//
                                        let referData = {
                                            status: enums.jobReferStatus.notInterested
                                        }
                                        crudOperationModel.updateAll(JobReferral, referData, { jobId : jobId, jobReferralId : jobReferralId })
                                        .then ( rs => {
                                            response = responseFormat.getResponseMessageByCodes(['success:notInterestedStatusUpdated']);
                                            res.status(200).json(response);
                                        }).catch(error => {
                                            let resp = commonMethods.catchError('accounts-controller/notInterestedForJob', error);
                                            response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                            res.status(resp.code).json(response);
                                        });
                                    //=======================================================//
                                }
                            }
                            else{
                                let resp = commonMethods.catchError('accounts-controller/notInterestedForJob-isExist', error);
                                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                res.status(resp.code).json(response);
                            }
                        });
                    }
                    else
                    {
                        response = responseFormat.getResponseMessageByCodes(['codeExpired:expiredCode'], { code: 417 });
                        res.status(200).json(response);
                    }
                }
                else
                {
                    response = responseFormat.getResponseMessageByCodes(['codeExpired:invalidCode'], { code: 417 });
                    res.status(200).json(response);
                }
                
            });

        }
    }

    checkApiUpdate(req, res, next)
    { 
        let response = responseFormat.createResponseTemplate();
        response = responseFormat.getResponseMessageByCodes('', { content: { dataList: [] } });
        res.status(200).json(response);
    }

    loginByGuid(req, res, next)
    {
        let response = responseFormat.createResponseTemplate();
        // let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId || 0;
        let guid = req.body.guid ? req.body.guid.trim() : '';
        let msgCode = [];

        if(!guid || guid == '')
        {
            msgCode.push('guid')
        }

        if (msgCode.length) 
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else 
        {
            accountModel.getUserCredentialByGuid(guid)
            .then( rs => {
                if(rs)
                {
                    this.getSignInDetails(rs.email, rs.password, enums.signInType.normalSignIn)
                    .then((resp) => { 
                        if (resp.status == 200 && resp.response.code == 200) 
                        {
                            let deviceId = (req.headers.deviceId || req.headers.DeviceId || req.headers.Deviceid || req.headers.deviceid);
                            crudOperationModel.updateAll(UserLoginDetail, {isDeviceLogin : 0}, {deviceId:deviceId})
                            .then( info => { 
                                // update database with device login info
                                commonMethods.addUserDevice(req.headers, resp.response.content.dataList[0].employeeDetailsId, 1, function(rs) { })
                            })
                        }
                        res.status(resp.status).json(resp.response);
                    }).catch(err => {
                        response = responseFormat.getResponseMessageByCodes(['guid'], { code: 417 });
                        res.status(200).json(response);
                    })
                }
                else
                {
                    response = responseFormat.getResponseMessageByCodes(['guid'], { code: 417 });
                    res.status(200).json(response);
                }
            })
        }
    }

    test(req, res, next)
    {
        
        let time = new Date('05-29-2018').getTime();
        let code1 = commonMethods.encrypt('acActivate||69472||javsiranj@gmail.com||'+time);
        let encKey = commonMethods.encrypt('NOTINTERESTED||76454||578073||'+new Date().getTime());
        console.log('encKey', encKey);

        console.log('code1 - ' +code1);
        // let c1 = 'DD19CC179890DAABB7C8F45093CF78CC:AA60006137A80B02C62CC751EB37592201400440A0B50A87A4B5BBE45866B125F01FA28253BDCD09441B0C141222FBBA';
        // let c1 = 'B96701EFEC470E96C861191F945FA78D:CDC96A0A9A4D9BC1540D77FB1BF6850C3CCEB4964DE53BDED647238AFE52944649207A4BCA89DA396ADD405A357D3A0B'
        // let c1 = '6b33efc07d66188818907b7f728035c8:0581a3691716b938ab2a8fbaa4696cbf2a46180ad5623d9af640bb3bd97757cd2e515694db7de5a34d4398df8a33a3db2707c9fc87cc1b29ce33b39b841cdb24';
        let c = 'f6189d476be8c4b2480a72a1dbff0c89:558e29c18a57025700815504c1f0d73197ae2c2a00b0944fdce52b4f4745721b';
        commonMethods.decrypt(c)
        .then( dec =>
        {
            console.log('code1 - ' +dec);
            let data = dec.split('||');
            console.log(data);
            console.log( (new Date().getTime() - data[3])/(60*60*1000));
        }).catch(error => {
            console.log(' Error Occurred : ', error)
        })


      
    }


}


module.exports = AccountController;