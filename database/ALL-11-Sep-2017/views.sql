
/******===========================================================================================================================================================******/
GO

GO

/****** Object:  View [dbo].[API_VIEW_GetAllImmigrationDocumentList]    Script Date: 9/11/2017 6:34:45 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[API_VIEW_GetAllImmigrationDocumentList]
AS
	SELECT  vcl.CHECKLISTID checkListId
	--,lr.EmployeeDetail_id
	,vcl.LEGALAPPID legalAppId	
	,vcl.DOCUMENTID documentId
	,lacl.DOCUMENTNAME documentName
	,vcl.LEGALDOCID legalDocId
	,ld.LEGALDOC_NAME legalDocName
	,ld.LEGALDOC_FILEPATH legalDocFilePath
	,ld.LEGALDOC_FILENAME legalDocFileName
	,ld.LEGALDOC_FILEEXT legalDocFileExt
	,ld.LEGALDOC_CREATEDATE  legalDocCreatedDate	
	FROM VISACHECKLISTDETAILS vcl
	LEFT JOIN LEGALDOC ld on vcl.LEGALDOCID=ld.LEGALDOCID
	LEFT JOIN LEGALAPPCHECKLIST lacl on vcl.DOCUMENTID=lacl.DOCUMENTID
	LEFT JOIN LegalRequest lr on vcl.LEGALAPPID=lr.LEGALAPPID
	

GO

/******===========================================================================================================================================================******/
GO

GO

/****** Object:  View [dbo].[API_VIEW_GetAllJobsList]    Script Date: 9/13/2017 7:04:52 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [dbo].[API_VIEW_GetAllJobsList]
AS
	SELECT CJM_JOB_ID cjmJobId
	,LTRIM(RTRIM(Job_Title)) jobTitle
	,CUS.Name employerName
	,LTRIM(RTRIM(Keywords)) keywords
	--,CJM_JOB_TITLE cjmJobTitle
	,CJM_JOB_DETAILS cjmJobDetails
	, (SUBSTRING((SELECT [dbo].[API_FN_StripHTML](CJM_JOB_DETAILS)),1,300)) trimedCjmJobDetails	
	,CJM_ASSESSMENT_TYPE cjmAssessmentTypeKey
	,(CASE CJM_ASSESSMENT_TYPE  WHEN 'C' THEN 'Consulting' WHEN 'F' THEN 'FullTime' WHEN 'R' THEN 'RightToHire' END) cjmAssessmentType
	,NUM_OF_POSITIONS numOfPositions	
	,Experience_Range experienceRangeId
	,EXPM.EM_DESC experienceRange
	,ISNULL(LTRIM(RTRIM(CJM_JOBCITY)),'')  cjmJobcity	
	,Location_Country_Id locationCountryId
	,ISNULL(LTRIM(RTRIM(COUNTM.Country_Name)),'') country
	,Location_State_Id locationStateId
	,ISNULL(LTRIM(RTRIM(SM.State_Name)),'') state
	,CJM.City_Id cityId
	,ISNULL(LTRIM(RTRIM(CITYM.City_Name)),'') city
	,CITYM.Latitude latitude
	,CITYM.Langitude longitude
	,(IIF(ShowPayRateOutside = 1, CAST(CJM_ANNUAL_SALARY AS VARCHAR(500)), 'DOE') ) cjmAnnualSalary	
	,isHot  isHot
	,ProjectType	 projectTypeId
	,CAT.KeyName projectType
	--,CJM_RESOURCE_TYPE  cjmResourceType
	,CJM_POSTING_DATE  cjmPostingDate
	,CJM_Status  cjmStatus
	
	FROM CLIENT_JOB_MASTER CJM WITH(NOLOCK)
	LEFT JOIN Country_Master COUNTM ON CJM.Location_Country_Id=COUNTM.Country_Id
	LEFT JOIN State_Master SM ON CJM.Location_State_Id=SM.State_ID
	LEFT JOIN city_master CITYM ON CJM.City_Id=CITYM.City_Id
	LEFT JOIN Customer CUS ON CJM.CustomerId =CUS.CustId
	LEFT JOIN EXPERIENCE_MASTER EXPM ON CJM.Experience_Range=EXPM.EM_ID
	INNER JOIN APP_REF_DATA CAT ON CJM.ProjectType =CAT.KeyId
	WHERE CJM_Status='A'	

	/*
	SELECT  SUBSTRING('gdxg', 1, 5) AS Initial 
	*/
	GO

/******===========================================================================================================================================================******/
GO

GO

/****** Object:  View [dbo].[API_VIEW_StaffContacts]    Script Date: 9/11/2017 6:36:12 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[API_VIEW_StaffContacts]
AS
SELECT 
CONCAT(ed.First_Name ,' ', ed.Last_Name) AS name
,ed.EmployeeDetails_Id AS empDetailId
,ed.Email_Id AS email
,IIF(ecd.Phone_Cell <> '(___) ___-____',ecd.Phone_Cell,'')AS phone
,ecd.Ext_Number AS ext 
,ed.CurrentJobTitle AS jobTitle 
,ed.PrimaryJobWorkRole AS jobRoleId
,ard.keyName AS jobRole
FROM EmployeeDetails ed
JOIN EmployeeContactDetails ecd ON ed.EmployeeDetails_Id =ecd.EmployeeDetails_Id
JOIN APP_REF_DATA ard ON ed.PrimaryJobWorkRole =ard.keyId
where ed.Employee_Type = 1221 AND emp_Status = 'A'

GO

/******===========================================================================================================================================================******/
GO

/******===========================================================================================================================================================******/
GO

/******===========================================================================================================================================================******/
GO