import enums from '../core/enums';
let accounts = {
    firstName: 50,
    lastName: 50,
    email: 50,
    userName: 50
};

let users = {
    firstName: 50,
    lastName: 50,
    currentJobTitle: 250,
    totalExp: 100,
    address: 500,
    contactNumber: 20,
    linkedIn: 250,
    twitter: 250,
    assignmentType: 50,
    annualSalary: 18,
    contractRate: 50,
    comments: 2000,
    positionTitle: 2000,
    employerName: 2000,
    licenceNumber: 200,
    certificateExamName: 500,
    zipCode: 20,
    institutionName: 50,
    yearsOfExp: 99
};

let immigrations = {
    firstName: 25,
    lastName: 25,
    contactNumber: 30,
    appFor: 4,
    appPriority: 10,
    appType: 5,
    currentStatus: 10,
    comments: 500,
    legalDocName: 50

};

let projects = {
    projectDuration: 200,
    projectDescription: 1000,
    managerName: 200,
    managerTitle: 200,
    managerEmail: 200,
    managerPhone: 25,
    comments: 500

};
let vacations = {
    reason: 500,
    contactInfo: 200
};

let contactUs = {
    requestType: 50,
    firstName: 50,
    lastName: 50,
    email: 50,
    mobileNo: 10
};

let timecards = {
    year: 4,
    month: 12
};


module.exports = {
    accounts: accounts,
    users: users,
    immigrations: immigrations,
    projects: projects,
    vacations: vacations,
    contactUs: contactUs,
    timecards:timecards
}