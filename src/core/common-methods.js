/**
 *  -------Import all classes and packages -------------
 */
import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
import logger from '../core/logger';
import configContainer from '../config/localhost';
import { dbContext, Sequelize } from '../core/db';
import { UserSession } from '../entities/accounts/user-session';
import { AccountSignIn } from "../entities/accounts/account-signin";
import lodash from 'lodash';
import enums from '../core/enums';
import moment from 'moment';
import request from 'request';
import async from 'async';
import mailer from "./nodemailer";
import Jimp from 'jimp';
import CrudOperationModel from '../models/common/crud-operation-model';
import { UserLoginDetail } from "../entities/accounts/user-login-detail";
import { CountryList, CityList, StateList } from "../entities/regions/regions";

const fileType = require('file-type');
const readChunk = require('read-chunk');

var converter = require('office-converter')();

/**
 *  -------Initialize global variabls-------------
 */
let config = configContainer.loadConfig();

let crudOperationModel = new CrudOperationModel();

export default class CommonMethods {

    constructor() {
        //
    }

    /**
 * Common method for file upload 
 * @param {*} file : encoded file
 * @param {*} fileName : name of file with extension
 * @param {*} filePath : path of file
 * @param {*} folderName : name of folder
 */
    fileUpload_BACKUP(file, fileName, filePath, folderName) {

        let self = this;
        return new Promise(function (resolve, reject) {
            let timestamp = new Date().getTime(),
                extension = path.extname(fileName),
                fileNameWithoutExtension = fileName.slice(0, -(extension.length)),
                response = {};

            return self.decodeBase64Image(file, extension)
                .then((imageBuffer) => {
                    if (imageBuffer.isSuccess) {

                        /**
                         * create folder if does not exist
                         */
                        let logDir = config.imageFolder;
                        if (!fs.existsSync(logDir)) {
                            fs.mkdirSync(logDir);
                        }

                        let folderPath = logDir + folderName;
                        /**
                         * create profile folder if does not exist
                         */
                        if (!fs.existsSync(folderPath)) {
                            fs.mkdirSync(folderPath);
                        }

                        let path = config.imageFolder + filePath;//folderPath + '/' + fileNameWithoutExtension + '_' + timestamp + '_' + extension;

                        fs.writeFile(path, imageBuffer.data, function (error) {
                            if (error) {
                                logger.error('Error has occured in common-methods/fileUpload fs.writeFile.', error);
                                response.isSuccess = false;
                                response.msgCode = ['error:errorFileUpload'];
                                return resolve(response);
                            } else {
                                response.filePath = filePath;
                                response.isSuccess = true;
                                return resolve(response);
                            }
                        });
                    } else {
                        response.isSuccess = imageBuffer.isSuccess;
                        response.msgCode = imageBuffer.msgCode;
                        return resolve(response);
                    }
                });
        });
    }


    /**
     * Common method for file upload 
     * @param {*} file : encoded file
     * @param {*} fileName : name of file with extension
     * @param {*} filePath : path of file
     * @param {*} folderName : name of folder
     */

