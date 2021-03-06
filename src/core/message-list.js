

import enums from '../core/enums';
import fieldsLength from '../core/fieldsLength';

let messageList = {
    invalidAuthToken: "Invalid token or token has expired, please signin again",
    unauthorized401: "Unauthorized access",
    common401: "Unauthorized access",
    common404: "Not found",
    common402: "Incorrect Data Format",
    common500: "Something went wrong, Please try after some time",
    common400: "Bad request",
    Common204: "No content",

    saved: "Saved successfully",
    deleted: "Data delete successfully",

    emailExists: "Provided email is already registered with us",


    invalidFile: "Invalid file type",
    invalidData: "Invalid data provided",
    blankRequest: "Can't process blank request",
    resumeFormat : "An error occurred while processing resume, please contact support",
    fileSizeError : "The file you are uploading exceeds the "+ enums.uploadType.maxFileSize +"MB limit",
    // invalidResume : "Not able to parse the resume. Please ensure your resume is in readable format and doesn't contains too many images",
    invalidResume : "Unable to analyze your resume. Make sure to upload an original copy that's mostly text. Scanned versions or resumes with images may cause errors",

    file: "A valid file is required",
    resume: "A valid resume is required",
    date: "A valid date is required",
    firstName: "A valid first name is required",
    lastName: "A valid last name is required",
    email: "Valid email address required (e.g. example@email.com)",
    phone: "Use ten digits including area code",
    resumeName: "A valid file name is required",
    resumeFile: "A valid file is required",

    //Account
    invalidUserNamePassword: "Invalid username and/or password",
    accountNotActivated: "Verification required. An email was sent with an activation link from StafflinePro™.",
    deActivateAccount: "Your account is disabled. Please contact support.",
    inactiveAccount : "Account is not active",
    // deActivateAccount: "Your account is either deactivated or temporarily closed. If you believe this is an error, please contact support",
    unAuthorizedAccount: "Your account is not authorized",
    // accFirstName: "First name is required, only alpha numeric upto " + fieldsLength.accounts.firstName + " characters are allowed",
    accFirstName: "Are you sure you entered your first name correctly?",
    accLastName: "Are you sure you entered your last name correctly?",
    password: "Use at least 8 characters, including 1 uppercase letter and 1 symbol", // "Password must have alpha-numeric with an special character with a 8-20 characters in length",
    reCaptchaCode: "A valid reCaptcha is required",
    termsAndConditions: "Please agree to our Privacy Policy and Terms of use to continue",
    invalidDocType: "Invalid file type",
    resumeFileName: "A valid file is required",
    registeredSuccess: "User registered successfully",
    countryCode: "A valid country is required",
    invalidCode: "A valid code is required",
    code: "A valid code is required",
    expiredCode: "Your code has expired",
    codeORusername: "A valid code or user name is required",
    invalidUser: "Invalid user",
    validCode: "Code is valid",
    name : "A valid name is required",
    profilePicture: "Profile photos must be "+ enums.uploadType.userPicture.allowedExt.join(', '),
    jobStatusUpdated: "Updated successfully",
 
    //Account Activate
    employeeDetailsId: "A valid employeeDetailsId is required",
    userName: "A valid email/employee id is required",
    otpCode: "A valid OTP code is required",
    otpExpired: "OTP has been expired",
    accountAlreadyActivated: "Account linked with this username has already been activated",
    accountActivatedSuccess: "Your account is not active",
    accountActivatelink: "An email with the account activation link has been sent to your email ID",
    otpSentSuccess: "OTP has been sent successfully on your email ID",
    passwordMismatch: "Passwords must match",

    //change password
    passwordChangedSuccess: "Your password has been successfully changed",
    passwordCantBeSame: "Your new password must differ any previously used passwords",
    confirmPasswordNotMatched: "New password and confirm password does not match",
    invalidOldPassword: "A valid old password is required",
    resetPasswordMail: "An email with the reset password link has been sent to your email ID",
    confirmPassword: "Password and confirm password does not match",
    //logout
    logOutSuccess: "User logged-out successfully",

    //social login
    accessToken: "A valid accessToken is required",
    accessTokenExpired: "Access token has expired please try again",
    emailNotMatchWithSocailEmail: "Entered email does not match with social media email",
    socialEmailRequired: "User registration could not be completed due to email address in social media is required. Please update your social media and try again.",
    id: "A valid id is required",
    passwordCreatedSuccess: "Password for social login has been created successfully",
    passwordAlreadyCreated: "Password for your social login has already been created",
    passwordAlreadyExists: "Password already been created",
    passwordCreated: "Password created successfully",

    //user profile
    annualSalary: "A valid annual salary is required",
    dob: "A valid dob is required",
    publicProfile: "A valid publicProfile is required",
    countryId: "A valid country is required",
    stateId: "A valid state is required",
    cityId: "A valid city is required",
    zipCode: "Only alpha numeric upto " + fieldsLength.users.zipCode + " characters are allowed",
    currentJobTitle: "Only alpha numeric upto " + fieldsLength.users.currentJobTitle + " characters are allowed",
    totalExp: "A valid totalExp is required",
    totalUsExp: "A valid totalUsExp is required",
    availabilityId: "A valid availabilityId is required",
    currentLocation: "Only alpha numeric upto " + fieldsLength.users.address + " characters are allowed",
    authorisationStatusId: "A valid authorisationStatusId is required",
    jobSearchStatusId: "A valid jobSearchStatusId is required",
    contactNumber: "A valid contact number is required",
    domainId: "A valid domain is required",
    linkedIn: "Upto " + fieldsLength.users.linkedIn + " characters are allowed",
    twitter: "Upto " + fieldsLength.users.twitter + " characters are allowed",
    desiredEmployementKey: "A valid desiredEmployementKey is required",
    contractRate: "A valid contract rate is required",
    contractRateTypeId: "A valid contractRateTypeId is required",
    interestedSme: "A valid interested-sme is required",
    interestedCounsellor: "A valid interested counsellor is required",
    prefferedCity: "A valid preffered city is required",
    careerProfile: "Upto " + fieldsLength.users.comments + " characters are allowed",
    industryVerticalId: "A valid industryVerticalId is required",
    employeeEducationId: "A valid employeeEducationId is required",
    qualificationId: "A valid qualificationId is required",
    qualification: "A valid degree is required",
    passingYear: "A valid passing year is required",
    candidateEmploymentExperienceId: "A valid candidateEmploymentExperienceId is required",
    positionResponsibilities: "A valid position responsibilities is required",
    positionTitle: "A valid title is required", //"Only alpha numeric upto " + fieldsLength.users.positionTitle + " characters are required",
    employerName: "A valid company name is required", //"Only alpha numeric upto " + fieldsLength.users.employerName + " characters are required",
    institutionName: "A valid collage/school name is required",//"Only alpha numeric upto " + fieldsLength.users.institutionName + " characters are required",
    candidateDocId:  "A valid resume is required", //"A valid candidateDocId is required",
    fileType: "A valid fileType is required",
    empCertificationDetailsId: "A valid empCertificationDetailsId is required",
    // certificateExamName: "certificate name is required, only alpha numeric upto " + fieldsLength.users.certificateExamName + " characters are allowed",
    certificateExamName: "Certificate name is required, only alpha numeric characters are allowed",
    candidateSkillId: "A valid candidateSkillId is required",
    skillName: "A valid skill name is required",
    noPrimarySkill: "Please add primary skill",
    noSkill: "Please add skill",
    noResume: "Please add resume",
    yearExp: "A valid years of experience is required, maximum upto " + fieldsLength.users.yearsOfExp+"",
    candidateAchievementId: "A valid candidateAchievementId is required",
    socialContactsId: "A valid social contacts id is required",
    description: "A valid description is required",
    employeeLicenseId: "A valid employeeLicenseId is required",
    docName: "A valid title is required",
    image: "A valid image is required",
    informedAm: 'Your request has been submitted successfully.',
    numSkills : "You can set only 5 primary skills",
    duplicateSkill : "You have already added this skill",
    duplicateSkills : "You have mentioned same skill twice",
    minNumSkills : "Minimum three primary skills are required",
    guid : "A valid guid is required",

    //dashboard
    content: "A valid content is required",

    //immigration
    checkListId: "A valid checkListId is required",
    immFirstName: "First name is required, only alpha numeric upto " + fieldsLength.immigrations.firstName + " characters are allowed",
    immLastName: "Last name is required, only alpha numeric upto " + fieldsLength.immigrations.lastName + " characters are allowed",
    appForId: "App for is required",
    appPriorityId: "App priority is required",
    appType: "App type is required, only alpha numeric upto " + fieldsLength.immigrations.appType + " characters are allowed",
    currentStatus: "Current status is required, only alpha numeric upto " + fieldsLength.immigrations.currentStatus + " characters are allowed",
    skillCategoryId: "A valid skillCategoryId is required",
    comments: "Upto " + fieldsLength.immigrations.comments + " characters are allowed",
    legalAppId: "A valid legal app is required",
    errorFileUpload: "Error has occured in uploading file",
    updateApplicationFailed: "Application updation failed",
    cantUpdateImmigration: "Immigration can't update after submitting",
    noImmigration: "No immigration application found",

    //My projects
    projectDetailId: "A valid project is required",
    projectDuration: "Project duration is required, only alpha numeric upto " + fieldsLength.projects.projectDuration + " characters are allowed",
    projectDescription: "Project description is required, only alpha numeric upto " + fieldsLength.projects.projectDescription + " characters are allowed",
    technologyId: "A valid technology is required",
    roleId: "A valid role is required",
    managerName: "Manager name is required, only alpha numeric upto " + fieldsLength.projects.managerName + " characters are allowed",
    managerTitle: "Manager title is required, only alpha numeric upto " + fieldsLength.projects.managerTitle + " characters are allowed",
    specialComments: "Upto " + fieldsLength.projects.specialComments + " characters are allowed",
    projectEndDate : "Valid project end date is required",
    validReason : "Valid reason is required",
    ProjectEnded: "Project has been ended",

    //static pages
    payrollcalendertype: "A valid payroll calender type is required",
    newsType: "A valid news type is required",
    deptName: "A valid department name is required",
    requestType: "Request type is required, only alpha numeric upto " + fieldsLength.contactUs.requestType + " characters are allowed",
    mobileNo: "A valid mobile number is required",
    contactUsSuccess: "Email sent successfully, Thank-you for contacting us",
    contComments: "A valid comments is required",

    //vacation
    invalidEmployeeType: "External users cannot create vacation request",
    fromDateCantGreater: "Make sure your start date occurs before the end date",
    maximumVacationLimitExceed: "Vacation request can be a maximum of " + enums.vacationRequest.maxDays + " days",
    reason: "Reason is required, only alpha numeric upto " + fieldsLength.vacations.reason + " characters are allowed",
    contactInfo: "Contact info is required, only alpha numeric upto " + fieldsLength.vacations.contactInfo + " characters are allowed",
    joinSameClient: "A valid joinSameClient is required",
    fromDateCantPastDate : "Make sure your start date is not past date",
    toDateCantPastDate : "Make sure your end date is not past date",

    //expenses
    expenseSuccess: "Expense request saved successfully",
    expenseFromDateCantGeater: "Expense from date can't be greater than to date",
    billableToClient: "A valid billableToClient is required",
    expenseAmount: "A valid expenseAmount is required",

    // Bank Details
    candidateReferred: "Your invitation has been sent. The recruiter will be in touch with your contact if there is a good fit.",
    candidateAlreadyReferred: "This candidate is already referred",
    bankName: "A valid bank name is required",
    bankAddress: "A valid bank address is required",
    abaNumber: "A valid ABA number is required",
    accountNumber: "A valid account number is required",
    accountTypeId: "A valid account type is required",
    chequeName: "A valid cheque number is required",
    chequeFile: "A valid cheque file is required",
    resumeId: "A valid resume is required",

    documentExists: "Timesheet information has already been reported for the dates you've selected. If you believe this is an error, Contact Timesheet Support.",
    fileUploaded: "File uploaded successfully",

    fromDate: "A valid from date is required",
    toDate: "A valid to date is required",
    invalidDateRange: "Invalid date range",
    totalHours: "Total hours required",
    invalidTotalHours: "Please enter valid total hours",// less than " + enums.timecard.dailyHours + " per day. ",
    projectId: "A valid project is required",
    totalRegHrs: "Total regular hours are required",
    totalOtHrs: "Total overtime hours are required",
    totalDtHrs: "Total doubletime hours are required",
    regHrs: "Regular hours are required",
    otHrs: "Overtime hours are required",
    dtHrs: "Doubletime hours are required",
    fileName: "A valid file name is required",
    companyName : "Valid company name is required",
    noBillingId : "Billing is not available",

    //jobs 
    pageCount: "A valid pageCount is required",
    pageSize: "A valid pageSize is required",
    jobId: "A valid job is required",
    invalidReferral: "You can't refer yourself",
    isHot: "A valid isHot field required",
    miles: "A valid miles is required",
    relevance: "A valid relevance field required",
    cjmJobId: "A valid job is required",
    jobAlertSaved: "Job alert saved successfully",
    jobAlertDeleted: "Job alert deleted successfully",
    jobSearchDeleted: "Job search deleted successfully",
    keyword: "A valid keyword is required",
    location: "A valid location is required",
    Max5JobAlert: "Maximum 5 job alerts allowed",
    jobAlertDuplicate: "A alert with same name already exists",
    jobSearchAlertId: "A valid job search alert is required",
    jobCategory: "A valid job category is required",
    jobAssignmentType: "A valid job assignmentType is required",
    searchName: "A valid name is required",
    searchParameter: "A valid search object is required",
    searchStringLocation: "Search string is required, Minimum 3 characters are allowed",
    inactiveJob: "The job you are looking for is no more available",
    reffered : "Thank You! You have successfully referred the job to your contact",
    userId : "A valid user is required",
    jobListType: "A valid job list type is required",
    invalidTitle: "A valid resume title is required",
    jobShared: "Job has been shared successfully",
    notLookingForOpportunity: "Your contact is not looking for new opportunity",
    clientReffered : "Thank you for your referral, we will be reaching out to them as soon as possible.",
    notInterestedStatusUpdated: "Updated successfully", 
    alreadyTookAction: "Already took action",

    //faq
    faqType: "A valid faqType is required",
    emailReferred: "This person is already been referred for this job",

    //settings
    notificationStatus: "A valid notification status required",
    alertTypeId: "A valid alert type required",
    alertStatus: "A valid alert status required",
    switchOffStatus: "A valid switch off status required",
    alertFrequencyId: "A valid alert frequency required",
    dateTo: "A valid date is rquired",
    readType: "A valid read type is required",
    messageId: "Valid message is required",
    messageSent: "Message sent successfully",
    messageCenterFile:"Valid file required, valid types are : "+ enums.uploadType.messageCenter.allowedExt.join(', ') ,

    //job apply
    jobApplied: "You have successfully applied for this job",
    alreadyApplied: "You have already applied for this job",



    applicationStatus: "A valid application status is required",

    // messageCenter
    isRead: "Is Read",
    isPriority: "Is Priority",
    unread: "A valid unread value is required",
    priority: "A valid priority value is required",
    messageType: "A valid message type is required",
    type: "A valid type is required",
    flag: "A valid flag is required",
    message: "Valid message is required",
    messageTypeId: "A valid message type is required",
    noRecruiter: "Recruiter not assigned",
    invalidMessageType: "Invalid message Type",



    //timecard
    year: "A valid year is required",
    month: "A valid month is required",
    dateDifferenceErr: "You can view/fill only upto 2 months Time Card at once",
    futureEndDate: "You can't fill future date time card",
    tsEntryStatus: "A valid tsEntryStatus is required",
    weekEnd: "A valid weekEndMissing is required",
    regularHours: "A valid regularHours is required",
    overTimeHours: "A valid overTimeHours is required",
    day: "A valid day is required",
    tsEntryId: "A valid tsEntryId is required",
    invoiceId: "A valid invoice is required",
    uploadedTimeSheetId: "A valid uploadedTimeSheetId is required",
    statusId: "A valid status is required",
    status: "A valid status is required",
    updateDisabled: " You can't update this timecard",
    projectData: "Project data is required",
    hoursDetail: "Hours details is required",
    inactiveProject: "A valid active project is required",
    projects: "A valid project is required",
    timesheetUploaded: "Timesheet submitted successfully",
    endDate : "End date is required",
    startDate : "Start date is required",
    
    invalidHours: "Invalid hours submitted",
    hoursDetailMissing: "hours are missing",
    futureDateRange: "You can't submit future date timesheet",
    noRegHrs: "Please enter your regular hours along with your overtime hours. You cannot submit over time hours without the associate regular hours.",


    // settings
    invalidUpdate: "You can not update this message",
    invalidMessage: "A valid message is required",

    // report bug
    requestSubmitted: "Thank you, your feedback has been reported",
    pageUrl: "Valid page url is required",
    comment: "Valid comment is required",


    //dashboard
    missingLocationMessage: "Are you missing on your location? Please update here",

    //sme
    smeReason : "A valid reason is required",
    formSubmitted : "Thank you for your interest in being a subject matter expert. Our team will be in touch with you soon.",
    weekDays : "Valid week days are required",
    fromTime : "Valid from time is required",
    toTime : "Valid to time is required",
    smeAvailabilityId : "Valid SME Availability id is required",
    interviewRequestId : "Valid interview request id is required",
    smeInterviewAction : "Valid action is required",
    interviewId : "Valid interview id is required",
    feedback : "Valid feedback is required",
    isRecommended : "Valid value isRecommended is required",

    //chat
    chatId : "Chat id is required",
    inavalidParticipent : "Invalid participent",
    messageBody : "Message is required",
    recipientId : "Recipient is required",
    severity : "Severity is required",
    issueType : "Issue type is required",
    messageId : "Message id is required",
    groupId : "Valid Group id is required",


    // job referral
    referrerResumeId : "Resume id is required",
    candidateName : "Candidate name is required",
    candidateEmail : "Candidate email is required",
    candidateRelation : "Candidate relationship is required",
    candidateRequirement : "Candidate job requirement is required",
    invitationSent : "Invitation sent successfully",


    // employeeonboarding / hellosign

    templateId : "Valid template id is required",
    offerLetterNotFound : "Offer letter not found",
    isAccepted : "Please provide value for isAccepted",
    offerLetterId : "Valid offer letter id is required",
    helloSignError: "Error from hello sign",
    templates: "Tempalte id required",
    noActiveEnvelope : "No active envelope found ",
    envelopeId : "Valid envelope id is required",
    signerId : "Invalid signer id",
    completedEnvelope: "Envelope already completed",


    // DdocName : "A valid document name is required",
    docId : "A valid document id is required",
    fileData : "File data is required",
    invalidOperation : "Invalid operation",
    dmsId : "Dms id is required",
    templateIds : "Template ids must be array",
    fileNoPrepared : "File not prepared",
    noAttachement: "No attachement found",
    allowedAttachments: "Valid file is required", //"Allowed file are : " +enums.uploadType.employeeDocs.allowedExt.join(', '),
    mailSent: "Mail sent successfully",
    mailnotSent: "Mail sending error",
    notSignerFound : "There is no signer left for this envelope",
    employeeSigner : "First signer is employee",
    signerId : "A valid signer id is required",
    noPlacementTracker : "Placement tracker not found"


}

module.exports = {
    messageList: messageList
}