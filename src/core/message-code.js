/**
 *  -------Import all classes and packages -------------
 */
import configContainer from '../config/localhost';
import enums from '../core/enums';

let config = configContainer.loadConfig();
let msgCodes = [
    {
        "MessageCode": "invalidAuthToken",
        "MessageDescription": "Invalid token or token has expired, please signin again."
    },
    {
        "MessageCode": "common404",
        "MessageDescription": "Not found."
    },
    {
        "MessageCode": "common402",
        "MessageDescription": "Incorrect Data Format."
    },

    {
        "MessageCode": "common500",
        "MessageDescription": "Something went wrong, Please try after some time."
    },
    {
        "MessageCode": "common400",
        "MessageDescription": "Bad Request."
    },
    {
        "MessageCode": "Common204",
        "MessageDescription": "No Content."
    },
    {
        "MessageCode": "fillRequiredFields",
        "MessageDescription": "Please fill required fields."
    },
    {
        "MessageCode": "invalidUserName",
        "MessageDescription": "Invalid Username."
    },
     {
        "MessageCode": "invalidProjectDetailId",
        "MessageDescription": "Invalid Project."
    },
    {
        "MessageCode": "invalidPassword",
        "MessageDescription": "Invalid password."
    },
    {
        "MessageCode": "invalidOldPassword",
        "MessageDescription": "Invalid old password."
    },

    {
        "MessageCode": "invalidPasswordRules",
        "MessageDescription": "Password must be 8 characters long, having one capital letter, lower letter and special character."
    },

    {
        "MessageCode": "confirmPasswordRequired",
        "MessageDescription": "Confirm password required."
    },


    {
        "MessageCode": "confirmPasswordNotMatched",
        "MessageDescription": "New Password and confirm password does not match."
    },
   

    {
        "MessageCode": "passwordCantBeSame",
        "MessageDescription": "New pasword and old password can't be same."
    },
    {
        "MessageCode": "unauthorized401",
        "MessageDescription": "Unauthorized access."
    },
    {
        "MessageCode": "userNameRequired",
        "MessageDescription": "Username field is required."
    },
    {
        "MessageCode": "passwordRequired",
        "MessageDescription": "Password field is required."
    },
    {
        "MessageCode": "Login001",
        "MessageDescription": "Login and Password fields are required."
    },
    {
        "MessageCode": "invalidCredentials",
        "MessageDescription": "Invalid credentials."
    },
    {
        "MessageCode": "logOutSuccess",
        "MessageDescription": "User logged out successfully."
    },
    {
        "MessageCode": "firstNameRequired",
        "MessageDescription": "Firstname field is required."
    },
    {
        "MessageCode": "lastNameRequired",
        "MessageDescription": "Lastname field is required."
    },
    {
        "MessageCode": "emailRequired",
        "MessageDescription": "Email field is required."
    },
    {
        "MessageCode": "appForIdRequired",
        "MessageDescription": "AppForId field is required."
    },
    {
        "MessageCode": "appPriorityRequired",
        "MessageDescription": "A valid AppPriorityField is required."
    },

    {
        "MessageCode": "currentStatusRequired",
        "MessageDescription": "CurrentStatus field is required."
    },

    {
        "MessageCode": "skillCategoryRequired",
        "MessageDescription": "Skill field is required."
    },


    {
        "MessageCode": "skillCategoryIdNotValidInteger",
        "MessageDescription": "Skill field is not a valid integer."
    },
    {
        "MessageCode": "legalAppIdNotValidInteger",
        "MessageDescription": "LegalApp Id field is not a valid integer."
    },

    {
        "MessageCode": "contactNumberRequired",
        "MessageDescription": "Contact number field is required."
    },
    {
        "MessageCode": "passwordRequired",
        "MessageDescription": "Password field is required."
    },
    {
        "MessageCode": "registeredSuccess",
        "MessageDescription": "User registered successfully."
    },
    {
        "MessageCode": "emailExists",
        "MessageDescription": "User email-id already exists."
    },
    {
        "MessageCode": "passwordChangedSuccess",
        "MessageDescription": "User password has been changed successfully."
    },
    {
        "MessageCode": "idRequired",
        "MessageDescription": "Id field is required."
    },
    {
        "MessageCode": "userNameRequired",
        "MessageDescription": "UserName field is required."
    },
    {
        "MessageCode": "otpRequired",
        "MessageDescription": "OtpCode field is required."
    },
    {
        "MessageCode": "newPasswordRequired",
        "MessageDescription": "Newpassword field is required."
    },
    {
        "MessageCode": "oldPasswordRequired",
        "MessageDescription": "Oldpassword field is required."
    },
    {
        "MessageCode": "accessTokenRequired",
        "MessageDescription": "Access Token field is required."
    },

    {
        "MessageCode": "invalidCode",
        "MessageDescription": "Invalid request code."
    },
    {
        "MessageCode": "accessTokenExpired",
        "MessageDescription": "Access token has expired please try again."
    },
    {
        "MessageCode": "socialEmailRequired",
        "MessageDescription": "User registration could not be completed due to email address is required. Please update your social media and try again."
    },
    {
        "MessageCode": "otpSentSuccess",
        "MessageDescription": "OTP has been sent successfully on your email id."
    },
    {
        "MessageCode": "otpValidSuccess",
        "MessageDescription": "OTP Validated Successfully."
    },
    {
        "MessageCode": "invalidOtp",
        "MessageDescription": "OTP validation failed."
    },
    {
        "MessageCode": "otpExpired",
        "MessageDescription": "OTP has been expired."
    },
    {
        "MessageCode": "invalidId",
        "MessageDescription": "Invalid Id."
    },
    {
        "MessageCode": "userProfileUpdated",
        "MessageDescription": "User profile updated successfully."
    },
    {
        "MessageCode": "userProfileUpdateFailed",
        "MessageDescription": "User profile updation failed."
    },
    {
        "MessageCode": "minimumLength",
        "MessageDescription": "Password must be at least " + enums.passwordPolicy.minimumLength + " letters long."
    },
    {
        "MessageCode": "requireCapital",
        "MessageDescription": "Password must contain a capital letter."
    },
    {
        "MessageCode": "requireLower",
        "MessageDescription": "Password must contain a lowercase letter."
    },
    {
        "MessageCode": "requireSpecial",
        "MessageDescription": "Password must contain a special character."
    },
    {
        "MessageCode": "requireNumber",
        "MessageDescription": "Password must contain a number."
    },
    {
        "MessageCode": "maximumLength",
        "MessageDescription": "Password must be less than " + enums.passwordPolicy.maximumLength + " letters long."
    },
    {
        "MessageCode": "fromDateRequired",
        "MessageDescription": "From date field is required."
    },
    {
        "MessageCode": "toDateRequired",
        "MessageDescription": "To date field is required."
    },
    {
        "MessageCode": "addApplicationSuccess",
        "MessageDescription": "Application added successfully."
    },
    {
        "MessageCode": "updateApplicationSuccess",
        "MessageDescription": "Application updated successfully."
    },
    {
        "MessageCode": "addApplicationFailed",
        "MessageDescription": "Application creation failed."
    },
    {
        "MessageCode": "updateApplicationFailed",
        "MessageDescription": "Application updation failed."
    },
    {
        "MessageCode": "appTypeRequired",
        "MessageDescription": "Application field is required."
    },
    {
        "MessageCode": "appTypeDoesNotExist",
        "MessageDescription": "Invalid application type code."
    },
    {
        "MessageCode": "invalidDocType",
        "MessageDescription": "Invalid file type."
    },
    {
        "MessageCode": "invalidBase64String",
        "MessageDescription": "Invalid Base64 file string."
    },
    {
        "MessageCode": "errorFileUpload",
        "MessageDescription": "Error has occured in uploading file."
    },
    {
        "MessageCode": "errorDocumentsSave",
        "MessageDescription": "Error has occured in saving documents."
    },
    {
        "MessageCode": "errorSkillsSave",
        "MessageDescription": "Error has occured in saving skills."
    },
    {
        "MessageCode": "errorCertificationsSave",
        "MessageDescription": "Error has occured in saving certifications."
    },
    {
        "MessageCode": "errorEducationsSave",
        "MessageDescription": "Error has occured in saving educations."
    },
    {
        "MessageCode": "errorLicensesSave",
        "MessageDescription": "Error has occured in saving licenses."
    },
    {
        "MessageCode": "apptypeIdRequired",
        "MessageDescription": "Applicationtype Id field is required."
    },
    {
        "MessageCode": "invalidApptypeId",
        "MessageDescription": "Invalid Applicationtype Id."
    },
    {
        "MessageCode": "legalAppIdRequired",
        "MessageDescription": "Legalapp Id field is required."
    },
    {
        "MessageCode": "invalidLegalAppId",
        "MessageDescription": "Invalid Legalapp Id."
    },

    {
        "MessageCode": "legalDocNameRequired",
        "MessageDescription": "Legaldocname field is required."
    },
    {
        "MessageCode": "legalDocumentRequired",
        "MessageDescription": "Legaldocument field is required."
    },

    {
        "MessageCode": "fileUploadedSuccess",
        "MessageDescription": "File uploaded successfully."
    },
    {
        "MessageCode": "deleteDocSuccess",
        "MessageDescription": "Document deleted successfully."
    },
    {
        "MessageCode": "countryIdRequired",
        "MessageDescription": "Country Id field is required."
    },

    {
        "MessageCode": "countryIdInvalid",
        "MessageDescription": "Country Id is invalid."
    },
    
    {
        "MessageCode": "stateIdRequired",
        "MessageDescription": "State Id field is required."
    },
    {
        "MessageCode": "checkListIdRequired",
        "MessageDescription": "Checklist Id field is required."
    },
    {
        "MessageCode": "invalidCheckListId",
        "MessageDescription": "Invalid Checklist Id."
    },
    {
        "MessageCode": "employeeSkillDetailsIdRequired",
        "MessageDescription": "EmployeeSkillDetails Id field is required."
    },
    {
        "MessageCode": "employeeSkillDetailsIdNotValidInteger",
        "MessageDescription": "EmployeeSkillDetails Id field is not a valid integer."
    },
    {
        "MessageCode": "skillIdRequired",
        "MessageDescription": "Skill Id field is required."
    },
    {
        "MessageCode": "skillIdNotValidInteger",
        "MessageDescription": "Skill Id field is not a valid integer."
    },
    {
        "MessageCode": "yearsOfExperienceRequired",
        "MessageDescription": "Years Of Experience field is required."
    },
    {
        "MessageCode": "skillActionRequired",
        "MessageDescription": "Skill action field is required."
    },
    {
        "MessageCode": "certificateNameRequired",
        "MessageDescription": "Certificate Name  field is required."
    },
    {
        "MessageCode": "issuedByRequired",
        "MessageDescription": "Certification Issued By field is required."
    },
    {
        "MessageCode": "certificationExpirationDateRequired",
        "MessageDescription": "Certification ExpirationDate field is required."
    },
    {
        "MessageCode": "licenseTypeIdRequired",
        "MessageDescription": "LicenseTypeId field is required."
    },
    {
        "MessageCode": "licenseTypeIdNotValidInteger",
        "MessageDescription": "LicenseTypeId field is not a valid integer."
    },
    {
        "MessageCode": "registeredStateIdRequired",
        "MessageDescription": "Registered State field is required."
    },
    {
        "MessageCode": "registeredStateIdNotValidInteger",
        "MessageDescription": "Registered State field is not a valid integer."
    },
    {
        "MessageCode": "employeeLicenseIdRequired",
        "MessageDescription": "EmployeeLicense Id field is required."
    },
    {
        "MessageCode": "employeeLicenseIdNotValidInteger",
        "MessageDescription": "EmployeeLicense Id field is not a valid integer."
    },
    {
        "MessageCode": "licenceNumberRequired",
        "MessageDescription": "licence Number field is required."
    },
    {
        "MessageCode": "licenceExpirationDateRequired",
        "MessageDescription": "Licence ExpirationDate field is required."
    },
    {
        "MessageCode": "empCertificationDetailsIdRequired",
        "MessageDescription": "EmpCertificationDetails Id field is required."
    },
    {
        "MessageCode": "empCertificationDetailsIdNotValidInteger",
        "MessageDescription": "EmpCertificationDetails Id field is not a valid integer."
    },
    {
        "MessageCode": "degreeIdRequired",
        "MessageDescription": "DegreeId field is required."
    },
    {
        "MessageCode": "degreeIdNotValidInteger",
        "MessageDescription": "DegreeId field is not a valid integer."
    },
    {
        "MessageCode": "collegeOrSchoolRequired",
        "MessageDescription": "CollegeOrSchool field is required."
    },
    {
        "MessageCode": "educationCountryIdRequired",
        "MessageDescription": "Education Country field is required."
    },
    {
        "MessageCode": "educationCountryIdNotValidInteger",
        "MessageDescription": "Education Country field is not a valid integer."
    },
    {
        "MessageCode": "attendedFromRequired",
        "MessageDescription": "Attended From field is required."
    },
    {
        "MessageCode": "attendedToRequired",
        "MessageDescription": "Attended To field is required."
    },
    {
        "MessageCode": "employeeEducationIdRequired",
        "MessageDescription": "EmployeeEducation Id field is required."
    },
    {
        "MessageCode": "employeeEducationIdNotValidInteger",
        "MessageDescription": "EmployeeEducation Id field is not a valid integer."
    },
    {
        "MessageCode": "candidateEmploymentExperienceIdNotValidInteger",
        "MessageDescription": "CandidateEmploymentExperience Id field is not a valid integer."
    },
    {
        "MessageCode": "candidateAchievementsIdNotValidInteger",
        "MessageDescription": "CandidateAchievements Id field is not a valid integer."
    },
    {
        "MessageCode": "fileNameRequired",
        "MessageDescription": "File Name field is required."
    },
    {
        "MessageCode": "fileRequired",
        "MessageDescription": "File field is required."
    },
    {
        "MessageCode": "fileNameExtensionRequired",
        "MessageDescription": "FileName with extension is required."
    },
    {
        "MessageCode": "candidateDocIdRequired",
        "MessageDescription": "CandidateDoc Id field is required."
    },
    {
        "MessageCode": "candidateDocIdNotValidInteger",
        "MessageDescription": "CandidateDoc Id field is not a valid integer."
    },
    {
        "MessageCode": "authorisationStatusIdNotValidInteger",
        "MessageDescription": "AuthorisationStatus Id field is not a valid integer."
    },
    {
        "MessageCode": "jobSearchStatusIdNotValidInteger",
        "MessageDescription": "JobSearchStatus Id field is not a valid integer."
    },
    {
        "MessageCode": "totalExpNotValidInteger",
        "MessageDescription": "TotalExp field is not a valid integer."
    },
    {
        "MessageCode": "totalUsExpNotValidInteger",
        "MessageDescription": "TotalUsExp field is not a valid integer."
    },
    {
        "MessageCode": "countryIdNotValidInteger",
        "MessageDescription": "Country Id field is not a valid integer."
    },
    {
        "MessageCode": "stateIdNotValidInteger",
        "MessageDescription": "State Id field is not a valid integer."
    },
    {
        "MessageCode": "cityIdNotValidInteger",
        "MessageDescription": "City Id field is not a valid integer."
    },
    {
        "MessageCode": "dobNotValidDate",
        "MessageDescription": "Dob field is not a valid date format."
    },
    {
        "MessageCode": "fromDateNotValidDate",
        "MessageDescription": "From Date field is not a valid date format."
    },
    {
        "MessageCode": "toDateNotValidDate",
        "MessageDescription": "To Date field is not a valid date format."
    },
    {
        "MessageCode": "licenceExpirationDateNotValidDate",
        "MessageDescription": "LicenceExpirationDate field is not a valid date format."
    },
    {
        "MessageCode": "certificationsExpirationDateNotValidDate",
        "MessageDescription": "Certifications field is not a valid date format."
    },
    {
        "MessageCode": "reasonRequired",
        "MessageDescription": "reason field is required."
    },
    {
        "MessageCode": "contactInfoRequired",
        "MessageDescription": "contactInfo field is required."
    },
    {
        "MessageCode": "vacationSavedSuccess",
        "MessageDescription": "Vacation request saved successfully."
    },
    {
        "MessageCode": "projectIdRequired",
        "MessageDescription": "Project Id field is required."
    },
    {
        "MessageCode": "assignmentidRequired",
        "MessageDescription": "Assignment Id field is required."
    },
    {
        "MessageCode": "projectTitleRequired",
        "MessageDescription": "Project Title field is required."
    },
    {
        "MessageCode": "projectDurationRequired",
        "MessageDescription": "Project Duration field is required."
    },
    {
        "MessageCode": "projectDescriptionRequired",
        "MessageDescription": "Project Description field is required."
    },
    {
        "MessageCode": "technologyIdRequired",
        "MessageDescription": "Primary Technology field is required."
    },
    {
        "MessageCode": "technologyIdNotValidInteger",
        "MessageDescription": "Primary Technology field is not a valid integer."
    },

    {
        "MessageCode": "roleRequired",
        "MessageDescription": "Role field is required."
    },
    {
        "MessageCode": "managerNameRequired",
        "MessageDescription": "Manager Name field is required."
    },
    {
        "MessageCode": "managerTitleRequired",
        "MessageDescription": "Manager Title field is required."
    },
    {
        "MessageCode": "managerEmailRequired",
        "MessageDescription": "Manager Email field is required."
    },
    {
        "MessageCode": "managerPhoneRequired",
        "MessageDescription": "A valid manager phone is required."
    },
    {
        "MessageCode": "licenseActionRequired",
        "MessageDescription": "License action field is required."
    },
    {
        "MessageCode": "certificationsActionRequired",
        "MessageDescription": "Certifications action field is required."
    },
    {
        "MessageCode": "educationsActionRequired",
        "MessageDescription": "Educations action field is required."
    },
    {
        "MessageCode": "documentsActionRequired",
        "MessageDescription": "Documents action field is required."
    },
    {
        "MessageCode": "projectDetailIdRequired",
        "MessageDescription": "A valid ProjectDetail Id field is required."
    },

    {
        "MessageCode": "projectDetailIdNotValidInteger",
        "MessageDescription": "ProjectDetail Id field is not a valid integer."
    },

    {
        "MessageCode": "projectIdNotValidInteger",
        "MessageDescription": "Project Id field is not a valid integer."
    },
    {
        "MessageCode": "technologyIdNotValidInteger",
        "MessageDescription": "Technology Id field is not a valid integer."
    },
    {
        "MessageCode": "roleNotValidInteger",
        "MessageDescription": "Role field is not a valid integer."
    },
    {
        "MessageCode": "projectDetailIdDoesNotExist",
        "MessageDescription": "Invalid Project Detail Id."
    },
    {
        "MessageCode": "lengthExceed100",
        "MessageDescription": "Length should not exceed 100 characters."
    },
    {
        "MessageCode": "lengthExceed200",
        "MessageDescription": "Length should not exceed 200 characters."
    },
    {
        "MessageCode": "lengthExceed250",
        "MessageDescription": "Length should not exceed 250 characters."
    },
    {
        "MessageCode": "lengthExceed500",
        "MessageDescription": "Length should not exceed 500 characters."
    },
    {
        "MessageCode": "lengthExceed1000",
        "MessageDescription": "Length should not exceed 1000 characters."
    },
    {
        "MessageCode": "lengthExceed2000",
        "MessageDescription": "Length should not exceed 2000 characters."
    },
    {
        "MessageCode": "lengthExceed25",
        "MessageDescription": "Length should not exceed 25 characters."
    },
    {
        "MessageCode": "lengthExceed50",
        "MessageDescription": "Length should not exceed 50 characters."
    },
    {
        "MessageCode": "lengthExceed20",
        "MessageDescription": "Length should not exceed 20 characters."
    },
    {
        "MessageCode": "lengthExceed30",
        "MessageDescription": "Length should not exceed 30 characters."
    },
    {
        "MessageCode": "lengthExceed5",
        "MessageDescription": "Length should not exceed 5 characters."
    },
    {
        "MessageCode": "lengthExceed10",
        "MessageDescription": "Length should not exceed 10 characters."
    },
    {
        "MessageCode": "lengthExceed4",
        "MessageDescription": "Length should not exceed 4 characters."
    },
    {
        "MessageCode": "lengthExceed3",
        "MessageDescription": "Length should not exceed 3 characters."
    },
    {
        "MessageCode": "emailInvalid",
        "MessageDescription": "Invalid EmailId."
    },
    {
        "MessageCode": "yearsOfExperienceNotValidInteger",
        "MessageDescription": "yearsOfExperience field is not a valid integer."
    },
    {
        "MessageCode": "notValidYear",
        "MessageDescription": "This field is not a valid year."
    },
    {
        "MessageCode": "checkListIdNotValidInteger",
        "MessageDescription": "Invalid Check List Id."
    },
    {
        "MessageCode": "captchaRequired",
        "MessageDescription": "Recaptcha field is required."
    },
    {
        "MessageCode": "termsConditionsRequired",
        "MessageDescription": "Terms and conditions field is required."
    },
    {
        "MessageCode": "captchInvalid",
        "MessageDescription": "Failed captcha verification."
    },

    {
        "MessageCode": "contentRequired",
        "MessageDescription": "Content field is required."
    },
    {
        "MessageCode": "contactUsSuccess",
        "MessageDescription": "Email sent successfully, Thank-you for contacting us."
    },
    {
        "MessageCode": "id",
        "MessageDescription": "Id field is required."
    },
    {
        "MessageCode": "invalidId",
        "MessageDescription": "Invalid field Id."
    },
    {
        "MessageCode": "accountAlreadyActivated",
        "MessageDescription": "Account linked with this username has already been activated."
    },
    {
        "MessageCode": "accountNotActivated",
        "MessageDescription": "Your account is not verified, click here to get the activation link."
    },
    {
        "MessageCode": "emailActivateSuccess",
        "MessageDescription": "Account Activated Successfully."
    },
    {
        "MessageCode": "emailActivate",
        "MessageDescription": "Error has occurred in email activation."
    },
    {
        "MessageCode": "fromDateCantGreater",
        "MessageDescription": "From date field cant be greater than To date field."
    },
    {
        "MessageCode": "passwordCreatedSuccess",
        "MessageDescription": "Password for social login has been created successfully."
    },
    {
        "MessageCode": "passwordAlreadyCreated",
        "MessageDescription": "Password for your social login has already been created."
    },
    {

        "MessageCode": "yearRequired",
        "MessageDescription": "Year field is required."
    },
    {
        "MessageCode": "yearInvalid",
        "MessageDescription": "Year field is invalid."
    },
    {
        "MessageCode": "monthInvalid",
        "MessageDescription": "Month field is invalid."
    },
    {
        "MessageCode": "statusIdInvalid",
        "MessageDescription": "StatusId field is invalid."
    },

    {
        "MessageCode": "invalidPayrollCalenderType",
        "MessageDescription": "Invalid payrollCalenderType."
    },
    {
        "MessageCode": "payrollCalenderTypeRequired",
        "MessageDescription": "payrollCalenderType is Required ."
    },
    {
        "MessageCode": "accountActivate",
        "MessageDescription": "An email with the account activate link has been sent on your email-Id."
    },
    {
        "MessageCode": "invalidFileType",
        "MessageDescription": "Invalid file type."
    },

    {
        "MessageCode": "joinSameClientRequired",
        "MessageDescription": "joinSameClient is Required ."
    },

    {
        "MessageCode": "fromDateRequired",
        "MessageDescription": "From Date is Required ."
    },

    {
        "MessageCode": "toDateRequired",
        "MessageDescription": "To Date is Required ."
    },

    {
        "MessageCode": "fromDateNotValid",
        "MessageDescription": "Invalid format of From Date."
    },

    {
        "MessageCode": "toDateNotValid",
        "MessageDescription": "Invalid format of To Date."
    },

    {
        "MessageCode": "invalidDateRange",
        "MessageDescription": "From Date should be less than To Date."
    },

    {
        "MessageCode": "dateDifferenceErr",
        "MessageDescription": "You can view/fill only upto 2 months Time Card at once."
    },

    {
        "MessageCode": "futureEndDate",
        "MessageDescription": "You can not fill future date Time Card."
    },
    {
        "MessageCode": "faqTypeRequired",
        "MessageDescription": "faqType field is Required ."
    },

    {
        "MessageCode": "userProfileCannotBeUpdated",
        "MessageDescription": enums.authorisationStatus.usCitizens + " are not eligible for adding Immigration Application."
    },
    {
        "MessageCode": "newEmailIdRequired",
        "MessageDescription": "newEmailId field is required"
    },
    {
        "MessageCode": "newEmailExists",
        "MessageDescription": "newEmailId already exists"
    },
    {
        "MessageCode": "emailIdChangedSuccess",
        "MessageDescription": "User emailId has been changed successfully."
    },
    {
        "MessageCode": "resumeFileNameRequired",
        "MessageDescription": "resumeFileName field is required."
    },
    {
        "MessageCode": "resumeFileRequired",
        "MessageDescription": "resumeFile field is required."
    },
    {
        "MessageCode": "invalidFaqType",
        "MessageDescription": "Invalid faq type id."
    },
    {
        "MessageCode": "deptNameRequired",
        "MessageDescription": "deptName field is required."
    },
    {
        "MessageCode": "invalidDeptName",
        "MessageDescription": "Invalid department name."
    },
    {
        "MessageCode": "invalidFaqType",
        "MessageDescription": "Invalid faq type id."
    },
    {
        "MessageCode": "searchTextRequired",
        "MessageDescription": "SearchText field is required."
    },
    {
        "MessageCode": "totalHoursRequired",
        "MessageDescription": "Total Hours field is Required."
    },
    {
        "MessageCode": "projectIdRequired",
        "MessageDescription": "ProjectId field is required."
    },
    {
        "MessageCode": "emailNotMatchWithSocailEmail",
        "MessageDescription": "Entered email does not match with social media email."
    },
    {
        "MessageCode": "joinSameClientNotValidboolean",
        "MessageDescription": "JoinSameClient field is invalid."
    },
    {
        "MessageCode": "accessTokenInvalid",
        "MessageDescription": "Invalid access token."
    },

    {
        "MessageCode": "totalHrsMissing",
        "MessageDescription": "Total Hours is missing."

    },

    {
        "MessageCode": "totalHrsInvalid",
        "MessageDescription": "Total Hours is more than 24 Hours a day."
    },
    {
        "MessageCode": "projectIdMissing",
        "MessageDescription": "ProjectId is missing."
    },
    {
        "MessageCode": "invalidEmployeeType",
        "MessageDescription": "External Users cannot create vacation request."
    },
    {
        "MessageCode": "regularHoursMissing",
        "MessageDescription": "Regular Hours missing."
    },

    {
        "MessageCode": "totalHoursMissing",
        "MessageDescription": "Total Hours missing."
    },

    {
        "MessageCode": "overTimeHoursMissing",
        "MessageDescription": "OverTime Hours missing."
    },


    {
        "MessageCode": "weekEndTotalHoursMissing",
        "MessageDescription": "Week End Total Hours is missing."
    },

    {
        "MessageCode": "dayMissing",
        "MessageDescription": "Week Day missing."
    },

    {
        "MessageCode": "weekEndMissing",
        "MessageDescription": "Weekend Date missing."
    },

    {
        "MessageCode": "invalidSummaryId",
        "MessageDescription": "Summary Id is missing."
    },
    {
        "MessageCode": "employeeEducationIdNotValid",
        "MessageDescription": "Employee Education Id is not valid."
    },
    {
        "MessageCode": "candidateEmploymentExperienceIdNotValid",
        "MessageDescription": "Candidate Employment Experience Id is not valid."
    },
    {
        "MessageCode": "candidateDocIdNotValid",
        "MessageDescription": "Candidate Doc Id is not valid."
    },
    {
        "MessageCode": "employeeLicenseIdNotValid",
        "MessageDescription": "Employee License Id is not valid."
    },
    {
        "MessageCode": "empCertificationDetailsIdNotValid",
        "MessageDescription": "Employee Certification Details Id is not valid."
    },
    {
        "MessageCode": "employeeSkillDetailsIdNotValid",
        "MessageDescription": "Employee Skill Details Id is not valid."
    },
    {
        "MessageCode": "candidateAchievementsIdNotValid",
        "MessageDescription": "Candidate Achievements Id is not valid."
    },
    {
        "MessageCode": "deleteSuccess",
        "MessageDescription": "Deleted successfully."
    },
    {
        "MessageCode": "idFieldsRequired",
        "MessageDescription": "Atleast one Id field required."
    },
    {
        "MessageCode": "invalidTsEntryId",
        "MessageDescription": "Timesheet Entry Id is missing."

    },
    {
        "MessageCode": "publicProfileNotValidBoolean",
        "MessageDescription": "Public Profile field is invalid."
    },

    {
        "MessageCode": "invalidInvoiceId",
        "MessageDescription": "Timesheet Id is missing."

    },

    {
        "MessageCode": "tsEntryStatusMissing",
        "MessageDescription": "Timesheet Entry Status is missing."

    },
    {
        "MessageCode": "skillSaved",
        "MessageDescription": "Skill saved successfully."
    },
    {
        "MessageCode": "experiencesSaved",
        "MessageDescription": "Experience saved successfully."
    },

    {
        "MessageCode": "skillIdNotExist",
        "MessageDescription": "Skill Id does not exist."
    },
    {
        "MessageCode": "educationSaved",
        "MessageDescription": "Education saved successfully."
    },
    {
        "MessageCode": "educationIdNotExist",
        "MessageDescription": "Education Id does not exist."
    },
    {
        "MessageCode": "blankRequest",
        "MessageDescription": "Can not post blank request."
    },
    {
        "MessageCode": "licenseSaved",
        "MessageDescription": "License saved successfully."
    },
    {
        "MessageCode": "documentsSaved",
        "MessageDescription": "Document saved successfully."
    },
    {
        "MessageCode": "certificationSaved",
        "MessageDescription": "Certification saved successfully."
    },
    {
        "MessageCode": "candidateAchievementSaved",
        "MessageDescription": "Achievements saved successfully."
    },
    {
        "MessageCode": "profileSaved",
        "MessageDescription": "User profile saved successfully."
    },
    {
        "MessageCode": "publicProfileNotValidBoolean",
        "MessageDescription": "Public Profile field is invalid."
    },

    {
        "MessageCode": "invalidInvoiceId",
        "MessageDescription": "Timesheet Id is missing."

    },
    {
        "MessageCode": "tsEntryStatusMissing",
        "MessageDescription": "Timesheet Entry Status field is missing."

    },
    {
        "MessageCode": "availabilityIdInvalid",
        "MessageDescription": "Availability Id field is invalid."
    },
    {
        "MessageCode": "annualSalaryInvalid",
        "MessageDescription": "Annual Salary field is invalid. "
    },
    {
        "MessageCode": "contractRateTypeIdInvalid",
        "MessageDescription": "Contract Rate Type id is invalid."
    },
    {
        "MessageCode": "interestedSmeNotValidBoolean",
        "MessageDescription": "Interested Sme field is invalid."
    },
    {
        "MessageCode": "interestedCounsellorNotValidBoolean",
        "MessageDescription": "Interested Counsellor field is invalid."
    },
    {
        "MessageCode": "employeeEducationIdRequired",
        "MessageDescription": "Employee Education Id field is required."
    },
    {
        "MessageCode": "employeeEducationIdInvalid",
        "MessageDescription": "Employee Education Id field is invalid."
    },
    {
        "MessageCode": "qualificationIdRequired",
        "MessageDescription": "Qualification Id field is required."
    },
    {
        "MessageCode": "qualificationIdInvalid",
        "MessageDescription": "Qualification Id field is invalid."
    },
    {
        "MessageCode": "institutionNameRequired",
        "MessageDescription": "Institution Name field is required."
    },
    {
        "MessageCode": "passingYearRequired",
        "MessageDescription": "Passing Year field is required."
    },
    {
        "MessageCode": "passingYearInvalid",
        "MessageDescription": "Passing Year field is invalid."
    },
    {
        "MessageCode": "candidateEmploymentExperienceIdRequired",
        "MessageDescription": "Candidate Employment Experience Id field is required."
    },
    {
        "MessageCode": "candidateEmploymentExperienceIdInvalid",
        "MessageDescription": "Candidate Employment Experience Id field is invalid."
    },
    {
        "MessageCode": "cityIdRequired",
        "MessageDescription": "City Id field is required."
    },
    {
        "MessageCode": "cityIdInvalid",
        "MessageDescription": "City Id field is invalid."
    },
    {
        "MessageCode": "positionEndDateInvalid",
        "MessageDescription": "Position End Date field is invalid."
    },
    {
        "MessageCode": "positionResponsibilitiesRequired",
        "MessageDescription": "Position Responsibilities field is required."
    },
    {
        "MessageCode": "positionStartDateRequired",
        "MessageDescription": "Position Start Date field is required."
    },
    {
        "MessageCode": "positionStartDateInvalid",
        "MessageDescription": "Position Start Date field is invalid."
    },
    {
        "MessageCode": "skillCreated",
        "MessageDescription": "Skill created successfully."

    },
    {
        "MessageCode": "skillUpdated",
        "MessageDescription": "Skill updated successfully."
    },
    {
        "MessageCode": "skillIdNotExist",
        "MessageDescription": "Skill Id does not exist."
    },
    {
        "MessageCode": "educationCreated",
        "MessageDescription": "Education created successfully."

    },
    {
        "MessageCode": "educationUpdated",
        "MessageDescription": "Education updated successfully."
    },
    {
        "MessageCode": "educationIdNotExist",
        "MessageDescription": "Education Id does not exist."
    },
    {
        "MessageCode": "blankRequest",
        "MessageDescription": "Can not post blank request."
    },
    {
        "MessageCode": "positionTitleRequired",
        "MessageDescription": "Position Title field is required."
    },
    {
        "MessageCode": "employerNameRequired",
        "MessageDescription": "EmployerName field is required."
    },
    {
        "MessageCode": "stateIdInvalid",
        "MessageDescription": "State Id field is invalid."
    },
    {
        "MessageCode": "candidateDocIdRequired",
        "MessageDescription": "Candidate Doc Id field is required."
    },
    {
        "MessageCode": "candidateDocIdInvalid",
        "MessageDescription": "Candidate Doc Id field is invalid."
    },
    {
        "MessageCode": "fileNameRequired",
        "MessageDescription": "File Name field is required."
    },

    {
        "MessageCode": "fileDataRequired",
        "MessageDescription": "File Data field is required."
    },

    {
        "MessageCode": "fileRequired",
        "MessageDescription": "File field is required."
    },
    {
        "MessageCode": "employeeLicenseIdRequired",
        "MessageDescription": "Employee License Id field is required."
    },
    {
        "MessageCode": "employeeLicenseIdInvalid",
        "MessageDescription": "Employee License Id field is invalid."
    },
    {
        "MessageCode": "licenceNumberRequired",
        "MessageDescription": "Licence Number field is required."
    },
    {
        "MessageCode": "licenseTypeIdRequired",
        "MessageDescription": "License Type Id field is required."
    },
    {
        "MessageCode": "licenseTypeIdInvalid",
        "MessageDescription": "License Type Id field is invalid."
    },
    {
        "MessageCode": "registeredStateIdRequired",
        "MessageDescription": "Registered State Id field is required."
    },
    {
        "MessageCode": "registeredStateIdInvalid",
        "MessageDescription": "Registered State Id field is invalid."
    },
    {
        "MessageCode": "expiryRenewalDateRequired",
        "MessageDescription": "Expiry Renewal Date field is required."
    },
    {
        "MessageCode": "expiryRenewalDateInvalid",
        "MessageDescription": "Expiry Renewal Date field is invalid."
    },
    {
        "MessageCode": "empCertificationDetailsIdRequired",
        "MessageDescription": "Employee Certification Details Id field is required."
    },
    {
        "MessageCode": "empCertificationDetailsIdInvalid",
        "MessageDescription": "Employee Certification Details Id field is invalid."
    },
    {
        "MessageCode": "certificateExamNameRequired",
        "MessageDescription": "Certificate Exam Name field is required."
    },
    {
        "MessageCode": "issuedByRequired",
        "MessageDescription": "Issued By field is required."
    },
    {
        "MessageCode": "employeeSkillDetailsIdRequired",
        "MessageDescription": "Employee Skill Details Id field is required."
    },
    {
        "MessageCode": "employeeSkillDetailsIdInvalid",
        "MessageDescription": "Employee Skill Details Id field is invalid."
    },
    {
        "MessageCode": "skillIdRequired",
        "MessageDescription": "Skill Id field is required."
    },
    {
        "MessageCode": "skillIdInvalid",
        "MessageDescription": "Skill Id field is invalid."
    },
    {
        "MessageCode": "yearsRequired",
        "MessageDescription": "Years field is required."
    },
    {
        "MessageCode": "yearsInvalid",
        "MessageDescription": "Years field is invalid."
    },
    {
        "MessageCode": "monthsRequired",
        "MessageDescription": "Months field is required."
    },
    {
        "MessageCode": "monthsInvalid",
        "MessageDescription": "Months field is invalid."
    },
    {
        "MessageCode": "candidateAchievementsIdRequired",
        "MessageDescription": "Candidate Achievement Id field is required."
    },
    {
        "MessageCode": "candidateAchievementsIdInvalid",
        "MessageDescription": "Candidate Achievement Id field is invalid."
    },
    {
        "MessageCode": "descriptionRequired",
        "MessageDescription": "Description field is required."
    },
    {
        "MessageCode": "EmailExists",
        "MessageDescription": "Email-Id already exists."
    },
    {
        "MessageCode": "countryIdNotValidInteger",
        "MessageDescription": "Country Id field is not a valid integer."
    },
    {
        "MessageCode": "stateIdNotValidInteger",
        "MessageDescription": "State Id field is not a valid integer."
    },
    {
        "MessageCode": "cityIdNotValidInteger",
        "MessageDescription": "City Id field is not a valid integer."
    },
    {
        "MessageCode": "dobInvalid",
        "MessageDescription": "D.O.B. field is invalid."
    },
    {
        "MessageCode": "industryVerticalIdInvalid",
        "MessageDescription": "Industry Vertical Id field is invalid."
    },
    {
        "MessageCode": "requestTypeRequired",
        "MessageDescription": "Select Type of Request."
    },
    {
        "MessageCode": "mobileNoRequired",
        "MessageDescription": "Mobile Number is required"
    },
    {
        "MessageCode": "commentsRequired",
        "MessageDescription": "Comments is required."
    },
    {
        "MessageCode": "clientSheetRequired",
        "MessageDescription": "ClientSheet is required."
    },
    {
        "MessageCode": "publicProfileRequired",
        "MessageDescription": "Public Profile field is required."
    },
    {
        "MessageCode": "interestedSmeRequired",
        "MessageDescription": "IntersetedSme field is required."
    },
    {
        "MessageCode": "interestedCounsellorRequired",
        "MessageDescription": "Interested Counsellor field is required."
    },
    {
        "MessageCode": "timeCardRequired",
        "MessageDescription": "TimeCard is required."
    },
    {
        "MessageCode": "expenseSuccess",
        "MessageDescription": "Expense request saved successfully."
    },
    {
        "MessageCode": "projectDetailIdRequired",
        "MessageDescription": "Project field is required."
    },
    {
        "MessageCode": "expenseFromDateRequired",
        "MessageDescription": "Expense from date field is required."
    },
    {
        "MessageCode": "expenseToDateRequired",
        "MessageDescription": "Expense to date field is required."
    },
    {
        "MessageCode": "expenseFromDateNotValidDate",
        "MessageDescription": "Expense from date is not a valid date."
    },
    {
        "MessageCode": "expenseToDateNotValidDate",
        "MessageDescription": "Expense to date is not a valid date."
    },
    {
        "MessageCode": "expenseFromDateCantGeater",
        "MessageDescription": "Expense from date can't be greater than to date."
    },
    {
        "MessageCode": "billableToClientRequired",
        "MessageDescription": "Billable to client field is required"
    },
    {
        "MessageCode": "billableToClientNotValidBoolean",
        "MessageDescription": "Billable to client field is not valid"
    },
    {
        "MessageCode": "expenseAmountNotValidInteger",
        "MessageDescription": "Billable to client field is not valid"
    },
    {
        "MessageCode": "newsTypeRequired",
        "MessageDescription": "News Type field is required"
    },
    {
        "MessageCode": "invalidNewsType",
        "MessageDescription": "News Type field is not valid"
    },
    {
        "MessageCode": "expenseAmountRequired",
        "MessageDescription": "Expense amount field required"
    },
    {
        "MessageCode": "employeeSkillIdNotValid",
        "MessageDescription": "Employee Skill Id Not Valid."
    },

    {
        "MessageCode": "employeeExperienceIdInvalid",
        "MessageDescription": "Employee Experiece Id Not Valid."
    },

    {
        "MessageCode": "employeeCertificationIdInvalid",
        "MessageDescription": "Employee Certification Id Not Valid."
    },

    {
        "MessageCode": "employeeAchievementsIdNotValid",
        "MessageDescription": "Employee Achievement Id Not Valid."
    },

    {
        "MessageCode": "employeeDocumentIdInvalid",
        "MessageDescription": "Employee Document Id Not Valid."
    },
    {
        "MessageCode": "pageNumRequired",
        "MessageDescription": "PageNum field is required."
    },
    {
        "MessageCode": "pageSizeRequired",
        "MessageDescription": "PageSize field is required."
    },
    {
        "MessageCode": "pageNumIntRequired",
        "MessageDescription": "PageNum must be a positive integer"
    },
    {
        "MessageCode": "pageSizeIntRequired",
        "MessageDescription": "PageSize must be a positive integer"
    },
    {
        "MessageCode": "pageNumNonZero",
        "MessageDescription": "PageNum must be greater then zero"
    },
    {
        "MessageCode": "pageSizeNonZero",
        "MessageDescription": "PageSize must be greater then zero"
    },    
    {
        "MessageCode": "appForIdNotValidInteger",
        "MessageDescription": "AppForId field is not a valid integer."
    },    
    {
        "MessageCode": "maximumVacationLimitExceed",
        "MessageDescription": "Vacation Request can't be greater than 5 days"
    },

    {
        "MessageCode": "annualSalaryRequired",
        "MessageDescription": "Annual salary is required."
    },

    {
        "MessageCode": "annualSalaryInvalid",
        "MessageDescription": "Invalid annual salary."
    },    

    {
        "MessageCode": "candidateSkillIdInvalid",
        "MessageDescription": "Candidaet sill id is invalid."
    },

    {
        "MessageCode": "skillNameRequired",
        "MessageDescription": "Skill name is required."
    },


    {
        "MessageCode": "yearExpRequired",
        "MessageDescription": "Year of experience is required."
    },

    {
        "MessageCode": "yearExpInvalid",
        "MessageDescription": "Year of experience is invalid."
    },

    {
        "MessageCode": "candidateSkillIdNotValid",
        "MessageDescription": "Invalid candidate skill id."
    },

    {
        "MessageCode": "totalExpInvalid",
        "MessageDescription": "Invalid total experience."
    },

    {
        "MessageCode": "invalidContact",
        "MessageDescription": "Invalid phone no."
    },


    
    

];

function messageCode(code) {
    let returnMessage = undefined;
    for (let i = 0; i < msgCodes.length; i++) {
        if (msgCodes[i].MessageCode === code) {
            returnMessage = msgCodes[i].MessageDescription;
            break;
        }
    }
    return returnMessage;
}


module.exports = {
    messageCode: messageCode
}