    fileUpload(file, fileName, docType, pjEmployeeId = null, placementTrackerId = null, employeeDetailsId = null) {
        docType = (docType) ? docType : enums.uploadType.userDocument;
        let self = this;
        let timestamp = new Date().getTime(),
                extension = path.extname(fileName),
                fileNameWithoutExtension = fileName.slice(0, -(extension.length)),
                response = {};

        return new Promise(function (resolve, reject) {

            // check if file size upto 2MB

            let size = (file.length*(3/4)/(1024*1024));
         
            if(size > enums.uploadType.maxFileSize)
            {
                logger.error('Error has occured in common-methods/fileUpload.', 'File size greater than '+enums.uploadType.maxFileSize+'MB.');
                response.isSuccess = false;
                response.msgCode = ['fileSizeError'];
                return resolve(response);
            }

            let uniqueFilename = fileNameWithoutExtension.replace(/[^a-zA-Z]/g, "") + new Date().getMonth().toString() + new Date().getDate().toString() + new Date().getFullYear().toString() +
                new Date().getHours().toString() + new Date().getMinutes().toString() + new Date().getSeconds().toString() + extension;

            // console.log(uniqueFilename);
            // return resolve(uniqueFilename);

            let encodedBody = new Buffer(
                JSON.stringify({
                    docType: docType,
                    fileName: uniqueFilename,
                    encodedData: file,
                    pjEmployeeId: pjEmployeeId,
                    placementTrackerId : placementTrackerId,
                    employeeDetailsId : employeeDetailsId
                })
            ).toString('base64');

            //console.log("encodedBody:", encodedBody);
            var options = {
                method: 'POST',
                url: config.thirdPartyApiUrl + config.uploadEndpoint,
                body: { data: encodedBody },
                timeout: 30000,
                json: true

            };

            request(options, function (error, resp, body) {
                // console.log('body', body)
                if (error || body.status == 500 || body.status == 404) {
                    // console.log('error', error)
                    logger.error('Error has occured in common-methods/fileUpload fs.writeFile.', error);
                    response.isSuccess = false;
                    response.msgCode = ['errorFileUpload'];
                    return resolve(response);
                }
                else if (body.message.trim().toLowerCase() !== 'success') {
                    // console.log('body', body)
                    // response.fileName = uniqueFilename;
                    logger.error('Error has occured in common-methods/fileUpload.', body);
                    response.msgCode = ['errorFileUpload'];
                    response.isSuccess = false;
                    return resolve(response);
                }
                else {
                    response.fileName = uniqueFilename;
                    response.isSuccess = true;
                    return resolve(response);
                }

            });

        });
    }


    /**
     * Check base64 string and decode
     * @param {*} dataString :encoded string of file
     * @param {*} ext : extension of file
     */
    decodeBase64Image(dataString, ext) {
        ext = (ext.toString()).toLowerCase().trim()
        let self = this;
        return new Promise(function (resolve, reject) {
            if (dataString === '' || ext === '') {
                resolve({ isSuccess: true });
            }
            let response = {};
            let matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            let stringData = dataString;
            if (!matches) {
                stringData = dataString;
            } else if (matches && matches.length == 3) {
                stringData = matches[2];
            }

            let encodedString = dataString.toString();
            var data = encodedString.slice(0, 5);

            let check = self.checkExtension(data);

            /**
             * checking file type and extension
             */
            if (check == ".jpg" || check == ".png" || check == ".gif" || check == ".jpeg" || check == ".doc" || check == ".docx" || check == ".pdf") {
                if (check == ext) {
                    response.data = self.base64ToByteArray(stringData);
                    response.isSuccess = true;
                } else {
                    response.isSuccess = false;
                    response.msgCode = ['invalidDocType'];
                }
            } else if (check == ".exe" || check == ".rar" || check == ".zip" || check == ".srt") {
                response.isSuccess = false;
                response.msgCode = ['invalidDocType'];
            } else if (ext == ".bmp" || ext == ".txt") {
                response.data = self.base64ToByteArray(stringData);
                response.isSuccess = true;
            } else {
                response.isSuccess = false;
                response.msgCode = ['invalidDocType'];
            }
            return resolve(response);
        })
    }

    /**
     * common method to find file type from base64
     * @param {*} data : sliced encoded data of length 5
     */
    checkExtension(data) {
        switch (data.toLowerCase()) {
            case "ivbor":
                return ".png";

            case "/9j/4":
                return ".jpg";

            case "jvber":
                return ".pdf";

            case "umfyi":
                return ".rar";

            case "uesdb":
                return ".docx";

            case "0m8r4":
                return ".doc";

            case "/9j/4":
                return ".jpeg";

            case "uesdb":
                return ".zip";

            case "umfyi":
                return ".rar";

            case "tvqqa":
                return ".exe";

            case "mq0km":
                return ".srt";
            default:
                return "";
        }
    }

