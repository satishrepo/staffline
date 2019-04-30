import express from 'express';
import loggerInfo from './logger-info';
import CrudOperationModel from '../models/common/crud-operation-model';
import { APILog } from "../entities/apilog/apilog";
import enums from './enums';

let crudOperationModel = new CrudOperationModel();

let app = express.Router();

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With,Authorization, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "PUT, POST,DELETE,GET");

  loggerInfo.info('================================================================================================');
  loggerInfo.info('requestBody:', req.body);
  loggerInfo.info('requestHeader:', req.headers);
  loggerInfo.info('requestMethod:', req.method);
  loggerInfo.info('requestUrl:', req.url);


  // construct object to insert into log file

  let inputObj = {
    application: enums.appRefParentId.apiLog,
    method : req.method,
    endPoint : req.originalUrl,
    requestHeader : (Object.keys(req.headers).length ? JSON.stringify(req.headers) : ''),
    inputBody : (Object.keys(req.body).length ? JSON.stringify(req.body) : ''),
    fromIp : req.ip, //req.connection.remoteAddress
    createdDate : new Date()
  };

  // console.log(req.connection.remoteAddress, req.headers);return;

  crudOperationModel.saveModel(APILog, inputObj, {apiLogId:0})
  .then( rs => {
    // console.log(rs.apiLogId)
  }).catch( error => {
      let resp = commonMethods.catchError('Request Logging (customCors) \n ', error);     
  })


  /**
   * replace single quotes with double single quotes in response body
   */
  // req.body = JSON.parse(JSON.stringify(req.body).replace(/'/g, "''"));
  next();
});

module.exports=app;