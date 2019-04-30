/**
 * all new tables list
 */

let tables=[
    UserSession,
    EmailTemplate,
    EmployeeOTP,
    EmployeeLicense,
    //ApiStaticContent
],
/**
 * all views list
 */
let views=[
    API_VIEW_GetAllImmigrationDocumentList,
    API_VIEW_GetAllJobsList,
    API_VIEW_StaffContacts   
],

/**
 * all functions list
 */
let functions=[
    API_FN_GetAvailabilityByAvailabilityId,
    API_FN_GetDesiredEmployementByDesiredEmployementKey,
    API_FN_GetPageCount,
    API_FN_GetTimecardStatusByTsEntryIdAndEmployeeId,
    API_FN_GetWeekStartDateByWeekEndingDate,
    API_FN_SplitString,
    API_FN_GetSearchScoreDifference,
    API_FN_GetSearchScore
],

/**
 * all storedProcedures list
 */
let storedProcedures=[
    API_SP_AddImmigrationApplication,
    API_SP_AddLegalDocuments,
    API_SP_Candidate_Active_Job_List,
    API_SP_CheckOldPassword,
    API_SP_CheckTimesheet,
    API_SP_DeleteLegalDocuments,
    API_SP_GetAllApplicationDocListByLegalAppId,
    API_SP_GetAllTimeCardDocumentsByDateRange,
    API_SP_GetAllTimeCardListByEmployeeId,
    API_SP_GetAllTimeCardWeekEndingDatesByDateRange,
    API_SP_GetApplicationDocListByLegalAppId,
    API_SP_GetCandidateAchievementByEmployeeDetId,
    API_SP_GetCertificationByEmployeeDetId,
    API_SP_GetDocumentByWeekDay,
    API_SP_GetDocumentListByApplicationType,
    API_SP_GetDocumentsByEmployeeDetId,
    API_SP_GetEducationDetailsByEmployeeDetId,
    API_SP_GetEmailTemplateByEventName,
    API_SP_GetEmployeeBenefit,
    API_SP_GetEmployeeProjects,
    API_SP_GetEmployeeResumeDocumentsByEmployeeDetId,
    API_SP_GetExpenseList,
    API_SP_GetExperienceByEmployeeDetId,
    API_SP_GetFormsList,
    API_SP_GetImmigrationApplications,
    API_SP_GetImmigrationApplicationsByLegalAppId,
    API_SP_GetJobLocationAndKeyword,
    API_SP_GetLca,
    API_SP_GetLicenseByEmployeeDetId,
    API_SP_GetMyReferrals,
    API_SP_GetProfileLookupData,
    API_SP_GetProjectByProjectDetailId,
    API_SP_GetSkillsByEmployeeDetId,
    API_SP_GetStaticPageContent,
    API_SP_GetTimeCardListByTimeRange,
    API_SP_GetUserByUserName,
    API_SP_GetUserDashboardById,
    API_SP_GetUserDashboardTimeCard,
    API_SP_GetUserProfileById,
    API_SP_Jobs_JobAlertCount,
    API_SP_Jobs_JobAssignmentTypeAndCount,
    API_SP_Jobs_JobCategoryAndCount,
    API_SP_Jobs_JobCountByLocationByEmpId,
    API_SP_Jobs_JobLocationAndCount,
    API_SP_Jobs_JobTypeAndCount,
    API_SP_Jobs_ProjectType,
    API_SP_Jobs_Search,
    API_SP_Jobs_Search_Back,
    API_SP_SetEmailQueue,
    API_SP_StaffContacts,
    API_SP_TimeCardByDateRange,
    API_SP_TimeCardBySummaryId,
    API_SP_UpdateEmployeeProject,
    API_SP_UpdateImmigrationApplication,
    API_SP_UpdateUserProfile,
    API_SP_UserChangePassword,
    API_SP_UserSignIn,
    API_SP_UserSignOut,
    API_SP_UserSignUp,
    API_spLegalGetNews
]