    /**
     * convert base64 To ByteArray
     * @param {*} encStr : encrypted string 
     */
    base64ToByteArray(encStr) {
        var base64s = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        let decOut = new Buffer(encStr, 'ascii');
        var bits;
        for (var i = 0, j = 0; i < encStr.length; i += 4, j += 3) {
            bits = (base64s.indexOf(encStr.charAt(i)) & 0xff) << 18 | (base64s.indexOf(encStr.charAt(i + 1)) & 0xff) << 12 | (base64s.indexOf(encStr.charAt(i + 2)) & 0xff) << 6 | base64s.indexOf(encStr.charAt(i + 3)) & 0xff;
            decOut[j + 0] = ((bits & 0xff0000) >> 16);
            if (i + 4 != encStr.length || encStr.charCodeAt(encStr.length - 2) != 61) {
                decOut[j + 1] = ((bits & 0xff00) >> 8);
            }
            if (i + 4 != encStr.length || encStr.charCodeAt(encStr.length - 1) != 61) {
                decOut[j + 2] = (bits & 0xff);
            }
        }
        return decOut;
    }

    /**
     * Check database connection
     */
    isDbConnected() {
        return AccountSignIn.findOne({
            limit: 1,
            raw: true
        })
            .then(details => {
                return 1;
            })
            .catch((error) => {
                logger.error('Error has occured in common-methods.js  // isDbConnected section .', error);
                return 0;
            });
    }

    /**
     * Check user is logged in or not
     */
    isUserLoggedIn(employeeDetailsId) {
        return UserSession.findOne({
            where: {
                EmployeeDetails_Id: employeeDetailsId
            },
            raw: true
        })
            .then(details => {
                return (details) ? details.Status : -1;
            })
            .catch((error) => {
                logger.error('Error has occured in common-methods.js  // isUserLoggedIn section .', error);
                return -1;
            });;
    }

    /**
     * Add user device/platform Details in db
     */
    addUserDevice(reqHeader, employeeDetailsId, signIn = 1, next) 
    {  
        let os = enums.osTypes[(reqHeader.os || reqHeader.OS).toLowerCase()];
        let loginInfo = {
            employeeDetailsId : (employeeDetailsId || 0), 
            deviceName : (reqHeader.platform || reqHeader.Platform),            
            lat : (reqHeader.GeoLat || reqHeader.geoLat || reqHeader.geolat),            
            long : (reqHeader.GeoLong || reqHeader.geoLong || reqHeader.geolong),            
        };

        if(([1,2].indexOf(os) > -1))
        {
            loginInfo['isDeviceLogin'] = signIn ? 1 : 0;
            loginInfo['deviceId'] = (reqHeader.deviceId || reqHeader.DeviceId || reqHeader.Deviceid || reqHeader.deviceid);
            loginInfo['deviceVersion'] = (reqHeader.version || reqHeader.Version);
            loginInfo['os'] = os;
        }

        if(([1,2].indexOf(os) < 0))
        {
            loginInfo['isWebLogin'] = signIn ? 1 : 0;
        }
 

        crudOperationModel.saveModel(UserLoginDetail, loginInfo, {employeeDetailsId:loginInfo.employeeDetailsId})
        .then( rs => {
            next(rs)
        })
    
        
    }

    /**
     * common-method for count of number of working days
     * @param {*} startDate :fromDate of range
     * @param {*} endDate  :toDate of range
     */
    calcBusinessDays(startDate, endDate) {
        var millisecondsPerDay = 86400 * 1000;
        startDate.setHours(0, 0, 0, 1);
        endDate.setHours(23, 59, 59, 999);
        var diff = endDate - startDate;
        var days = Math.ceil(diff / millisecondsPerDay);

        /**
         * Subtract two weekend days for every week in between
         */
        var weeks = Math.floor(days / 7);
        days = days - (weeks * 2);

        /**
         *  Handle special cases
         */
        var startDay = startDate.getDay();
        var endDay = endDate.getDay();

        /**
         *  Remove weekend not previously removed. 
         */
        if (startDay - endDay > 1)
            days = days - 2;

        /**
         *  Remove start day if span starts on Sunday but ends before Saturday
         */
        if (startDay === 0 && endDay != 6)
            days = days - 1;

        /**
         *  Remove end day if span ends on Saturday but starts after Sunday
         */
        if (endDay === 6 && startDay !== 0)
            days = days - 1;

        return days;
    }

    /**
     * Vacation Requests Status Field
     * @param {*} statusValue :status of request
     */
    getStatus(statusValue) {
        if (statusValue == -1)
            return "All";
        else if (statusValue == 0)
            return "Pending";
        else if (statusValue == 1)
            return "Approved";
        else if (statusValue == 2)
            return "Rejected";
    }

