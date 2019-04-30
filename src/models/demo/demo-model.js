import fs from "fs";
import path from "path";
import logger from "../../core/logger";
import configContainer from "../../config/localhost";
import CommonMethods from "../../core/common-methods";
import { dbContext, Sequelize } from "../../core/db";
import  {EmployeeContactDetails}  from "../../entities/index";
import {ObjectMapper} from '../../core/objectMapper';
import Q from "q";

/**
 *  -------Initialize global variabls-------------
 */
let config = configContainer.loadConfig();

export default class DemoModel {
  constructor() {
    //
  }

  getEmployeeContactDetailsByEmployeeDetailsId(employeeDetailsId,inputData) {
    return new Promise((resolve,reject)=>{
      EmployeeContactDetails.findOne({
        where: {
          EmployeeDetails_Id: employeeDetailsId
        },
        raw: true
      })
      .then((employeeContactDetails) => {
        console.log("employeeContactDetails :",employeeContactDetails);
         this.updateContactDetail(inputData,employeeDetailsId)
           .then((response)=>{
             resolve(response)
           })
           .catch((error)=>{
             reject(error);
           })
      })
      .catch((error)=>{
         reject(error);
      })
    })

  }

  updateContactDetail(employeeContactDetails,employeeDetailsId){
    console.log("updateContactDetail");
    return new Promise((resolve,reject)=>{
      let val= EmployeeContactDetails.customValidate(employeeContactDetails);
      console.log("val in promise :",val);
      if(val && val.msg=='success'){
        EmployeeContactDetails.update(employeeContactDetails,{ where: [{EmployeeDetails_Id: employeeDetailsId }]})
          .then((response)=>{
            resolve('Update ' + response)
          })
          .catch((error)=>{
            reject(error);
          })
      } else {
        reject(val);
      }

    })
  }
}
