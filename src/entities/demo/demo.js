/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';
import inputValidate from '../../core/serverValidation';

/**
 *  -------Define EmployeeContactDetails model -------------
 */
let EmployeeContactDetails = dbContext.define('EmployeeContactDetails', {
  EmployeeContactDetails_Id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employeeDetailsId: {
    type: Sequelize.INTEGER,
    field:'EmployeeDetails_Id'
  },
  contactNumber: {
    type: Sequelize.STRING,
    field:'Phone_Cell',
  },
  countryId: {
    type: Sequelize.INTEGER,
    field:'Country'
  },
  stateId: {
    type: Sequelize.STRING,
    field:'State'
  },
  cityId: {
    type: Sequelize.STRING,
    field:'City_Id'
  },
  address: {
    type: Sequelize.STRING,
    field:'Address1'
  },
  zipCode: {
    type: Sequelize.STRING,
    field:'Zip_Code'
  },
  modifiedBy: {
    type: Sequelize.STRING,
    field:'Modified_By'
  },
  modifiedDate: {
    type: Sequelize.DATE,
    field:'Modified_Date'
  }
},
  {
    classMethods: {
      customValidate: validate
    }
  }
);

function validate(inputData) {
  let d= inputValidate('DemoSchema',inputData);
  return d;
}


module.exports = {
  EmployeeContactDetails: EmployeeContactDetails,
}