    /**
     * Email Validation Common Method
     * @param {*} email 
     */
    validateEmailid(email) {
        // var pattern =/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
        var pattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        // var pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if (pattern.test(email)) {
            return true;
        } else {
            return false
        };
    }

    /**
     * common method for calculate prev month first date
     * @param {*} date
     */
    prevMonthFirstDate(date) {
        var now = new Date(date);
        var prevMonthLastDate = new Date(now.getFullYear(), now.getMonth(), 0);
        var prevMonthFirstDate = new Date(now.getFullYear(), (now.getMonth() - 1 + 12) % 12, 1);

        var formatDateComponent = function (dateComponent) {
            return (dateComponent < 10 ? '0' : '') + dateComponent;
        };

        var formatDate = function (date) {
            return formatDateComponent(date.getMonth() + 1) + '/' + formatDateComponent(date.getDate()) + '/' + date.getFullYear();
        };

        // let lastDateOfPrevMonth = formatDate(prevMonthLastDate);
        let firstDateOfPrevMonth = formatDate(prevMonthFirstDate);
        return firstDateOfPrevMonth;
    }

    /**
     * To encrypt any string 
     * @param {*} text : plain text
     */
    encrypt(text) {
        // return new Promise(function (resolve, reject) {
        let iv = crypto.randomBytes(enums.encryption.encryptionValueLength);
        let cipher = crypto.createCipheriv('aes-256-cbc', new Buffer(enums.encryption.encryptionKey), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        // return resolve(iv.toString('hex') + ':' + encrypted.toString('hex'));
        return iv.toString('hex') + ':' + encrypted.toString('hex');
        // })
    }

    /**
     *  To decrypt any string 
     * @param {*} text :encrypted text
     */
    decrypt(text) {
        return new Promise(function (resolve, reject) 
        {
            try{
                let textParts = text.split(':');
                let iv = new Buffer(textParts.shift(), 'hex');
                let encryptedText = new Buffer(textParts.join(':'), 'hex');
                let decipher = crypto.createDecipheriv('aes-256-cbc', new Buffer(enums.encryption.encryptionKey), iv);
                let decrypted = decipher.update(encryptedText);
                decrypted = Buffer.concat([decrypted, decipher.final()]); 
                return resolve(decrypted.toString());
            }
            catch(e)
            {
                // console.log('catch part' , e)
                // return reject('inavalid')
                return resolve(false)
            }
            
        })
    }


    /**
     * Common methods for filter collection data by key from procedure value
     * @param {*} collection 
     * @param {*} keyName 
     * @param {*} value 
     * @param {*} condition 
     */
    filterCollectionWithKey(collection, keyName, value, condition) {
        return lodash.filter(collection, (key) => {
            if (condition == enums.conditions.euqals) {
                return (key[keyName]).toString().trim().toLowerCase() === (value).toString().trim().toLowerCase();
            } else if (condition == enums.conditions.lessThen) {
                return key[keyName] < value;
            }
        });
    }

    /**
     * date-format validation
     * @param {*} testdate : request body date 
     */
    validateDate_mmddyyyy_yyyymmdd(testdate) {
        var date_regex_mmddyyyy = /^\d{2}\-\d{2}\-\d{4}$/;
        var date_regex_yyyymmdd = /^\d{4}\-\d{2}\-\d{2}$/;
        // var date_regex = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;
        // if (date_regex.test(testdate) && (!isNaN(Date.parse(testdate)))) {
        if ((date_regex_mmddyyyy.test(testdate) || date_regex_yyyymmdd.test(testdate)) && (!isNaN(Date.parse(testdate)))) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Check valid image file
     * @param {*} dataString : encoded base64 file string
     */
    checkValidImage(dataString) {

        let self = this,
            response = {},
            encodedString = dataString.toString(),
            data = encodedString.slice(0, 5),
            check = self.checkExtension(data);

        return new Promise(function (resolve, reject) {
            if (dataString === '') {
                resolve({ isSuccess: true });
            }
            /**
             * checking file type
             */
            if (check == ".jpg" || check == ".png" || check == ".gif" || check == ".jpeg") {
                response.data = self.base64ToByteArray(dataString);
                response.isSuccess = true;
            }
            else if (check == ".exe" || check == ".rar" || check == ".zip" || check == ".srt" || check == ".doc" || check == ".docx" || check == ".pdf") {
                response.isSuccess = false;
                response.msgCode = ['profilePicture:invalidDocType'];
            } else {
                response.isSuccess = false;
                response.msgCode = ['profilePicture:invalidDocType'];
            }
            return resolve(response);
        })
    }

    /**
    * uploadFile
    * @param {*} file : base 64 string
    * @param {*} fileName : Name of file
    * @param {*} filePath :path to upload
    * @param {*} folderName :folder name to upload
    */
    uploadFile(file, fileName, filePath, folderName) {
        let self = this;
        let response = {};
        return new Promise(function (resolve, reject) {
            /**
             * create imageFolder (stafflineDocuments) if does not exist
             */
            let logDir = config.imageFolder;
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir);
            }

            let folderPath = logDir + folderName;
            /**
             * create profile folder if does not exist
             */
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath);
            }

            let path = config.imageFolder + filePath;

            fs.writeFile(path, file, function (error) {
                if (error) {
                    logger.error('Error has occured in common-methods/uploadFile fs.writeFile.', error);
                    response.isSuccess = false;
                    response.msgCode = ['errorFileUpload'];
                    return resolve(response);
                } else {
                    response.filePath = filePath;
                    response.isSuccess = true;
                    return resolve(response);
                }
            });
        })
    }

    /**
     * Check date is valid or not
     * @param {*} date :Input request date
     */
    isValidDate(date) {
        let regEx = /^\d{4}-\d{2}-\d{2}$/;

        if (!date) {
            return false;
        }
        // else if (date.match(regEx) == null) {
        //     return false;
        // }
        
        let m = moment(date);

        if (m.isValid() && m.isAfter('1900-01-01')) {
            return true;
        }
        return false;
    }

    /**
    * Check data is valid integer or not
    * @param {*} data :Input request value
    */
    isValidInteger(data) {
        let regEx = /^\+?(0|[1-9]\d*)$/;

        if (!data) {
            return false;
        }
        else if (data.toString().match(regEx) == null) {
            return false;
        }

        return true;
    }


    /**
    * Check data is valid isValidNumber or not
    * @param {*} data :Input request value
    */
    isValidNumber(data) {

        let regEx = /^[0-9]+([,.][0-9]+)?$/g;
        if (!data) {
            return false;
        }
        else if (data.toString().match(regEx) == null) {
            return false;
        }

        return true;
    }

    /**
    * Check data is valid isValidMoney or not
    * @param {*} data :Input request value
    */
    isValidMoney(data) {

        let regEx = /^[0-9]+([.][0-9]+)?$/g;
        if (!data) {
            return false;
        }
        else if (data.toString().match(regEx) == null) {
            return false;
        }

        return true;
    }


    /**
     * get existing file extension
     * @param {*} filePth : Path of existing file
     */
    getFileExtension(filePath) {
        let buffer = readChunk.sync(filePath, 0, 4100);
        // console.log(fileType(buffer));
        let info = fileType(buffer);
        return info !== null ? '.' + info['ext'] : null;
    }

    /**
     * get incoming file extension on runtime, before upload
     * @param {*} fileData : Base64 Encodede data
     */

    getIncomingFileExtension(fileData) {
        let buffer = new Buffer(4100);
        buffer.write(fileData, 0, 'base64');
        let info = fileType(buffer);
        return info !== null ? info['ext'] : 'txt';
    }

    /**
     * check file extension and its type to validate 
     * @param {*} fileData : Base64 Encodede data
     * @param {*} fileName : file Name
     * @param {*} allowedExt : Array of allwed extesions
     */

    validateFileType(fileData, fileName, allowedExt) {
        var base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

        // if (!base64regex.test(fileData)) {
        //     return false;
        // }

        if (!fileName || !fileData) {
            return false;
        }

        let fileNameArr = fileName.split('.');
        let givenExt = (fileNameArr[0] != '' && fileNameArr.length > 1) ? fileNameArr[fileNameArr.length - 1] : '';
        if (givenExt == '' || allowedExt.indexOf(givenExt.toLowerCase()) < 0) {
            return false;
        }
        let extension = this.getIncomingFileExtension(fileData);
        if (extension != null)//&& extension == givenExt)
        {
            return true;
        }
        return false;


    }
    /**
     * Set search history and job alert title
     * @param {*} keyword :search keyword 
     * @param {*} location :search location
     */
    getJobTitleKeyword(keyword, location, jobListType, jobTitle) {

        //console.log('-----------------------------keyword, location, jobListType, jobTitle:',keyword, location, jobListType, jobTitle);
        let returnText = "All Jobs";
        if (keyword && !location) {
            returnText = "All " + keyword + " Jobs";
        } else if (!keyword && location && !jobListType) {
            returnText = "All Jobs in " + location;
        } else if (keyword && location && jobListType != enums.jobListType.similarJobs) {
            returnText = keyword + " Jobs in " + location;
        } else if (jobListType == enums.jobListType.localJobs || jobListType == enums.jobListType.otherLocationJobs || jobListType == enums.jobListType.similarJobs || jobListType == enums.jobListType.matchingJobs) {
            if (jobListType == enums.jobListType.localJobs)
                returnText = "All Local Jobs";
            if (jobListType == enums.jobListType.otherLocationJobs)
                returnText = "All Other Location Jobs";
            if (jobListType == enums.jobListType.similarJobs) {
                if (jobTitle)
                    returnText = "Similar Jobs for \"" + jobTitle + "\"";
                else
                    returnText = "All Similar Jobs";
            }
            // if (jobListType == enums.jobListType.matchingJobs)
            //     returnText = "All Matching Jobs";
        }
        return returnText;
    }

    /**
    * Set search history and job alert title
    * @param {*} keyword :search keyword 
    * @param {*} location :search location
    */
    getJobSearchParams(reqBody) {
        return JSON.stringify({
            keyword: reqBody.keyword,
            location: reqBody.location,
            miles: reqBody.miles,
            isHot: reqBody.isHot,
            jobCategory: (reqBody.jobCategory) ? reqBody.jobCategory.split(",") : [],
            jobAssignmentType: (reqBody.jobAssignmentType) ? reqBody.jobAssignmentType.split(",") : [],
            jobListType: (reqBody.jobListType) ? reqBody.jobListType : "",
        })

    }


    /**
       * get City State From Location
       * @param {*} location :location
       */
    getCityStateFromLocation(location) {
        let city = '', state = '';
        if ((location) && location.indexOf(',') <= -1) {
            city = location;
            state = location;
        } else if ((location) && location.indexOf(',') >= 0) {
            city = location.split(',')[0];
            state = location.split(',')[1];
        }
        return {
            city: city,
            state: state
        };
    }

    /**
    * validate phone no patterns [XXX-XXX-XXXX, XXX.XXX.XXXX, XXX XXX XXXX ,+91 xx-xx-xxxxxx]
    * @param {*} location :location
    */
    isValidPhone(inputtxt) {
        var phoneno = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;

        var phone = /^([0|\+[0-9]{1,6})[ ]?([0-9]{2})[-]?([0-9]{2})[-]?([0-9]{6})$/; // +91 xx-xx-xxxxxx

        if (inputtxt.toString().match(phoneno) || inputtxt.toString().match(phone)) {
            return true;
        }
        else {
            return false;
        }
    }

    /**
     * Validate boolean field
     * @param {*} input : input value
     */
    isBoolean(input) {

        return [0, 1, "0", "1", true, false, "true", "false"].indexOf(input) > -1 ? true : false;

    }
    /**
    * Validate Alpha Numeric Value
    * @param {*} input : input value
    */
    isAlphaNumeric(input) {
        if (input === undefined || input === null || input === "")
            return true;
        else
            return input.match(/^[a-z\d\.-_\s]+$/i) ? true : false;

    }

    /**
    * Validate optional boolean field 
    * @param {*} input : input value
    */

    isBooleanOptionalField(input) {
    if (input === undefined || input === null || input === "")
        return true;
    else
        return [0, 1, "0", "1", true, false, "true", "false"].indexOf(input) > -1 ? true : false;

}

    /**
     * calculate diiference between two days
     * @param {*} startDate : start date
     * @param {*} endDate : end date
     */
    getDifferenceInDays(startDate, endDate) {

        let a = moment(startDate).startOf('day');
        let b = moment(endDate).startOf('day');

        return b.diff(a, 'days');
    }

    /**
     * calculate Profile Strength
     * @param {*} profileData : data for calculate strength
     */
    calculateProfileStrength(data) {
        let profileData = data[0];

        let obj = {
            experiences: profileData.experiences,
            resume: profileData.resume,
            skills: profileData.skills,
            careerProfile: profileData.empDetails.careerProfile,
            name: profileData.empDetails.firstName,
            emailId: profileData.empDetails.emailId,
            contactNumber: profileData.empDetails.contactNumber,
            desiredEmployement: profileData.empDetails.desiredEmployement,
            annualSalary: (profileData.empDetails.annualSalary) ? profileData.empDetails.annualSalary : profileData.empDetails.contractRate,
            industryVerticalId: profileData.empDetails.industryVerticalId,
            totalExp: profileData.empDetails.totalExp,
            currentJobTitle: profileData.empDetails.currentJobTitle,
            availability: profileData.empDetails.availability,
            authorisationStatus: profileData.empDetails.authorisationStatus,
            jobSearchStatus: profileData.empDetails.jobSearchStatus
        }
        // console.log('obj:', obj);

        let count = 0;
        for (let item in obj) {
            if (item == "experiences" || item == "resume" || item == "skills" || item == "desiredEmployement") {
                if (obj[item].length > 0) {
                    count = count + 1;
                }
            } else if (obj[item]) {
                // console.log('obj[item]:', obj[item]);
                count = count + 1;
            }
        }
        // console.log('count:', count);
        let profileStrength = (count * 6.66);
        return Number((profileStrength).toFixed(0));
    }

    /**
     * match giver urls with method and regEd
     * @param {*} arrayOfUrl : Url array to match with
     * @param {*} originalUrl : original Url to match 
     * @param {*} method : method of original url
     */
    matchUrl(arrayOfUrl, originalUrl, method) {
        var rs = arrayOfUrl.filter(item => {
            return (item.url == originalUrl && item.methods.indexOf(method) > -1) || (item.regex && item.pattern.test(originalUrl) && item.methods.indexOf(method) > -1)
        })

        return rs.length ? true : false;
    }

    /**
     * method to handle execption
     * @param {*} fromText : Text contains source method, to log in file
     * @param {*} error : original error     
     */
    catchError(fromText, error)
    {
        
        let toEmail = config.errorReportEmail;
        let subject = config.node_env.toUpperCase() + ' : Error occurred in : '+ fromText;
        let body = 'An Error has occurred in : '+ fromText +' \n Original Error is : '+ error;
        
        logger.error('Error has occured in : ' + fromText + ' || ERROR : ', error);


        mailer.sendEmail({
            to: toEmail,
            subject: subject,
            html: body
        });

        return { message: ['common500'], code: 500 };
    }

    /**
     * Image process for writing file from base64 data and resizing pic if required
     * @param {*} fileData : base64 data of picture
     * @param {*} next : callback
     */

    imageProcess(fileData)
    {
        return new Promise(resolve => {
            let profilePicPath = config.imageFolder + '/profile-picture.jpg';
            let buffer = new Buffer(fileData, 'base64');

            let self  = this;

            fs.writeFile(profilePicPath, buffer, function(err, response)
            {
                if(err)
                {
                    resolve({success:false, error: err})
                }

                self.resizePic(profilePicPath, function(result)
                {                
                    if(result.success)
                    {
                        fs.readFile(profilePicPath, function(err1, data)
                        {
                            if(err1)
                            {
                                resolve({success:false, error: err1})
                            }
                            let base64Data = new Buffer(data).toString('base64'); 
                            resolve({success: true, fileData: base64Data})                            
                        })
                    }
                    else
                    {
                        resolve({success:false, error: result.error})
                    }
                })
            });

            setTimeout(function()
            {
                fs.unlink(profilePicPath);
            },1000);
        })
        
    }

    /**
     * Resize of image
     * @param {*} path : path of picture
     * @param {*} next : callback
     */

    resizePic(path, next)
    {
        let destinationPath = config.imageFolder + '/profile-picture.jpg';

        Jimp.read(path, function (err, lenna) 
        {
            if (err)
            {
                next({success:false,error:err});
            } 
            let height = lenna.bitmap.height;
            let width = lenna.bitmap.width;
            let maxSize = 100;
         
            if( (height > maxSize && width > maxSize) || width > maxSize)
            {
                lenna.resize(maxSize,  Jimp.AUTO).write(destinationPath);  
                next({success:true});              
            }
            else if( height > maxSize)
            {
                lenna.resize(Jimp.AUTO, maxSize).write(destinationPath); 
                next({success:true});
            }
            next({success:true});

        }).catch(function (err) 
        {
            console.error(err);
            next({success:false,error:err});
        });

    }


    // convert \n(new line) to <br> for html 
    nl2br(str)
    {
        if(!str || str =='')
        {
            return '';
        }
        return str.replace(/(?:\r\n|\r|\n)/g, '<br />');
    }

    toUSFormat(s) 
    {
        return s;

        /*if(!s || s =='')
        {
            return '';
        }
        var s2 = (""+s).replace(/\D/g, '');
        var m = s2.match(/^(\d{3})(\d{3})(\d{4})$/);
        return (!m) ? null : "(" + m[1] + ") " + m[2] + "-" + m[3];*/
    }


    writeFile(fileName, fileData)
    {
        
        return new Promise(resolve => {
            let profilePicPath = config.imageFolder +'/'+ fileName;
            let buffer = new Buffer(fileData, 'base64');

            fs.writeFile(profilePicPath, buffer, function(err, response)
            {
                if(err)
                {
                    resolve({success: false, error: err})
                }
                else
                {
                    resolve({success: true, filePath: profilePicPath})
                }

            });

            // setTimeout(function()
            // {
            //     fs.unlink(profilePicPath);
            // },1000);
        })
        
    }

    convertOfficeDocToPdf(fileName, fileData)
    {
        let picPath = '';
        let self = this;
        return new Promise(resolve => {

            let extension = path.extname(fileName);

            if(extension == '.pdf')
            {
                resolve({success: true, fileData: fileData, filePath: ''})     
            }
            else
            {

                self.writeFile(fileName, fileData)
                .then ( file => {
    
                    converter.generatePdf(file.filePath, function(err, result) 
                    {
                        if (result.status === 0) 
                        {
                            // console.log('Output File located at ' + result.outputFile); 
                            
                            picPath = result.outputFile;
    
                            fs.readFile(result.outputFile, function(err1, data)
                            {
                                if(err1)
                                {
                                    resolve({success:false, err: err1})
                                }
                                
                                resolve({success: true, fileData: new Buffer(data).toString('base64'), filePath: result.outputFile})     
    
                            })
                        }
                        else
                        {
                            resolve({success: false, error: err})
                        }
                    })
    
                })
            }


            // setTimeout(function()
            // {
            //     fs.unlink(picPath);
            // },1000);

        })
    }


    generateDays(startDate, endDate, maxDate) 
    {
        let out = [];
        let currentDate = moment(startDate);
        let stopDate = moment(endDate);

        while (currentDate <= stopDate) {
            if (maxDate && moment(currentDate).isAfter(maxDate, 'day')) {
                break;
            }

            out.push(moment(currentDate).format('YYYY-MM-DD'));
            
            currentDate = moment(currentDate).add(1, 'days');
        }
        return out;
    }


    getCountyByName(countryName)
    {
        return crudOperationModel.findModelByCondition(CountryList, {countryName : countryName})
        .then( rs => {
            return rs;
        })
    }

    getStateByName(stateName)
    {
        return crudOperationModel.findModelByCondition(StateList, {stateName : stateName})
        .then( rs => {
            return rs;
        })
    }
    getCityByName(cityName)
    {
        return crudOperationModel.findModelByCondition(CityList, {cityName : cityName})
        .then( rs => {
            return rs;
        })
    }

}