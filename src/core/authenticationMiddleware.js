import express from 'express';
import jwt from 'jsonwebtoken';
import responseFormat from './response-format';
import configContainer from '../config/localhost';
import routesConfig from './routes';
import CommonMethods from './common-methods';
import logger from './logger';
import accountModel from '../models/accounts/accounts-model';
import CrudOperationModel from '../models/common/crud-operation-model';
import { UserLoginDetail } from '../entities/accounts/user-login-detail';
import enums from './enums';

let app = express.Router();

let config = configContainer.loadConfig(),
    commonMethods = new CommonMethods(),
    crudOperationModel = new CrudOperationModel(),
    appRoutes = routesConfig.getRoutes();


app.use((req, res, next) => {

  let response = responseFormat.createResponseTemplate();
  let at = req.headers.authorization || req.headers.Authorization;
  
  // all header info validate 
  let headerParams = config.headerParams;
  let headerArr = Object.keys(headerParams);
  let reqHeader = req.headers;
  let reqHeaderArr = Object.keys(reqHeader).map(it=>{return it.toLowerCase()});


  for(let i=0; i<headerArr.length; i++)
  {
      if(headerParams[headerArr[i]] == 'required' && reqHeaderArr.indexOf(headerArr[i].toLowerCase()) < 0)
      {
          response = responseFormat.getResponseMessageByCodes(['common401'], { code: 401 });
          res.status(401).json(response);
          return;
      }      
  }

  
  // decode header Authorization
  if (at) 
  {
    let accessToken = new Buffer(at, 'base64').toString('ascii');
    if (accessToken.indexOf(':') <= -1) 
    {
      
      if (commonMethods.matchUrl(routesConfig.accessAndAuthUrl, req.originalUrl, req.method) && accessToken == config.apiAccessToken) {
        req.headers.ext = 1;
        next();
        return;
      }
      else 
      {
		
        if (accessToken !== config.apiAccessToken) {
          response = responseFormat.getResponseMessageByCodes(['common401'], { code: 401 });
          res.status(401).json(response);
          return;
        }
        else 
        {
          let excludArr = [];
          for (let i in routesConfig.excludeJwtPaths) {
            excludArr.push(routesConfig.excludeJwtPaths[i].url);            
          }
		  
          if (excludArr.indexOf(req.originalUrl) > -1) 
          {
            next();
            return;
          }
          else 
		      {  
            response = responseFormat.getResponseMessageByCodes(['common404'], { code: 404 });
            res.status(404).json(response);
            return;
          }

        }
      }

    } 
    else
    {
      let apiAccessToken = accessToken.split(':')[0];
      let authToken = accessToken.split(':')[1];
      

      if (apiAccessToken !== config.apiAccessToken) 
      {
        response = responseFormat.getResponseMessageByCodes(['common401'], { code: 401 });
        res.status(401).json(response);
        return;
      }
      
      jwt.verify(authToken, config.jwtSecretKey, function (err, decoded) 
      {
        if (err) 
        {
          // if accessAndAuthUrl accessed with wrong token, request treated as non-logged in user
          if (commonMethods.matchUrl(routesConfig.accessAndAuthUrl, req.originalUrl, req.method) && apiAccessToken == config.apiAccessToken) 
          {
            req.headers.ext = 1;
            next();
            return;
          }  
          response = responseFormat.getResponseMessageByCodes(['common401'], { code: 401 });
          res.status(401).json(response);
          return;
        }
        else 
        {
          
          req.tokenDecoded = decoded;

          let commonMethods = new CommonMethods();
          commonMethods.isUserLoggedIn(decoded.data.employeeDetailsId)
            .then((isuser) => 
            {
              if (isuser == 1) 
              {
                //check user id exists or not and status is active
                accountModel.getUserById(decoded.data.employeeDetailsId)
                  .then((isUsers) => {
                    if (isUsers) 
                    {
                      req.tokenDecoded = decoded;
                      req.headers.apiAccessToken = apiAccessToken;
                      req.headers.authorization = "Bearer " + authToken;

                      // update database with device login info
                      commonMethods.addUserDevice(reqHeader, decoded.data.employeeDetailsId, 1, function(rs) { })
          
                      next();
                      return;
                    } 
                    else 
                    {
                      response = responseFormat.getResponseMessageByCodes(['common401'], { code: 401 });
                      res.status(401).json(response);
                      return;
                    }
                  })
              }
              else 
              {
                // if accessAndAuthUrl accessed with expired token, request treated as non-logged in user
                if (commonMethods.matchUrl(routesConfig.accessAndAuthUrl, req.originalUrl, req.method) && apiAccessToken == config.apiAccessToken) 
                {
                  req.headers.ext = 1;
                  next();
                  return;
                }
                response = responseFormat.getResponseMessageByCodes(['common401'], { code: 401 });
                res.status(401).json(response);
                return;
              }
            })
            .catch((error) => {
              logger.error('Error has occured in servr.js  // isUserLoggedIn section .', err);
              response = responseFormat.getResponseMessageByCodes(['common500'], { code: 500 });
              res.status(500).json(response);
              return;
            })
        }
      });
      return;
  
    }
  }
  else {
    response = responseFormat.getResponseMessageByCodes(['common401'], { code: 401 });
    res.status(401).json(response);
    return;
  }
  // next();
});
module.exports = app;