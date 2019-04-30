USE [CSG_2001_Staging]
GO

/****** Object:  StoredProcedure [dbo].[API_S_uspAccounts_CheckOldPassword]    Script Date: 2/8/2018 5:44:16 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_S_uspAccounts_CheckOldPassword] 
 @employeeDetailsId  INT
,@Password varchar(500)

AS
BEGIN
	SELECT * FROM EmployeeDetails 	
	WHERE EmployeeDetails_Id=@employeeDetailsId AND Password=@Password COLLATE Latin1_General_CS_AS
END

GO

/****** Object:  StoredProcedure [dbo].[API_S_uspAccounts_UserChangePassword]    Script Date: 2/8/2018 5:44:18 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_S_uspAccounts_UserChangePassword] --'p@yopmail.com' ,'4321'
  @employeeDetailsId  INT
 ,@Password varchar(500)   
 ,@empStatus char(1)
 ,@isAccountActivated bit

AS
BEGIN
	Update EmployeeDetails 
	SET Password=@Password,
		emp_status=@empStatus,
		isAccountActivated=@isAccountActivated,
		Modified_Date=GETDATE()
    WHERE EmployeeDetails_Id=@employeeDetailsId
END
/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_S_uspGetActiveApplicationsCount]    Script Date: 2/8/2018 5:44:19 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_S_uspGetActiveApplicationsCount] 
 @EmployeeDetails_Id  int

AS
BEGIN
	
-- Open Application producedure

	SELECT  
	count(DISTINCT Job_Resume_Id) AS openApplications
	FROM EmployeeDetails ed 
	LEFT JOIN Resume_Master rm ON rm.FromEmployeeDetails_Id = ed.EmployeeDetails_Id
	LEFT JOIN JOB_RESUME jr ON jr.CandidateResume_Id = rm.Resume_Id	
	LEFT JOIN API_VIEW_GetAllJobsList cjm ON jr.CJM_JOB_ID = cjm.cjmJobId 
	LEFT JOIN EventManagement EM ON EM.EventRegardingSubmission_Id = jr.Job_Resume_Id 	
	WHERE ed.employeeDetails_Id = @EmployeeDetails_Id
	AND ((jr.JR_STATUS_ID in (6,10,15,19,24,25) AND cjm.cjmStatus= 'A')  OR (em.Event_Type = 4 AND cjm.cjmStatus is null))  


	--SELECT count(jr.CandidateResume_Id) AS openApplications
	--FROM EmployeeDetails ed 
	--LEFT JOIN Resume_Master rm ON rm.FromEmployeeDetails_Id = ed.EmployeeDetails_Id
	--LEFT JOIN JOB_RESUME jr ON jr.CandidateResume_Id = rm.Resume_Id
	--JOIN CLIENT_JOB_MASTER cjm on jr.CJM_JOB_ID = cjm.CJM_JOB_ID
	--WHERE ed.EmployeeDetails_Id = @EmployeeDetails_Id AND jr.JR_STATUS_ID in(6, 10, 15, 19, 24, 25) AND cjm.CJM_STATUS = 'A'




-- interview scheduled procedure 
	;WITH CTE(EventManagement_Id)
	AS
	(
	SELECT MAX(EventManagement_Id)
	FROM EventManagement EM	
    GROUP BY EventRegardingSubmission_Id
	)
	SELECT distinct
	count(*) as interviewScheduled
	FROM Eventmanagement EM
	JOIN CTE ON CTE.EventManagement_Id=EM.EventManagement_Id
	LEFT JOIN Resume_Master RM ON RM.Resume_Id = EM.CandidateId	
	LEFT JOIN job_resume JR ON EM.EventRegardingSubmission_Id=JR.Job_Resume_Id
	
	WHERE RM.FromEmployeeDetails_Id = @EmployeeDetails_Id
	AND jr.JR_STATUS_ID in (19)
	AND em.Event_Type = 4
	AND  CONVERT(DATETIME, CONVERT(CHAR(8), em.EventDate, 112) + ' ' + CONVERT(CHAR(8), ISNULL(em.EventTime, '00:00:00.000'), 108)) >=  getDate()
	

	--SELECT count(jr.CandidateResume_Id) AS interviewScheduled
	--FROM EmployeeDetails ed 
	--LEFT JOIN Resume_Master rm ON rm.FromEmployeeDetails_Id = ed.EmployeeDetails_Id
	--LEFT JOIN JOB_RESUME jr ON jr.CandidateResume_Id = rm.Resume_Id
	--JOIN CLIENT_JOB_MASTER cjm on jr.CJM_JOB_ID = cjm.CJM_JOB_ID
	--WHERE ed.EmployeeDetails_Id = @EmployeeDetails_Id AND jr.JR_STATUS_ID in(19) AND cjm.CJM_STATUS = 'A'
	
	
END

/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_S_uspGetBankDetails]    Script Date: 2/8/2018 5:44:20 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_S_uspGetBankDetails] 
 @EmployeeDetails_Id  INT
AS
BEGIN
 SELECT a.EmployeeDepositeDetailsID AS employeeDepositeDetailsID,
	a.Bank_Name AS bankName,
	a.Bank_Address AS bankAddress,
	a.ABA_Number AS abaNumber,
	a.Account_number AS accountNumber,
	a.Account_Type AS accountTypeId,
	b.KeyName AS accountType,
	a.ChequeAttachmentName AS chequeAttachmentName,
	a.ChequeUploadAttachmentName AS chequeUploadAttachmentName		 
	FROM EmployeeDepositeDetails a 
	LEFT JOIN APP_REF_DATA b on a.Account_Type = b.KeyID
	WHERE a.EmployeeDetetails_ID = @EmployeeDetails_Id
END

GO

/****** Object:  StoredProcedure [dbo].[API_S_uspGetDocumentDetailsById]    Script Date: 2/8/2018 5:44:21 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_S_uspGetDocumentDetailsById] 
 @EmployeeDetails_Id  INT,
 @DocumentDetails_Id INT
AS
BEGIN
 SELECT b.CandidateDoc_Id as candidateDocId,
	b.Resume_Id AS resumeId,
	b.Resume_File as resumeFile,
	b.File_name as fileName,
	b.Created_Date as createdDate
	FROM Resume_Master a 
	join Candidate_ResumeAndDoc b on a.Resume_Id = b.Resume_Id
	WHERE a.FromEmployeeDetails_Id = @EmployeeDetails_Id AND b.CandidateDoc_Id = @DocumentDetails_Id
END

GO

/****** Object:  StoredProcedure [dbo].[API_S_uspGetMatchingJobs]    Script Date: 2/8/2018 5:44:23 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_S_uspGetMatchingJobs] 
 --@EmployeeDetails_Id  int

AS
BEGIN
	SELECT TOP 10
	cjm.CJM_JOB_ID jobId,
	cjm.CJM_JOB_TITLE jobTitle
    FROM CLIENT_JOB_MASTER cjm     
    --WHERE IEE.EmployeeDetails_Id = @EmployeeDetails_Id
	ORDER BY cjm.CJM_JOB_ID DESC
END

/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_S_uspGetRecruiterDetails]    Script Date: 2/8/2018 5:44:24 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO



CREATE PROCEDURE [dbo].[API_S_uspGetRecruiterDetails] 
 @EmployeeDetails_Id  int

AS
BEGIN
DECLARE @RecruiterId INT=(SELECT [dbo].API_FN_GetRecruiterIdByEmployeeDetailsId(@EmployeeDetails_Id));

	SELECT ED.EmployeeDetails_Id recruiterId, 
	ED.First_Name AS firstName,
	ED.Last_Name AS lastName,	
	ED.Email_Id AS emailId,
	ED.ProfilePicture AS profilePicture,
	ECD.Phone_Work AS workPhone,
	ECD.WorkExtension as workExt
	FROM EmployeeDetails ED
	--LEFT JOIN Resume_Master RM ON RM.FromEmployeeDetails_Id = ED.EmployeeDetails_Id
	--LEFT JOIN EmployeeDetails EDR ON EDR.EmployeeDetails_Id = ED.Recruiter
	LEFT JOIN EmployeeContactDetails ECD ON ECD.EmployeeDetails_Id = ED.EmployeeDetails_Id
	WHERE ED.EmployeeDetails_Id = @RecruiterId
END

/******===========================================================================================================================================================******/

--[dbo].[API_S_uspGetRecruiterDetails] 17084
GO

/****** Object:  StoredProcedure [dbo].[API_S_uspGetResumeDocuments]    Script Date: 2/8/2018 5:44:25 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_S_uspGetResumeDocuments] 
 @EmployeeDetails_Id  INT
AS
BEGIN
 SELECT b.CandidateDoc_Id as candidateDocId,
	b.Resume_Id AS resumeId,
	b.Resume_File as resumeFile,
	b.File_name as fileName,
	b.Created_Date as createdDate
	FROM 
	Resume_Master a 
	JOIN Candidate_ResumeAndDoc b on a.Resume_Id = b.Resume_Id
	WHERE a.FromEmployeeDetails_Id = @EmployeeDetails_Id AND b.Doc_Type = 1
END



/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_S_uspGetUserInterviews]    Script Date: 2/8/2018 5:44:26 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


/* 
select top 5 * from EventManagement order by 1 desc
 EXEC API_S_uspGetUserInterviews @where= '  
  RM.FromEmployeeDetails_Id = 17084 
 AND jr.JR_STATUS_ID in (19) AND cjm.cjmStatus= ''A''  AND em.Event_Type = 4  AND  CONVERT(DATETIME, CONVERT(CHAR(8), em.EventDate, 112) + '' '' + CONVERT(CHAR(8), em.EventTime, 108)) <  getDate()
   '
select * from resume_master where fromemployeedetails_id=17084

select CandidateResume_Id,* from job_resume where CandidateResume_Id=157178 
--AND JR_STATUS_ID in (19)

select * from eventmanagement where CandidateId=157178
*/


CREATE PROCEDURE [dbo].[API_S_uspGetUserInterviews]
 @where NVARCHAR(MAX) 
AS
BEGIN
	DECLARE @SQLQuery AS NVARCHAR(MAX)
	SET @SQLQuery ='
	;WITH CTE(EventManagement_Id)
	AS
	(
	SELECT MAX(EventManagement_Id)
	FROM EventManagement EM	
    GROUP BY EventRegardingSubmission_Id
	)
	
	SELECT DISTINCT
	EM.EventManagement_Id
	,EM.Title eventTitle
	,EM.Interview_Type interviewTypeId
	--,CASE EM.Interview_Type WHEN 1 THEN ''In Person'' WHEN 2 THEN ''Telephonic'' ELSE ''Web Cam'' END interviewType
	,IWT.KeyName interviewType
	,EM.location eventLocation
	,EM.Description eventDescription 
	,CONCAT(CONVERT(DATETIME, CONVERT(CHAR(8), EM.EventDate, 112) + '' '' + CONVERT(CHAR(8), ISNULL(EM.EventTime, ''00:00:00.000''), 108)),'' '', ARD.KeyName) eventTime		
	,EM.Created_Date
	,EM.Zone zoneId
	,ARD.KeyName zone
	,JR.JR_STATUS_ID as jobStatusId
	,ISM.STATUS_DESC applicationStatus
	,JR.JR_UPDATED_ON appliedOn
	,CJM_JOB_ID jobId
	,IIF(CJM_JOB_ID IS NULL, JR.Resume_Title,CJM.jobTitle) jobTitle
	,CJM.cjmAssessmentType as assesmentType
	,CJM.cjmStatus jobStatus
	,CJM.employerName
	,CJM.cjmAnnualSalary annualSalary
	,CJM.experienceRange as experience
	,IIF(CJM_JOB_ID IS NULL, JR.Job_CityId,CJM.cityId) cityId
	,IIF(CJM_JOB_ID IS NULL,  CM.City_Name,CJM.city) city
	,IIF(CJM_JOB_ID IS NULL, JR.Job_StateId,CJM.locationStateId) stateId
	,IIF(CJM_JOB_ID IS NULL,  SM.State_Name,CJM.state) state
	FROM Eventmanagement EM
	JOIN CTE ON CTE.EventManagement_Id=EM.EventManagement_Id
	LEFT JOIN Resume_Master RM ON RM.Resume_Id = EM.CandidateId	
	LEFT JOIN job_resume JR ON EM.EventRegardingSubmission_Id=JR.Job_Resume_Id
	LEFT JOIN API_VIEW_GetAllJobsList CJM ON JR.CJM_JOB_ID = CJM.cjmJobId
	LEFT JOIN INTERVIEW_STATUS_MASTER ISM on JR.JR_STATUS_ID = ISM.STATUS_ID
	LEFT JOIN City_Master CM ON CM.City_Id=JR.Job_CityId
	LEFT JOIN State_Master  SM ON SM.state_id=JR.Job_StateId
	LEFT JOIN App_ref_data ARD ON EM.Zone= ARD.KeyID AND ARD.Parentid = 2900
	LEFT JOIN App_ref_data IWT ON EM.Interview_Type= IWT.KeyID AND IWT.Parentid = 250
	WHERE ' + @where +' ORDER BY EM.Created_Date DESC
	'

	print @SQLQuery
	EXEC(@SQLQuery)

	

	
END



GO

/****** Object:  StoredProcedure [dbo].[API_S_uspGetUserJobApplications]    Script Date: 2/8/2018 5:44:27 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


--EXEC API_S_uspGetUserJobApplications 
--@where= ' ed.employeeDetails_Id = 17084 AND jr.JR_STATUS_ID in (6,10,15,19,24,25) AND cjm.cjmStatus= ''A'' '


CREATE PROCEDURE [dbo].[API_S_uspGetUserJobApplications] 
 @where NVARCHAR(MAX) 
AS
BEGIN
	DECLARE @SQLQuery AS NVARCHAR(MAX)
	SET @SQLQuery ='
	SELECT DISTINCT 
	cjm.cjmJobId jobId,
	IIF(CJM_JOB_ID IS NULL, JR.Resume_Title,CJM.jobTitle) jobTitle
	,cjm.cjmAssessmentType as assesmentType,
	cjm.cjmStatus jobStatus,
	cjm.employerName,
	cjm.cjmAnnualSalary annualSalary,
	cjm.experienceRange as experience
	--cjm.cityId,
	--cjm.city,
	--cjm.locationStateId stateId,
	--cjm.state,

	,IIF(CJM_JOB_ID IS NULL, JR.Job_CityId,CJM.cityId) cityId
	,IIF(CJM_JOB_ID IS NULL,  CM.City_Name,CJM.city) city
	,IIF(CJM_JOB_ID IS NULL, JR.Job_StateId,CJM.locationStateId) stateId
	,IIF(CJM_JOB_ID IS NULL,  SM.State_Name,CJM.state) state

	,jr.JR_STATUS_ID as jobStatusId
	,ism.STATUS_DESC applicationStatus
	,jr.JR_UPDATED_ON appliedOn
	,EM.EventRegardingSubmission_Id
	,jr.Job_Resume_Id
	FROM EmployeeDetails ed 
	LEFT JOIN Resume_Master rm ON rm.FromEmployeeDetails_Id = ed.EmployeeDetails_Id
	LEFT JOIN JOB_RESUME jr ON jr.CandidateResume_Id = rm.Resume_Id
	LEFT JOIN API_VIEW_GetAllJobsList cjm ON jr.CJM_JOB_ID = cjm.cjmJobId  
	LEFT JOIN INTERVIEW_STATUS_MASTER ism on jr.JR_STATUS_ID = ism.STATUS_ID 
	LEFT JOIN EventManagement EM ON EM.EventRegardingSubmission_Id = jr.Job_Resume_Id 
	LEFT JOIN City_Master CM ON CM.City_Id=JR.Job_CityId
	LEFT JOIN State_Master  SM ON SM.state_id=JR.Job_StateId
	WHERE ' + @where +'
	--ED.EmployeeDetails_Id = 57883 
	--AND ( (jr.JR_STATUS_ID in (6,10,15,19,24,25) AND cjm.cjmStatus= ''A'') OR em.Event_Type = 4) 
	--AND (jr.JR_STATUS_ID in (4,14,16,17) OR cjm.cjmStatus <> ''A'') 

	ORDER BY appliedOn DESC
	'


/*
	DECLARE @SQLQuery AS NVARCHAR(MAX)
	--SET @where =' WHERE ed.EmployeeDetails_Id= ' +@where	
	SET @SQLQuery =' SELECT cjm.cjmJobId jobId,
	cjm.jobTitle,
	cjm.cjmAssessmentType as assesmentType,
	cjm.cjmStatus jobStatus,
	cjm.employerName,
	cjm.cjmAnnualSalary annualSalary,
	cjm.experienceRange as experience,
	cjm.cityId,
	cjm.city,
	cjm.locationStateId stateId,
	cjm.state,
	jr.JR_STATUS_ID as jobStatusId,
	ism.STATUS_DESC applicationStatus,
	jr.JR_UPDATED_ON appliedOn
	FROM EmployeeDetails ed 
	LEFT JOIN Resume_Master rm ON rm.FromEmployeeDetails_Id = ed.EmployeeDetails_Id
	LEFT JOIN JOB_RESUME jr ON jr.CandidateResume_Id = rm.Resume_Id
	LEFT JOIN API_VIEW_GetAllJobsList cjm ON jr.CJM_JOB_ID = cjm.cjmJobId
	LEFT JOIN INTERVIEW_STATUS_MASTER ism on jr.JR_STATUS_ID = ism.STATUS_ID WHERE ' + @where +' ORDER BY appliedOn DESC'
*/

	print @SQLQuery
	EXEC(@SQLQuery)
	
END



GO

/****** Object:  StoredProcedure [dbo].[API_S_uspImmigration_GetApplicationDocListByCondition]    Script Date: 2/8/2018 5:44:28 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_S_uspImmigration_GetApplicationDocListByCondition]
  @pintLegalAppId INT,
  @pintAppTypeCode VARCHAR(255)


AS

DECLARE @SQL VARCHAR(8000),
	@vszAppTypeId int
	BEGIN
		SET @vszAppTypeId = (SELECT APPTYPEID FROM LEGALAPPTYPE WHERE APPTYPECODE = @pintAppTypeCode)
		
		SET @SQL = 'SELECT VD.CHECKLISTID checkListId, VD.LEGALAPPID legalAppId, VD.DOCUMENTID documentId, VD.LEGALDOCID legalDocId, DM.DOCUMENTNAME documentName, '
		SET @SQL = @SQL + 'ld.LEGALDOC_NAME legalDocName, ld.LEGALDOC_FILEPATH legalDocFilePath, ld.LEGALDOC_FILENAME legalDocFileName, ld.LEGALDOC_FILEEXT legalDocFileExt, ld.LEGALDOC_CREATEDATE legalDocCreatedDate, '
		SET @SQL = @SQL + '(CASE WHEN (VD.LEGALDOCID IS NOT NULL AND ld.LEGALDOC_SHOWTOCONSLT=1) THEN ''Uploaded'' WHEN (VD.LEGALDOCID IS NOT NULL AND ld.LEGALDOC_SHOWTOCONSLT=0) THEN ''Not Required'' ELSE ''Required'' END) buttonLabel, '
		SET @SQL = @SQL + '(CASE WHEN (VD.LEGALDOCID IS NOT NULL OR ld.LEGALDOC_SHOWTOCONSLT=0) THEN ''N'' ELSE ''Y'' END) buttonAction '
		SET @SQL = @SQL + ' FROM LEGALAPPCHECKLIST DM '
		SET @SQL = @SQL + ' LEFT JOIN VISACHECKLISTDETAILS VD ON VD.DOCUMENTID = DM.DOCUMENTID AND VD.LEGALAPPID = ' + CAST(@pintLegalAppId AS VARCHAR) + ''
		SET @SQL = @SQL + ' LEFT JOIN LEGALDOC ld on VD.LEGALDOCID=ld.LEGALDOCID'
		SET @SQL = @SQL + ' LEFT JOIN LegalRequest lr on VD.LEGALAPPID=lr.LEGALAPPID'
		SET @SQL = @SQL + ' WHERE DM.STATUS = ''1'' AND DM.APPTYPEID =' + CAST(@vszAppTypeId AS VARCHAR) + ''
		SET @SQL = @SQL + ' ORDER BY DM.DOCUMENTNAME ASC'

	EXEC (@SQL)
	print(@SQL)
END

/*
BEGIN
DECLARE @sqlQuery NVARCHAR(MAX)
	SET @sqlQuery= 'SELECT  vcl.CHECKLISTID checkListId	
	,vcl.LEGALAPPID legalAppId	
	,vcl.DOCUMENTID documentId
	,lacl.DOCUMENTNAME documentName
	,vcl.LEGALDOCID legalDocId
	,ld.LEGALDOC_NAME legalDocName
	,ld.LEGALDOC_FILEPATH legalDocFilePath
	,ld.LEGALDOC_FILENAME legalDocFileName
	,ld.LEGALDOC_FILEEXT legalDocFileExt
	,ld.LEGALDOC_CREATEDATE  legalDocCreatedDate	
	,(CASE WHEN (vcl.LEGALDOCID IS NOT NULL AND ld.LEGALDOC_SHOWTOCONSLT=1) THEN ''Uploaded'' WHEN (vcl.LEGALDOCID IS NOT NULL AND ld.LEGALDOC_SHOWTOCONSLT=0) THEN ''Not Required''  ELSE ''Required'' END) buttonLabel
	,(CASE WHEN (vcl.LEGALDOCID IS NOT NULL OR ld.LEGALDOC_SHOWTOCONSLT=0) THEN ''N'' ELSE ''Y'' END) buttonAction
	FROM VISACHECKLISTDETAILS vcl
	LEFT JOIN LEGALDOC ld on vcl.LEGALDOCID=ld.LEGALDOCID
	LEFT JOIN LEGALAPPCHECKLIST lacl on vcl.DOCUMENTID=lacl.DOCUMENTID
	LEFT JOIN LegalRequest lr on vcl.LEGALAPPID=lr.LEGALAPPID
	WHERE ' +@where+
	' order by legalDocCreatedDate DESC'

	PRINT(@sqlQuery)
	EXEC (@sqlQuery)
END
*/

--API_S_uspImmigration_GetApplicationDocListByCondition 19109, 'H1EXT'

/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_S_uspImmigration_GetApplicationListByCondition]    Script Date: 2/8/2018 5:44:29 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_S_uspImmigration_GetApplicationListByCondition]
  @Where NVARCHAR(max)
AS

DECLARE @SQL VARCHAR(8000),
	@vszAppTypeId int
		
BEGIN
DECLARE @sqlQuery NVARCHAR(MAX)
	SET @sqlQuery= 'SELECT  vcl.CHECKLISTID checkListId	
	,vcl.LEGALAPPID legalAppId	
	,vcl.DOCUMENTID documentId
	,lacl.DOCUMENTNAME documentName
	,vcl.LEGALDOCID legalDocId
	,ld.LEGALDOC_NAME legalDocName
	,ld.LEGALDOC_FILEPATH legalDocFilePath
	,ld.LEGALDOC_FILENAME legalDocFileName
	,ld.LEGALDOC_FILEEXT legalDocFileExt
	,ld.LEGALDOC_CREATEDATE  legalDocCreatedDate	
	,(CASE WHEN (vcl.LEGALDOCID IS NOT NULL AND ld.LEGALDOC_SHOWTOCONSLT=1) THEN ''Uploaded'' WHEN (vcl.LEGALDOCID IS NOT NULL AND ld.LEGALDOC_SHOWTOCONSLT=0) THEN ''Not Required''  ELSE ''Required'' END) buttonLabel
	,(CASE WHEN (vcl.LEGALDOCID IS NOT NULL OR ld.LEGALDOC_SHOWTOCONSLT=0) THEN ''N'' ELSE ''Y'' END) buttonAction
	FROM VISACHECKLISTDETAILS vcl
	LEFT JOIN LEGALDOC ld on vcl.LEGALDOCID=ld.LEGALDOCID
	LEFT JOIN LEGALAPPCHECKLIST lacl on vcl.DOCUMENTID=lacl.DOCUMENTID
	LEFT JOIN LegalRequest lr on vcl.LEGALAPPID=lr.LEGALAPPID
	WHERE ' +@where+
	' order by legalDocCreatedDate DESC'

	PRINT(@sqlQuery)
	EXEC (@sqlQuery)
END



/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_S_uspJobs_GetDistanceAndCount]    Script Date: 2/8/2018 5:44:30 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

/*
----3959 miles 6371 for KM
*/
CREATE PROCEDURE [dbo].[API_S_uspJobs_GetDistanceAndCount] ---77.9155,35.7213
(
  --@searchText NVARCHAR(MAX)='',
  @keyWords NVARCHAR(MAX)='',
  @latitude Float=0.0,
  @longitude Float=0.0, 
  @where NVARCHAR(MAX)=' 1=1 ',
  @orderBy NVARCHAR(MAX)=' ORDER BY cjmPostingDate DESC '
)
AS
BEGIN
	DECLARE @selectQuery AS VARCHAR(MAX)='';	
	DECLARE @whereConditionLocation AS VARCHAR(500)='';


	IF(@where='')
		SET @where=' 1=1 '
	IF (@orderBy ='')
		SET @orderBy=' ORDER BY cjmPostingDate DESC '


	SET @selectQuery=@selectQuery + ' Select * Into #tempMatchedJobs From (Select *  From [dbo].[API_FN_FullTextJobSearch]('''+@keyWords+''')) Alias '

	SET @selectQuery=@selectQuery + ' ;WITH CTE AS
	(		
		SELECT API_VIEW_GetAllJobsListActiveRecord.*
			,tj.rank
			,CASE WHEN  ( ('+CONVERT(VARCHAR(50),@latitude)+' != 0 ) AND ('+CONVERT(VARCHAR(50),@longitude)+' != 0 )
				AND (CONVERT(VARCHAR(50),'+CONVERT(VARCHAR(50),@latitude)+') !=CONVERT(VARCHAR(50),latitude) ) AND (CONVERT(VARCHAR(50),'+CONVERT(VARCHAR(50),@longitude)+') != CONVERT(VARCHAR(50),longitude) )
				)  
			THEN  (
			ROUND(3959  
				* ACOS(
						COS(RADIANS(ISNULL('+CONVERT(VARCHAR(50),@latitude)+',0.0)))
						* COS(RADIANS(ISNULL(latitude,0.0)))
						* COS(RADIANS(ISNULL(longitude,0.0)) - RADIANS(ISNULL('+CONVERT(VARCHAR(50),@longitude)+',0.0)))
						+ SIN(RADIANS(ISNULL('+CONVERT(VARCHAR(50),@latitude)+',0.0)))
						* SIN(RADIANS(ISNULL(latitude,0.0)))
						)
			,2)) ELSE 0 END  distanceInMiles

		FROM API_VIEW_GetAllJobsListActiveRecord
		INNER JOIN #tempMatchedJobs tj on API_VIEW_GetAllJobsListActiveRecord.cjmJobId =  tj.cjm_job_id
		  WHERE cjmStatus =''A'' AND cityId>0 AND  '+@where +'
	)'

	SET @selectQuery=@selectQuery + ' SELECT	 	
		distanceInMiles
		,((SELECT (COUNT(distanceInMiles)) WHERE distanceInMiles<=0)) miles0
		,((SELECT (COUNT(distanceInMiles)) WHERE distanceInMiles<=10)) miles10
		,((SELECT (COUNT(distanceInMiles)) WHERE distanceInMiles<=20)) miles20
		,((SELECT (COUNT(distanceInMiles)) WHERE distanceInMiles<=50)) miles50
		,((SELECT (COUNT(distanceInMiles)) WHERE distanceInMiles<=200)) miles200
	INTO #dis
	FROM CTE
	GROUP BY distanceInMiles 
	ORDER BY distanceInMiles '

	SET @selectQuery=@selectQuery + ' SELECT 
	      ''0'' miles0,ISNULL(SUM(miles0),0) count0
		 ,''10'' miles10,ISNULL(SUM(miles10),0) count10
		 ,''20'' miles20,ISNULL(SUM(miles20),0) count20
		 ,''50'' miles50,ISNULL(SUM(miles50),0) count50
		 ,''200'' miles200,ISNULL(SUM(miles200),0) count200
	 FROM #dis '

	 SET @selectQuery=@selectQuery + ' DROP TABLE #dis  DROP TABLE #tempMatchedJobs'

	--Print selectQuery
	PRINT(@selectQuery)

	--Execute query
	EXEC (@selectQuery) 

END

/*

[API_S_uspJobs_GetDistanceAndCount_NEW] '-74.006','40.7143' ,''
select * from city_master where City_Id=86643
Select City_Id,Location_State_Id,* from client_job_master where City_Id=86643
select  * from API_VIEW_GetAllJobsList where city ='Basking Ridge' ANd state='New Jersey'

SELECT [dbo].[API_FN_GetNearestCoOrdinatesInMiles]('0.0','0.0',0,'','Basking Ridge' ,'New Jersey') 

*/


GO

/****** Object:  StoredProcedure [dbo].[API_S_uspJobs_GetJobAssignmentTypeAndCount]    Script Date: 2/8/2018 5:44:31 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


--SP_HELPTEXT API_S_uspJobs_GetJobAssignmentTypeAndCount
----3959 miles 6371 for KM

CREATE PROCEDURE [dbo].[API_S_uspJobs_GetJobAssignmentTypeAndCount]
(
	@keyWords NVARCHAR(MAX)='',
	@latitude Float=0.0,
	@longitude Float=0.0,
	@where AS VARCHAR(MAX)='1=1'
)
AS
BEGIN
		DECLARE @selectQuery AS VARCHAR(MAX)='';
		SET @selectQuery=@selectQuery + ' Select * Into #tempMatchedJobs From (Select *  From [dbo].[API_FN_FullTextJobSearch]('''+@keyWords+''')) Alias '
		SET @selectQuery= @selectQuery +'
		
			SELECT DISTINCT 
			cjmAssessmentTypeKey
			,cjmAssessmentType
			,cjmJobId	
			,latitude
			,longitude
			,jobTitle
			,projectTypeId
			,keywords
			,cityId
			,city
			,state
			,CASE WHEN  ( ('+CONVERT(VARCHAR(50),@latitude)+' != 0 ) AND ('+CONVERT(VARCHAR(50),@longitude)+' != 0 )
				AND (CONVERT(VARCHAR(50),'+CONVERT(VARCHAR(50),@latitude)+') !=CONVERT(VARCHAR(50),latitude) ) AND (CONVERT(VARCHAR(50),'+CONVERT(VARCHAR(50),@longitude)+') != CONVERT(VARCHAR(50),longitude) )
				)    
			THEN  (
			ROUND(3959  
				* ACOS(
						COS(RADIANS(ISNULL('+CONVERT(VARCHAR(50),@latitude)+',0.0)))
						* COS(RADIANS(ISNULL(latitude,0.0)))
						* COS(RADIANS(ISNULL(longitude,0.0)) - RADIANS(ISNULL('+CONVERT(VARCHAR(50),@longitude)+',0.0)))
						+ SIN(RADIANS(ISNULL('+CONVERT(VARCHAR(50),@latitude)+',0.0)))
						* SIN(RADIANS(ISNULL(latitude,0.0)))
						)
			,2)) ELSE 0 END  distanceInMiles
			,tj.[rank]
			INTO #temp		
			FROM API_VIEW_GetAllJobsListActiveRecord JOBS		
			INNER JOIN #tempMatchedJobs tj on JOBS.cjmJobId =  tj.cjm_job_id
			WHERE cjmStatus =''A'' AND  cjmAssessmentTypeKey IS NOT NULL 	
		
		
	  '
	  SET @selectQuery=@selectQuery+ 'SELECT  cjmAssessmentTypeKey,cjmAssessmentType
								   , (SELECT COUNT(cjmAssessmentTypeKey) WHERE cjmAssessmentTypeKey=temp.cjmAssessmentTypeKey) count  
								   FROM #temp temp WHERE '+ @where +'
								   GROUP BY  cjmAssessmentTypeKey , cjmAssessmentType ORDER BY cjmAssessmentType  DROP TABLE #temp DROP TABLE #tempMatchedJobs'
--Print selectQuery
PRINT(@selectQuery)

--Execute query
 EXEC (@selectQuery) 
END

/*
[API_SP_Jobs_JobAssignmentTypeAndCount] 
*/

/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_S_uspJobs_GetJobCategoryAndCount]    Script Date: 2/8/2018 5:44:33 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


--SP_HELPTEXT API_S_uspJobs_GetJobCategoryAndCount
----3959 miles 6371 for KM

CREATE PROCEDURE [dbo].[API_S_uspJobs_GetJobCategoryAndCount]
(
	@keyWords NVARCHAR(MAX)='',
	@latitude Float=0.0,
	@longitude Float=0.0,
	@where AS VARCHAR(MAX) =' 1=1'
)
AS
BEGIn
		DECLARE @selectQuery AS VARCHAR(MAX)='';
		SET @selectQuery=@selectQuery + ' Select * Into #tempMatchedJobs From (Select *  From [dbo].[API_FN_FullTextJobSearch]('''+@keyWords+''')) Alias '
		SET @selectQuery= @selectQuery +'
		
			SELECT DISTINCT 
			 projectTypeId
			, projectType
			, cjmJobId		
			,latitude
			,longitude
			,jobTitle
			,keywords
			,cityId
			,city
			,state
			,isHot
			,cjmAssessmentTypeKey
			,CASE WHEN  ( ('+CONVERT(VARCHAR(50),@latitude)+' != 0 ) AND ('+CONVERT(VARCHAR(50),@longitude)+' != 0 )
				AND (CONVERT(VARCHAR(50),'+CONVERT(VARCHAR(50),@latitude)+') !=CONVERT(VARCHAR(50),latitude) ) AND (CONVERT(VARCHAR(50),'+CONVERT(VARCHAR(50),@longitude)+') != CONVERT(VARCHAR(50),longitude) )
				)    
			THEN  (
			ROUND(3959  
				* ACOS(
						COS(RADIANS(ISNULL('+CONVERT(VARCHAR(50),@latitude)+',0.0)))
						* COS(RADIANS(ISNULL(latitude,0.0)))
						* COS(RADIANS(ISNULL(longitude,0.0)) - RADIANS(ISNULL('+CONVERT(VARCHAR(50),@longitude)+',0.0)))
						+ SIN(RADIANS(ISNULL('+CONVERT(VARCHAR(50),@latitude)+',0.0)))
						* SIN(RADIANS(ISNULL(latitude,0.0)))
						)
			,2)) ELSE 0 END  distanceInMiles
			,tj.[rank]
			INTO #temp			
			FROM API_VIEW_GetAllJobsListActiveRecord JOBS		
			INNER JOIN #tempMatchedJobs tj on JOBS.cjmJobId =  tj.cjm_job_id
			WHERE cjmStatus =''A'' AND  projectTypeId IS NOT NULL 
			
		
		
	'
	SET @selectQuery=@selectQuery+ ' SELECT  projectTypeId , projectType
								   , (SELECT COUNT(projectTypeId) WHERE projectTypeId=temp.projectTypeId) count  
								   FROM #temp temp WHERE  '+ @where +'
								   GROUP BY  projectTypeId , projectType  ORDER BY projectType  DROP TABLE #temp DROP TABLE #tempMatchedJobs'
--Print selectQuery
PRINT(@selectQuery)

--Execute query
 EXEC (@selectQuery)   
END

/*
[API_S_uspJobs_GetJobCategoryAndCount] 
select  * from API_VIEW_GetAllJobsList where city ='Anaheim' ANd state='California'
select * from API_VIEW_GetAllJobsList where projectTypeId=4652
*/

/******===========================================================================================================================================================******/


GO

/****** Object:  StoredProcedure [dbo].[API_S_uspJobs_GetJobsCounts]    Script Date: 2/8/2018 5:44:34 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

/*
[API_S_uspJobs_GetJobsCounts] 57971, 
@keyWords ='BUSINESS REQUIREMENTS DATABASES HTML JAVASCRIPT MS SQL SERVER 2005 MYSQL PHP RDMS REQUIREMENT ANALYSIS STORED PROCEDURES SVN XML Java SAP',
@latitude= -95.3633 ,@longitude= 29.7633 ,
@where= '  1=1  AND (((city = ''Houston'')  AND  (state = ''Texas''))  OR  (distanceInMiles <= (CASE WHEN (EXISTS(SELECT * FROM #temp WHERE distanceInMiles
<=50))  THEN CONVERT(VARCHAR(50),50)  ELSE 200 END) AND (ISNULL(cityId,0) > 0) ) )   AND cjmJobId NOT IN ( Select Distinct CJM_JOB_ID From Job_Resume 
Where CandidateResume_id = 302880 And CJM_JOB_ID is not null ) ' 
*/
CREATE PROCEDURE [dbo].[API_S_uspJobs_GetJobsCounts]
(
  @employeeDetailsId INT= 0,
  @keyWords NVARCHAR(MAX)='',
  @latitude Float=0.0,
  @longitude Float=0.0,
  @where NVARCHAR(MAX)=' 1=1 '
 
)
AS
BEGIN
DECLARE @selectQuery AS VARCHAR(MAX)='';
DECLARE @paging AS VARCHAR(5000) ='';
DECLARE @TotalCount INT=0;

	IF(@where='')
		SET @where=' 1=1 '
	

	--Select data for search result

	SET @selectQuery=@selectQuery + ' Select * Into #tempMatchedJobs From (Select *  From [dbo].[API_FN_FullTextJobSearch]('''+@keyWords+''')) Alias '

	SET @selectQuery=@selectQuery + '  
				SELECT 
				--TOP 500
				cjm.CJM_JOB_ID cjmJobId				
				,LTRIM(RTRIM(CJM_JOB_TITLE)) jobTitle
				,CUS.Name employerName
				,LTRIM(RTRIM(Keywords)) keywords	
				,(SUBSTRING((SELECT [dbo].[API_FN_StripHTML](CJM_JOB_DETAILS)),1,500)) cjmJobDetails	
				,CJM_ASSESSMENT_TYPE cjmAssessmentTypeKey
				,(CASE CJM_ASSESSMENT_TYPE  WHEN ''C'' THEN ''Consulting'' WHEN ''F'' THEN ''Full Time'' WHEN ''R'' THEN ''Right to Hire'' END) cjmAssessmentType
				,NUM_OF_POSITIONS numOfPositions		
				,Experience_Range experienceRangeId
				,EXPM.EM_DESC experienceRange
				--,cjmJobcity	
				,Location_Country_Id locationCountryId
				,country
				,Location_State_Id locationStateId
				,state
				,CJM.City_Id cityId	
				,city
				,CASE  WHEN  (city ='''' AND state='''') THEN ''''
				   WHEN  (city !='''' AND state='''') THEN city
			       WHEN  (city ='''' AND state!='''') THEN state
				   ELSE  city +'', ''+state 
				END location
				,CITYM.Latitude latitude
				,CITYM.Langitude longitude
				,(IIF(ShowPayRateOutside = 1, CAST(CJM_ANNUAL_SALARY AS VARCHAR(500)), ''DOE'') ) cjmAnnualSalary		
				,isHot
				,ProjectType projectTypeId
				,projectType	
				,CJM_POSTING_DATE cjmPostingDate
				,CJM_Status  cjmStatus	
				,CJM_JOB_REFERENCE cjmJobReferenceId
				,JR.JR_UPDATED_ON  appliedOn
				,CASE WHEN (ISNULL(JR.Job_Resume_Id,0)= 0)  THEN 0 ELSE 1 END alreadyApplied

				,CASE WHEN  ( ('+CONVERT(VARCHAR(50),@latitude)+' != 0 ) AND ('+CONVERT(VARCHAR(50),@longitude)+' != 0 )
				AND (CONVERT(VARCHAR(50),'+CONVERT(VARCHAR(50),@latitude)+') !=CONVERT(VARCHAR(50),CITYM.Latitude) ) AND (CONVERT(VARCHAR(50),'+CONVERT(VARCHAR(50),@longitude)+') != CONVERT(VARCHAR(50),CITYM.Langitude) )
				)   

				THEN  (
				ROUND(3959  
					* ACOS(
							COS(RADIANS(ISNULL('+CONVERT(VARCHAR(50),@latitude)+',0.0)))
							* COS(RADIANS(ISNULL(CITYM.Latitude,0.0)))
							* COS(RADIANS(ISNULL(CITYM.Langitude,0.0)) - RADIANS(ISNULL('+CONVERT(VARCHAR(50),@longitude)+',0.0)))
							+ SIN(RADIANS(ISNULL('+CONVERT(VARCHAR(50),@latitude)+',0.0)))
							* SIN(RADIANS(ISNULL(CITYM.Latitude,0.0)))
							)
				,2)) ELSE 0 END  distanceInMiles
				,tj.[rank] 

				INTO #temp
				--FROM API_VIEW_GetAllJobsListActiveRecord VIEWJOBS 

				FROM DBO.CLIENT_JOB_MASTER CJM WITH(NOLOCK)
				LEFT JOIN DBO.Country_Master COUNTM ON CJM.Location_Country_Id=COUNTM.Country_Id
				LEFT JOIN DBO.State_Master SM ON CJM.Location_State_Id=SM.State_ID
				LEFT JOIN DBO.city_master CITYM ON CITYM.City_Id= CJM.City_Id
				LEFT JOIN DBO.Customer CUS ON CJM.CustomerId =CUS.CustId
				LEFT JOIN DBO.EXPERIENCE_MASTER EXPM ON CJM.Experience_Range=EXPM.EM_ID
				LEFT JOIN DBO.APP_REF_DATA CAT ON CJM.ProjectType =CAT.KeyId

				INNER JOIN #tempMatchedJobs tj on CJM.CJM_JOB_ID =  tj.cjm_job_id
				LEFT JOIN Job_resume JR ON CJM.CJM_JOB_ID =JR.CJM_JOB_ID  AND CandidateResume_Id= (SELECT TOP 1 Resume_Id FROM Resume_Master WHERE FromEmployeeDetails_Id='+CONVERT(VARCHAR(50),@employeeDetailsId)+' ORDER BY Resume_Id DESC) 				
				WHERE CJM_Status =''A'' AND CJM.City_Id IS NOT NULL  '

	--  Select TotalCount 
	SET @selectQuery= @selectQuery+ 'DECLARE @TotalCount INT=0;
				 SET @TotalCount = (SELECT COUNT(*) totalCount FROM #temp WHERE '+ @where  +')
				 SELECT @TotalCount totalCount'


	--SET @selectQuery=@selectQuery+  ' SELECT * FROM #temp t WHERE '+ @where  +''
	
	
	--	Drop temp table
	--SET @selectQuery=@selectQuery +  ' DROP TABLE #temp  DROP TABLE #tempMatchedJobs'

	SET @selectQuery=@selectQuery +  ' DROP TABLE #temp DROP TABLE #tempMatchedJobs'

	--  Print selectQuery
	PRINT(@selectQuery)

	-- Execute query
	EXEC (@selectQuery)  

END


GO

/****** Object:  StoredProcedure [dbo].[API_S_uspJobs_GetJobsDetailById]    Script Date: 2/8/2018 5:44:35 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_S_uspJobs_GetJobsDetailById]
(
  @employeeDetailsId INT= 0,
  @cjmJobId INT=0
)
AS
BEGIN
	 SELECT DISTINCT cjmJobId
	,jobTitle
	,employerName
	,keywords	
	,cjmJobDetails
	--,(SUBSTRING((SELECT [dbo].[API_FN_StripHTML](cjmJobDetails)),1,500)) trimedCjmJobDetails	
	,cjmAssessmentTypeKey
	,cjmAssessmentType
	,numOfPositions	
	,experienceRangeId
	,experienceRange
	--,cjmJobcity	
	,locationCountryId
	,country
	,locationStateId
	,state
	,cityId
	,city
	,latitude
	,longitude
	,cjmAnnualSalary	
	,isHot
	,projectTypeId
	,projectType	
	,cjmPostingDate
	,cjmStatus	
	,cjmJobReferenceId
	,clientName
	,JR.JR_UPDATED_ON  appliedOn
	,ED.First_Name recruiterFirstName
	,ED.Last_Name recruiterLastName
	,ED.Email_Id recruiterEmailId
	,CASE WHEN (ISNULL(JR.Job_Resume_Id,0)= 0)  THEN 0 ELSE 1 END alreadyApplied
	FROM API_VIEW_GetAllJobsList VIEWJOBS 
	LEFT JOIN Job_resume JR ON VIEWJOBS.cjmJobId =JR.CJM_JOB_ID  AND CandidateResume_Id= (SELECT TOP 1 Resume_Id FROM Resume_Master WHERE FromEmployeeDetails_Id=@employeeDetailsId AND FromEmployeeDetails_Id IS NOT NULL)
	LEFT JOIN EmployeeDetails ED ON JR.RecruiterId = ED.EmployeeDetails_Id 
	WHERE  cjmJobId =@cjmJobId 

END



--select * from  client_job_master where CJM_JOB_ID=319204

/*

select * from API_VIEW_GetAllJobsList where cjmJobId=319205
[API_S_uspJobs_GetJobsDetailById] '21567','319205'

select * from resume_master where resume_id=208050
select * from client_job_master where CJM_JOB_ID=319205

select * from Job_resume order by CandidateResume_Id desc

NULL 
*/

/******===========================================================================================================================================================******/




GO

/****** Object:  StoredProcedure [dbo].[API_S_uspJobs_GetJobsSearch]    Script Date: 2/8/2018 5:44:36 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


/*
[API_S_uspJobs_GetJobsSearch] 0,1,30,0,0,50,' cjmJobId in (277245,277246)',''
*/
CREATE PROCEDURE [dbo].[API_S_uspJobs_GetJobsSearch]
(
  @employeeDetailsId INT= 0,
  @pageCount INT=1,
  @pageSize INT=30,
  @keyWords NVARCHAR(MAX)='',
  @latitude Float=0.0,
  @longitude Float=0.0,
  @where NVARCHAR(MAX)=' 1=1 ',
  @orderBy NVARCHAR(MAX)=' ORDER BY distanceInMiles ASC , cjmPostingDate DESC'
)
AS
BEGIN
DECLARE @selectQuery AS VARCHAR(MAX)='';
DECLARE @paging AS VARCHAR(5000) ='';
DECLARE @TotalCount INT=0;

	IF(@where='')
		SET @where=' 1=1 '
	IF (@orderBy ='')
		SET @orderBy=' ORDER BY distanceInMiles ASC , cjmPostingDate DESC '

	
--Select data for search result
	SET @selectQuery=@selectQuery + ' Select * Into #tempMatchedJobs From (Select *  From [dbo].[API_FN_FullTextJobSearch]('''+@keyWords+''')) Alias '

	SET @selectQuery=@selectQuery + '  
				SELECT cjmJobId
				,jobTitle
				,employerName
				,keywords	
				,(SUBSTRING((SELECT [dbo].[API_FN_StripHTML](cjmJobDetails)),1,500)) cjmJobDetails	
				,cjmAssessmentTypeKey
				,cjmAssessmentType
				,numOfPositions	
				,experienceRangeId
				,experienceRange
				--,cjmJobcity	
				,locationCountryId
				,country
				,locationStateId
				,state
				,cityId
				,city
				,CASE  WHEN  (city ='''' AND state='''') THEN ''''
				   WHEN  (city !='''' AND state='''') THEN city
			       WHEN  (city ='''' AND state!='''') THEN state
				   ELSE  city +'', ''+state 
				END location
				,latitude
				,longitude
				,cjmAnnualSalary	
				,isHot
				,projectTypeId
				,projectType	
				,cjmPostingDate
				,cjmStatus	
				,cjmJobReferenceId
				,JR.JR_UPDATED_ON  appliedOn
				,CASE WHEN (ISNULL(JR.Job_Resume_Id,0)= 0)  THEN 0 ELSE 1 END alreadyApplied

				,CASE WHEN  ( ('+CONVERT(VARCHAR(50),@latitude)+' != 0 ) AND ('+CONVERT(VARCHAR(50),@longitude)+' != 0 )
				AND (CONVERT(VARCHAR(50),'+CONVERT(VARCHAR(50),@latitude)+') !=CONVERT(VARCHAR(50),latitude) ) AND (CONVERT(VARCHAR(50),'+CONVERT(VARCHAR(50),@longitude)+') != CONVERT(VARCHAR(50),longitude) )
				)  

				THEN  (
				ROUND(3959  
					* ACOS(
							COS(RADIANS(ISNULL('+CONVERT(VARCHAR(50),@latitude)+',0.0)))
							* COS(RADIANS(ISNULL(latitude,0.0)))
							* COS(RADIANS(ISNULL(longitude,0.0)) - RADIANS(ISNULL('+CONVERT(VARCHAR(50),@longitude)+',0.0)))
							+ SIN(RADIANS(ISNULL('+CONVERT(VARCHAR(50),@latitude)+',0.0)))
							* SIN(RADIANS(ISNULL(latitude,0.0)))
							)
				,2)) ELSE 0 END  distanceInMiles
				,tj.[rank] 
				INTO #temp
				FROM API_VIEW_GetAllJobsListActiveRecord VIEWJOBS 
				INNER JOIN #tempMatchedJobs tj on VIEWJOBS.cjmJobId =  tj.cjm_job_id
				LEFT JOIN Job_resume JR ON VIEWJOBS.cjmJobId =JR.CJM_JOB_ID  AND CandidateResume_Id= (SELECT TOP 1 Resume_Id FROM Resume_Master WHERE FromEmployeeDetails_Id='+CONVERT(VARCHAR(50),@employeeDetailsId)+' ORDER BY Resume_Id DESC) 
				WHERE cjmStatus =''A''  '
	

	--  Set paging
	SET @paging= ' OFFSET '+CONVERT(VARCHAR(50),@pageSize)+' * (@CurrentPage - 1) ROWS  FETCH NEXT '+CONVERT(VARCHAR(50),@pageSize)+' ROWS ONLY OPTION (RECOMPILE) '
	
	--  Select TotalCount 
	SET @selectQuery= @selectQuery+ 'DECLARE @TotalCount INT=0;
				 SET @TotalCount = (SELECT COUNT(*) totalCount FROM #temp WHERE '+ @where  +')
				 SELECT @TotalCount totalCount'

	--  Select Current page number
	SET @selectQuery=@selectQuery + ' DECLARE @CurrentPage INT= [dbo].API_FN_GetPageCount(@TotalCount,'+CONVERT(VARCHAR(50),@pageSize)+','+CONVERT(VARCHAR(50),@pageCount)+')  SELECT @CurrentPage currentPage'

	SET @selectQuery=@selectQuery+  ' SELECT * FROM #temp WHERE '+ @where  +''

	--  Apply orderBy
	SET @selectQuery=@selectQuery + @orderBy

	--  Apply paging
	SET @selectQuery=@selectQuery + @paging

	--	Drop temp table
	SET @selectQuery=@selectQuery +  ' DROP TABLE #temp  DROP TABLE #tempMatchedJobs'

	--  Print selectQuery
	PRINT(@selectQuery)

	-- Execute query
	 EXEC (@selectQuery)  

END

GO

/****** Object:  StoredProcedure [dbo].[API_S_uspJobs_GetJobsSearch_bkp]    Script Date: 2/8/2018 5:44:37 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO



/*
[API_S_uspJobs_GetJobsSearch_bkp] 0,1,30,0,0,50,' cjmJobId in (277245,277246)','', '277245^10,277246^9'
*/
CREATE PROCEDURE [dbo].[API_S_uspJobs_GetJobsSearch_bkp]
(
  @employeeDetailsId INT= 0,
  @pageCount INT=1,
  @pageSize INT=30,
  @keyWords NVARCHAR(MAX)='',
  @latitude Float=0.0,
  @longitude Float=0.0,
  @where NVARCHAR(MAX)=' 1=1 ',
  @orderBy NVARCHAR(MAX)=' ORDER BY #jobsTempTable.score DESC, distanceInMiles ASC , cjmPostingDate DESC',
  @jobObject NVARCHAR(MAX)=''
)
AS
BEGIN
DECLARE @selectQuery AS VARCHAR(MAX)='';
DECLARE @paging AS VARCHAR(5000) ='';
DECLARE @TotalCount INT=0;

	IF(@where='')
		SET @where=' 1=1 '
	IF (@orderBy ='')
		SET @orderBy=' ORDER BY #jobsTempTable.score DESC, distanceInMiles ASC , cjmPostingDate DESC '


	if(@jobObject <> '')
		SET @selectQuery=@selectQuery + 'Select col1 as jid, col2 as score into #jobsTempTable from [API_FN_SplitString_New]('''+@jobObject+''', '','' , ''^'') ' 
	
--Select data for search result
if(@keyWords <> '')
begin
	SET @selectQuery=@selectQuery + ' Select * Into #tempMatchedJobs From (Select *  From [dbo].[API_FN_FullTextJobSearch]('''+@keyWords+''')) Alias '

	SET @selectQuery=@selectQuery + '  
				SELECT 
				--TOP 500
				cjm.CJM_JOB_ID cjmJobId				
				,LTRIM(RTRIM(CJM_JOB_TITLE)) jobTitle
				,CUS.Name employerName
				,LTRIM(RTRIM(Keywords)) keywords	
				,(SUBSTRING((SELECT [dbo].[API_FN_StripHTML](CJM_JOB_DETAILS)),1,500)) cjmJobDetails	
				,CJM_ASSESSMENT_TYPE cjmAssessmentTypeKey
				,(CASE CJM_ASSESSMENT_TYPE  WHEN ''C'' THEN ''Consulting'' WHEN ''F'' THEN ''Full Time'' WHEN ''R'' THEN ''Right to Hire'' END) cjmAssessmentType
				,NUM_OF_POSITIONS numOfPositions		
				,Experience_Range experienceRangeId
				,EXPM.EM_DESC experienceRange
				--,cjmJobcity	
				,Location_Country_Id locationCountryId
				,country
				,Location_State_Id locationStateId
				,state
				,CJM.City_Id cityId	
				,city
				,CASE  WHEN  (city ='''' AND state='''') THEN ''''
				   WHEN  (city !='''' AND state='''') THEN city
			       WHEN  (city ='''' AND state!='''') THEN state
				   ELSE  city +'', ''+state 
				END location
				,CITYM.Latitude latitude
				,CITYM.Langitude longitude
				,(IIF(ShowPayRateOutside = 1, CAST(CJM_ANNUAL_SALARY AS VARCHAR(500)), ''DOE'') ) cjmAnnualSalary		
				,isHot
				,ProjectType projectTypeId
				,projectType	
				,CJM_POSTING_DATE cjmPostingDate
				,CJM_Status  cjmStatus	
				,CJM_JOB_REFERENCE cjmJobReferenceId
				,JR.JR_UPDATED_ON  appliedOn
				,CASE WHEN (ISNULL(JR.Job_Resume_Id,0)= 0)  THEN 0 ELSE 1 END alreadyApplied

				,CASE WHEN  ( ('+CONVERT(VARCHAR(50),@latitude)+' != 0 ) AND ('+CONVERT(VARCHAR(50),@longitude)+' != 0 )
				AND (CONVERT(VARCHAR(50),'+CONVERT(VARCHAR(50),@latitude)+') !=CONVERT(VARCHAR(50),CITYM.Latitude) ) AND (CONVERT(VARCHAR(50),'+CONVERT(VARCHAR(50),@longitude)+') != CONVERT(VARCHAR(50),CITYM.Langitude) )
				)   

				THEN  (
				ROUND(3959  
					* ACOS(
							COS(RADIANS(ISNULL('+CONVERT(VARCHAR(50),@latitude)+',0.0)))
							* COS(RADIANS(ISNULL(CITYM.Latitude,0.0)))
							* COS(RADIANS(ISNULL(CITYM.Langitude,0.0)) - RADIANS(ISNULL('+CONVERT(VARCHAR(50),@longitude)+',0.0)))
							+ SIN(RADIANS(ISNULL('+CONVERT(VARCHAR(50),@latitude)+',0.0)))
							* SIN(RADIANS(ISNULL(CITYM.Latitude,0.0)))
							)
				,2)) ELSE 0 END  distanceInMiles
				,tj.[rank] 

				INTO #temp
				--FROM API_VIEW_GetAllJobsListActiveRecord VIEWJOBS 

				FROM DBO.CLIENT_JOB_MASTER CJM WITH(NOLOCK)
				LEFT JOIN DBO.Country_Master COUNTM ON CJM.Location_Country_Id=COUNTM.Country_Id
				LEFT JOIN DBO.State_Master SM ON CJM.Location_State_Id=SM.State_ID
				LEFT JOIN DBO.city_master CITYM ON CITYM.City_Id= CJM.City_Id
				LEFT JOIN DBO.Customer CUS ON CJM.CustomerId =CUS.CustId
				LEFT JOIN DBO.EXPERIENCE_MASTER EXPM ON CJM.Experience_Range=EXPM.EM_ID
				LEFT JOIN DBO.APP_REF_DATA CAT ON CJM.ProjectType =CAT.KeyId

				INNER JOIN #tempMatchedJobs tj on CJM.CJM_JOB_ID =  tj.cjm_job_id
				LEFT JOIN Job_resume JR ON CJM.CJM_JOB_ID =JR.CJM_JOB_ID  AND CandidateResume_Id= (SELECT TOP 1 Resume_Id FROM Resume_Master WHERE FromEmployeeDetails_Id='+CONVERT(VARCHAR(50),@employeeDetailsId)+' ORDER BY Resume_Id DESC) 				
				WHERE CJM_Status =''A'' AND CJM.City_Id IS NOT NULL  '
end
else
begin
SET @selectQuery=@selectQuery + '  
				SELECT 
				--top 500 								
				cjm.CJM_JOB_ID cjmJobId				
				,LTRIM(RTRIM(CJM_JOB_TITLE)) jobTitle
				,CUS.Name employerName
				,LTRIM(RTRIM(Keywords)) keywords	
				,(SUBSTRING((SELECT [dbo].[API_FN_StripHTML](CJM_JOB_DETAILS)),1,500)) cjmJobDetails	
				,CJM_ASSESSMENT_TYPE cjmAssessmentTypeKey
				,(CASE CJM_ASSESSMENT_TYPE  WHEN ''C'' THEN ''Consulting'' WHEN ''F'' THEN ''Full Time'' WHEN ''R'' THEN ''Right to Hire'' END) cjmAssessmentType
				,NUM_OF_POSITIONS numOfPositions		
				,Experience_Range experienceRangeId
				,EXPM.EM_DESC experienceRange
				--,cjmJobcity	
				,Location_Country_Id locationCountryId
				,country
				,Location_State_Id locationStateId
				,state
				,CJM.City_Id cityId	
				,city
				,CASE  WHEN  (city ='''' AND state='''') THEN ''''
				   WHEN  (city !='''' AND state='''') THEN city
			       WHEN  (city ='''' AND state!='''') THEN state
				   ELSE  city +'', ''+state 
				END location
				,CITYM.Latitude latitude
				,CITYM.Langitude longitude
				,(IIF(ShowPayRateOutside = 1, CAST(CJM_ANNUAL_SALARY AS VARCHAR(500)), ''DOE'') ) cjmAnnualSalary		
				,isHot
				,ProjectType projectTypeId
				,projectType	
				,CJM_POSTING_DATE cjmPostingDate
				,CJM_Status  cjmStatus	
				,CJM_JOB_REFERENCE cjmJobReferenceId
				,JR.JR_UPDATED_ON  appliedOn
				,CASE WHEN (ISNULL(JR.Job_Resume_Id,0)= 0)  THEN 0 ELSE 1 END alreadyApplied

				,CASE WHEN  ( ('+CONVERT(VARCHAR(50),@latitude)+' != 0 ) AND ('+CONVERT(VARCHAR(50),@longitude)+' != 0 )
				AND (CONVERT(VARCHAR(50),'+CONVERT(VARCHAR(50),@latitude)+') !=CONVERT(VARCHAR(50),CITYM.Latitude) ) AND (CONVERT(VARCHAR(50),'+CONVERT(VARCHAR(50),@longitude)+') != CONVERT(VARCHAR(50),CITYM.Langitude) )
				)  

				THEN  (
				ROUND(3959  
					* ACOS(
							COS(RADIANS(ISNULL('+CONVERT(VARCHAR(50),@latitude)+',0.0)))
							* COS(RADIANS(ISNULL(CITYM.Latitude,0.0)))
							* COS(RADIANS(ISNULL(CITYM.Langitude,0.0)) - RADIANS(ISNULL('+CONVERT(VARCHAR(50),@longitude)+',0.0)))
							+ SIN(RADIANS(ISNULL('+CONVERT(VARCHAR(50),@latitude)+',0.0)))
							* SIN(RADIANS(ISNULL(CITYM.Latitude,0.0)))
							)
				,2)) ELSE 0 END  distanceInMiles
				
				INTO #temp
				--FROM API_VIEW_GetAllJobsListActiveRecord VIEWJOBS 
				
				FROM DBO.CLIENT_JOB_MASTER CJM WITH(NOLOCK)
				LEFT JOIN DBO.Country_Master COUNTM ON CJM.Location_Country_Id=COUNTM.Country_Id
				LEFT JOIN DBO.State_Master SM ON CJM.Location_State_Id=SM.State_ID
				LEFT JOIN DBO.city_master CITYM ON CITYM.City_Id= CJM.City_Id
				LEFT JOIN DBO.Customer CUS ON CJM.CustomerId =CUS.CustId
				LEFT JOIN DBO.EXPERIENCE_MASTER EXPM ON CJM.Experience_Range=EXPM.EM_ID
				LEFT JOIN DBO.APP_REF_DATA CAT ON CJM.ProjectType =CAT.KeyId

				LEFT JOIN Job_resume JR ON CJM.CJM_JOB_ID =JR.CJM_JOB_ID  AND CandidateResume_Id= (SELECT TOP 1 Resume_Id FROM Resume_Master WHERE FromEmployeeDetails_Id='+CONVERT(VARCHAR(50),@employeeDetailsId)+' ORDER BY Resume_Id DESC) 				
				WHERE CJM_Status =''A'' AND CJM.City_Id IS NOT NULL  '
end	

	--  Set paging
	SET @paging= ' OFFSET '+CONVERT(VARCHAR(50),@pageSize)+' * (@CurrentPage - 1) ROWS  FETCH NEXT '+CONVERT(VARCHAR(50),@pageSize)+' ROWS ONLY OPTION (RECOMPILE) '
	
	--  Select TotalCount 
	SET @selectQuery= @selectQuery+ 'DECLARE @TotalCount INT=0;
				 SET @TotalCount = (SELECT COUNT(*) totalCount FROM #temp WHERE '+ @where  +')
				 SELECT @TotalCount totalCount'

	--  Select Current page number
	SET @selectQuery=@selectQuery + ' DECLARE @CurrentPage INT= [dbo].API_FN_GetPageCount(@TotalCount,'+CONVERT(VARCHAR(50),@pageSize)+','+CONVERT(VARCHAR(50),@pageCount)+')  SELECT @CurrentPage currentPage'

	

	IF(@jobObject='')
		SET @selectQuery=@selectQuery+  ' SELECT * FROM #temp t WHERE '+ @where  +''
	ELSE 
		SET @selectQuery=@selectQuery+  ' SELECT t.*, jt.score FROM #temp t INNER JOIN #jobsTempTable jt ON jt.jid = t.cjmJobId WHERE '+ @where  +''


	--  Apply orderBy
	SET @selectQuery=@selectQuery + @orderBy

	--  Apply paging
	SET @selectQuery=@selectQuery + @paging

	--	Drop temp table

	if(@keyWords <> '')
	    SET @selectQuery=@selectQuery +  ' DROP TABLE #temp  DROP TABLE #tempMatchedJobs'
	else
	    SET @selectQuery=@selectQuery +  ' DROP TABLE #temp '

	--  Print selectQuery
	PRINT(@selectQuery)

	-- Execute query
	EXEC (@selectQuery)  

END


GO

/****** Object:  StoredProcedure [dbo].[API_S_uspJobs_GetJobsSearch_new]    Script Date: 2/8/2018 5:44:38 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO



/*
[API_S_uspJobs_GetJobsSearch_bkp] 0,1,30,0,0,50,' cjmJobId in (277245,277246)','', '277245^10,277246^9'
*/
CREATE PROCEDURE [dbo].[API_S_uspJobs_GetJobsSearch_new]
(
  @employeeDetailsId INT= 0,
  @pageCount INT=1,
  @pageSize INT=30,
  @keyWords NVARCHAR(MAX)='',
  @latitude Float=0.0,
  @longitude Float=0.0,
  @where NVARCHAR(MAX)=' 1=1 ',
  @orderBy NVARCHAR(MAX)=' ORDER BY #jobsTempTable.score DESC, distanceInMiles ASC , cjmPostingDate DESC',
  @jobObject NVARCHAR(MAX)=''
)
AS
BEGIN
DECLARE @selectQuery AS VARCHAR(MAX)='';
DECLARE @paging AS VARCHAR(5000) ='';
DECLARE @TotalCount INT=0;

	IF(@where='')
		SET @where=' 1=1 '
	IF (@orderBy ='')
		SET @orderBy=' ORDER BY #jobsTempTable.score DESC, distanceInMiles ASC , CJM_POSTING_DATE DESC '


--Select data for search result
if(@keyWords <> '')
begin
	SET @selectQuery=@selectQuery + ' Select * Into #tempMatchedJobs From (Select *  From [dbo].[API_FN_FullTextJobSearch]('''+@keyWords+''')) Alias '

	SET @selectQuery=@selectQuery + '  
				SELECT 
				TOP 500
				cjm.CJM_JOB_ID cjmJobId				
				,LTRIM(RTRIM(CJM_JOB_TITLE)) jobTitle
				,CUS.Name employerName
				,LTRIM(RTRIM(Keywords)) keywords	
				,(SUBSTRING((SELECT [dbo].[API_FN_StripHTML](CJM_JOB_DETAILS)),1,500)) cjmJobDetails	
				,CJM_ASSESSMENT_TYPE cjmAssessmentTypeKey
				,(CASE CJM_ASSESSMENT_TYPE  WHEN ''C'' THEN ''Consulting'' WHEN ''F'' THEN ''Full Time'' WHEN ''R'' THEN ''Right to Hire'' END) cjmAssessmentType
				,NUM_OF_POSITIONS numOfPositions		
				,Experience_Range experienceRangeId
				,EXPM.EM_DESC experienceRange
				--,cjmJobcity	
				,Location_Country_Id locationCountryId
				,country
				,Location_State_Id locationStateId
				,state
				,CJM.City_Id cityId	
				,city
				,CASE  WHEN  (city ='''' AND state='''') THEN ''''
				   WHEN  (city !='''' AND state='''') THEN city
			       WHEN  (city ='''' AND state!='''') THEN state
				   ELSE  city +'', ''+state 
				END location
				,CITYM.Latitude latitude
				,CITYM.Langitude longitude
				,(IIF(ShowPayRateOutside = 1, CAST(CJM_ANNUAL_SALARY AS VARCHAR(500)), ''DOE'') ) cjmAnnualSalary		
				,isHot
				,ProjectType projectTypeId
				,projectType	
				,CJM_POSTING_DATE cjmPostingDate
				,CJM_Status  cjmStatus	
				,CJM_JOB_REFERENCE cjmJobReferenceId
				,JR.JR_UPDATED_ON  appliedOn
				,CASE WHEN (ISNULL(JR.Job_Resume_Id,0)= 0)  THEN 0 ELSE 1 END alreadyApplied

				,CASE WHEN  ( ('+CONVERT(VARCHAR(50),@latitude)+' != 0 ) AND ('+CONVERT(VARCHAR(50),@longitude)+' != 0 )
				AND (CONVERT(VARCHAR(50),'+CONVERT(VARCHAR(50),@latitude)+') !=CONVERT(VARCHAR(50),CITYM.Latitude) ) AND (CONVERT(VARCHAR(50),'+CONVERT(VARCHAR(50),@longitude)+') != CONVERT(VARCHAR(50),CITYM.Langitude) )
				)   

				THEN  (
				ROUND(3959  
					* ACOS(
							COS(RADIANS(ISNULL('+CONVERT(VARCHAR(50),@latitude)+',0.0)))
							* COS(RADIANS(ISNULL(CITYM.Latitude,0.0)))
							* COS(RADIANS(ISNULL(CITYM.Langitude,0.0)) - RADIANS(ISNULL('+CONVERT(VARCHAR(50),@longitude)+',0.0)))
							+ SIN(RADIANS(ISNULL('+CONVERT(VARCHAR(50),@latitude)+',0.0)))
							* SIN(RADIANS(ISNULL(CITYM.Latitude,0.0)))
							)
				,2)) ELSE 0 END  distanceInMiles
				,tj.[rank] 

				INTO #temp
				--FROM API_VIEW_GetAllJobsListActiveRecord VIEWJOBS 

				FROM DBO.CLIENT_JOB_MASTER CJM WITH(NOLOCK)
				LEFT JOIN DBO.Country_Master COUNTM ON CJM.Location_Country_Id=COUNTM.Country_Id
				LEFT JOIN DBO.State_Master SM ON CJM.Location_State_Id=SM.State_ID
				LEFT JOIN DBO.city_master CITYM ON CITYM.City_Id= CJM.City_Id
				LEFT JOIN DBO.Customer CUS ON CJM.CustomerId =CUS.CustId
				LEFT JOIN DBO.EXPERIENCE_MASTER EXPM ON CJM.Experience_Range=EXPM.EM_ID
				LEFT JOIN DBO.APP_REF_DATA CAT ON CJM.ProjectType =CAT.KeyId

				INNER JOIN #tempMatchedJobs tj on CJM.CJM_JOB_ID =  tj.cjm_job_id
				LEFT JOIN Job_resume JR ON CJM.CJM_JOB_ID =JR.CJM_JOB_ID  AND CandidateResume_Id= (SELECT TOP 1 Resume_Id FROM Resume_Master WHERE FromEmployeeDetails_Id='+CONVERT(VARCHAR(50),@employeeDetailsId)+' ORDER BY Resume_Id DESC) 				
				WHERE CJM_Status =''A'' AND CJM.City_Id IS NOT NULL  '
end
else
begin
SET @selectQuery=@selectQuery + '  
				SELECT 
				TOP 500 								
				cjm.CJM_JOB_ID cjmJobId				
				,LTRIM(RTRIM(CJM_JOB_TITLE)) jobTitle
				,CUS.Name employerName
				,LTRIM(RTRIM(Keywords)) keywords	
				,(SUBSTRING((SELECT [dbo].[API_FN_StripHTML](CJM_JOB_DETAILS)),1,500)) cjmJobDetails	
				,CJM_ASSESSMENT_TYPE cjmAssessmentTypeKey
				,(CASE CJM_ASSESSMENT_TYPE  WHEN ''C'' THEN ''Consulting'' WHEN ''F'' THEN ''Full Time'' WHEN ''R'' THEN ''Right to Hire'' END) cjmAssessmentType
				,NUM_OF_POSITIONS numOfPositions		
				,Experience_Range experienceRangeId
				,EXPM.EM_DESC experienceRange
				--,cjmJobcity	
				,Location_Country_Id locationCountryId
				,country
				,Location_State_Id locationStateId
				,state
				,CJM.City_Id cityId	
				,city
				,CASE  WHEN  (city ='''' AND state='''') THEN ''''
				   WHEN  (city !='''' AND state='''') THEN city
			       WHEN  (city ='''' AND state!='''') THEN state
				   ELSE  city +'', ''+state 
				END location
				,CITYM.Latitude latitude
				,CITYM.Langitude longitude
				,(IIF(ShowPayRateOutside = 1, CAST(CJM_ANNUAL_SALARY AS VARCHAR(500)), ''DOE'') ) cjmAnnualSalary		
				,isHot
				,ProjectType projectTypeId
				,projectType	
				,CJM_POSTING_DATE cjmPostingDate
				,CJM_Status  cjmStatus	
				,CJM_JOB_REFERENCE cjmJobReferenceId
				,JR.JR_UPDATED_ON  appliedOn
				,CASE WHEN (ISNULL(JR.Job_Resume_Id,0)= 0)  THEN 0 ELSE 1 END alreadyApplied

				,CASE WHEN  ( ('+CONVERT(VARCHAR(50),@latitude)+' != 0 ) AND ('+CONVERT(VARCHAR(50),@longitude)+' != 0 )
				AND (CONVERT(VARCHAR(50),'+CONVERT(VARCHAR(50),@latitude)+') !=CONVERT(VARCHAR(50),CITYM.Latitude) ) AND (CONVERT(VARCHAR(50),'+CONVERT(VARCHAR(50),@longitude)+') != CONVERT(VARCHAR(50),CITYM.Langitude) )
				)  

				THEN  (
				ROUND(3959  
					* ACOS(
							COS(RADIANS(ISNULL('+CONVERT(VARCHAR(50),@latitude)+',0.0)))
							* COS(RADIANS(ISNULL(CITYM.Latitude,0.0)))
							* COS(RADIANS(ISNULL(CITYM.Langitude,0.0)) - RADIANS(ISNULL('+CONVERT(VARCHAR(50),@longitude)+',0.0)))
							+ SIN(RADIANS(ISNULL('+CONVERT(VARCHAR(50),@latitude)+',0.0)))
							* SIN(RADIANS(ISNULL(CITYM.Latitude,0.0)))
							)
				,2)) ELSE 0 END  distanceInMiles
				
				INTO #temp
				--FROM API_VIEW_GetAllJobsListActiveRecord VIEWJOBS 
				
				FROM DBO.CLIENT_JOB_MASTER CJM WITH(NOLOCK)
				LEFT JOIN DBO.Country_Master COUNTM ON CJM.Location_Country_Id=COUNTM.Country_Id
				LEFT JOIN DBO.State_Master SM ON CJM.Location_State_Id=SM.State_ID
				LEFT JOIN DBO.city_master CITYM ON CITYM.City_Id= CJM.City_Id
				LEFT JOIN DBO.Customer CUS ON CJM.CustomerId =CUS.CustId
				LEFT JOIN DBO.EXPERIENCE_MASTER EXPM ON CJM.Experience_Range=EXPM.EM_ID
				LEFT JOIN DBO.APP_REF_DATA CAT ON CJM.ProjectType =CAT.KeyId

				LEFT JOIN Job_resume JR ON CJM.CJM_JOB_ID =JR.CJM_JOB_ID  AND CandidateResume_Id= (SELECT TOP 1 Resume_Id FROM Resume_Master WHERE FromEmployeeDetails_Id='+CONVERT(VARCHAR(50),@employeeDetailsId)+' ORDER BY Resume_Id DESC) 				
				WHERE CJM_Status =''A'' AND CJM.City_Id IS NOT NULL  AND '+ @where + @orderBy
end	

	--  Set paging
	SET @paging= ' ORDER BY 1 DESC OFFSET '+CONVERT(VARCHAR(50),@pageSize)+' * (@CurrentPage - 1) ROWS  FETCH NEXT '+CONVERT(VARCHAR(50),@pageSize)+' ROWS ONLY OPTION (RECOMPILE) '
	
	--  Select TotalCount 
	SET @selectQuery= @selectQuery+ 'DECLARE @TotalCount INT=0;
				 SET @TotalCount = (SELECT COUNT(*) totalCount FROM #temp )
				 SELECT @TotalCount totalCount'

	--  Select Current page number
	SET @selectQuery=@selectQuery + ' DECLARE @CurrentPage INT= [dbo].API_FN_GetPageCount(@TotalCount,'+CONVERT(VARCHAR(50),@pageSize)+','+CONVERT(VARCHAR(50),@pageCount)+')  SELECT @CurrentPage currentPage'

	


	SET @selectQuery=@selectQuery+  ' SELECT * FROM #temp t '
	

	--  Apply orderBy
	--SET @selectQuery=@selectQuery + @orderBy

	--  Apply paging
	SET @selectQuery=@selectQuery + @paging

	--	Drop temp table

	if(@keyWords <> '')
	    SET @selectQuery=@selectQuery +  ' DROP TABLE #temp  DROP TABLE #tempMatchedJobs'
	else
	    SET @selectQuery=@selectQuery +  ' DROP TABLE #temp '

	--  Print selectQuery
	PRINT(@selectQuery)

	-- Execute query
	EXEC (@selectQuery)  

END


GO

/****** Object:  StoredProcedure [dbo].[API_S_uspJobs_GetJobsTitleSuggestion]    Script Date: 2/8/2018 5:44:39 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

/*
[API_S_uspRegions_GetLocationsSuggestion] 'New'
*/

CREATE PROCEDURE [dbo].[API_S_uspJobs_GetJobsTitleSuggestion] 
(	
	@searchString AS NVARCHAR(MAX) =''
)
AS
BEGIN
	WITH CTE AS
	(
	 SELECT DISTINCT jobTitle FROM API_VIEW_GetAllJobsListActiveRecord
	 WHERE  cjmStatus='A' AND jobTitle LIKE '%'+@searchString+'%' 
	 )
	 SELECT TOP 15 * FROM CTE 
	 ORDER BY Difference(jobTitle, @searchString) DESC
   
END
/*
select * from API_VIEW_GetAllJobsList
API_S_uspJobs_GetJobsTitleSuggestion 'java'
*/


GO

/****** Object:  StoredProcedure [dbo].[API_S_uspJobs_GetJobTypeAndCount]    Script Date: 2/8/2018 5:44:40 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_S_uspJobs_GetJobTypeAndCount]
(
  @keyWords NVARCHAR(MAX)='',
  @latitude Float=0.0,
  @longitude Float=0.0,
  @where AS VARCHAR(MAX)='1=1'
)
AS
BEGIN
   DECLARE @selectQuery AS VARCHAR(MAX)='';

	SET @selectQuery=@selectQuery + ' Select * Into #tempMatchedJobs From (Select *  From [dbo].[API_FN_FullTextJobSearch]('''+@keyWords+''')) Alias '

   SET @selectQuery= @selectQuery +'
		
			SELECT 
			ISNULL(isHot,0) isHot
			,cjmAssessmentTypeKey	
			,cjmJobId
			,keywords
			,projectTypeId
			,jobTitle
			,cityId
			,city	
			,state	
			,latitude
			,longitude
			,CASE WHEN  ( ('+CONVERT(VARCHAR(50),@latitude)+' != 0 ) AND ('+CONVERT(VARCHAR(50),@longitude)+' != 0 )
				AND (CONVERT(VARCHAR(50),'+CONVERT(VARCHAR(50),@latitude)+') !=CONVERT(VARCHAR(50),latitude) ) AND (CONVERT(VARCHAR(50),'+CONVERT(VARCHAR(50),@longitude)+') != CONVERT(VARCHAR(50),longitude) )
				)   
			THEN  (
			ROUND(3959  
				* ACOS(
						COS(RADIANS(ISNULL('+CONVERT(VARCHAR(50),@latitude)+',0.0)))
						* COS(RADIANS(ISNULL(latitude,0.0)))
						* COS(RADIANS(ISNULL(longitude,0.0)) - RADIANS(ISNULL('+CONVERT(VARCHAR(50),@longitude)+',0.0)))
						+ SIN(RADIANS(ISNULL('+CONVERT(VARCHAR(50),@latitude)+',0.0)))
						* SIN(RADIANS(ISNULL(latitude,0.0)))
						)
			,2)) ELSE 0 END  distanceInMiles
		
			,tj.[rank]
			INTO #temp
			FROM API_VIEW_GetAllJobsListActiveRecord JOBS
			INNER JOIN #tempMatchedJobs tj on JOBS.cjmJobId =  tj.cjm_job_id
			WHERE cjmStatus =''A'' AND  ISNULL(isHot,0) IN (0,1) 			
	
	 '
	SET @selectQuery=@selectQuery+ ' SELECT CAST(isHot AS VARCHAR(50)) isHot
								   , (CASE WHEN (isHot=1) THEN ''Hot Jobs'' ELSE ''Non-Hot Jobs'' END ) title
								   , (SELECT COUNT(isHot) WHERE isHot=#temp.isHOT) count  
								   FROM #temp WHERE '+ @where +'  GROUP BY  isHot ORDER BY isHot  DROP TABLE #temp DROP TABLE #tempMatchedJobs'

--Print selectQuery
PRINT(@selectQuery)

--Execute query
 EXEC (@selectQuery) 	 
END

/*
[API_S_uspJobs_GetJobTypeAndCount]
select  * from API_VIEW_GetAllJobsList where city ='Anaheim' ANd state='California'
select * from API_VIEW_GetAllJobsList
*/

/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_S_uspJobs_GetLocationAndCount]    Script Date: 2/8/2018 5:44:41 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

--SP_HELPTEXT API_S_uspJobs_GetLocationAndCount
----3959 miles 6371 for KM


/*
[API_S_uspJobs_GetLocationAndCount] '50','-74.006','40.7143'
----3959 miles 6371 for KM
*/
CREATE PROCEDURE [dbo].[API_S_uspJobs_GetLocationAndCount]  
( 
  @keyWords NVARCHAR(MAX)='',
  @latitude Float=0.0,
  @longitude Float=0.0,
  @where AS VARCHAR(MAX) =' 1=1'
)
AS
BEGIN
DECLARE @selectQuery AS VARCHAR(MAX)='';

SET @selectQuery=@selectQuery + ' Select * Into #tempMatchedJobs From (Select *  From [dbo].[API_FN_FullTextJobSearch]('''+@keyWords+''')) Alias '

SET @selectQuery=@selectQuery + '
		
			SELECT 
			cjmJobId
			,keywords
			,jobTitle
			,cityId
			,city	
			,state	
			,CASE  WHEN  (city ='''' AND state='''') THEN ''''
				   WHEN  (city !='''' AND state='''') THEN city
			       WHEN  (city ='''' AND state!='''') THEN state
				   ELSE  city +'', ''+state 
			 END location
			,latitude
			,longitude
			,isHot
			,projectTypeId
			,cjmAssessmentTypeKey
			,COUNT(cjmJobId) count		
			,CASE WHEN  ( ('+CONVERT(VARCHAR(50),@latitude)+' != 0 ) AND ('+CONVERT(VARCHAR(50),@longitude)+' != 0 )
				AND (CONVERT(VARCHAR(50),'+CONVERT(VARCHAR(50),@latitude)+') !=CONVERT(VARCHAR(50),latitude) ) AND (CONVERT(VARCHAR(50),'+CONVERT(VARCHAR(50),@longitude)+') != CONVERT(VARCHAR(50),longitude) )
				)    
			THEN  (
			ROUND(3959  
				* ACOS(
						COS(RADIANS(ISNULL('+CONVERT(VARCHAR(50),@latitude)+',0.0)))
						* COS(RADIANS(ISNULL(latitude,0.0)))
						* COS(RADIANS(ISNULL(longitude,0.0)) - RADIANS(ISNULL('+CONVERT(VARCHAR(50),@longitude)+',0.0)))
						+ SIN(RADIANS(ISNULL('+CONVERT(VARCHAR(50),@latitude)+',0.0)))
						* SIN(RADIANS(ISNULL(latitude,0.0)))
						)
			,2)) ELSE 0 END  distanceInMiles
			,tj.[rank]
			INTO #temp
			FROM API_VIEW_GetAllJobsListActiveRecord
			INNER JOIN #tempMatchedJobs tj on API_VIEW_GetAllJobsListActiveRecord.cjmJobId =  tj.cjm_job_id
			WHERE  cjmStatus =''A'' AND  city != '''' AND state != ''''  
			GROUP BY  city,latitude,longitude,cjmJobcity,state,keywords,jobTitle,isHot,projectTypeId,cjmAssessmentTypeKey,cjmJobId,tj.[rank],cityId
		
		
'
SET @selectQuery=@selectQuery+ ' SELECT TOP 15 location,latitude,longitude,sum(count) count  FROM #temp 

WHERE '+ @where +'  GROUP BY  location,latitude,longitude   ORDER BY count DESC   DROP TABLE #temp DROP TABLE #tempMatchedJobs'

--Print selectQuery
PRINT(@selectQuery)

--Execute query
 EXEC (@selectQuery) 	  
END

/*
[API_SP_Jobs_JobLocationAndCount]


EXEC API_S_uspJobs_GetLocationAndCount @keyWords ='Drupal Developer', @latitude= 0 ,@longitude= 0 ,@where= '  1=1 '
*/


GO

/****** Object:  StoredProcedure [dbo].[API_S_uspJobs_InsertApplyAndRefferJobs]    Script Date: 2/8/2018 5:44:43 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


/*
@RecruiterComments---NULL
@JR_STATUS_ID---Pending recruiter   review ---24
@Phone,@Email_Id-----applicant user details
@RelocationType-----No---0
@Rate----------- rate applicant user  else 0
@RateType----------- rate type applicant user else null
@OtherSubContractor------null
@IsVendor--0
@CandidateType---- get from client job master table (select CJM_Max_W2_Rate, CJM_Max_W1099_Rate, CJM_CTC from Client_Job_Master
			--CJM_Max_W2_Rate = 1
			--CJM_Max_W1099_Rate = 2
			--CJM_CTC = 3)

 @intEmployeeDetails_id-------logged-in employeeDetails_id
 @DataComeFrom-----------null
 @SubContractor----------null
 @Work_Status----------applicant auth status else null


 @Availability --------applicant availability else null
 @Total_Exp--------applicant Total_Exp else null
 @intResumeId--------applicant ResumeId
 @County--------applicant 
 @State--------applicant 
 @City--------applicant 
 @FirstName--------applicant 
 @LastName--------applicant 
 ,@SkillSummary------applicant skills from transaction table comma separeted
 ,@SourceId------------4414   self else in case of refer other 4417
 @SubmissionType---------------1
 @RequirementDetails--------null
 ,@EntityGroup---------------2321-----staffline
 ,@HotlistID---------------resume_master hotlistid
 ,@RecruiterId-----------------cjm 	EmployeeDetails_ID_Recruiter
 ,@SalesPersonId-----------------cjm EmployeeDetails_ID_Sales
 ,@LocationOther-------------------null
 ,@SkypeId-----------------------applicant resume master
 @activity-------------Contact referred by <b>+ referrer Firstname + ' ' + Referrer Last name + ' ' + (referrer email Id) + </b>
					 Job referred by <b>+ referrer Firstname + ' ' + Referrer Last name + ' ' + (referrer email Id) + </b>

  select top 100 * from resume_master order by 1 desc
 select top 100 * from JOB_RESUME order by TotalExperience desc
  select top 100 CJM_Max_W2_Rate,CJM_Max_W1099_Rate,CJM_CTC,* from CLIENT_JOB_MASTER
  where ISNULL(CJM_Max_W2_Rate,0)<0  or ISNULL(CJM_Max_W1099_Rate,0)<0 or ISNULL(CJM_CTC,0)<0
   order by 1 desc 

 -- In job apply logged in user and applicant are same
  */
CREATE PROCEDURE [dbo].[API_S_uspJobs_InsertApplyAndRefferJobs]
(
 @JobId INT,
 @ApplicantEmployeeDetailsId INT,
 @ApplicantResumeId INT,
 @loggedInEmployeeDetailsId INT,
 @CandidateDocId INT=NULL,
 @isJobReferral BIT =0, ---------------set value 1 in case of job reffer
 @source_id INT=NULL,
 @Entity_Group INT=NULL
)
AS
BEGIN
	DECLARE	@intMaxResume INT,
			@CandidateType INT,
			@RecruiterComments VARCHAR(250)=NULL,
			@JR_STATUS_ID INT=24, ---Pending recruiter review
			@RelocationType VARCHAR(20)=0, ----No
			@OtherSubContractor VARCHAR(255)= NULL,
			@IsVendor INT=0 ,
			@DataComeFrom INT=NULL,
			@SubContractor VARCHAR(50)= NULL,
			@SkillSummary VARCHAR(MAX)= NULL,
			@SourceId INT=4414,    --4414   self else in case of refer other 4417
			@SubmissionType INT=1,  -----Job Submission
			@RequirementDetails VARCHAR(255)= NULL,
			@EntityGroup INT =2323, -----staffline -pro
			@RecruiterId INT,
			@SalesPersonId INT,
			@LocationOther VARCHAR(50)=NULL,
			@ResumeSubmission_Id INT

	IF(@source_id IS NOT NULL)
	BEGIN
		SET @SourceId=@source_id
	END
	ELSE IF(@APPLICANTEMPLOYEEDETAILSID!=@LOGGEDINEMPLOYEEDETAILSID)
	BEGIN
		SET @SourceId=4417
	END

	IF(@Entity_Group IS NOT NULL)
	BEGIN 
		SET @EntityGroup = @Entity_Group
	END


	SELECT @intMaxResume = (ISNULL(MAX(JR_RESUME_ID),0)+1)  FROM JOB_RESUME WHERE CJM_JOB_ID = @JobId
	SELECT @RecruiterId = EmployeeDetails_ID_Recruiter  FROM CLIENT_JOB_MASTER WHERE CJM_JOB_ID = @JobId
	SELECT @SalesPersonId = EmployeeDetails_ID_Sales  FROM CLIENT_JOB_MASTER WHERE CJM_JOB_ID = @JobId
	SELECT @CandidateType = CASE 
							WHEN (ISNULL(CJM_Max_W2_Rate,0)>0) THEN 1 
							WHEN (ISNULL(CJM_Max_W1099_Rate,0)>0) THEN 2
							WHEN (ISNULL(CJM_CTC,0)>0) THEN 3
							ELSE 0
							END
							FROM CLIENT_JOB_MASTER WHERE CJM_JOB_ID = @JobId

	PRINT(@CandidateType)

	SELECT @SkillSummary=COALESCE(@SkillSummary + ', ', '') + SkillName FROM CandidateSkills WHERE EmployeeDetails_Id=@ApplicantEmployeeDetailsId ORDER BY CandidateSkill_Id
	PRINT(@SkillSummary)

	INSERT INTO JOB_RESUME 
		(
			  CJM_JOB_ID, JR_RESUME_ID, JR_UPDATED_ON, COMMENTS, JR_STATUS_ID, Phone
			, Email, Relocation, PayRate, RateType, SubContractor, IsVendor, Consult_Phone

			, Candidate_Type, EmployeeDetails_Id_PostedBy, DataComeFrom, Vm_Vendor_Id, Work_Status
			, Availability_Id, Total_Exp, CandidateResume_Id, Country_Id, State_Id, City_Id

			, First_Name, Last_Name, SkillSummary, Source_Id, SubmissionType, RequirementDetails
			, EntityGroup, HotlistID, RecruiterId, SalesPersonId, Location_Other, Skype
		)
        Select 
			  @JobId, @intMaxResume, GETDATE(), @RecruiterComments, @JR_STATUS_ID, ECD.Phone_Cell
			, RTRIM(LTRIM(RM.Email_Id)), ISNULL(Relocation,@RelocationType), CAST(Rate AS VARCHAR(10)), RateType, @OtherSubContractor, @IsVendor, ECD.Phone_Cell

			, @CandidateType, @loggedInEmployeeDetailsId, @DataComeFrom, @SubContractor, ED.LegalFilingStatus
			, (SELECT [dbo].API_FN_GetAvailabilityByAvailabilityId(RM.Availability)), ExpMaster.EM_DESC
			, @ApplicantResumeId, RM.Country_Id, RM.State_Id, RM.City_Id

			, RM.First_Name, RM.Last_Name, @SkillSummary, @SourceId, @SubmissionType, @RequirementDetails
			, @EntityGroup, RM.Hotlist_ID, @RecruiterId, @SalesPersonId, @LocationOther, RM.Skype

		FROM Resume_Master RM 
		LEFT JOIN EmployeeDetails ED ON RM.FromEmployeeDetails_Id=ED.EmployeeDetails_Id
		LEFT JOIN EmployeeContactDetails ECD ON RM.FromEmployeeDetails_Id=ECD.EmployeeDetails_Id
		LEFT JOIN Experience_Master ExpMaster on RM.Total_Exp = ExpMaster.EM_ID
		WHERE Resume_Id=@ApplicantResumeId
		     
             
		SELECT @ResumeSubmission_Id = SCOPE_IDENTITY()
		PRINT(@ResumeSubmission_Id)
 
		DECLARE @Activity AS VARCHAR(500) = NULL
		--SELECT @Activity = ' Resume Uploaded for Candidate : <b>' +  First_Name + ' ' + Last_Name + '</b>' FROM Resume_Master WHERE Resume_Id=@ApplicantResumeId
		SELECT @Activity = ' Job referred by : <b>' +  First_Name + ' ' + Last_Name +' ('+ Email_Id+ ') </b>' FROM Resume_Master WHERE FromEmployeeDetails_Id=@loggedInEmployeeDetailsId

		-- Resume Upload = 3
		INSERT INTO ATS_JobActivity (Client_JobId,JR_ResumeId,Candidate_Id,Activity_Log,Created_By,Created_On,DataComeFrom,Job_Resume_id)             
		VALUES (@JobId, @intMaxResume, @ApplicantResumeId, @Activity, @loggedInEmployeeDetailsId ,GETDATE(), 2,@ResumeSubmission_Id)
 
		-- To Update Job Search Status
		--4751 - Actively Looking
		UPDATE Resume_Master SET JobSearchStatus = 4751 WHERE Resume_Id = @ApplicantResumeId
 
		IF (@CandidateDocId >0)
		BEGIN
				INSERT INTO CandidateSubmittedDocs(ResumeSubmission_Id,Document_Id,Created_Date,Created_By)
				VALUES( @ResumeSubmission_Id, @CandidateDocId, GETDATE(), @loggedInEmployeeDetailsId) 
		END

		---set value 1 in case of job reffer 
		IF (@isJobReferral >0)
		BEGIN
				INSERT INTO JobReferral(EmployeeDetails_Id,Job_Id,Resume_Id,Job_Resume_Id,Created_Date,Created_By)
				VALUES( @loggedInEmployeeDetailsId, @JobId, @ApplicantResumeId,@ResumeSubmission_Id, GETDATE(), @loggedInEmployeeDetailsId) 

				UPDATE Resume_Master SET EmployeeReferreal_Id = @loggedInEmployeeDetailsId WHERE Resume_Id = @ApplicantResumeId
		END
END


/*
SELECT top 100 * FROM JOB_RESUME order by 1 desc



select * from app_ref_data where keyId=4414
select * from candidate_resumeAnddoc order by 1 desc
*/
GO

/****** Object:  StoredProcedure [dbo].[API_S_uspJobs_InsertJobsAlert]    Script Date: 2/8/2018 5:44:44 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_S_uspJobs_InsertJobsAlert]
@email VARCHAR(50)='',
@employeeDetailsId INT=0,
@searchName VARCHAR(1000)='',
@searchParameter NVARCHAR(MAX)='',
@searchParameterHashData NVARCHAR(MAX)=''
AS
BEGIN

	BEGIN TRANSACTION
		-- Get employeeDetailsId from Email 
		IF((@employeeDetailsId <=0) AND  (@email IS NOT NULL) AND (@email!=''))
		BEGIN
			--check email in resume_master
			IF EXISTS(SELECT Email_Id FROM Resume_Master WHERE Email_Id = @email)
			BEGIN
				-- email exists in resume_master and check FromEmployeeDetails_Id filed 
				IF ((SELECT  ISNULL(FromEmployeeDetails_Id,0) FROM Resume_Master WHERE Email_Id = @email)>0)
				BEGIN				
					SET @employeeDetailsId = (SELECT FromEmployeeDetails_Id FROM Resume_Master WHERE Email_Id = @email)
				END
				ELSE
				BEGIN				
					--insert record in EmployeeDetails from Resume_Master
					INSERT INTO EmployeeDetails
					   (First_Name,Last_Name,Email_Id,Employee_Type,emp_status,isAccountActivated,Created_Date)
					SELECT First_Name,Last_Name,Email_Id,1224,'I',	0 ,GETDATE() FROM Resume_Master WHERE Email_Id=@email
					SELECT @employeeDetailsId = SCOPE_IDENTITY()

					--update FromEmployeeDetails_Id column in Resume_Master
					UPDATE Resume_Master SET FromEmployeeDetails_Id=@employeeDetailsId , Modified_By=@employeeDetailsId ,Modified_On=GETDATE() WHERE Email_Id =@email 
				END
			END	
			-- email does not exist in 	resume_master
			ELSE
			BEGIN
				-- user registration in employeeDetails 	
				INSERT INTO EmployeeDetails(Email_Id,Employee_Type,emp_status,isAccountActivated,Created_Date)
				VALUES(@email,1224,'I',	0 ,GETDATE())---status in active and  In Activated account
				SELECT @employeeDetailsId = SCOPE_IDENTITY()

				--insert record in resume_Master
				INSERT INTO Resume_Master(Email_Id,FromEmployeeDetails_Id,Status,Created_On)
				VALUES(@email,@employeeDetailsId,1,GETDATE())
			END	
		END

		IF(@employeeDetailsId>0)
		BEGIN
			--get max alert count  of user
			IF((SELECT COUNT(*)  FROM JobSearchAlert WHERE Created_By = @employeeDetailsId AND isAlert=1) >=10)
			BEGIN
				SELECT 417 code , 'maxLength10' description
			END
			ELSE
			BEGIN
				--check duplicate record
				IF EXISTS(SELECT * FROM JobSearchAlert  WHERE Created_By = @employeeDetailsId AND isAlert=1 AND SearchParameter_HashData=@searchParameterHashData)
					SELECT 409 code , 'alreadyExists' description
				ELSE
				BEGIN
					-- insert record in JobSearchAlert
					INSERT INTO JobSearchAlert(SearchName,SearchParameter,SearchParameter_HashData,isAlert,Created_By,Created_Date)
					VALUES (@searchName,@searchParameter,@searchParameterHashData,1,@employeeDetailsId,GETDATE())

					--get all alert list
					SELECT 200 code , 'success' description
					--SELECT JobSearchAlert_Id jobSearchAlertId,SearchName searchName,SearchParameter searchParameter, Created_Date createdDate 
					--FROM JobSearchAlert 
					--WHERE Created_By=@employeeDetailsId AND isAlert=1 
					--ORDER BY Created_Date DESC
				END
			END
		END
		ELSE
		BEGIN
			SELECT 400 code , 'error' description
		END
	
		IF @@ERROR <> 0
		BEGIN
			SELECT 400 code , 'error' description
			ROLLBACK
			RETURN
		END
		COMMIT
END



--select * from EmployeeDetails order by 1 desc

GO

/****** Object:  StoredProcedure [dbo].[API_S_uspMessage_GetAllMessages]    Script Date: 2/8/2018 5:44:45 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_S_uspMessage_GetAllMessages] 
 @where NVARCHAR(MAX)
AS
BEGIN

DECLARE @SQLQuery AS NVARCHAR(MAX)
	SET @where =' WHERE  a.EmployeeDetails_Id= ' +@where	
	SET @SQLQuery =' SELECT a.Message_Id as messageId,
	a.ParentMessage_Id as parentMessageId,
	a.Subject as subject,
	CONCAT(d.First_Name ,'' '',d.Last_Name ) as senderName,
	LEFT(a.MessageBody,100) as messageBody,
	b.CJM_JOB_REFERENCE as jobCode,
	e.ProjectTitle as projectTitle,
	a.MessageType as messageTypeId,
	c.KeyName as messageType,
	a.TypeRef_Id as typeRefId,
	CAST(a.isRead as int) as isRead, 
	CAST(a.isFlag as int) as isFlag,
	CAST(a.isPriority as int) as isPriority,
	CAST(a.isArchive as int) as isArchive,
	a.created_Date as createdDate,
	b.CJM_JOB_TITLE AS jobTitle,
	b.CJM_CLIENT_NAME AS jobClientName
	,(SELECT count(*) from MessageCenter m where a.Message_Id = m.ParentMessage_Id) as replyCount
	--d.File_Name AS attachment,
	--d.Message_Id AS attachedDocId
	FROM MessageCenter a
	LEFT JOIN CLIENT_JOB_MASTER b ON a.TypeRef_Id = b.CJM_JOB_ID
	LEFT JOIN APP_REF_DATA c ON a.messageType = c.KeyId
	LEFT JOIN EmployeeDetails d ON a.EmployeeDetails_Id = d.EmployeeDetails_Id
	LEFT JOIN projectProfile e ON a.TypeRef_Id = e.ProjectId
	--LEFT JOIN MessageCenterDocument d on a.Message_Id = d.Message_Id
	
	 '+ @where +' ORDER BY a.Message_Id DESC'

	print @SQLQuery
	EXEC(@SQLQuery)
	
END

/*
[API_S_uspMessage_GetAllMessages] ' 17084  AND IsRead=0'

*/
GO

/****** Object:  StoredProcedure [dbo].[API_S_uspRegions_GetLocationsSuggestion]    Script Date: 2/8/2018 5:44:46 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

/*
[API_S_uspRegions_GetLocationsSuggestion] 'New'
*/

CREATE PROCEDURE [dbo].[API_S_uspRegions_GetLocationsSuggestion] 
(	
	@searchString AS NVARCHAR(MAX) =''
)
AS
BEGIN

WITH CTE AS
	(
		SELECT DISTINCT
			 City_Id cityId
			,CASE WHEN  (City_Name ='' AND State_Name='') THEN ''
				 WHEN  (City_Name !='' AND State_Name='') THEN City_Name
				 WHEN  (City_Name ='' AND State_Name!='') THEN State_Name
				 ELSE  City_Name +', '+State_Name 
				 END location 

		 FROM city_master CM
		 JOIN State_Master SM ON CM.State_Id=SM.State_IEU_Id
		 WHERE CM.Status=1 
	 )
	 SELECT TOP 15 * FROM CTE WHERE location LIKE '%'+@searchString+'%' 
	 ORDER BY Difference(location, @searchString) DESC
   
END

--select * from State_Master where State_Id =37
--select * from city_master where City_Id=86643
--Select City_Id, Location_State_Id,* from client_job_master where City_Id=86643



GO

/****** Object:  StoredProcedure [dbo].[API_S_uspSettings_GetMessageDetails]    Script Date: 2/8/2018 5:44:47 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[API_S_uspSettings_GetMessageDetails]
 @employeeDetailsId INT,
 @messageId INT
AS
BEGIN
	SELECT a.Message_Id as messageId,
	a.ParentMessage_Id as parentMessageId,
	CONCAT(d.First_Name ,' ',d.Last_Name ) as senderName,
	a.Subject as subject,
	a.MessageBody as messageBody,
	b.CJM_JOB_REFERENCE as jobCode,
	e.ProjectTitle as projectTitle,
	a.MessageType as messageTypeId,
	c.KeyName as messageType,
	a.TypeRef_Id as typeRefId,
	CAST(a.isRead as int) as isRead, 
	CAST(a.isFlag as int) as isFlag,
	CAST(a.isPriority as int) as isPriority,
	CAST(a.isArchive as int) as isArchive,
	a.created_Date as createdDate,
	b.CJM_JOB_TITLE AS jobTitle,
	b.CJM_CLIENT_NAME AS jobClientName
	--,(SELECT count(*) from MessageCenter m where a.Message_Id = m.ParentMessage_Id) as replyCount,
	--d.File_Name AS attachment,
	--d.Message_Id AS attachedDocId
	FROM MessageCenter a
	LEFT JOIN CLIENT_JOB_MASTER b ON a.TypeRef_Id = b.CJM_JOB_ID
	LEFT JOIN APP_REF_DATA c ON a.messageType = c.KeyId
	LEFT JOIN EmployeeDetails d ON a.EmployeeDetails_Id = d.EmployeeDetails_Id
	LEFT JOIN projectProfile e ON a.TypeRef_Id = e.ProjectId
	--LEFT JOIN MessageCenterDocument d on a.Message_Id = d.Message_Id
	WHERE a.Message_Id = @messageId AND a.EmployeeDetails_Id = @employeeDetailsId 
	
END
/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_AddImmigrationApplication]    Script Date: 2/8/2018 5:44:48 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_AddImmigrationApplication] 
 @EmployeeDetail_id INT
,@FIRST_NAME varchar(25)
,@LAST_NAME varchar(25)
,@APP_EMAIL varchar(50)
,@HOME_PHONE varchar(30)
,@APP_FOR_ID varchar(4)
,@APP_PRIORITY varchar(10)
,@APP_TYPE varchar(5)
,@CURRENT_STATUS varchar(10)
,@APP_COMMENT varchar(512)
,@SkillCategoryId int


AS
BEGIN
DECLARE @APPTYPEID	INT, @LEGALAPPID INT

--Insert in LegalRequest 
BEGIN TRANSACTION
	  INSERT INTO LegalRequest(
		 EmployeeDetail_id
		,FIRSTNAME
		,LASTNAME
		,APP_EMAIL
		,HOME_PHONE 
		,APP_FOR 
		,APP_PRIORITY 
		,APP_TYPE 
		,APP_STATUS
		,CURRENT_STATUS 
		,APP_COMMENT 
		,SkillCategoryId
		,Created_By
		,CreatedDate
		,Modified_By
		,ModifiedDate,
		CHECKLIST_REMINDER
	  )
	  VALUES(
		 @EmployeeDetail_id
		,@FIRST_NAME
		,@LAST_NAME	
		,@APP_EMAIL
		,@HOME_PHONE 
		,@APP_FOR_ID	
		,@APP_PRIORITY 
		,@APP_TYPE 
		,'10506' -- Pending
		,@CURRENT_STATUS 
		,@APP_COMMENT 
		,@SkillCategoryId
		,@EmployeeDetail_id
		,GETDATE()
		,@EmployeeDetail_id
		,GETDATE()
		,1
	  )

	SELECT @LEGALAPPID=SCOPE_IDENTITY()

IF @@ERROR <> 0
BEGIN
	ROLLBACK
	RETURN
END

--Select  APPTYPEID from LEGALAPPTYPE
SELECT @APPTYPEID = (SELECT APPTYPEID FROM LEGALAPPTYPE WHERE APPTYPECODE=@APP_TYPE)


IF EXISTS (SELECT * FROM LegalRequest WHERE LEGALAPPID = @LEGALAPPID)
BEGIN
SELECT @LEGALAPPID LEGALAPPID, @APPTYPEID APPTYPEID;
END
ELSE
BEGIN
	SELECT 0 LEGALAPPID,0 APPTYPEID ;
END

COMMIT

END


/*
EXEC API_SP_AddImmigrationApplication @EmployeeDetail_id=17084 ,@FIRST_NAME='Rahul',@LAST_NAME='Papnoi',@APP_EMAIL='rahulpapnoi08@gmail.com',@HOME_PHONE='9560764979',@APP_FOR_ID='1222',@APP_PRIORITY='3581',@APP_TYPE='H4DEP',@CURRENT_STATUS='3',@APP_COMMEN


T='aaaaaaaaa',@SkillCategoryId='2'
*/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_AddLegalDocuments]    Script Date: 2/8/2018 5:44:49 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_AddLegalDocuments] --1015 
 @CHECKLISTID  INT,
 @LEGALDOC_NAME VARCHAR(50),
 @LEGALDOC_FILEPATH VARCHAR(255),
 @LEGALDOC_FILENAME VARCHAR(255),
 @LEGALDOC_FILEEXT VARCHAR(5)

AS
BEGIN

DECLARE @LEGALDOCID INT,@LEGALAPPID  INT

SET @LEGALDOCID =((SELECT MAX(LEGALDOCID) FROM LEGALDOC)+1)-----  this is primarykey but not auto increment
SET @LEGALAPPID= (SELECT LEGALAPPID FROM VISACHECKLISTDETAILS WHERE CHECKLISTID=@CHECKLISTID)

--Print @LEGALDOCID
---update data in LEGALDOC table
INSERT INTO LEGALDOC 
(
  LEGALAPPID
 ,LEGALDOCID
 ,LEGALDOC_NAME
 ,LEGALDOC_FILEPATH
 ,LEGALDOC_FILENAME
 ,LEGALDOC_FILEEXT
 ,LEGALDOC_CREATEDATE
 ,LEGALDOC_SHOWTOCONSLT
 )
 VALUES
 (
  @LEGALAPPID
 ,@LEGALDOCID
 ,@LEGALDOC_NAME
 ,@LEGALDOC_FILEPATH
 ,@LEGALDOC_FILENAME
 ,@LEGALDOC_FILEEXT
 ,GETDATE()
 ,1
 )
END

--delete old document in LEGALDOC of same CHECKLISTID

DELETE FROM LEGALDOC WHERE LEGALDOCID=(SELECT LEGALDOCID FROM VISACHECKLISTDETAILS WHERE CHECKLISTID=@CHECKLISTID)

---update data in VISACHECKLISTDETAILS table

UPDATE VISACHECKLISTDETAILS
 SET LEGALDOCID=@LEGALDOCID
 WHERE CHECKLISTID=@CHECKLISTID


/*
select * from LEGALDOC
select * from VISACHECKLISTDETAILS


select * from LEGALAPPCHECKLIST
select * from legalrequest where LEGALAPPID=26048
select * from VisaCheckListDetails where LEGALAPPID=26048
select * from LEGALDOC  where LEGALAPPID=26048
*/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_Candidate_Active_Job_List]    Script Date: 2/8/2018 5:44:50 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_Candidate_Active_Job_List] 
@employeeDetailsId INT
AS
BEGIN
 
	SELECT cjm.CJM_JOB_ID AS cjmJobId, CJM_JOB_TITLE AS	cjmJobTitle, cjm.CJM_CLIENT_NAME AS cjmClientName, cjm.CJM_POSTING_DATE AS cjmPostingDate, JR.JR_STATUS_ID as jobStatusId, ism.STATUS_DESC as jobStatus
	FROM Resume_Master rm 
	JOIN Job_Resume JR ON JR.CandidateResume_Id = RM.Resume_Id
	JOIN CLIENT_JOB_MASTER cjm ON JR.CJM_JOB_ID = cjm.CJM_JOB_ID
	JOIN INTERVIEW_STATUS_MASTER ism ON JR.JR_STATUS_ID = ism.STATUS_ID
	WHERE rm.FromEmployeeDetails_Id = @employeeDetailsId AND JR.JR_STATUS_ID not in (4, 14, 16, 17, 24)

END


GO

/****** Object:  StoredProcedure [dbo].[API_SP_CheckOldPassword]    Script Date: 2/8/2018 5:44:51 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_CheckOldPassword] 
 @Login  varchar(50)
,@Password varchar(500)

AS
BEGIN
	SELECT * FROM EmployeeDetails 	
	WHERE (Email_Id=@Login AND Password=@Password) OR (EmployeeDetails_Id=@Login  AND Password=@Password)
END

GO

/****** Object:  StoredProcedure [dbo].[API_SP_CheckTimesheet]    Script Date: 2/8/2018 5:44:53 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[API_SP_CheckTimesheet]
 @employeeDetailsId INT,
 @projectId INT,
 @fromDate DATE,
 @toDate Date
AS
BEGIN
 
SELECT TSUpload_ID FROM 
Invoice_ClientTimeSheet WHERE EmployeeID = @employeeDetailsId 
AND ProjectID = @projectId 
AND  ( (@fromDate between CAST(TSFromDate as Date) AND CAST(TSToDate as Date) ) 
OR ((@toDate between CAST(TSFromDate as Date) AND CAST(TSToDate as Date) )))
ENd

/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_DeleteLegalDocuments]    Script Date: 2/8/2018 5:44:54 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_DeleteLegalDocuments] --1015 
 @CHECKLISTID  INT
AS
BEGIN

    DELETE FROM LEGALDOC 
	WHERE LEGALDOCID=(SELECT LEGALDOCID FROM VISACHECKLISTDETAILS WHERE CHECKLISTID=@CHECKLISTID)
	AND LEGALAPPID=(SELECT LEGALAPPID FROM VISACHECKLISTDETAILS WHERE CHECKLISTID=@CHECKLISTID)

	UPDATE VISACHECKLISTDETAILS SET LEGALDOCID=null
	WHERE CHECKLISTID=@CHECKLISTID


END

/*
select * from LEGALDOC
select * from VISACHECKLISTDETAILS
*/


GO

/****** Object:  StoredProcedure [dbo].[API_SP_GetAllApplicationDocListByLegalAppId]    Script Date: 2/8/2018 5:44:55 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_GetAllApplicationDocListByLegalAppId]
 @LEGALAPPID varchar(max)

AS
BEGIN
	--print  @LEGALAPPID;
	Declare @Ids varchar(max) Set @Ids =@LEGALAPPID--'24867'--
	SELECT vcl.CHECKLISTID checkListId
	--,Charindex(','+cast(vcl.LEGALAPPID as varchar(8000))+',', ',24873,')
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
	,(CASE WHEN (vcl.LEGALDOCID IS NOT NULL AND ld.LEGALDOC_SHOWTOCONSLT=1) THEN 'Uploaded' WHEN (vcl.LEGALDOCID IS NOT NULL AND ld.LEGALDOC_SHOWTOCONSLT=0) THEN 'Not Required'  ELSE 'Required' END) buttonLabel
	,(CASE WHEN (vcl.LEGALDOCID IS NOT NULL OR ld.LEGALDOC_SHOWTOCONSLT=0) THEN 'N' ELSE 'Y' END) buttonAction
	FROM VISACHECKLISTDETAILS vcl
	LEFT JOIN LEGALDOC ld on vcl.LEGALDOCID=ld.LEGALDOCID
	LEFT JOIN LEGALAPPCHECKLIST lacl on vcl.DOCUMENTID=lacl.DOCUMENTID
	LEFT JOIN LegalRequest lr on vcl.LEGALAPPID=lr.LEGALAPPID
	WHERE Charindex(','+cast(vcl.LEGALAPPID as varchar(8000))+',', @Ids) > 0 order by LEGALDOC_CREATEDATE DESC
END


GO

/****** Object:  StoredProcedure [dbo].[API_SP_GetAllTimeCardDocumentsByDateRange]    Script Date: 2/8/2018 5:44:56 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_GetAllTimeCardDocumentsByDateRange] --1112,2017
@EmployeeDetails_Id INT,
@StartDate DATETIME,
@EndDate DATETIME
AS
BEGIN

	SELECT DISTINCT TotalTimeSheetHrs AS totalTimeSheetHrs
	,UploadedTimeSheet_Id AS uploadedTimeSheetId
	,UploadedTimesheetName AS uploadedTimesheetName
	,UploadedTimeSheetLocation AS uploadedTimeSheetLocation
	,TSFromDate AS tsFromDate
	,TSToDate AS tsToDate
	,TotalTimeSheetHrs AS totalTimeSheetHrs
	,IUCT.Created_Date AS createdDate
	,DTL.ProjectDetail_Id AS projectId
	,DTL.Project_Description AS projectTitle
	,IUCT.UploadedTimesheetName as fileName
	,IUCT.UploadedTimeSheetLocation as filePath
	FROM Invoice_ClientTimeSheet ICT
	JOIN Invoice_UploadedClientTimeSheets IUCT on ICT.TSUpload_ID =IUCT.TSUpload_Id
	LEFT JOIN ProjectDetails DTL on ICT.ProjectID = DTL.ProjectDetail_Id
	--LEFT JOIN ProjectProfile PP on DTL.Project_Id = PP.Assignmentid
	WHERE EmployeeID=@EmployeeDetails_Id 	
	 AND CAST(TSFromDate AS DATE)>= CAST(@StartDate AS DATE) 
	 AND CAST(TSToDate AS DATE) <= CAST(@EndDate AS DATE)
	
END

/*
Select * from [dbo].[Invoice_UploadedClientTimeSheets]
select * from Invoice_ClientTimeSheet
update Invoice_ClientTimeSheet set EmployeeID=1112
*/


GO

/****** Object:  StoredProcedure [dbo].[API_SP_GetAllTimeCardListByEmployeeId]    Script Date: 2/8/2018 5:44:57 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_GetAllTimeCardListByEmployeeId] 
@EmployeeDetails_Id INT,
@where NVARCHAR(MAX)

AS
BEGIN
	DECLARE @SQLQuery AS NVARCHAR(MAX)
	SET @SQLQuery ='
		SELECT DISTINCT 	
		YEAR( PW.we_date) year
		--,MONTH( PW.we_date) month
		,CONCAT( YEAR(PW.we_date), ''-'', MONTH(PW.we_date)) as dt
		,(Convert(char(3), PW.we_date, 0))+char(39)+ CAST((YEAR(PW.we_date) % 100) as CHAR(2)) monthYear	
		,FORMAT(PW.we_date,''yyyy-MM-dd'') weekEndingDate
		,TED.TSEntery_ID tsEntryId
		,ISNULL(TES.TotalHrs,0) totalHours
		,CONCAT(Ed.First_Name, '' '', ED.Last_Name) AS uploadedBy
		,(SELECT [dbo].API_FN_GetTimecardStatusByTsEntryIdAndEmployeeId('+ (CAST(@EmployeeDetails_Id AS varchar(150)))+',TES.TSEntery_ID))  AS statusIdStatus
		,PD.ProjectDetail_Id AS projectId 
		,PD.End_Date, PD.Start_Date
		FROM PJWEEK PW
		LEFT JOIN Invoice_TimesheetEntrySummary TES on CAST(TES.WeekEnd_Date AS DATE) = CAST(PW.we_date AS DATE) AND  TES.EmployeeID = '+ (CAST(@EmployeeDetails_Id AS varchar(150)))+'
		LEFT JOIN Invoice_TimeSheetEntryDetails TED on TED.TSEntery_ID = TES.TSEntery_ID
		LEFT JOIN ProjectDetails PD on TED.ProjectID = PD.ProjectDetail_Id
		LEFT JOIN employeeDetails ED on TES.Created_By = ED.EmployeeDetails_Id
		WHERE ' + @where +' AND (PD.End_Date is null OR PD.End_Date > GETDATE()) 
		AND PW.we_date < GETDATE()
		ORDER BY weekEndingDate DESC'
		--(TES.EmployeeID=@EmployeeDetails_Id OR TES.EmployeeID IS NULL)
		--AND Year(PW.we_date)=@Year


	print @SQLQuery
	EXEC(@SQLQuery)
	
END

/*
Select Convert(char(3), GetDate(), 0)+char(39)+ CAST((YEAR(GETDATE()) % 100) as CHAR(2))
Select( YEAR( GETDATE() ) % 100 ) + 1
select DISTINCT * from Invoice_TimeSheetEntryDetails where (CAST(EntryDate as date) BETWEEN CAST('2016-05-01' as date) AND CAST('2016-05-13'  as date))
select * from Invoice_TimesheetEntrySummary where TSEntery_ID in(1,2,3)
select * from APP_REF_DATA where ParentID=3300
Select * from [Invoice_TimesheetEntryDetails] where TSEntery_ID=2
Select top 2 * from [dbo].[Invoice_TimesheetEntrySummary] where WeekEnd_Date='2016-05-08 00:00:00.000'
Select distinct  From_Date,To_Date,WeekEnd_Date,Year,Month,WeekOfYear from Payroll_master where Year =2016 and Month=5 and Pay_Frequency_Id=1001
select * from PJWEEK  where Year(we_date)=2017 and Month(we_date)=7
select * from Payroll_master  where Year =2017 and Month=7 
Select * from [Invoice_ClientTimeSheet]
Select * from [dbo].[Invoice_UploadedClientTimeSheets]
dbo].[API_SP_GetAllTimeCardListByEmployeeId] 1112,2016

SELECT we_date,  DATEADD(DAY, 1 - DATEPART(WEEKDAY, we_date), CAST(we_date AS DATE)) [WeekStart],
        DATEADD(DAY, 7 - DATEPART(WEEKDAY, we_date), CAST(we_date AS DATE)) [WeekEnd]
		from PJWEEK where Year(we_date)=2017 and Month(we_date)=7

*/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_GetAllTimeCardWeekEndingDatesByDateRange]    Script Date: 2/8/2018 5:44:58 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_GetAllTimeCardWeekEndingDatesByDateRange] --1112,2017
@StartDate DATETIME,
@EndDate DATETIME
AS
BEGIN
SELECT DISTINCT 
we_date
FROM PJWEEK
WHERE  CAST(we_date AS DATE) BETWEEN CAST(@StartDate AS DATE) AND  CAST(@EndDate AS DATE)

END

/*
Select * from [dbo].[Invoice_UploadedClientTimeSheets]
select * from Invoice_ClientTimeSheet
update Invoice_ClientTimeSheet set EmployeeID=1112
*/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_GetApplicationDocListByLegalAppId]    Script Date: 2/8/2018 5:44:59 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_GetApplicationDocListByLegalAppId]
 @LEGALAPPID INT,
 @EmployeeDetail_Id INT

AS
BEGIN
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
	,(CASE WHEN (vcl.LEGALDOCID IS NOT NULL AND ld.LEGALDOC_SHOWTOCONSLT=1) THEN 'Uploaded' WHEN (vcl.LEGALDOCID IS NOT NULL AND ld.LEGALDOC_SHOWTOCONSLT=0) THEN 'Not Required'  ELSE 'Required' END) buttonLabel
	,(CASE WHEN (vcl.LEGALDOCID IS NOT NULL OR ld.LEGALDOC_SHOWTOCONSLT=0) THEN 'N' ELSE 'Y' END) buttonAction
	FROM VISACHECKLISTDETAILS vcl
	LEFT JOIN LEGALDOC ld on vcl.LEGALDOCID=ld.LEGALDOCID
	LEFT JOIN LEGALAPPCHECKLIST lacl on vcl.DOCUMENTID=lacl.DOCUMENTID
	LEFT JOIN LegalRequest lr on vcl.LEGALAPPID=lr.LEGALAPPID
	WHERE vcl.LEGALAPPID=@LEGALAPPID AND lr.EmployeeDetail_id=@EmployeeDetail_Id order by legalDocCreatedDate DESC
END

/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_GetCandidateAchievementByEmployeeDetId]    Script Date: 2/8/2018 5:45:00 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_GetCandidateAchievementByEmployeeDetId] 
 @EmployeeDetails_Id  int

AS
BEGIN
	SELECT CA.CandidateAchievement_Id AS candidateAchievementId
	,CA.Description AS description
    FROM CandidateAchievement CA 
    JOIN Resume_Master RM ON RM.Resume_Id = CA.Resume_Id	
    WHERE RM.FromEmployeeDetails_Id = @EmployeeDetails_Id
END

/*
 select top 5 * from CandidateAchievement
*/

/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_GetCertificationByEmployeeDetId]    Script Date: 2/8/2018 5:45:01 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_GetCertificationByEmployeeDetId] 
 @EmployeeDetails_Id  int

AS
BEGIN
	SELECT 
	ec.EmpCertificationDetails_Id empCertificationDetailsId
	,ec.CertificateExam_Name certificateExamName
	--,Institution_Name issuedBy
	--,ExpiryRenewal_Date expiryRenewalDate 
	FROM EmployeeCertificationDetails ec
	LEFT JOIN Resume_Master rm on rm.Resume_Id = ec.Resume_Id
    WHERE rm.FromEmployeeDetails_Id=@EmployeeDetails_Id
END

/******===========================================================================================================================================================******/

--API_SP_GetCertificationByEmployeeDetId 57971

GO

/****** Object:  StoredProcedure [dbo].[API_SP_GetClientApprovedTimeCardList]    Script Date: 2/8/2018 5:45:02 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_GetClientApprovedTimeCardList] 
@where NVARCHAR(MAX)

AS
BEGIN
	DECLARE @SQLQuery AS NVARCHAR(MAX)
	SET @SQLQuery ='
		SELECT DISTINCT
			ICT.TSFromDate
			,CONCAT( YEAR(ICT.TSFromDate), ''-'', MONTH(ICT.TSFromDate)) as dt
			,FORMAT(ICT.TSFromDate, ''yyyy-MM-dd'') as startDate
			,FORMAT(ICT.TSToDate, ''yyyy-MM-dd'') as endDate
			,ICT.TotalTimeSheetHrs as totalHours
			,CONCAT(ED.First_Name, '' '', ED.Last_Name) as uploadedBy
			,ICT.ApproveStatus as status
			FROM Invoice_ClientTimeSheet ICT
			LEFT JOIN EmployeeDetails ED ON ICT.EmployeeID = ED.EmployeeDetails_Id			
			WHERE ' + @where +'
			ORDER BY ICT.TSFromDate DESC'
		

	print @SQLQuery
	EXEC(@SQLQuery)
	
END
GO

/****** Object:  StoredProcedure [dbo].[API_SP_GetDocumentByWeekDay]    Script Date: 2/8/2018 5:45:04 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_GetDocumentByWeekDay] 
 @EmployeeDetails_Id  int,
 @weekDate  date

AS
BEGIN
	SELECT DISTINCT TotalTimeSheetHrs AS totalTimeSheetHrs
    ,UploadedTimeSheet_Id AS uploadedTimeSheetId
    ,UploadedTimesheetName AS uploadedTimesheetName
    ,UploadedTimeSheetLocation AS uploadedTimeSheetLocation
    ,TSFromDate AS tsFromDate
    ,TSToDate AS tsToDate
    ,TotalTimeSheetHrs AS totalTimeSheetHrs
    ,IUCT.Created_Date AS createdDate
    ,ICT.TSUpload_ID AS tsUploadId
    ,PP.ProjectTitle AS projectTitle
	,DTL.ProjectDetail_Id AS projectId
    FROM Invoice_ClientTimeSheet ICT
    JOIN Invoice_UploadedClientTimeSheets IUCT on ICT.TSUpload_ID =IUCT.TSUpload_Id
    JOIN ProjectDetails DTL on ICT.ProjectID = DTL.ProjectDetail_Id
    LEFT JOIN ProjectProfile PP on DTL.Project_Id = PP.Assignmentid
    WHERE ICT.EmployeeID = @EmployeeDetails_Id
    AND @weekDate between cast(ICT.TSFromDate as date) and cast(ICT.TSToDate as date)    
END

/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_GetDocumentListByApplicationType]    Script Date: 2/8/2018 5:45:05 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


--API_SP_GetDocumentListByApplicationType 10

CREATE PROCEDURE [dbo].[API_SP_GetDocumentListByApplicationType] --1015
 @AppTYpeId  INT

AS
BEGIN

SELECT DOCUMENTID documentId
      ,APPTYPEID appTypeId
	  ,DOCUMENTNAME documentName 
	  FROM LEGALAPPCHECKLIST
      WHERE APPTYPEID=@AppTYpeId AND STATUS=1 order by DOCUMENTID DESC

END

/******===========================================================================================================================================================******/
select * from legalrequest where LEGALAPPID=26047
select * from LEGALAPPCHECKLIST
select * from VisaCheckListDetails where LEGALAPPID=26047
select * from LEGALDOC  where LEGALAPPID=26047
GO

/****** Object:  StoredProcedure [dbo].[API_SP_GetDocumentsByEmployeeDetId]    Script Date: 2/8/2018 5:45:06 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_GetDocumentsByEmployeeDetId] 
 @EmployeeDetails_Id  int

AS
BEGIN
	SELECT 
	crd.CandidateDoc_Id candidateDocId
	,crd.Resume_File filePath
	,crd.File_name fileName
	,crd.Created_Date uploadedDate
	FROM Candidate_ResumeAndDoc crd
	LEFT JOIN Resume_Master rm on crd.Resume_Id=rm.Resume_Id
	LEFT JOIN EmployeeDetails ed on rm.FromEmployeeDetails_Id=ed.EmployeeDetails_Id
    WHERE ed.EmployeeDetails_Id=@EmployeeDetails_Id
END




/*
select * from Candidate_ResumeAndDoc
*/

/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_GetEducationDetailsByEmployeeDetId]    Script Date: 2/8/2018 5:45:07 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_GetEducationDetailsByEmployeeDetId] 
 @EmployeeDetails_Id  int

AS
BEGIN
	/*SELECT EmployeeEducation_Id employeeEducationId
	,Qualification qualificationId
	,data.KeyName qualification
	,Institution_Name institutionName
	,PassingYear passingYear
	FROM EmployeeEducationDetails eed
	LEFT JOIN APP_REF_DATA data on eed.Qualification=data.KeyID
	LEFT JOIN Country_Master cou on eed.Country_Id=cou.Country_Id
    WHERE EmployeeDetails_Id=@EmployeeDetails_Id*/

	SELECT Auto_Id employeeEducationId
	,DegreeName qualification	
	,SchoolName institutionName
	,DATEPART(year,DegreeEndDate) passingYear
	--,CAST(DegreeEndDate as DATE) passingYear
	--,convert(datetime, DegreeEndDate, 102) passingYear
	FROM ResumeEducationDataType eed
	LEFT JOIN Resume_Master rm on eed.Resume_Id = rm.Resume_id
	--LEFT JOIN EmployeeDetails ed on ed.EmployeeDetails_Id = rm.FromEmployeeDetails_Id
    WHERE rm.FromEmployeeDetails_Id=@EmployeeDetails_Id

END


/*
select * from EmployeeEducationDetails

*/
/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_GetEmailTemplateByEventName]    Script Date: 2/8/2018 5:45:08 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_GetEmailTemplateByEventName] 
 @EventName  varchar(256)
AS
BEGIN
	SELECT * FROM EmailTemplate 	
	WHERE (EventName=@EventName AND Status=1)
END

/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_GetEmployeeBenefit]    Script Date: 2/8/2018 5:45:09 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_GetEmployeeBenefit] 
 @EmployeeDetails_Id  INT
AS
BEGIN
 SELECT 
 bed.Benefit_Employee_Id
 ,bed.Benefit_Id
 ,bm.Benefit_Name 
 ,bm.Description
 ,bm.Provider_Name
 ,bm.Provider_Address
 ,bm.Start_Date
 ,bm.End_Date
 ,bm.Benefit_Contains
 ,bm.BenefitOrder
 FROM Benefit_Employee_Details bed
 JOIN Benefit_Master bm on bed.Benefit_Id=bm.Benefit_Id
 WHERE bed.EmployeeDetails_Id=@EmployeeDetails_Id
 AND bm.Status=1
ENd


/*
select * from Benefit_Employee_Details
select * from Benefit_Master
*/

/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_GetEmployeeProjects]    Script Date: 2/8/2018 5:45:10 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_GetEmployeeProjects]
 @EmployeeDetailsId  INT,
 @IsCurrentProject BIT=0
 
AS
BEGIN

IF(@IsCurrentProject =1)
BEGIN
 SELECT DISTINCT pd.ProjectDetail_Id projectDetailId
  ,pd.Project_Id projectId
  ,pd.Project_Description projectName  
  ,pd.Start_Date startDate
  ,pd.End_Date endDate
  ,CUS.Name clientName
  ,pd.Modified_Date modifiedDate
  ,pp.ProjectDuration projectDuration 
  ,pp.ProjectDescription projectDescription 
  ,pp.Technology  technologyId
  ,ST.Technology_Name technology
  ,pp.Role roleId
  ,SR.Skill_Role_Name role
  ,pp.ManagerName managerName
  ,pp.ManagerTitle managerTitle
  ,pp.ManagerEmail managerEmail
  ,pp.ManagerOffPhone managerOffPhone
  ,pp.SpecialComments  specialComments
  , (	SELECT PR.PayRate
		FROM ProjectDetails PDet
		INNER JOIN (SELECT ProjectRate_ID, ProjectDetail_Id, PayRate, ROW_NUMBER() OVER(PARTITION BY ProjectDetail_Id ORDER BY StartDate DESC) AS RowNum FROM ProjectRate ) PR ON PR.ProjectDetail_Id = PDet.ProjectDetail_Id AND PR.RowNum = 1
		WHERE PDet.ProjectDetail_Id=pd.ProjectDetail_Id AND Employee_Id = @EmployeeDetailsId   
		) payRate
  ,Project_Status projectStatusId
  ,APP.KeyName projectStatus
 FROM  ProjectDetails pd
 INNER JOIN Customer CUS on CUS.CustId = pd.Customer_Id
 LEFT JOIN ProjectProfile pp on pd.Project_Id = pp.Assignmentid
 LEFT JOIN Skill_Role SR on pp.Role = SR.Skill_Role_Id
 LEFT JOIN Skill_Technology ST on pp.Technology = ST.Technology_Id
 INNER JOIN APP_REF_DATA APP on pd.Project_Status = APP.KeyId
 WHERE pd.Employee_Id=@EmployeeDetailsId AND 
 ISNULL(pd.End_Date, '12/12/9999') >= getdate()
 ORDER BY pd.Start_Date DESC
 END
 ELSE
 BEGIN
  SELECT DISTINCT pd.ProjectDetail_Id projectDetailId
  ,pd.Project_Id projectId
  ,pd.Project_Description projectName  
  ,pd.Start_Date startDate
  ,pd.End_Date endDate
  ,CUS.Name clientName
  ,pd.Modified_Date modifiedDate
  --,pp.ProjectDuration projectDuration 
  --,pp.ProjectDescription projectDescription 
  --,pp.Technology  technologyId
  --,ST.Technology_Name technology
  --,pp.Role roleId
  --,SR.Skill_Role_Name role
  --,pp.ManagerName managerName
  --,pp.ManagerTitle managerTitle
  --,pp.ManagerEmail managerEmail
  --,pp.ManagerOffPhone managerOffPhone
  --,pp.SpecialComments  specialComments
  --, (	SELECT PR.PayRate
		--FROM ProjectDetails PDet
		--INNER JOIN (SELECT ProjectRate_ID, ProjectDetail_Id, PayRate, ROW_NUMBER() OVER(PARTITION BY ProjectDetail_Id ORDER BY StartDate DESC) AS RowNum FROM ProjectRate ) PR ON PR.ProjectDetail_Id = PDet.ProjectDetail_Id AND PR.RowNum = 1
		--WHERE PDet.ProjectDetail_Id=pd.ProjectDetail_Id AND Employee_Id = @EmployeeDetailsId   
		--) payRate
  --,Project_Status projectStatusId
  --,APP.KeyName projectStatus
 FROM  ProjectDetails pd
 INNER JOIN Customer CUS on CUS.CustId = pd.Customer_Id
 LEFT JOIN ProjectProfile pp on pd.Project_Id = pp.Assignmentid
 LEFT JOIN Skill_Role SR on pp.Role = SR.Skill_Role_Id
 LEFT JOIN Skill_Technology ST on pp.Technology = ST.Technology_Id
 INNER JOIN APP_REF_DATA APP on pd.Project_Status = APP.KeyId
 WHERE pd.Employee_Id=@EmployeeDetailsId AND 
 isNull(PD.End_Date, '12/12/9999') < getdate()  
 ORDER BY pd.Start_Date DESC
 END
END

/*
select  * from ProjectDetails
select * from ProjectProfile
select * from ProjectRate

select * from APP_REF_DATA where ParentID=900

select * from APP_REF_DATA where keyname like'%Developer%'

select PR.*, PD.Project_Id 
from ProjectDetails PD
inner join (select ProjectRate_ID, ProjectDetail_Id, PayRate, row_number() over(partition by ProjectDetail_Id order by StartDate desc) as RowNum from ProjectRate ) PR on PR.ProjectDetail_Id = PD.ProjectDetail_Id and PR.RowNum = 1
where Employee_Id = EmployeeDetails.EmployeeDetails_Id
[API_SP_GetEmployeeProjects] 17084 ,0
select * from Skill_Technology
select * from Skill_Role

*/

/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_GetEmployeeProjectsWithDate]    Script Date: 2/8/2018 5:45:11 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_GetEmployeeProjectsWithDate]
 @EmployeeDetailsId  INT,
 @startDate DATE,
 @endDate DATE
AS

BEGIN
 SELECT DISTINCT pd.ProjectDetail_Id projectDetailId
  ,pd.Project_Id projectId
  ,pd.Project_Description projectName  
  ,pd.Start_Date startDate
  ,pd.End_Date endDate
  --,CUS.Name clientName
  ,pd.Modified_Date modifiedDate
  
 FROM  ProjectDetails pd
 --INNER JOIN Customer CUS on CUS.CustId = pd.Customer_Id
 --INNER JOIN APP_REF_DATA APP on pd.Project_Status = APP.KeyId
 WHERE pd.Employee_Id=@EmployeeDetailsId 
 --AND ISNULL(pd.End_Date, '12/12/9999') >= getdate()
 AND (pd.End_Date is null OR (pd.End_Date BETWEEN @startDate AND @endDate))
 AND (pd.Start_Date <= @endDate)
 ORDER BY pd.Start_Date DESC

 
END


/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_GetEmployeeResumeDocumentsByEmployeeDetId]    Script Date: 2/8/2018 5:45:12 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_GetEmployeeResumeDocumentsByEmployeeDetId] 
 @EmployeeDetails_Id  int

AS
BEGIN
	SELECT 
	crd.CandidateDoc_Id candidateDocId
	,crd.Resume_File filePath
	,crd.File_name fileName
	,crd.Doc_Type as docType
	,crd.Created_Date uploadedDate
	FROM Candidate_ResumeAndDoc crd
	 JOIN Resume_Master rm on crd.Resume_Id=rm.Resume_Id
	 JOIN EmployeeDetails ed on rm.FromEmployeeDetails_Id=ed.EmployeeDetails_Id
    WHERE ed.EmployeeDetails_Id=@EmployeeDetails_Id
	ORDER BY IsPrimary DESC
END




/*
select * from Candidate_ResumeAndDoc
*/

/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_GetExpenseList]    Script Date: 2/8/2018 5:45:14 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_GetExpenseList] --17084
 @EmployeeDetails_Id  int

AS
BEGIN
	SELECT IEE.ProjectDetail_Id AS projectDetailId,
	PP.ProjectTitle projectTitle,
	PD.Project_Description AS projectDescription,
	IEE.ExpenseAmount AS expenseAmount,
	IEE.ExpenseFromDate AS expenseFromDate,
	IEE.ExpenseToDate AS expenseToDate,
	IEE.BillTo AS billableToClient,
	IEE.ExpenseDescription AS expenseDescription,
	ARD.KeyName AS status,
	IEE.ApprovedReason AS approvedReason,
	--IEE.DocumentExpenseLocation AS documentExpenseLocation,
	IEE.DocumentExpenseName AS documentExpenseName,
	IEE.OriginalFileName AS originalFileName,
	IEE.DocumentExpenseLocation+IEE.DocumentExpenseName AS documentExpenseFileLocation,
	IEE.DocumentExpenseLocation documentExpenseLocation,
	IEE.Created_Date createdDate
    FROM Invoice_ExpenseEntry IEE 
    LEFT JOIN ProjectDetails PD ON IEE.ProjectDetail_Id = PD.ProjectDetail_Id	
	LEFT JOIN ProjectProfile PP ON PP.Assignmentid = PD.Project_Id	
	LEFT JOIN APP_REF_DATA ARD ON IEE.Status = ARD.KeyID
    WHERE IEE.EmployeeDetails_Id = @EmployeeDetails_Id
	ORDER BY IEE.Created_Date DESC
END

/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_GetExperienceByEmployeeDetId]    Script Date: 2/8/2018 5:45:15 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_GetExperienceByEmployeeDetId] 
 @EmployeeDetails_Id  int

AS
BEGIN
	SELECT 
	 CEE.CandidateEmploymentExperience_Id candidateEmploymentExperienceId
	,CEE.Position_Title as positionTitle
	,CEE.Employer_Name as employerName
	,CEE.PositionResponsibilities as positionResponsibilities
	,FORMAT(CEE.Position_StartDate, 'yyyy-MM-dd') as positionStartDate
	,FORMAT(CEE.Position_EndDate, 'yyyy-MM-dd') as positionEndDate
	,CEE.CityId as cityId
	,CM.City_Name as cityName

	,CEE.StateId as stateId
	,SM.State_Name as stateName
	,SM.State_IEU_Id as state_Id

	,CEE.City_Other as otherCity
	,CTR.Country_Name as countryName
	,CEE.CountryId as countryId
    FROM CandidateEmploymentExperience CEE 
    JOIN Resume_Master RM on RM.Resume_Id = CEE.Resume_Id
	LEFT JOIN City_Master CM on CM.City_Id = CEE.CityId
	LEFT JOIN State_Master SM on SM.State_ID = CEE.StateId
	LEFT JOIN Country_Master CTR on CTR.Country_Id = CEE.CountryId
    WHERE RM.FromEmployeeDetails_Id = @EmployeeDetails_Id
END



/*
select top 5 * from CandidateEmploymentExperience
select top 5 * from State_Master
*/


/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_GetFormsList]    Script Date: 2/8/2018 5:45:16 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_GetFormsList] 
 @Dept_Name  VARCHAR(10),
 @Employee VARCHAR(10)
AS
BEGIN
 SELECT 
 FAT.FormID,
 FAT.FormName,
 FAT.Description,
 FAT.Dept_Code,
 FAT.UpdateDate,
 FAT.FormSize,
 FAT.Type,
 DEP.Dept_Name,
 DEP.Dept_Email,
 DEP.Employee,
 (CAST(FAT.FormId AS VARCHAR(500)) + '.' + FAT.FormName) AS FileName
 FROM FormsAndTemplates FAT
 INNER JOIN Department DEP ON FAT.Dept_Code = DEP.Dept_Code
 WHERE FAT.type = '9101'------Forms/Templates
 AND DEP.Dept_Name = @Dept_Name
 ORDER BY FAT.Description
ENd


/*
select * from employeeOtp where employeeDetails_id=21540
delete from employeeOtp where employeeDetails_id=21540
update employeeOtp set isactive=1 where employeeDetails_id=21540

select * from app_ref_data where parentId=9100
*/

/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_GetImmigrationApplications]    Script Date: 2/8/2018 5:45:17 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_GetImmigrationApplications] --17084
 @EmployeeDetails_Id  int

AS
BEGIN
	SELECT	
	 FIRSTNAME as firstName	
	,LASTNAME as lastName
	,rec.First_Name recruiterFirstName
	,rec.Last_Name recruiterLastName
	,leg.First_Name legRepFirstName
	,leg.Last_Name legRepLastName
	,LEGALAPPID as legalAppId
    ,APPLICANTID applicationId 
	,lr.APP_FOR appForId    
	,APPForData.KeyName appFor	
	,LEGALAPPTYPE.APPTYPEID appTypeId
    ,APP_TYPE appType 
	,LEGALAPPTYPE.APPTYPENAME appTypeName
	,APP_PRIORITY appPriorityId 
	,AppPri.KeyName appPriority    	
  --  ,(
		-- CASE APP_STATUS
		-- WHEN 'APPRD' THEN 'Application Approved'
		-- WHEN 'CLSD' THEN 'Application Closed/Not Filed'
		-- WHEN 'FILED' THEN 'Application Filed'
		-- WHEN 'ATTR' THEN 'Attorney Review'
		-- WHEN 'CMPLT' THEN 'Completed'
		-- WHEN 'EAC' THEN 'Receipt(EAC) received'
		-- ELSE 'Pending'-------PENDG
		-- END
	 --) appStatus
	 , ARD1.KeyName appStatus
     ,CURRENT_STATUS currentStatus 
     ,APP_EACNUM eacNumber 
     ,APP_COMMENT comments 
     ,APP_EMAIL email 
     ,HOME_PHONE contactNumber 
     ,EmployeeDetail_id employeeDetailsId 
     ,SkillCategoryId skillCategoryId 
	 ,skillCat.HL_CATEGORY_DESC skillCategory	
	 ,IIF(lr.ModifiedDate IS NULL,lr.CreatedDate,lr.ModifiedDate) modifiedDate
	FROM LegalRequest lr
	LEFT JOIN EmployeeDetails ed on lr.EmployeeDetail_id=ed.EmployeeDetails_Id	
	LEFT JOIN EmployeeDetails rec on ed.Recruiter=rec.EmployeeDetails_Id
	LEFT JOIN HOTLIST_CATEGORY skillCat on skillCat.HL_CATEGORY_ID=lr.SkillCategoryId
	LEFT JOIN EmployeeDetails leg on ed.LegalRepresentative=leg.EmployeeDetails_Id
	LEFT JOIN LEGALAPPTYPE  on lr.APP_TYPE=LEGALAPPTYPE.APPTYPECODE
	LEFT JOIN APP_REF_DATA AppPri on ( CAST(lr.APP_PRIORITY AS VARCHAR(50))=CAST(AppPri.KeyID AS VARCHAR(50)) AND AppPri.ParentID=3580 )
	LEFT JOIN APP_REF_DATA APPForData on ( CAST(lr.APP_FOR AS VARCHAR(50))=CAST(APPForData.KeyID AS VARCHAR(50)) AND APPForData.ParentID=3550 )
	Left JOIN APP_REF_DATA ARD1 on ARD1.KeyID = Lr.APP_STATUS
    WHERE lr.EmployeeDetail_id=@EmployeeDetails_Id order by LEGALAPPID DESC
END


/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_GetImmigrationApplicationsByLegalAppId]    Script Date: 2/8/2018 5:45:18 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_GetImmigrationApplicationsByLegalAppId] 
 @EmployeeDetails_Id  int,
 @LEGALAPPID INT

AS
BEGIN
	SELECT	
	 FIRSTNAME as firstName	
	,LASTNAME as lastName
	,rec.First_Name recruiterFirstName
	,rec.Last_Name recruiterLastName
	,leg.First_Name legRepFirstName
	,leg.Last_Name legRepLastName
	,LEGALAPPID as legalAppId
    ,APPLICANTID applicationId  
	,lr.APP_FOR appForId   
	,APPForData.KeyName appFor	
	,LEGALAPPTYPE.APPTYPEID appTypeId
    ,APP_TYPE appType 
	,LEGALAPPTYPE.APPTYPENAME appTypeName
	,APP_PRIORITY appPriorityId 
	,AppPri.KeyName appPriority   
	, APP_STATUS appStatusCode
  --  ,(
		-- CASE APP_STATUS
		-- WHEN 'APPRD' THEN 'Application Approved'
		-- WHEN 'CLSD' THEN 'Application Closed/Not Filed'
		-- WHEN 'FILED' THEN 'Application Filed'
		-- WHEN 'ATTR' THEN 'Attorney Review'
		-- WHEN 'CMPLT' THEN 'Completed'
		-- WHEN 'EAC' THEN 'Receipt(EAC) received'
		-- ELSE 'Pending'-------PENDG
		-- END
	 --) appStatus
	  ,ARD1.KeyName appStatus
     ,CURRENT_STATUS currentStatus 
     ,APP_EACNUM eacNumber 
     ,APP_COMMENT comments 
     ,APP_EMAIL email 
     ,HOME_PHONE contactNumber 
     ,EmployeeDetail_id employeeDetailsId 
     ,SkillCategoryId skillCategoryId 
	 ,skillCat.HL_CATEGORY_DESC skillCategory
	 ,IIF(lr.ModifiedDate IS NULL,lr.CreatedDate,lr.ModifiedDate) modifiedDate
	FROM LegalRequest lr
	LEFT JOIN EmployeeDetails ed on lr.EmployeeDetail_id=ed.EmployeeDetails_Id	
	LEFT JOIN EmployeeDetails rec on ed.Recruiter=rec.EmployeeDetails_Id
	LEFT JOIN HOTLIST_CATEGORY skillCat on skillCat.HL_CATEGORY_ID=lr.SkillCategoryId
	LEFT JOIN EmployeeDetails leg on ed.LegalRepresentative=leg.EmployeeDetails_Id
	LEFT JOIN LEGALAPPTYPE  on lr.APP_TYPE=LEGALAPPTYPE.APPTYPECODE
	LEFT JOIN APP_REF_DATA AppPri on ( CAST(lr.APP_PRIORITY AS VARCHAR(50))=CAST(AppPri.KeyID AS VARCHAR(50)) AND AppPri.ParentID=3580 )
	LEFT JOIN APP_REF_DATA APPForData on ( CAST(lr.APP_FOR AS VARCHAR(50))=CAST(APPForData.KeyID AS VARCHAR(50)) AND APPForData.ParentID=3550 )
	Left JOIN APP_REF_DATA ARD1 on ARD1.KeyID = Lr.APP_STATUS
    WHERE lr.EmployeeDetail_id=@EmployeeDetails_Id ANd lr.LEGALAPPID=@LEGALAPPID order by LEGALAPPID DESC
END

/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_GetJobLocationAndKeyword]    Script Date: 2/8/2018 5:45:19 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO






CREATE PROCEDURE [dbo].[API_SP_GetJobLocationAndKeyword]
(
  @jobId Int  
)
AS
BEGIN
    SELECT @jobId jobId
	,(CASE WHEN city = '' THEN cjmJobcity ELSE city END) +', '+state as location, 
		keywords, 
		jobTitle, 
		state, 
		clientName,
		cjmJobReferenceId as jobRefId 
	FROM API_VIEW_GetAllJobsList 
	WHERE cjmJobId = @jobId	  
END

GO

/****** Object:  StoredProcedure [dbo].[API_SP_GetJobRecruiterDetails]    Script Date: 2/8/2018 5:45:20 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO



CREATE PROCEDURE [dbo].[API_SP_GetJobRecruiterDetails]
(
  @jobId Int, 
  @employeeDetailsId Int
)
AS
BEGIN
	SELECT cjm.CJM_JOB_TITLE jobTitle
	,cjm.CJM_JOB_ID jobId
	,cjm.CJM_CLIENT_NAME clientName
	,cjm.CJM_JOB_REFERENCE jobRefId
	,rm.First_Name firstName
	,rm.Last_Name lastName
	,rm.Email_Id emailId
	,rm.Phone phone
	,rm.relocation relocation
	,authdata.ACTIVITY_NAME workAuthorisation
	,ExpMaster.EM_DESC totalExp
	,(SELECT [dbo].API_FN_GetAvailabilityByAvailabilityId(rm.Availability))  AS availability
	,CONCAT(rm.Rate,' ', rateTypeData.keyName) payRate
	,jr.Source_id source
	,jr.EntityGroup entity
	,rm.Skill_Summary skillSummary
	,rec.First_Name recFirstName
	,rec.Last_Name recLastName
	,rec.Email_Id recEmailId
	,rec.EmployeeDetails_Id recId	
	,SV.Vertical_Name vertical
	,SC.Category_Name category
	,SR.Skill_Role_Name role
	,ST.Technology_Name technology
	,Isnull(CJM.CLIENT_REQ_ID,'') as clientReqId
	,CJM_RECRUITER_COMMENTS as recruiterComments

	FROM Client_Job_Master cjm
	LEFT JOIN Job_Resume jr ON jr.CJM_JOB_ID = cjm.CJM_JOB_ID AND CandidateResume_Id = (SELECT TOP 1 Resume_Id FROM Resume_Master WHERE FromEmployeeDetails_Id=@employeeDetailsId ORDER BY Resume_Id DESC)
	LEFT JOIN Resume_Master rm ON rm.Resume_Id = jr.CandidateResume_Id
	LEFT JOIN EmployeeDetails ed ON ed.EmployeeDetails_Id = rm.FromEmployeeDetails_Id
	LEFT JOIN ACTIVITIES_MASTER authdata on IIF(rm.Work_Status < 1, -1 , rm.Work_Status) = authdata.ACTIVITY_ID 
	LEFT JOIN Experience_Master ExpMaster on rm.Total_Exp = ExpMaster.EM_ID AND rm.Total_Exp <> 0
	LEFT JOIN APP_REF_DATA rateTypeData on rm.RateType =rateTypeData.KeyID AND rm.RateType <> 0  AND rateTypeData.ParentID = 1100
	LEFT JOIN EmployeeDetails rec ON rec.EmployeeDetails_id = cjm.EmployeeDetails_ID_Recruiter

	Left JOIN Skill_Vertical SV on SV.Vertical_Id = CJM.CJM_Vertical
	Left JOIN Skill_Category SC on SC.Category_Id = CJM.CJM_Category
	Left JOIN Skill_Role SR on SR.Skill_Role_Id = CJM.CJM_Role
	Left JOIN Skill_Technology ST on ST.Technology_Id = CJM.CJM_Technology
	WHERE cjm.CJM_JOB_ID = @jobId

END


/*
select top 5 * from Client_Job_Master order by 1 desc
CREATE PROCEDURE [dbo].[API_SP_GetJobRecruiterDetails]
(
  @jobId Int  
)
AS
BEGIn
    SELECT CJM_JOB_TITLE jobTitle, 
	CJM_JOB_ID jobId,
	CJM_CLIENT_NAME clientName,
	CustomerId,
	LM1.LOCATION_NAME,
	LM2.LOCATION_NAME, 
	ED2.Email_id as RecruiterLocationHead,
	ED3.Email_id as SalesLocationHead,
	ED4.Email_id as ClientManageEmailId,
	ED5.Email_id as AccountManagerEmailId,
	ED.EmployeeDetails_id as recuiterId,
	(ED.Last_Name + ' ' + ED.First_Name) as recruiter,   
	(ED.First_Name + ' ' + ED.Last_Name) as recruiterFullName, 
	isnull(ED.First_Name,'') as recruiterFirstName,   
    ED.EMail_id recruiterEmail, 
	(ED1.Last_Name + ' ' + ED1.First_Name) AS Posted_By,  
    ED1.Email_id Job_Posted_by_Email, Isnull(Job_Title, CJM_JOB_TITLE) as NewJobTitle,
	CJM_JOB_REFERENCE,Isnull(CJM.CLIENT_REQ_ID,'N/A') as CLIENT_REQ_ID,
	ED.PJEmployee_Id AS RecruiterEmp_ID, ED1.PJEmployee_Id AS PostedByEmp_ID,
	SV.Vertical_Name, SC.Category_Name,SR.Skill_Role_Name,ST.Technology_Name
	FROM Client_Job_Master  CJM  
	Left Join EmployeeDetails ED on ED.EmployeeDetails_id = CJM.EmployeeDetails_ID_Recruiter
	Left Join EmployeeDetails ED1 on ED1.EmployeeDetails_id = CJM.EmployeeDetails_ID_Sales
	Left Join Location_Master LM1 on LM1.LOCATION_HEAD = CJM.EmployeeDetails_ID_Recruiter
	Left Join Location_Master LM2 on LM2.LOCATION_HEAD = CJM.EmployeeDetails_ID_Sales
	Left Join EmployeeDetails ED2 on ED2.EmployeeDetails_id = LM1.LOCATION_HEAD
	Left Join EmployeeDetails ED3 on ED3.EmployeeDetails_id = LM2.LOCATION_HEAD
	Left Join customerprofiling CP on CP.Customer_Id = CJM.CustomerId
	Left Join EmployeeDetails ED4 on ED4.Pjemployee_id = CP.Client_Manager_id and ED4.emp_status='A'
	Left Join EmployeeDetails ED5 on ED4.Pjemployee_id = CP.Account_Manager_id

	Left Join Skill_Vertical SV on SV.Vertical_Id = CJM.CJM_Vertical
	Left Join Skill_Category SC on SC.Category_Id = CJM.CJM_Category
	Left Join Skill_Role SR on SR.Skill_Role_Id = CJM.CJM_Role
	Left Join Skill_Technology ST on ST.Technology_Id = CJM.CJM_Technology
	WHERE  
    CJM.CJM_JOB_ID = @jobId
END

[API_SP_GetJobRecruiterDetails] 320578, 17084

*/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_GetLca]    Script Date: 2/8/2018 5:45:21 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_GetLca] 
 @PJEmployee_Id  VARCHAR(20)
AS
BEGIN
 SELECT 
 LF.Validity_From,
 LF.Validity_To,
 SM.State_Name,
 LF.*
 FROM LCA_FILING LF
 LEFT JOIN State_Master SM ON SM.State_ID = LF.State 
 WHERE LF.Employee_Id = @PJEmployee_Id
 ORDER BY LF.Created_Date DESC
ENd

/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_GetLicenseByEmployeeDetId]    Script Date: 2/8/2018 5:45:22 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_GetLicenseByEmployeeDetId]
 @EmployeeDetails_Id  int

AS
BEGIN
	SELECT EmployeeLicense_Id employeeLicenseId
	,LicenseType licenseTypeId
	,data.KeyName licenseType
	,RegisteredState registeredStateId
	,sm.State_Name registeredState
	,LicenceNumber licenceNumber
	,ExpirationDate expirationDate
	FROM EmployeeLicense
	LEFT JOIN APP_REF_DATA data on EmployeeLicense.LicenseType =data.KeyID
	LEFT JOIN State_Master sm on EmployeeLicense.RegisteredState =sm.State_ID
    WHERE EmployeeDetails_Id=@EmployeeDetails_Id
END


/*
 select * from APP_REF_DATA where ParentID = 4800
 */

/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_GetMyReferrals]    Script Date: 2/8/2018 5:45:24 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[API_SP_GetMyReferrals]
 @employeeDetailsId INT
AS
BEGIN
 SELECT rm.Resume_Id AS resumeId, rm.FromEmployeeDetails_Id AS employeeDetailsId, rm.First_Name AS firstName, rm.Last_Name AS lastName, 
 rm.Email_Id AS email, Created_Date AS createdOn, rm.JobSearchStatus AS jobSearchStatusId, JRM.JR_STATUS_ID AS jobStatusId,
arf.KeyName as JobSearchStatus,
    (
        SELECT count(*) from Job_Resume JR where JR.CandidateResume_Id = RM.Resume_Id and JR_STATUS_ID not in (4, 14, 16, 17, 24)
    ) AS activeApplications
FROM CandidateReferral as rf
JOIN Resume_Master rm ON rf.Resume_Id = rm.Resume_Id
LEFT JOIN App_ref_data arf ON rm.JobSearchStatus = arf.KeyID
LEFT JOIN Job_Resume JRM ON JRM.CandidateResume_Id = RM.Resume_Id
WHERE rf.EmployeeDetails_Id = @employeeDetailsId
ORDER BY rf.Referral_Id DESC
ENd
/******===========================================================================================================================================================******/

--[API_SP_GetMyReferrals] 17084
GO

/****** Object:  StoredProcedure [dbo].[API_SP_GetMyReferrals_new]    Script Date: 2/8/2018 5:45:25 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[API_SP_GetMyReferrals_new]
  @employeeDetailsId INT,
  @pageNum INT,
  @pageSize INT
AS
BEGIN

DECLARE @TotalCount INT = (SELECT COUNT(*) totalCount FROM CandidateReferral WHERE EmployeeDetails_Id = @employeeDetailsId)
SELECT @TotalCount totalCount

DECLARE @CurrentPage INT= [dbo].API_FN_GetPageCount(@TotalCount,@pageSize,@pageNum)
SELECT @CurrentPage currentPage

SELECT rm.Resume_Id AS resumeId, 
 rm.FromEmployeeDetails_Id AS employeeDetailsId, 
 rm.First_Name AS firstName, 
 rm.Last_Name AS lastName, 
 rm.Email_Id AS email, 
 Created_Date AS createdOn, 
 rm.JobSearchStatus AS jobSearchStatusId, 
 JRM.JR_STATUS_ID AS jobStatusId,
 arf.KeyName as JobSearchStatus,
    (
        SELECT count(*) from Job_Resume JR where JR.CandidateResume_Id = RM.Resume_Id and JR_STATUS_ID not in (4, 14, 16, 17, 24)
    ) AS activeApplications
FROM CandidateReferral as rf
JOIN Resume_Master rm ON rf.Resume_Id = rm.Resume_Id
LEFT JOIN App_ref_data arf ON rm.JobSearchStatus = arf.KeyID
LEFT JOIN Job_Resume JRM ON JRM.CandidateResume_Id = RM.Resume_Id
WHERE rf.EmployeeDetails_Id = @employeeDetailsId
ORDER BY rf.Referral_Id DESC
OFFSET @pageSize*(@CurrentPage - 1) ROWS  FETCH NEXT @pageSize ROWS ONLY OPTION (RECOMPILE)

ENd
/******===========================================================================================================================================================******/

--[API_SP_GetMyReferrals_new] 17084
GO

/****** Object:  StoredProcedure [dbo].[API_SP_GetPayrollCalender]    Script Date: 2/8/2018 5:45:26 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO





CREATE PROCEDURE [dbo].[API_SP_GetPayrollCalender] --1001, 2015
 @frequencyId  INT,
 @year INT

AS
BEGIN
	SELECT PayDate_W2 payrollDate,
	--CONCAT(CAST(From_Date AS DATE),' - ', CAST(To_Date AS DATE)) payrollCycle
	CAST(From_Date AS DATE) fromDate,
	CAST(To_Date AS DATE) toDate
	FROM Payroll_Master
	WHERE Pay_Frequency_Id = @frequencyId AND Year = @year
	
END

GO

/****** Object:  StoredProcedure [dbo].[API_SP_GetProfileLookupData]    Script Date: 2/8/2018 5:45:27 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO



CREATE PROCEDURE [dbo].[API_SP_GetProfileLookupData]
AS
BEGIN
 
    select 'ASL' as KeyType, ACTIVITY_ID keyId, ACTIVITY_NAME keyName from ACTIVITIES_MASTER where Activity_Type = 'LS' and Activity_Status = 1 ORDER BY ACTIVITY_NAME ASC
	SELECT 'JSSL' as KeyType,KeyID keyId,KeyName keyName from APP_REF_DATA WHERE ParentID=4750 AND KeyID !=4750 ORDER BY KeyName ASC ---------------jobSearchStatusList
	SELECT 'LTL' as KeyType,KeyID keyId,KeyName keyName from APP_REF_DATA WHERE ParentID=4800 AND KeyID !=4800 ORDER BY KeyName ASC ---------------licenseTypeList
	SELECT 'DL' as KeyType, KeyID keyId,KeyName keyName from APP_REF_DATA WHERE ParentID=2100 AND KeyID !=2100 ORDER BY KeyName ASC ---------------degreeList
	
	--SELECT 'IV' as KeyType, KeyID keyId,KeyName keyName from APP_REF_DATA WHERE ParentID=3000 AND KeyID !=3000 ORDER BY KeyName ASC ---------------Industry Vertical list (OLD)
	
	SELECT 'IV' as KeyType, Vertical_Id keyId,Vertical_Name keyName FROM skill_vertical WHERE Status = 1  ---------------Industry Vertical list

	SELECT 'EXP' as KeyType, EM_ID as keyId, EM_DESC as keyName from Experience_Master where orderby > -1  order by orderby asc -- experince 

	--SELECT 'ASL' as KeyType, KeyID keyId,KeyName keyName from APP_REF_DATA WHERE ParentID=2600 AND KeyID !=2600  ORDER BY KeyName ASC ---------------authorizationStatusList
	--SELECT 'COUNTRY' as KeyType, Country_Id countryId,Country_Code countryCode,Country_Name countryName FROM Country_Master where IsActive=1
	--SELECT 'STATE' as KeyType, State_ID stateId,State_Code stateCode,State_Name stateName,Country_Id countryId FROM State_Master where Status=1
	--SELECT 'CITY' as KeyType, City_Id cityId,Country_Id countryId,State_Id stateId,City_Name cityName FROM City_Master where Status=1
	
END

/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_GetProjectByProjectDetailId]    Script Date: 2/8/2018 5:45:28 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[API_SP_GetProjectByProjectDetailId](@EmployeeDetailsId  INT,
 @ProjectDetail_Id INT)
AS
BEGIN
 SELECT pd.ProjectDetail_Id projectDetailId
  ,pd.Project_Id projectId
  ,pd.Project_Description projectName  
  ,pd.Start_Date startDate
  ,pd.End_Date endDate
  ,pd.Modified_Date modifiedDate
  ,CUS.Name clientName
  ,pp.ProjectDuration projectDuration 
  ,pp.ProjectDescription projectDescription 
  ,pp.Technology  technologyId
  ,ST.Technology_Name technology
  ,pp.Role roleId
  ,SR.Skill_Role_Name role
  ,pp.ManagerName managerName
  ,pp.ManagerTitle managerTitle
  ,pp.ManagerEmail managerEmail
  ,pp.ManagerOffPhone managerOffPhone
  ,pp.SpecialComments  specialComments
, (	    SELECT PR.PayRate
		FROM ProjectDetails PDet
		INNER JOIN (SELECT ProjectRate_ID, ProjectDetail_Id, PayRate, ROW_NUMBER() OVER(PARTITION BY ProjectDetail_Id ORDER BY StartDate DESC) AS RowNum FROM ProjectRate ) PR ON PR.ProjectDetail_Id = PDet.ProjectDetail_Id AND PR.RowNum = 1
		WHERE PDet.ProjectDetail_Id=pd.ProjectDetail_Id AND Employee_Id = @EmployeeDetailsId   
		) payRate
  ,Project_Status projectStatusId
  ,APP.KeyName projectStatus
 FROM  ProjectDetails pd
 INNER JOIN Customer CUS on CUS.CustId = pd.Customer_Id
 LEFT JOIN ProjectProfile pp on pd.Project_Id = pp.Assignmentid
 LEFT JOIN Skill_Role SR on pp.Role = SR.Skill_Role_Id
 LEFT JOIN Skill_Technology ST on pp.Technology = ST.Technology_Id
  INNER JOIN APP_REF_DATA APP on pd.Project_Status = APP.KeyId
 WHERE pd.Employee_Id=@EmployeeDetailsId AND  pd.ProjectDetail_Id=@ProjectDetail_Id
 END

 /*
 select  top 95 * from ProjectDetails  order by 1 desc
 where employee_id=17084
  select  top 5 * from ProjectProfile 
  where Assignmentid='6376-DIREN14001'

select PR.*, C.Name CustomerName, PD.Project_Id from ProjectDetails PD
inner join (select ProjectRate_ID, ProjectDetail_Id, PayRate, 
row_number() over(partition by ProjectDetail_Id order by StartDate desc) as RowNum from ProjectRate ) PR on PR.ProjectDetail_Id = PD.ProjectDetail_Id and PR.RowNum = 1
inner join Customer C on C.CustId = PD.Customer_Id

*/


/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_GetSkillAndLocation]    Script Date: 2/8/2018 5:45:29 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO



CREATE PROCEDURE [dbo].[API_SP_GetSkillAndLocation] 
(
  @employeeDetails_id Int  
)
AS
BEGIN
    SELECT STUFF((SELECT ' ' + SkillName AS [text()]
            FROM candidateskills
            WHERE resume_id = b.resume_id
            FOR XML PATH('')
        ), 1, 1, '' ) AS skillName
		, ct.City_Name cityName
		, sm.State_Name stateName
		, ct.Langitude long
		, ct.Latitude lat
		, b.Resume_Id resumeId
	FROM Resume_Master b 
	LEFT JOIN City_Master ct on b.city_id = ct.City_Id
	LEFT JOIN State_Master sm on b.State_Id = sm.State_Id
	Where b.FromEmployeeDetails_id = @employeeDetails_id
END


-- [API_SP_GetSkillAndLocation] 57971
GO

/****** Object:  StoredProcedure [dbo].[API_SP_GetSkillsByEmployeeDetId]    Script Date: 2/8/2018 5:45:30 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_GetSkillsByEmployeeDetId] 
 @EmployeeDetails_Id  int

AS
BEGIN
	SELECT cs.CandidateSkill_Id candidateSkillId	
	,cs.SkillName skillName
	,cs.YearExp yearExp	
	FROM CandidateSkills cs	
	JOIN Resume_Master RM ON RM.Resume_Id = cs.Resume_Id	
    WHERE RM.FromEmployeeDetails_Id=@EmployeeDetails_Id
END


/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_GetStateCountryByCityId]    Script Date: 2/8/2018 5:45:31 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_GetStateCountryByCityId] --87
 @cityId INT

AS
BEGIN
	
	SELECT st.State_ID stateId
	, st.State_IEU_Id state_id
	, st.Country_Id countryId
	, ct.City_id cityId
	, st.state_name state
	, ct.city_name city
	FROM State_Master st
	JOIN City_Master ct ON st.State_IEU_Id = ct.State_id
	WHERE ct.City_Id = @cityId
END

-- [API_SP_GetStateCountryByCityId] 48838
GO

/****** Object:  StoredProcedure [dbo].[API_SP_GetStaticPageContent]    Script Date: 2/8/2018 5:45:32 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[API_SP_GetStaticPageContent] 
 @PageReferenceId INT
AS
BEGIN
 SELECT *
 FROM StaticContents
-- JOIN  APP_REF_DATA on StaticContents.PageReference_Id =APP_REF_DATA.KeyID
 WHERE isActive=1 AND PageReference_Id=@PageReferenceId  
ENd

/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_GetTimeCardListByTimeRange]    Script Date: 2/8/2018 5:45:34 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_GetTimeCardListByTimeRange] --1112,2017
@EmployeeDetails_Id INT,
@StartDate DATETIME,
@EndDate DATETIME
AS
BEGIN

WITH TimeSheet_CTE (year,month,tsEntryId,totalHours,weekStartDate,weekEndingDate)
	AS
	(
		SELECT DISTINCT 	
		YEAR( PW.we_date) year
		,MONTH( PW.we_date) month		
		,TED.TSEntery_ID tsEntryId
		,ISNULL(TES.TotalHrs,0) totalHours
		,(SELECT [dbo].API_FN_GetWeekStartDateByWeekEndingDate(PW.we_date))  AS weekStartDate 
		,PW.we_date weekEndingDate
		FROM PJWEEK PW

		LEFT JOIN Invoice_TimesheetEntrySummary TES on TES.WeekEnd_Date = PW.we_date
		LEFT JOIN Invoice_TimeSheetEntryDetails TED on TED.TSEntery_ID = TES.TSEntery_ID	
		WHERE (TES.EmployeeID=@EmployeeDetails_Id OR TES.EmployeeID IS NULL)
		)
SELECT year,month,tsEntryId,weekStartDate,weekEndingDate
	FROM TimeSheet_CTE
	WHERE CAST(@StartDate AS DATE)>=CAST(weekStartDate AS DATE) AND CAST(@EndDate AS DATE)<=CAST(weekEndingDate AS DATE)

END
/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_GetUserByUserName]    Script Date: 2/8/2018 5:45:35 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO




CREATE PROCEDURE [dbo].[API_SP_GetUserByUserName] --'p@yopmail.com' ,'4321'
 @UserName  varchar(250)

AS
BEGIN
	SELECT 
	--EmployeeDetails.*
	ed.isAccountActivated
	,ed.emp_status
	,ed.EmployeeDetails_Id
	,ed.Password

	,rm.First_Name
	,rm.Last_Name
	,rm.Email_Id
	,rm.Resume_Id resumeId
	,rm.JobSearchStatus jobSearchStatus
	,cast(rm.AvailableDate as DATE) availableDate
	,APP_REF_DATA.KeyName EmployeeType 
	FROM EmployeeDetails ed
	LEFT JOIN  APP_REF_DATA on ed.Employee_Type = APP_REF_DATA.KeyID
	LEFT JOIN  Resume_Master rm on ed.EmployeeDetails_Id = rm.FromEmployeeDetails_Id
	WHERE (rm.Email_Id=@UserName) OR (PJEmployee_Id=@UserName)
    --WHERE (ed.Email_Id=@UserName COLLATE SQL_Latin1_General_CP1_CS_AS) OR (PJEmployee_Id=@UserName COLLATE SQL_Latin1_General_CP1_CS_AS)
END
/******===========================================================================================================================================================******/

--[API_SP_GetUserByUserName] 'jay.swd@gmail.com'


GO

/****** Object:  StoredProcedure [dbo].[API_SP_GetUserDashboardById]    Script Date: 2/8/2018 5:45:36 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_GetUserDashboardById] --17084
 @EmployeeDetails_Id  INT

AS
BEGIN

DECLARE @RecruiterId INT=(SELECT [dbo].API_FN_GetRecruiterIdByEmployeeDetailsId(@EmployeeDetails_Id))
PRINT(@RecruiterId)

SELECT DISTINCT ed.EmployeeDetails_Id employeeDetailsId
    ,@RecruiterId recruiterId
	,IsNull(ed.PJEmployee_Id,'') employeeId	
	,ed.Employee_Type employeeTypeId
	,empTypedata.KeyName employeeType
	,IsNull(recu.First_Name,'') recFirstName
	,IsNull(recu.Last_Name,'') recLastName
	,IsNull(recu.Email_Id,'') recEmailId
	,IsNull(recu.ProfilePicture,'') recProfilePicture
	, IIF(recContact.Phone_Cell <> '(___) ___-____',recContact.Phone_Cell,'') recContactNumber
	,ed.Modified_Date modifiedDate 	

	FROM EmployeeDetails ed	
	LEFT JOIN EmployeeDetails recu on recu.EmployeeDetails_Id=@RecruiterId
	LEFT JOIN EmployeeContactDetails ecd on recu.EmployeeDetails_Id =ecd.EmployeeDetails_Id
	LEFT JOIN EmployeeContactDetails recContact on recu.EmployeeDetails_Id =recContact.EmployeeDetails_Id
	LEFT JOIN APP_REF_DATA empTypedata on ed.Employee_Type =empTypedata.KeyID	
	WHERE ed.EmployeeDetails_Id=@EmployeeDetails_Id

END



/*
select IsNull(PJEmployee_Id,'') employeeId , * from employeedetails
*/
/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_GetUserDashboardTimeCard]    Script Date: 2/8/2018 5:45:37 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_GetUserDashboardTimeCard] 
 @EmployeeDetails_Id INT,
 @FromDate NVARCHAR(250),
 @ToDate NVARCHAR(250)

AS
BEGIN

------------------check status is paid or process in given time

SELECT DISTINCT ted.TSEntery_ID tsEntryId
    ,tes.TotalHrs hours
    ,tes.WeekEnd_Date date
	,ted.TSEntryStatus
	,CASE (SELECT COUNT(TSEntryStatus) FROM Invoice_TimeSheetEntryDetails  WHERE TSEntryStatus <> 3305) WHEN 0 THEN 'Paid'  ELSE 'Processing' END as status 	
	FROM Invoice_TimeSheetEntryDetails	ted
	LEFT JOIN Invoice_TimesheetEntrySummary tes on ted.TSEntery_ID =tes.TSEntery_ID	
	WHERE tes.EmployeeID=@EmployeeDetails_Id AND (CAST(ted.EntryDate as date) BETWEEN CAST(@FromDate as date) AND CAST(@ToDate  as date))
	AND ted.IsDeleted =0 AND tes.IsDeleted =0

END


/*
select DISTINCT * from Invoice_TimeSheetEntryDetails where (CAST(EntryDate as date) BETWEEN CAST('2016-05-01' as date) AND CAST('2016-05-13'  as date))
select * from Invoice_TimesheetEntrySummary where TSEntery_ID in(1,2,3)
*/
/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_GetUserNotifications]    Script Date: 2/8/2018 5:45:38 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_GetUserNotifications] 
 @employeeDetailsId INT,
 @where NVARCHAR(MAX)
AS
BEGIN

DECLARE @SQLQuery AS NVARCHAR(MAX)
	SET @where =' WHERE  b.EmployeeDetails_Id= ' +@where	
	SET @SQLQuery ='
	
	
	SELECT a.Notification_Subject as subject,
	CONCAT(d.First_Name ,'' '',d.Last_Name ) as senderName,
	a.Notification_Details as messageBody,
	--a.MessageType as messageTypeId,
	--c.KeyName as messageType,
	--a.TypeRef_Id as typeRefId,
	a.created_Date as createdDate,
	a.App_ScreenName as view_app,
	a.Web_ScreenName as view_web
	FROM PushNotificationDetail b
	JOIN PushNotification a on a.Notification_Id = b.Notification_Id
	LEFT JOIN EmployeeDetails d ON b.EmployeeDetails_Id = d.EmployeeDetails_Id ' + @where +'
	ORDER BY a.created_Date DESC
	

	UPDATE PushNotificationDetail set Read_Date=GETDATE() WHERE EmployeeDetails_Id = '+CONVERT(VARCHAR(100),@employeeDetailsId)

	print @SQLQuery
	EXEC(@SQLQuery)
	
END

/*
ALTER PROCEDURE [dbo].[API_SP_GetUserNotifications] 
 @employeeDetailsId INT,
 @where NVARCHAR(MAX),
 @pageNum INT,
 @pageSize INT
AS
BEGIN

DECLARE @SQLQuery AS NVARCHAR(MAX)
	SET @where =' WHERE  b.EmployeeDetails_Id= ' +@where	
	SET @SQLQuery ='
	
	DECLARE @TotalCount INT = (
		SELECT COUNT(*)
		FROM PushNotificationDetail b
		JOIN PushNotification a on a.Notification_Id = b.Notification_Id '+ @where +' 
	)
	SELECT @TotalCount totalCount 

	DECLARE @CurrentPage INT =  [dbo].API_FN_GetPageCount(@TotalCount,'+CONVERT(VARCHAR(50),@pageSize)+','+CONVERT(VARCHAR(50),@pageNum)+')
	SELECT @CurrentPage currentPage 


	SELECT a.Notification_Subject as subject,
	CONCAT(d.First_Name ,'' '',d.Last_Name ) as senderName,
	a.Notification_Details as messageBody,
	--a.MessageType as messageTypeId,
	--c.KeyName as messageType,
	--a.TypeRef_Id as typeRefId,
	a.created_Date as createdDate,
	a.App_ScreenName as view_app,
	a.Web_ScreenName as view_web
	FROM PushNotificationDetail b
	JOIN PushNotification a on a.Notification_Id = b.Notification_Id
	LEFT JOIN EmployeeDetails d ON b.EmployeeDetails_Id = d.EmployeeDetails_Id ' + @where +'
	ORDER BY a.created_Date DESC
	OFFSET '+CONVERT(VARCHAR(50),@pageSize)+'*(@CurrentPage - 1) ROWS  FETCH NEXT '+CONVERT(VARCHAR(50),@pageSize)+' ROWS ONLY OPTION (RECOMPILE)

	UPDATE PushNotificationDetail set Read_Date=GETDATE() WHERE EmployeeDetails_Id = '+CONVERT(VARCHAR(100),@employeeDetailsId)

	print @SQLQuery
	EXEC(@SQLQuery)
	
END
*/
/*


[API_SP_GetUserNotifications] 57971,  ' 57971 ', 1, 2

[API_SP_GetUserNotifications] 57971,  ' 57971 AND Read_Date IS NULL ', 1, 2

*/
/*
ALTER PROCEDURE [dbo].[API_SP_GetUserNotifications] 
 @where NVARCHAR(MAX)
AS
BEGIN

DECLARE @SQLQuery AS NVARCHAR(MAX)
	SET @where =' WHERE  a.User_Id= ' +@where	
	SET @SQLQuery =' SELECT a.Message_Id as messageId,
	a.Subject as subject,
	CONCAT(d.First_Name ,'' '',d.Last_Name ) as senderName,
	a.MessageBody as messageBody,
	a.MessageType as messageTypeId,
	c.KeyName as messageType,
	a.TypeRef_Id as typeRefId,
	CAST(a.isRead as int) as isRead, 
	CAST(a.isFlag as int) as isFlag,
	CAST(a.isPriority as int) as isPriority,
	CAST(a.isArchive as int) as isArchive,
	a.created_Date as createdDate
	FROM NotificationCenter a
	LEFT JOIN APP_REF_DATA c ON a.messageType = c.KeyId
	LEFT JOIN EmployeeDetails d ON a.User_Id = d.EmployeeDetails_Id
	 '+ @where

	print @SQLQuery
	EXEC(@SQLQuery)
END
*/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_GetUserNotifications_paging]    Script Date: 2/8/2018 5:45:39 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_GetUserNotifications_paging] 
 @employeeDetailsId INT,
 @where NVARCHAR(MAX),
 @pageNum INT,
 @pageSize INT
AS
BEGIN

DECLARE @SQLQuery AS NVARCHAR(MAX)
	SET @where =' WHERE  b.EmployeeDetails_Id= ' +@where	
	SET @SQLQuery ='
	
	DECLARE @TotalCount INT = (
		SELECT COUNT(*)
		FROM PushNotificationDetail b
		JOIN PushNotification a on a.Notification_Id = b.Notification_Id '+ @where +' 
	)
	SELECT @TotalCount totalCount 

	DECLARE @CurrentPage INT =  [dbo].API_FN_GetPageCount(@TotalCount,'+CONVERT(VARCHAR(50),@pageSize)+','+CONVERT(VARCHAR(50),@pageNum)+')
	SELECT @CurrentPage currentPage 


	SELECT a.Notification_Subject as subject,
	CONCAT(d.First_Name ,'' '',d.Last_Name ) as senderName,
	a.Notification_Details as messageBody,
	--a.MessageType as messageTypeId,
	--c.KeyName as messageType,
	--a.TypeRef_Id as typeRefId,
	a.created_Date as createdDate,
	a.App_ScreenName as view_app,
	a.Web_ScreenName as view_web
	FROM PushNotificationDetail b
	JOIN PushNotification a on a.Notification_Id = b.Notification_Id
	LEFT JOIN EmployeeDetails d ON b.EmployeeDetails_Id = d.EmployeeDetails_Id ' + @where +'
	ORDER BY a.created_Date DESC
	OFFSET '+CONVERT(VARCHAR(50),@pageSize)+'*(@CurrentPage - 1) ROWS  FETCH NEXT '+CONVERT(VARCHAR(50),@pageSize)+' ROWS ONLY OPTION (RECOMPILE)

	UPDATE PushNotificationDetail set Read_Date=GETDATE() WHERE EmployeeDetails_Id = '+CONVERT(VARCHAR(100),@employeeDetailsId)

	print @SQLQuery
	EXEC(@SQLQuery)
	
END


/*


[API_SP_GetUserNotifications] 57971,  ' 57971 ', 1, 2

[API_SP_GetUserNotifications] 57971,  ' 57971 AND Read_Date IS NULL ', 1, 2

*/
/*
ALTER PROCEDURE [dbo].[API_SP_GetUserNotifications] 
 @where NVARCHAR(MAX)
AS
BEGIN

DECLARE @SQLQuery AS NVARCHAR(MAX)
	SET @where =' WHERE  a.User_Id= ' +@where	
	SET @SQLQuery =' SELECT a.Message_Id as messageId,
	a.Subject as subject,
	CONCAT(d.First_Name ,'' '',d.Last_Name ) as senderName,
	a.MessageBody as messageBody,
	a.MessageType as messageTypeId,
	c.KeyName as messageType,
	a.TypeRef_Id as typeRefId,
	CAST(a.isRead as int) as isRead, 
	CAST(a.isFlag as int) as isFlag,
	CAST(a.isPriority as int) as isPriority,
	CAST(a.isArchive as int) as isArchive,
	a.created_Date as createdDate
	FROM NotificationCenter a
	LEFT JOIN APP_REF_DATA c ON a.messageType = c.KeyId
	LEFT JOIN EmployeeDetails d ON a.User_Id = d.EmployeeDetails_Id
	 '+ @where

	print @SQLQuery
	EXEC(@SQLQuery)
END
*/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_GetUserProfileById]    Script Date: 2/8/2018 5:45:40 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_GetUserProfileById] --17084
 @EmployeeDetails_Id  INT

AS
BEGIN
	DECLARE @RecruiterId INT=(SELECT [dbo].API_FN_GetRecruiterIdByEmployeeDetailsId(@EmployeeDetails_Id))

	PRINT(@RecruiterId)

	SELECT DISTINCT TOP 1 ed.EmployeeDetails_Id employeeDetailsId
	,ISNULL(leg.First_Name,'') legRepFirstName
	,ISNULL(leg.Last_Name,'') legRepLastName
	,IsNull(recu.EmployeeDetails_Id,'') recId
	,IsNull(recu.First_Name,'') recFirstName
	,IsNull(recu.Last_Name,'') recLastName
	,IsNull(recu.Email_Id,'') recEmailId
	,IsNull(recu.ProfilePicture,'') recProfilePicture
	,IIF(recContact.Phone_Cell <> '(___) ___-____',recContact.Phone_Cell,'') recContactNumber
	,IsNull(recContact.WorkExtension,'') as workExt
	,ed.PJEmployee_Id employeeId
	,rm.First_Name firstName
	,rm.Last_Name lastName
	,rm.Resume_Id resumeId
	,rm.PublicProfile publicProfile
	,ed.ProfilePicture profilePicture
	,rm.Email_Id emailId
	,ed.DOB dob
	,ed.Employee_Type employeeTypeId
	,empTypedata.KeyName employeeType
	,rm.Resume_title  currentJobTitle
	,rm.Total_Exp totalExpId
	,ExpMaster.EM_DESC totalExp
	,rm.TotalUSExp	totalUsExp
	--,ISNULL(rm.Relocation, 0) openToRelocate
	,rm.Relocation openToRelocate
	,rm.Availability availabilityId
	,(SELECT [dbo].API_FN_GetAvailabilityByAvailabilityId(rm.Availability))  AS availability
	,rm.Address1 currentLocation
	,rm.Country_Id countryId
	,ISNULL(cm.Country_Name,'') country
	,cm.Country_Code countryCode
	
	,rm.State_Id stateId
	,sm.State_Name state
	,sm.State_IEU_Id state_Id

	,sm.State_Code stateCode
	,rm.City_Id cityId
	,cim.City_Name city	
	,ecd.Zip_Code zipCode
	--,ed.LegalFilingStatus authorisationStatusId 
	,rm.Work_Status authorisationStatusId
	,authdata.ACTIVITY_NAME authorisationStatus 
	,rm.JobSearchStatus jobSearchStatusId 
	,jobdata.KeyName jobSearchStatus
	,rm.IndustryVertical industryVerticalId 
	,industryVer.Vertical_Name industryVertical
	--, IIF(rm.Phone <> '(___) ___-____',rm.Phone,null) contactNumber
	, IIF(Phone <> '', FORMAT(cast(Phone as bigint),'###-###-####'), '') contactNumber	
	,rm.LinkedIn linkedIn
	--,rm.Facebook facebook
	,rm.Twitter twitter
	--,rm.GooglePlus googlePlus
	,rm.Assignment_Type desiredEmployementKey
	,(SELECT [dbo].API_FN_GetDesiredEmployementByDesiredEmployementKey(rm.Assignment_Type,'||','||'))  AS desiredEmployement	
	,rm.Annual_Salary annualSalary
	,rm.Rate contractRate
	,rm.RateType contractRateTypeId
	,rateTypeData.keyName contractRateType
	,rm.InterestedSME interestedSme
	,rm.InterestedCounsellor interestedCounsellor
	,rm.PrefferedCity prefferedCity
	,rm.IndustyExp  careerProfile
	,ed.LastLogin lastLogin
	,ed.Modified_Date lastUpdatedOn
	,ed.Created_Date createdDate
	,rm.Source source
	,rm.EntityGroup entity
	--,rm.Skill_Summary as skillSummary

	--,(SELECT COUNT(*) FROM EmployeeReferenceDetails WHERE EmployeeDetails_Id=@EmployeeDetails_Id) peopleReferred
	--,(SELECT COUNT(*) FROM Job_Resume WHERE JR_RESUME_ID=rm.Resume_Id) jobsAppliedCount

	FROM EmployeeDetails ed
	LEFT JOIN EmployeeDetails leg on ed.LegalRepresentative=leg.EmployeeDetails_Id
	LEFT JOIN EmployeeDetails recu on recu.EmployeeDetails_Id= @RecruiterId
	LEFT JOIN Resume_Master rm on ed.EmployeeDetails_Id =rm.FromEmployeeDetails_Id
	LEFT JOIN EmployeeContactDetails ecd on ed.EmployeeDetails_Id =ecd.EmployeeDetails_Id
	LEFT JOIN EmployeeContactDetails recContact on recu.EmployeeDetails_Id =recContact.EmployeeDetails_Id
	--LEFT JOIN EmployeeDetails recPic on recu.FromEmployeeDetails_Id =recPic.EmployeeDetails_Id
	LEFT JOIN Country_Master cm on rm.Country_id=cm.Country_Id
	LEFT JOIN State_Master sm on rm.state_id=sm.State_ID
	LEFT JOIN City_Master cim on rm.City_Id=cim.City_Id
	LEFT JOIN APP_REF_DATA empTypedata on ed.Employee_Type =empTypedata.KeyID
	LEFT JOIN APP_REF_DATA jobdata on IIF(rm.JobSearchStatus < 1,-1,rm.JobSearchStatus) =jobdata.KeyID ANd jobdata.ParentID = 4750
	LEFT JOIN ACTIVITIES_MASTER authdata on IIF(rm.Work_Status < 1, -1 , rm.Work_Status) = authdata.ACTIVITY_ID -- AND authdata.ParentID = 2600
	LEFT JOIN APP_REF_DATA rateTypeData on rm.RateType =rateTypeData.KeyID AND rm.RateType <> 0  AND rateTypeData.ParentID = 1100
	--LEFT JOIN APP_REF_DATA industryVer on rm.IndustryVertical =industryVer.KeyID AND industryVer.ParentID = 3000
	LEFT JOIN skill_vertical industryVer on rm.IndustryVertical =industryVer.Vertical_Id 
	LEFT JOIN Experience_Master ExpMaster on rm.Total_Exp = ExpMaster.EM_ID AND rm.Total_Exp <> 0
	WHERE ed.EmployeeDetails_Id= @EmployeeDetails_Id

	ORDER BY ed.Created_Date DESC
END

/*

[API_SP_GetUserProfileById] 57883 17084

select password,* from EmployeeDetails where email_id='puja.kumari@compunnel.in'

select * from EmployeeContactDetails 
select * from EmployeeReferenceDetails
select top 200 RateType,* from Resume_Master  where FromEmployeeDetails_Id=1015
select * from Job_Resume where JR_RESUME_ID = 1
select * from app_ref_data where keyid=3008

*/

/*
select (case when IsNull(PD.End_Date, '12/12/9999') >= getdate() Then ED.Recruiter Else RM.RecruiterId End ) RecruiterId
from Resume_Master RM
left Join EmployeeDetails ED ON ED.EmployeeDetails_Id = RM.FromEmployeeDetails_Id
left join (select ProjectDetail_Id, Employee_Id, Start_Date, End_Date, row_number() 
over(partition by Employee_Id order by Start_Date Desc) as RowNum from ProjectDetails)
PD ON PD.Employee_Id = ED.EmployeeDetails_Id and PD.RowNum = 1
where ED.EmployeeDetails_Id=17084

*/




GO

/****** Object:  StoredProcedure [dbo].[API_SP_GetUserSettings]    Script Date: 2/8/2018 5:45:42 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_GetUserSettings] 
 @employeeDetailsId  int

AS
BEGIN
	SELECT CAST(a.ReceiveNotification as INT) as notificationStatus , 
	--b.AlertNotificationSetting_Id as alertNotificationSettingId, 
	--b.EmployeeDetails_Id as employeeDetailsId,
	b.AlertType as alertTypeId,
	c.KeyName as alertType,
	CAST(b.Status as int) as alertStatus,
	--CAST(b.SwitchOffStatus as int) as switchOffStatus,
	b.DateTo as dateTo
	--b.AlertFrequency as alertFrequencyId,	
	--d.KeyName as alertFrequency
	FROM EmployeeDetails a
	JOIN AlertNotificationSetting b ON a.employeeDetails_Id = b.employeeDetails_Id
	LEFT JOIN APP_REF_DATA c ON b.AlertType = c.KeyId
	--LEFT JOIN APP_REF_DATA d ON b.AlertFrequency = d.KeyId
	WHERE a.employeeDetails_Id = @employeeDetailsId AND a.ReceiveNotification > 0
END

GO

/****** Object:  StoredProcedure [dbo].[API_SP_Jobs_DistanceAndCount]    Script Date: 2/8/2018 5:45:44 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_Jobs_DistanceAndCount]
(
  @searchText NVARCHAR(MAX)='',
  @city NVARCHAR(500)='',
  @state NVARCHAR(500)=''
)
AS
BEGIN

	DECLARE @LAT FLOAT, @LONG FLOAT;
	DECLARE @flag VARCHAR(500)
	IF(@city = @state)
		SET @flag =  'N';
	ELSE 
		SET @flag =  'Y';

		WITH CTE(latitude,longitude) AS
		(
			SELECT TOP 1
			Latitude
			,Langitude 
			FROM City_Master CM
			LEFT JOIN State_Master SM ON SM.State_IEU_Id =CM.State_Id
			WHERE ((@flag = 'N' AND (CM.City_Name=@city OR SM.State_Name=@state))
			OR (@flag = 'Y' AND (CM.City_Name=@city AND SM.State_Name=@state)))
		)

		SELECT 
		--latitude,longitude,
		  '0' miles0,(SELECT [dbo].[API_FN_GetNearestCoOrdinatesInMiles](ISNULL(latitude,0.0),ISNULL(longitude,0.0),0,@searchText,@city,@state)) count0
		 ,'10' miles10,(SELECT [dbo].[API_FN_GetNearestCoOrdinatesInMiles](ISNULL(latitude,0.0),ISNULL(longitude,0.0),10,@searchText,@city,@state)) count10
		 ,'20' miles20,(SELECT [dbo].[API_FN_GetNearestCoOrdinatesInMiles](ISNULL(latitude,0.0),ISNULL(longitude,0.0),20,@searchText,@city,@state)) count20
		 ,'50' miles50,(SELECT [dbo].[API_FN_GetNearestCoOrdinatesInMiles](ISNULL(latitude,0.0),ISNULL(longitude,0.0),50,@searchText,@city,@state)) count50
		 ,'200' miles200,(SELECT [dbo].[API_FN_GetNearestCoOrdinatesInMiles](ISNULL(latitude,0.0),ISNULL(longitude,0.0),200,@searchText,@city,@state)) count200
		FROM CTE
END

/*

[API_SP_Jobs_DistanceAndCount] '','Basking Ridge' ,'New Jersey'
select * from city_master where City_Id=86643
Select City_Id,Location_State_Id,* from client_job_master where City_Id=86643
select  * from API_VIEW_GetAllJobsList where city ='Basking Ridge' ANd state='New Jersey'

SELECT [dbo].[API_FN_GetNearestCoOrdinatesInMiles]('0.0','0.0',0,'','Basking Ridge' ,'New Jersey') 

*/


GO

/****** Object:  StoredProcedure [dbo].[API_SP_Jobs_JobAlertCount]    Script Date: 2/8/2018 5:45:45 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_Jobs_JobAlertCount]
(
  @searchText NVARCHAR(MAX)='',
  @city NVARCHAR(500)='',
  @state NVARCHAR(500)=''
)
AS
BEGIn
--CITY OR STATE ARE EQUAL
    DECLARE @flag VARCHAR(500)
	IF(@city = @state)
		SET @flag =  'N'
	ELSE 
		SET @flag =  'Y'		

   
	DECLARE @TotalCount INT = (
		SELECT COUNT(*) 
		FROM API_VIEW_GetAllJobsList 
		WHERE (RTRIM(LTRIM(jobTitle)) LIKE '%'+ RTRIM(LTRIM(@searchText))+'%' OR RTRIM(LTRIM(keywords)) LIKE '%'+ RTRIM(LTRIM(@searchText))+'%')
		AND 
		  (
			  (@flag = 'N' AND ((RTRIM(LTRIM(city)) LIKE '%'+ RTRIM(LTRIM(@city))+'%') OR  (RTRIM(LTRIM(state)) LIKE '%'+ RTRIM(LTRIM(@state))+'%')))
			  OR  (@flag = 'N' AND ((RTRIM(LTRIM(city)) LIKE '%'+ RTRIM(LTRIM(@city))+'%') AND  (RTRIM(LTRIM(state)) LIKE '%'+ RTRIM(LTRIM(@state))+'%')))
		  )
	  )  

	SELECT @TotalCount totalCount	
END


/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_Jobs_JobAssignmentTypeAndCount]    Script Date: 2/8/2018 5:45:46 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_Jobs_JobAssignmentTypeAndCount]
(
  @searchText NVARCHAR(MAX)='',
  @city NVARCHAR(500)='',
  @state NVARCHAR(500)=''
)
AS
BEGIn
    DECLARE @flag VARCHAR(500)
	IF(@city = @state)
		SET @flag =  'N';
	ELSE 
		SET @flag =  'Y';

		WITH CTE (cjmAssessmentTypeKey,cjmAssessmentType,count) AS
		(
			SELECT DISTINCT
			 cjmAssessmentTypeKey
			, cjmAssessmentType
			,(SELECT COUNT(cjmJobId) FROM API_VIEW_GetAllJobsList   WHERE cjmAssessmentTypeKey = JOBS.cjmAssessmentTypeKey ) count
					
			FROM API_VIEW_GetAllJobsList JOBS		

			WHERE (RTRIM(LTRIM(jobTitle)) LIKE '%'+ RTRIM(LTRIM(@searchText))+'%' OR RTRIM(LTRIM(keywords)) LIKE '%'+ RTRIM(LTRIM(@searchText))+'%')
			AND 
			  (
				  (@flag = 'N' AND ((RTRIM(LTRIM(cjmJobcity)) LIKE '%'+ RTRIM(LTRIM(@city))+'%'	OR RTRIM(LTRIM(city)) LIKE '%'+ RTRIM(LTRIM(@city))+'%') OR  (RTRIM(LTRIM(state)) LIKE '%'+ RTRIM(LTRIM(@state))+'%')))
				  OR (@flag = 'Y' AND ((RTRIM(LTRIM(cjmJobcity)) LIKE '%'+ RTRIM(LTRIM(@city))+'%'	OR RTRIM(LTRIM(city)) LIKE '%'+ RTRIM(LTRIM(@city))+'%') AND  (RTRIM(LTRIM(state)) LIKE '%'+ RTRIM(LTRIM(@state))+'%')))
			  )
			 GROUP BY  cjmAssessmentTypeKey,cjmAssessmentType
		
		)
		SELECT cjmAssessmentTypeKey,cjmAssessmentType, count FROM CTE  ORDER BY cjmAssessmentTypeKey
	  
END

/*
[API_SP_Jobs_JobAssignmentTypeAndCount] '','Basking Ridge' ,'New Jersey'
select  * from API_VIEW_GetAllJobsList where city ='Anaheim' ANd state='California'
EXEC API_SP_Jobs_JobCategoryAndCount @searchText='' ,@city='' ,@state=''
select * from API_VIEW_GetAllJobsList where projectTypeId=4651
*/

/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_Jobs_JobCategoryAndCount]    Script Date: 2/8/2018 5:45:48 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_Jobs_JobCategoryAndCount]
(
  @searchText NVARCHAR(MAX)='',
  @city NVARCHAR(500)='',
  @state NVARCHAR(500)=''
)
AS
BEGIn
    DECLARE @flag VARCHAR(500)
	IF(@city = @state)
		SET @flag =  'N';
	ELSE 
		SET @flag =  'Y';

		WITH CTE (projectTypeId,projectType,count) AS
		(
			SELECT DISTINCT
			 projectTypeId
			, projectType
			,(SELECT COUNT(cjmJobId) FROM API_VIEW_GetAllJobsList   WHERE projectTypeId = JOBS.projectTypeId ) count
					
			FROM API_VIEW_GetAllJobsList JOBS		

			WHERE (RTRIM(LTRIM(jobTitle)) LIKE '%'+ RTRIM(LTRIM(@searchText))+'%' OR RTRIM(LTRIM(keywords)) LIKE '%'+ RTRIM(LTRIM(@searchText))+'%')
			AND 
			  (
				  (@flag = 'N' AND ((RTRIM(LTRIM(cjmJobcity)) LIKE '%'+ RTRIM(LTRIM(@city))+'%'	OR RTRIM(LTRIM(city)) LIKE '%'+ RTRIM(LTRIM(@city))+'%') OR  (RTRIM(LTRIM(state)) LIKE '%'+ RTRIM(LTRIM(@state))+'%')))
				  OR (@flag = 'Y' AND ((RTRIM(LTRIM(cjmJobcity)) LIKE '%'+ RTRIM(LTRIM(@city))+'%'	OR RTRIM(LTRIM(city)) LIKE '%'+ RTRIM(LTRIM(@city))+'%') AND  (RTRIM(LTRIM(state)) LIKE '%'+ RTRIM(LTRIM(@state))+'%')))
			  )
			 GROUP BY  projectTypeId,projectType
		
		)
		SELECT projectTypeId, projectType, count FROM CTE  ORDER BY projectTypeId
	  
END

/*
[API_SP_Jobs_JobCategoryAndCount] '','Basking Ridge' ,'New Jersey'
select  * from API_VIEW_GetAllJobsList where city ='Anaheim' ANd state='California'
select * from API_VIEW_GetAllJobsList where projectTypeId=4652
*/

/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_Jobs_JobCountByLocationByEmpId]    Script Date: 2/8/2018 5:45:49 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_Jobs_JobCountByLocationByEmpId] --21543
@EmployeeDetails_Id INT
AS
BEGIN
 SELECT COUNT(CJM_JOB_ID)  localJobCount
 FROM CLIENT_JOB_MASTER WHERE CJM_Status='A' AND City_Id=(SELECT City_Id FROM Resume_Master WHERE FromEmployeeDetails_Id=@EmployeeDetails_Id) 

 SELECT COUNT(CJM_JOB_ID)  otherLocationJobCount
 FROM CLIENT_JOB_MASTER WHERE CJM_Status='A' AND City_Id <> (SELECT City_Id FROM Resume_Master WHERE FromEmployeeDetails_Id=@EmployeeDetails_Id)

END
/*
select City_Id,* from employeecontactDetails where City_Id is not null 
select count(City_Id) from CLIENT_JOB_MASTER  where  CJM_Status='A' AND City_Id is not null
select * from city_master where city_id in (79694)

select * from resume_master

*/



/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_Jobs_JobLocationAndCount]    Script Date: 2/8/2018 5:45:50 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_Jobs_JobLocationAndCount]
(
  @searchText NVARCHAR(MAX)='',
  @city NVARCHAR(500)='',
  @state NVARCHAR(500)=''
)
AS
BEGIn
    DECLARE @flag VARCHAR(500)
	IF(@city = @state)
		SET @flag =  'N';
	ELSE 
		SET @flag =  'Y';

		WITH CTE (location,latitude,longitude,count) AS
		(
			SELECT	
			(CASE WHEN city = '' THEN cjmJobcity ELSE city END) +', '+state as location
			,latitude
			,longitude
			,COUNT(cjmJobId) count
			FROM API_VIEW_GetAllJobsList	

			WHERE (RTRIM(LTRIM(jobTitle)) LIKE '%'+ RTRIM(LTRIM(@searchText))+'%' OR RTRIM(LTRIM(keywords)) LIKE '%'+ RTRIM(LTRIM(@searchText))+'%')
			AND 
			  (
				  (@flag = 'N' AND ((RTRIM(LTRIM(cjmJobcity)) LIKE '%'+ RTRIM(LTRIM(@city))+'%'	OR RTRIM(LTRIM(city)) LIKE '%'+ RTRIM(LTRIM(@city))+'%') OR  (RTRIM(LTRIM(state)) LIKE '%'+ RTRIM(LTRIM(@state))+'%')))
				  OR (@flag = 'Y' AND ((RTRIM(LTRIM(cjmJobcity)) LIKE '%'+ RTRIM(LTRIM(@city))+'%'	OR RTRIM(LTRIM(city)) LIKE '%'+ RTRIM(LTRIM(@city))+'%') AND  (RTRIM(LTRIM(state)) LIKE '%'+ RTRIM(LTRIM(@state))+'%')))
			  )
			 GROUP BY  city,latitude,longitude,cjmJobcity,state  
		
		)
		SELECT location,latitude,longitude,sum(count) count FROM CTE  GROUP BY  location,latitude,longitude   ORDER BY location
	  
END

/*
[API_SP_Jobs_JobLocationAndCount] '','Basking Ridge' ,'New Jersey'
select  * from API_VIEW_GetAllJobsList where city ='Anaheim' ANd state='California'
*/
GO

/****** Object:  StoredProcedure [dbo].[API_SP_Jobs_JobLocationAndCount_New]    Script Date: 2/8/2018 5:45:51 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_Jobs_JobLocationAndCount_New]
(
  @where AS VARCHAR(MAX)
)
AS
BEGIN
DECLARE @selectQuery AS VARCHAR(MAX)

SET @selectQuery='
		WITH CTE (location,latitude,longitude,count) AS
		(
			SELECT	
			(CASE WHEN city = '''' THEN cjmJobcity ELSE city END) +'', ''+state as location
			,latitude
			,longitude
			,COUNT(cjmJobId) count
			FROM API_VIEW_GetAllJobsList	

			WHERE '+ @where +' GROUP BY  city,latitude,longitude,cjmJobcity,state  
		
		)
		SELECT location,latitude,longitude,sum(count) count FROM CTE  GROUP BY  location,latitude,longitude   ORDER BY location
'
--Print selectQuery
PRINT(@selectQuery)

--Execute query
 EXEC (@selectQuery) 	  
END

/*
[API_SP_Jobs_JobLocationAndCount_New] ''
select  * from API_VIEW_GetAllJobsList where city ='Anaheim' ANd state='California'
select * from API_VIEW_GetAllJobsList
*/

/******===========================================================================================================================================================******/
--EXEC API_SP_Jobs_JobLocationAndCount_New @where =' (jobTitle LIKE ''%java%''  OR  keywords LIKE ''%java%'')  AND ((cjmJobcity LIKE ''%New York%'') OR (state LIKE ''%New York%'') )   AND ISNULL(isHot,0) = 1  AND Charindex(cast(projectTypeId as varchar(8000)),''4651,4652'') > 0   AND Charindex(cast(cjmAssessmentTypeKey as varchar(8000)), ''C,F,R'') > 0  '
GO

/****** Object:  StoredProcedure [dbo].[API_SP_Jobs_JobTypeAndCount]    Script Date: 2/8/2018 5:45:52 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_Jobs_JobTypeAndCount]
(
  @searchText NVARCHAR(MAX)='',
  @city NVARCHAR(500)='',
  @state NVARCHAR(500)=''
)
AS
BEGIn
    DECLARE @flag VARCHAR(500)
	IF(@city = @state)
		SET @flag =  'N';
	ELSE 
		SET @flag =  'Y';

		WITH CTE (isHot,count) AS
		(
			SELECT
			ISNULL(isHot,0) isHot	
			,(SELECT COUNT(cjmJobId)  FROM API_VIEW_GetAllJobsList   WHERE ISNULL(isHot,0)=ISNULL(JOBS.isHot,0)) count
					
			FROM API_VIEW_GetAllJobsList JOBS

			WHERE (RTRIM(LTRIM(jobTitle)) LIKE '%'+ RTRIM(LTRIM(@searchText))+'%' OR RTRIM(LTRIM(keywords)) LIKE '%'+ RTRIM(LTRIM(@searchText))+'%')
			AND 
			  (
				  (@flag = 'N' AND ((RTRIM(LTRIM(cjmJobcity)) LIKE '%'+ RTRIM(LTRIM(@city))+'%'	OR RTRIM(LTRIM(city)) LIKE '%'+ RTRIM(LTRIM(@city))+'%') OR  (RTRIM(LTRIM(state)) LIKE '%'+ RTRIM(LTRIM(@state))+'%')))
				  OR (@flag = 'Y' AND ((RTRIM(LTRIM(cjmJobcity)) LIKE '%'+ RTRIM(LTRIM(@city))+'%'	OR RTRIM(LTRIM(city)) LIKE '%'+ RTRIM(LTRIM(@city))+'%') AND  (RTRIM(LTRIM(state)) LIKE '%'+ RTRIM(LTRIM(@state))+'%')))
			  )
			 GROUP BY  isHot
		
		)
		SELECT isHot, count FROM CTE  ORDER BY isHot
	  
END

/*
[API_SP_Jobs_JobTypeAndCount] '','Basking Ridge' ,'New Jersey'
select  * from API_VIEW_GetAllJobsList where city ='Anaheim' ANd state='California'
select * from API_VIEW_GetAllJobsList
*/

/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_Jobs_ProjectType]    Script Date: 2/8/2018 5:45:53 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_Jobs_ProjectType] 
AS
BEGIN
SELECT 
	ProjectType projectTypeId
	,(SELECT KeyName FROM APP_REF_DATA WHERE keyId=CLIENT_JOB_MASTER.ProjectType) projectType
	,COUNT(projectType) jobCount
	FROM CLIENT_JOB_MASTER  
	WHERE CJM_Status='A' AND ProjectType IS NOT NULL
	GROUP BY  ProjectType
END

/*
select * from APP_REF_DATA where ParentID=4650
select top 10 ProjectType,* from CLIENT_JOB_MASTER 
*/
/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_Jobs_Search]    Script Date: 2/8/2018 5:45:54 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_Jobs_Search]
(
  @EmployeeDetails_Id INT=0,
  @pageCount INT=1,
  @pageSize INT=30,
  @searchText NVARCHAR(MAX)='',
  @city NVARCHAR(500)='',
  @state NVARCHAR(500)='',
  @cjmJobId INT=0,
  @miles INT=NULL,
  @isHot BIT =NULL,
  @jobCategory NVARCHAR(500)='',
  @jobAssignmentType NVARCHAR(500)='',
  @sortRelevance CHAR(1)='',
  @sortDate CHAR(1)=''
)
AS
BEGIN
DECLARE @selectQuery AS VARCHAR(MAX)
DECLARE @where AS VARCHAR(5000)
DECLARE @orderBy AS VARCHAR(5000)
DECLARE @paging AS VARCHAR(5000)
DECLARE @TotalCount INT


SET @paging= ' OFFSET '+CONVERT(VARCHAR(50),@pageSize)+' * (@CurrentPage - 1) ROWS  FETCH NEXT '+CONVERT(VARCHAR(50),@pageSize)+' ROWS ONLY OPTION (RECOMPILE) '


 -- Custom where condition
IF(@cjmJobId>0)
	BEGIN
		SET @where = '  cjmJobId= '+ CONVERT(VARCHAR(50),@cjmJobId)
	END
ELSE
	BEGIN
		SET @where =' (RTRIM(LTRIM(jobTitle)) LIKE ''%'+ RTRIM(LTRIM(@searchText))+'%'' OR RTRIM(LTRIM(keywords)) LIKE ''%'+ RTRIM(LTRIM(@searchText))+'%'') '	
		IF(@city = @state)
			SET @where= @where + ' AND ((RTRIM(LTRIM(cjmJobcity)) LIKE ''%'+ RTRIM(LTRIM(@city))+'%''	OR RTRIM(LTRIM(city)) LIKE ''%'+ RTRIM(LTRIM(@city))+'%'') OR  (RTRIM(LTRIM(state)) LIKE ''%'+ RTRIM(LTRIM(@state))+'%'')) '
		ELSE 
			SET @where= @where + ' AND ((RTRIM(LTRIM(cjmJobcity)) LIKE ''%'+ RTRIM(LTRIM(@city))+'%''	OR RTRIM(LTRIM(city)) LIKE ''%'+ RTRIM(LTRIM(@city))+'%'') AND  (RTRIM(LTRIM(state)) LIKE ''%'+ RTRIM(LTRIM(@state))+'%'')) '
		IF(@isHot=1)
			SET @where= @where + '  AND ISNULL(isHot,0) = 1 '
		ELSE IF(@isHot=0)
			SET @where= @where + '  AND ISNULL(isHot,0) = 0 '

		IF(@jobCategory !='')
			SET @where= @where + ' AND Charindex(cast(projectTypeId as varchar(8000)), '''+ @jobCategory +''') > 0  '

		IF(@jobAssignmentType!='')
			SET @where= @where + ' AND Charindex(cast(cjmAssessmentTypeKey as varchar(8000)), '''+ @jobAssignmentType +''') > 0  '
	END

	
PRINT(@where)


--  Custom order by condition

DECLARE @sortDateDESC VARCHAR(500)= ' ORDER BY cjmPostingDate DESC '
DECLARE @sortDateASC VARCHAR(500)= ' ORDER BY cjmPostingDate ASC '
DECLARE @sortRelevanceQueryDESC VARCHAR(500) = ' ,(SELECT  [dbo].[API_FN_GetSearchScore](NULLIF(jobTitle,'''') ,'''+@searchText+'''))  DESC , (SELECT  [dbo].[API_FN_GetSearchScore](NULLIF(keywords,'''') ,'''+@searchText+'''))  DESC '
DECLARE @sortRelevanceQueryASC VARCHAR(500) = ' ,(SELECT  [dbo].[API_FN_GetSearchScore](NULLIF(jobTitle,'''') ,'''+@searchText+'''))  ASC , (SELECT  [dbo].[API_FN_GetSearchScore](NULLIF(keywords,'''') ,'''+@searchText+'''))  ASC '

SET @orderBy= @sortDateDESC
IF(LOWER(@sortDate)='a')
	SET @orderBy =  @sortDateASC + @sortRelevanceQueryDESC
ELSE IF(LOWER(@sortRelevance)='a')
	SET @orderBy =  @orderBy + @sortRelevanceQueryASC
ELSE IF(LOWER(@sortRelevance)='d')
	SET @orderBy = @orderBy + @sortRelevanceQueryDESC
ELSE
	SET @orderBy = @orderBy + @sortRelevanceQueryDESC
	


--  Select total count
SET @selectQuery=' DECLARE @TotalCount INT = (SELECT COUNT(*) totalCount FROM API_VIEW_GetAllJobsList WHERE '+@where +')'
SET @selectQuery=@selectQuery + ' SELECT @TotalCount totalCount'

--  Select Current page number
SET @selectQuery=@selectQuery + ' DECLARE @CurrentPage INT= [dbo].API_FN_GetPageCount(@TotalCount,'+CONVERT(VARCHAR(50),@pageSize)+','+CONVERT(VARCHAR(50),@pageCount)+') SELECT @CurrentPage currentPage'

--Select data for search result
SET @selectQuery=@selectQuery + ' SELECT *	
				,(SELECT JR_UPDATED_ON
				FROM Job_resume WHERE CJM_JOB_ID = cjmJobId AND CandidateResume_Id= (SELECT Resume_Id FROM Resume_Master WHERE FromEmployeeDetails_Id='+CONVERT(VARCHAR(50),@EmployeeDetails_Id)+')) appliedOn 
				,(SELECT COUNT(CandidateResume_Id)
				FROM Job_resume WHERE CJM_JOB_ID = cjmJobId AND CandidateResume_Id= (SELECT Resume_Id FROM Resume_Master WHERE FromEmployeeDetails_Id='+CONVERT(VARCHAR(50),@EmployeeDetails_Id)+')) alreadyApplied 
				FROM API_VIEW_GetAllJobsList WHERE '+@where

--Apply order by
SET @selectQuery=@selectQuery+  @orderBy

--Apply paging
SET @selectQuery=@selectQuery+  @paging

--Print selectQuery
PRINT(@selectQuery)

--Execute query
 EXEC (@selectQuery)  

END

/*
Exec [dbo].[API_SP_Jobs_Search]
 DECLARE  @EmployeeDetails_Id INT=0,
  @pageCount INT=1,
  @pageSize INT=1,
  @searchText NVARCHAR(MAX)='',
  @city NVARCHAR(500)='',
  @state NVARCHAR(500)='',
  @cjmJobId INT=0,
  @miles INT=NULL,
  @isHot BIT =NULL,
  @jobCategory NVARCHAR(500)='',
  @jobAssignmentType NVARCHAR(500)='',
  @sortRelevance CHAR(1)='',
  @sortDate CHAR(1)=''

[API_SP_Jobs_Search] '','1','2','','','','307389','','','','',''

select *
,Charindex(cast(LEGALAPPID as varchar(8000)), '2215,1186,1199,1200')
FROM VISACHECKLISTDETAILS

SELECT  [dbo].[API_FN_GetSearchScore]('valnetin123456'  ,'')
select CJM_JOB_ID from CLIENT_JOB_MASTER
ORDER BY CJM_JOB_ID
OFFSET 10 * (2 - 1) ROWS
FETCH NEXT 6 ROWS ONLY OPTION (RECOMPILE); 
select * from city_master
select  * from CLIENT_JOB_MASTER  ORDER BY CJM_JOB_ID   OFFSET 10 ROWS

[API_SP_Jobs_Search] 0,2,2,'java','oh'
EXEC API_SP_Jobs_Search @EmployeeDetails_Id ='0' ,@pageCount ='1' ,@pageSize ='1'
select * from employeeDetails where email_id LIKE '%puja%' 
*/

/******===========================================================================================================================================================******/




GO

/****** Object:  StoredProcedure [dbo].[API_SP_SetEmailQueue]    Script Date: 2/8/2018 5:45:56 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_SetEmailQueue] 
  @To  nvarchar(100)
 ,@Cc  nvarchar(100)
 ,@Subject  nvarchar(100)
 ,@Body nvarchar(max)
AS
BEGIN
	INSERT INTO [dbo].[EmailQueue]
           ([TO]
           ,[CC]
           ,[Subject]
           ,[Body]          
           ,[AppId]
          )
     VALUES
           (@To
		   ,@Cc
		   ,@Subject
		   ,@Body
		   ,2)
END

/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_StaffContacts]    Script Date: 2/8/2018 5:45:57 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[API_SP_StaffContacts]
(
  @pageNum INT,
  @pageSize INT,
  @where NVARCHAR(MAX)
)
AS
BEGIN

DECLARE @SQLQuery AS NVARCHAR(MAX)

	SET @where=		'  empDetailId IS NOT NULL '+@where

	SET @SQLQuery=	' DECLARE @TotalCount INT = (SELECT COUNT(*) totalCount FROM API_VIEW_StaffContacts WHERE '+@where +')'
	SET @SQLQuery=	@SQLQuery+ ' SELECT @TotalCount totalCount'
	SET @SQLQuery=	@SQLQuery+ ' DECLARE @CurrentPage INT= [dbo].API_FN_GetPageCount(@TotalCount,'+CONVERT(VARCHAR(50),@pageSize)+','+CONVERT(VARCHAR(50),@pageNum)+') SELECT @CurrentPage currentPage'

	SET @SQLQuery = @SQLQuery +' SELECT * FROM API_VIEW_StaffContacts WITH(NOLOCK) WHERE '+ @where
	SET @SQLQuery=	@SQLQuery+ ' ORDER BY name OFFSET '+CONVERT(VARCHAR(50),@pageSize)+' * (@CurrentPage - 1) ROWS  FETCH NEXT '+CONVERT(VARCHAR(50),@pageSize)+' ROWS ONLY OPTION (RECOMPILE) '

	print @SQLQuery
	EXEC(@SQLQuery)

END


/*

select * from API_VIEW_StaffContacts where name like'%''%'

API_SP_StaffContacts] 1,20, AND name=Nikhil Nair'
SELECT *   from API_VIEW_StaffContacts where  name like '%anu%'
EXEC API_SP_StaffContacts @pageNum='1', @pageSize='10' , @where=' AND name like ''%''''%'''
EXEC API_SP_StaffContacts @pageNum='1', @pageSize='10' , @where=' AND name like ''%''+CHAR(39)+''%'''
*/


/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_TimeCardByDateRange]    Script Date: 2/8/2018 5:45:58 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[API_SP_TimeCardByDateRange]
(
  @employeeDetailsId INT,
  @startDate DATE,
  @endDate DATE
)
AS
BEGIN
	SELECT CONCAT(DATENAME(WEEKDAY, a.we_date),+' '+ DATENAME(MONTH, a.we_date), +' '+ FORMAT(a.we_date, 'dd yyyy') ) as dateFormat
	, FORMAT(a.we_date,'yyyy-MM-dd') as we_date, FORMAT(a.we_date,'yyyy-MM-dd') as k, FORMAT(a.we_date,'dd') as dt
	, b.TSEntery_ID as weekEndId
	, b.SummaryComments
	, b.WeekEnd_Date
	, b.RegHrs as smRegHrs
	, b.TotalHrs as smTotHrs
	, b.OTHrs
	--, CONCAT(DATENAME(weekday, c.EntryDate),+' '+ DATENAME(month, c.EntryDate), +' '+ format(c.EntryDate, 'dd yyyy') ) as EntryDate
	, FORMAT(c.EntryDate,'yyyy-MM-dd') as EntryDate
	, c.TSEnteryDetail_ID as detailId
	, c.RegHrs, c.TotalHrs
	, c.OT1Hrs
	, c.TSEntryStatus
	, c.Modified_Date
	, d.ProjectDetail_Id as projectId
	, d.Project_Description as projectName
	, e.KeyName
	,(SELECT [dbo].API_FN_GetTimecardStatusByTsEntryIdAndEmployeeId(@employeeDetailsId ,c.TSEntery_ID))  AS statusIdStatus 
		FROM PJWEEK a
		LEFT JOIN Invoice_TimesheetEntrySummary b ON CAST(a.we_date AS DATE) = CAST(b.WeekEnd_Date AS DATE) AND b.EmployeeID = @employeeDetailsId
		LEFT JOIN Invoice_TimesheetEntryDetails c ON b.TSEntery_ID = c.TSEntery_ID AND b.EmployeeID = @employeeDetailsId
		LEFT JOIN ProjectDetails d ON c.ProjectID = d.ProjectDetail_Id AND b.EmployeeID = @employeeDetailsId
        LEFT JOIN APP_REF_DATA e ON c.TSEntryStatus = e.KeyID
		WHERE a.we_date BETWEEN @startDate AND @endDate 
		--AND (d.End_Date is null OR d.End_Date > GETDATE())
		--AND (d.End_Date is null OR (d.End_Date > @endDate))
		AND (d.End_Date is null OR (d.End_Date BETWEEN @startDate AND @endDate))
		AND (d.Start_Date <= @endDate)
		ORDER BY a.we_date ASC, c.EntryDate ASC
   
END

/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_TimeCardBySummaryId]    Script Date: 2/8/2018 5:45:59 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[API_SP_TimeCardBySummaryId]
(
  @employeeDetailsId INT, 
  @entryId INT
)
AS
BEGIN
	SELECT CONCAT(DATENAME(WEEKDAY, b.WeekEnd_Date),+' '+ DATENAME(MONTH, b.WeekEnd_Date), +' '+ FORMAT(b.WeekEnd_Date, 'dd yyyy') ) as dateFormat
	, FORMAT(b.WeekEnd_Date,'yyyy-MM-dd') as we_date, FORMAT(b.WeekEnd_Date,'yyyy-MM-dd') as k, FORMAT(b.WeekEnd_Date,'dd') as dt
	, b.TSEntery_ID as weekEndId
	, b.SummaryComments
	, b.WeekEnd_Date
	, b.RegHrs as smRegHrs
	, b.TotalHrs as smTotHrs
	, b.OTHrs
	, CONCAT(DATENAME(WEEKDAY, c.EntryDate),+' '+ DATENAME(MONTH, c.EntryDate), +' '+ FORMAT(c.EntryDate, 'dd yyyy') ) as EntryDate
	, c.TSEnteryDetail_ID as detailId
	, c.RegHrs
	, c.TotalHrs
	, c.OT1Hrs
	, c.TSEntryStatus
	, c.Modified_Date
	, c.ProjectID as projectId
	, d.Project_Description as projectName
	, e.KeyName
	--, (SELECT [dbo].API_FN_GetTimecardStatusByTsEntryIdAndEmployeeId(B.EmployeeID,b.TSEntery_ID))  AS status 

    FROM [dbo].[Invoice_TimesheetEntrySummary] b 
    LEFT JOIN  [dbo].[Invoice_TimesheetEntryDetails] c ON b.TSEntery_ID = c.TSEntery_ID 
    LEFT JOIN [dbo].[ProjectDetails] d ON c.ProjectID = d.ProjectDetail_Id
    LEFT JOIN [dbo].[APP_REF_DATA] e ON c.TSEntryStatus = e.KeyID

    WHERE b.EmployeeID = @employeeDetailsId AND b.TSEntery_ID = @entryId ORDER BY b.WeekEnd_Date ASC, c.EntryDate ASC
   
END


/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_UpdateEmployeeProject]    Script Date: 2/8/2018 5:46:00 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[API_SP_UpdateEmployeeProject](
 @EmployeeDetailsId  INT,
 @ProjectDetailId INT, 
 @ProjectDuration VARCHAR(200),
 @ProjectDescription VARCHAR(1000), 
 @TechnologyId INT, 
 @Role INT, 
 @ManagerName VARCHAR(200),
 @ManagerTitle VARCHAR(200), 
 @ManagerEmail VARCHAR(200), 
 @ManagerOffPhone VARCHAR(25),
 @SpecialComments VARCHAR(1000)
 )
AS
BEGIN
 Update ProjectProfile 
  SET ProjectDuration = @ProjectDuration
  ,ProjectDescription = @ProjectDescription
  ,TechnologyUsed = (SELECT KeyName FROM APP_REF_DATA WHERE KeyID=@TechnologyId)
  ,Technology = @TechnologyId
  ,Role = @Role
  ,ManagerName = @ManagerName
  ,ManagerTitle = @ManagerTitle
  ,ManagerEmail = @ManagerEmail
  ,ManagerOffPhone = @ManagerOffPhone
  ,SpecialComments = @SpecialComments 
 FROM ProjectProfile as pp 
 INNER JOIN ProjectDetails as pd on pd.Project_Id = pp.Assignmentid 
 LEFT JOIN APP_REF_DATA as data on pp.Role=data.KeyID 
 WHERE pd.ProjectDetail_Id = @ProjectDetailId AND pp.Assignmentid = pd.Project_Id
 END
/*
 exec API_SP_UpdateEmployeeProject  1112,2,1, '701-APX101001', '701-APX101001', '7 months', 'R.Roy at APEX','.Net',, 905, 'Pravesh','PL','pravesh@compunnel.in', '123456789', ''
 */
/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_UpdateImmigrationApplication]    Script Date: 2/8/2018 5:46:01 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_UpdateImmigrationApplication] 
 @EmployeeDetails_Id  INT
,@LEGALAPP_ID INT
,@FIRST_NAME varchar(25)
,@LAST_NAME varchar(25)
,@APP_FOR_ID varchar(4)
,@APP_EMAIL varchar(50)
,@HOME_PHONE varchar(30)
,@APP_EACNUM varchar(25)
,@APP_PRIORITY varchar(10)
,@APP_TYPE varchar(5)
,@CURRENT_STATUS varchar(10)
,@APP_COMMENT varchar(512)
,@SkillCategoryId int

AS
BEGIN

-- check imigration status is pending
IF((SELECT ISNULL(APP_STATUS,'PENDG') FROM LegalRequest WHERE LEGALAPPID=@LEGALAPP_ID)='PENDG')
BEGIN

	DECLARE @appTypeId INT ;
	SELECT @appTypeId= (CASE WHEN @APP_TYPE<>'' THEN  (SELECT APPTYPEID FROM LEGALAPPTYPE WHERE APPTYPECODE = @APP_TYPE)
						ELSE (SELECT APPTYPEID FROM LEGALAPPTYPE WHERE APPTYPECODE = (SELECT APP_TYPE FROM  LegalRequest WHERE LEGALAPPID=@LEGALAPP_ID))
						END)
	PRINT (@appTypeId)


	--Update LegalRequest 
	UPDATE LegalRequest
		SET  FIRSTNAME = @FIRST_NAME
			,LASTNAME = @LAST_NAME
			,APP_FOR = @APP_FOR_ID
			,APP_EMAIL = @APP_EMAIL
			,HOME_PHONE = @HOME_PHONE
			,APP_EACNUM = @APP_EACNUM
			,APP_PRIORITY = @APP_PRIORITY
			,APP_TYPE = @APP_TYPE
			,CURRENT_STATUS = @CURRENT_STATUS
			,APP_COMMENT = @APP_COMMENT
			,SkillCategoryId = @SkillCategoryId
			,Modified_By=@EmployeeDetails_Id
			,ModifiedDate=GETDATE()
	WHERE LEGALAPPID=@LEGALAPP_ID

	--DELETE record from VisaCheckListDetails and LEGALDOC
	DELETE FROM VISACHECKLISTDETAILS WHERE LEGALAPPID=@LEGALAPP_ID
	DELETE FROM LEGALDOC WHERE LEGALAPPID=@LEGALAPP_ID

	--INSERT new record in VISACHECKLISTDETAILS based on APP_TYPE 
	INSERT INTO VISACHECKLISTDETAILS (LEGALAPPID,DOCUMENTID,STATUS,CREATED_BY,CREATED_DATE)
	SELECT @LEGALAPP_ID,DOCUMENTID,2,@EmployeeDetails_Id,GETDATE() FROM LEGALAPPCHECKLIST WHERE APPTYPEID=@appTypeId  --STATUS=    1----Completed,0--NA,2--Pending
	SELECT @appTypeId as appId
END


END

/*	

select * from LEGALAPPTYPE
select * from legalrequest where LEGALAPPID=26047
select * from LEGALAPPCHECKLIST
select * from VisaCheckListDetails where LEGALAPPID=26047
select * from LEGALDOC  where LEGALAPPID=26047
*/

/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_UpdateUserProfile]    Script Date: 2/8/2018 5:46:02 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_UpdateUserProfile] --1015
 @EmployeeDetails_Id  INT,
 @PJEmployee_Id varchar(20),
 @First_Name varchar(50),
 @Last_Name varchar(50),
 @DOB DateTime,
 --@Email_Id varchar(50),
 @ProfilePicture varchar(250),
 --@emp_type char(4),
 @CurrentJobTitle varchar(250),
 @AuthorisationStatusId int,
 @Total_Exp INT,
 @TotalUSExp INT,
 @LinkedIn varchar(250),
 @Facebook varchar(250),
 @Twitter varchar(250),
 @GooglePlus varchar(250),
 @CareerProfile nvarchar(2000),
 @Phone_Cell varchar(20),
 @Country INT,
 @State INT,
 @City_Id INT,
 @Address varchar(500),
 @Zip_Code varchar(20),
 @OtherCity varchar(50),
 @JobSearchStatusId INT
AS
BEGIN
    DECLARE @EmployeeContactDetails_Id	INT

	--insert other city in city master	
	if(@OtherCity is not null or @OtherCity <> '')
	BEGIN
	INSERT INTO City_Master(Country_Id, State_Id,City_Name,Status)
	VALUES(@Country,@State,@OtherCity,1)

	SET @City_Id=@@IDENTITY
	END

-----update data in EmployeeDetails table
UPDATE EmployeeDetails
	SET PJEmployee_Id=@PJEmployee_Id
		,First_Name=@First_Name
		,Last_Name=@Last_Name
		,ProfilePicture=@ProfilePicture
		--,Email_Id=@Email_Id
		,DOB=@DOB
		--,emp_type=@emp_type
		,CurrentJobTitle=@CurrentJobTitle
		,LegalFilingStatus=@AuthorisationStatusId
		,Modified_By=@EmployeeDetails_Id
		,Modified_Date=GETDATE()
	WHERE EmployeeDetails_Id=@EmployeeDetails_Id
	
-----update data in Resume_Master table
UPDATE Resume_Master
	SET Total_Exp=@Total_Exp
		,TotalUSExp=@TotalUSExp
		,LinkedIn=@LinkedIn
		,Facebook=@Facebook
		,Twitter=@Twitter
		,GooglePlus=@GooglePlus
		,Comments=@CareerProfile
		,JobSearchStatus=@JobSearchStatusId	
		,Modified_By=@EmployeeDetails_Id
		,Modified_On=GETDATE()
	WHERE FromEmployeeDetails_Id=@EmployeeDetails_Id

	SET @EmployeeContactDetails_Id=(SELECT EmployeeDetails_Id from EmployeeContactDetails where EmployeeDetails_Id=@EmployeeDetails_Id)
	IF(@EmployeeContactDetails_Id>0)
	BEGIN
			-----update data in EmployeeContactDetails table
		UPDATE EmployeeContactDetails
		SET Phone_Cell=@Phone_Cell
		,Country=@Country
		,State=@State
		,City_Id=@City_Id
		,Address1=@Address
		,Zip_Code=@Zip_Code
		,Modified_By=@EmployeeDetails_Id
		,Modified_Date=GETDATE()
	WHERE EmployeeDetails_Id=@EmployeeDetails_Id
	END
	ELSE
	BEGIN
		-----Insert data in EmployeeContactDetails table
		INSERT INTO EmployeeContactDetails(
		EmployeeDetails_Id
		,Phone_Cell
		,Country
		,State
		,City_Id
		,Address1
		,Zip_Code
		,Status
		,Created_By
		,Created_Date
		) 
		VALUES
		(
		@EmployeeDetails_Id
	   ,@Phone_Cell
	   ,@Country
	   ,@State
	   ,@City_Id
	   ,@Address
	   ,@Zip_Code
	   ,1
	   ,@EmployeeDetails_Id
	   ,GETDATE())
			
	END


END


SELECT Resume_Id from Resume_Master WHERE FromEmployeeDetails_Id=@EmployeeDetails_Id

/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_UserChangePassword]    Script Date: 2/8/2018 5:46:03 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_UserChangePassword] --'p@yopmail.com' ,'4321'
  @Login  varchar(50)
 ,@Password varchar(500)   
 ,@empStatus char(1)
 ,@isAccountActivated bit

AS
BEGIN
	Update EmployeeDetails 
	SET Password=@Password,
		emp_status=@empStatus,
		isAccountActivated=@isAccountActivated,
		Modified_Date=GETDATE()
    WHERE (Email_Id=@Login) OR (PJEmployee_Id=@Login)
END
/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_UserSignIn]    Script Date: 2/8/2018 5:46:05 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_UserSignIn] --'a@yopmail.com'	,123456
 @Login  varchar(50)
,@Password varchar(500)

AS
BEGIN

    DECLARE @EmployeeDetails_Id	INT

	IF(@Password is null or @Password = '' or @Password = 'null')
	BEGIN
		SET @EmployeeDetails_Id= (SELECT EmployeeDetails_Id  FROM EmployeeDetails 
		WHERE  Email_Id=@Login)
	END
	ELSE
	BEGIN
		SET @EmployeeDetails_Id= (SELECT EmployeeDetails_Id  FROM EmployeeDetails 
		WHERE (PJEmployee_Id=@Login AND Password=@Password COLLATE SQL_Latin1_General_CP1_CS_AS)  OR (  Email_Id=@Login AND Password=@Password COLLATE SQL_Latin1_General_CP1_CS_AS))
	END

	

	IF(@EmployeeDetails_Id>0)
	BEGIN
		IF((SELECT SessionId from UserSession WHERE EmployeeDetails_Id=@EmployeeDetails_Id)>0)
		BEGIN
			UPDATE [UserSession] SET [Status]=1
									,SessionUniqueId=NEWID()
									,[UpdatedBy]=@EmployeeDetails_Id
									,[UpdatedOn]=GETDATE()
			WHERE EmployeeDetails_Id=@EmployeeDetails_Id 
		END
		ELSE
		BEGIN
			INSERT INTO [dbo].[UserSession]
			   ([EmployeeDetails_Id]          
			   ,[CreatedBy])
			VALUES
			   (@EmployeeDetails_Id
			   ,@EmployeeDetails_Id)
		END


	END
	

	SELECT EmployeeDetails_Id employeeDetailsId
	,ED.Email_Id emailId
	,PJEmployee_Id employeeId
	,ED.First_Name firstName
	,ED.Last_Name lastName
	,Employee_Type  employeeTypeId
	,ARD.KeyName employeeType 
	,ED.ProfilePicture profilePicture
	,ED.LegalFilingStatus authorisationStatusId
	,(CASE WHEN RM.checkConfirm IS NULL THEN 0 ELSE 1 END) resumeUploaded
	--,(CASE WHEN RM.status = 1 THEN 0 ELSE 1 END) onBoarding
	,(CASE WHEN (RM.status = 1 AND ED.password <> '') THEN 0 ELSE 1 END) onBoarding
	,(CASE WHEN ED.password <> '' THEN 1 ELSE 0 END) passwordCreated
	FROM EmployeeDetails ED	
	LEFT JOIN  APP_REF_DATA ARD on ED.Employee_Type= ARD.KeyID 
	LEFT JOIN Resume_Master RM on RM.FromEmployeeDetails_Id = ED.EmployeeDetails_Id
	WHERE ED.EmployeeDetails_Id=@EmployeeDetails_Id

END



/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_UserSignOut]    Script Date: 2/8/2018 5:46:06 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_UserSignOut]
 @EmployeeDetails_Id  INT
AS
BEGIN
	UPDATE EmployeeDetails SET
			LastLogin=GETDATE()
			,Modified_By=@EmployeeDetails_Id
			,Modified_Date=GETDATE()
    WHERE EmployeeDetails_Id=@EmployeeDetails_Id 

	UPDATE [UserSession] SET 
		   [Status]=0
	      ,[LastLoggedIn]=GETDATE()
	      ,[UpdatedBy]=@EmployeeDetails_Id
	      ,[UpdatedOn]=GETDATE()
	WHERE EmployeeDetails_Id=@EmployeeDetails_Id 
END

/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_UserSignUp]    Script Date: 2/8/2018 5:46:07 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_UserSignUp]
 @FirstName  VARCHAR(50)
,@LastName  VARCHAR(50)
,@EmailId  VARCHAR(50)
,@Password VARCHAR(500)
,@empStatus CHAR(1)
,@isAccountActivated BIT
,@recruiter INT =12380  -----------Default recruiter sheffali razdan 
,@phone VARCHAR(50) =NULL
,@sourceId INT = 4414
,@entityGroup INT = 2323  
,@JobSearchStatus INT =NULL-------------4751   only applicable while creating new account for referrals (contact refer or job refer)
,@ProfilePicture VARCHAR(500) =NULL
,@resumeMasterStatus INT = 3 ---------------------------- Unverified: 3, InActive: 0, Active: 1, Approved: 2, BlackListed: 4

AS
BEGIN
DECLARE @EmployeeDetails_Id	INT=0, @resumeId	INT=0

BEGIN TRANSACTION

SELECT @EmployeeDetails_Id = EmployeeDetails_Id from EmployeeDetails where Email_Id = @EmailID

IF(@EmployeeDetails_Id=0)
BEGIN
		INSERT INTO [dbo].[EmployeeDetails]
			   (
				[First_Name]
			   ,[Last_Name]
			   ,[Email_Id]
			   ,[Password]
			   ,[Employee_Type]
			   ,[emp_status]
			   ,[isAccountActivated]
			   ,[ProfilePicture]
			   ,[Created_Date]
			   )
		VALUES
			   (
			   @FirstName
			  ,@LastName
			  ,@EmailId
			  ,@Password
			  ,1224
			 ,@empStatus	
			 ,@isAccountActivated
			 ,@ProfilePicture
			  ,GETDATE()
			   )
SELECT @EmployeeDetails_Id = SCOPE_IDENTITY()
END

UPDATE EmployeeDetails SET Created_By=@EmployeeDetails_Id WHERE EmployeeDetails_Id=@EmployeeDetails_Id

if @@ERROR <> 0
BEGIN
	ROLLBACK
	RETURN
END

SELECT @resumeId = Resume_Id FROM Resume_Master WHERE Email_Id = @EmailID
IF(@resumeId=0)
BEGIN
	INSERT INTO [dbo].[Resume_Master]
           (          
            [First_Name]
           ,[Last_Name]
           ,[Email_Id]	
		   ,[FromEmployeeDetails_Id]
		   ,[Status]
		   ,[Created_On]
		   ,[Created_By]
		   ,[RecruiterId]
		   ,[Phone]
		   ,[Source]
		   ,[EntityGroup]
		   ,[JobSearchStatus]
           )
	VALUES
           (
		   @FirstName
		  ,@LastName
		  ,@EmailId	
		  ,@EmployeeDetails_Id
		  ,@resumeMasterStatus
		  ,GETDATE()
		  ,@EmployeeDetails_Id
		  ,@recruiter  -----------Default recruiter sheffali razdan 
		  ,@phone
		  ,@sourceId
		  ,@entityGroup
		  ,@JobSearchStatus
		   )
	SELECT @resumeId = SCOPE_IDENTITY()
END

if @@ERROR <> 0
BEGIN
	ROLLBACK
	RETURN
END

--Insert record in  EmployeeContactDetails tabl
IF((SELECT EmployeeContactDetails_Id FROM EmployeeContactDetails WHERE EmployeeDetails_Id = @EmployeeDetails_Id)>0)
BEGIN
	UPDATE EmployeeContactDetails SET Phone_Cell= IIF(@phone=NULL OR @phone='',Phone_Cell,@phone) ,Modified_By=@EmployeeDetails_Id ,Modified_Date=GETDATE() WHERE EmployeeDetails_Id = @EmployeeDetails_Id
END
ELSE
BEGIN
	INSERT INTO [dbo].[EmployeeContactDetails]
           (          
            EmployeeDetails_Id
           ,Phone_Cell
           ,Status	
		   ,Created_By
		   ,Created_Date		
           )
	VALUES
           (
		   @EmployeeDetails_Id
		  ,@phone
		  ,1801 ----Active	  select * from app_ref_data where keyId=1801	 
		  ,@EmployeeDetails_Id
		  ,GETDATE()
		
		   )
END

if @@ERROR <> 0
BEGIN
	ROLLBACK
	RETURN
END


BEGIN	 
	DECLARE @Activity AS VARCHAR(500) = NULL	
	SELECT @Activity = ' New User Created '

	INSERT INTO ATS_JobActivity (Client_JobId, Candidate_Id,Activity_Log,Created_By,Created_On,DataComeFrom)             
	VALUES (-1, @resumeId, @Activity, @EmployeeDetails_Id ,GETDATE(), 2)
END

if @@ERROR <> 0
BEGIN
	ROLLBACK
	RETURN
END

IF EXISTS (Select * from EmployeeDetails where Email_Id = @EmailID)
BEGIN
SELECT @EmployeeDetails_Id EmployeeDetails_Id ,@resumeId resumeId ;
END

ELSE
BEGIN
	SELECT 0 EmployeeDetails_Id ,0 resumeId;
END

COMMIT

END



/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_usp_GetJobReferrals]    Script Date: 2/8/2018 5:46:08 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[API_SP_usp_GetJobReferrals]
 @employeeDetailsId INT
AS
BEGIN
 SELECT 
	ED.EmployeeDetails_Id,
	ED.First_Name firstName,
	ED.Last_Name lastName,
	ED.email_Id email,
	--JR.Created_Date referralDate,
	CJM.cjmJobId jobId,
	CJM.jobTitle,
	CJM.cjmAssessmentType as assesmentType,
	CJM.cjmStatus jobStatus,
	CJM.employerName,
	CJM.cjmAnnualSalary annualSalary,
	CJM.experienceRange as experience,
	ARF.KeyName jobSearchStatus,
	--CJM.cityId,
	--CJM.city,
	--CJM.locationStateId stateId,
	--CJM.state,
	JRM.JR_STATUS_ID as jobStatusId,
	ISM.STATUS_DESC applicationStatus,
	JRM.JR_UPDATED_ON appliedOn 
FROM JobReferral JR
LEFT JOIN API_VIEW_GetAllJobsList CJM ON JR.Job_Id = CJM.cjmJobId
LEFT JOIN Resume_Master RM ON JR.Resume_Id = RM.Resume_Id
LEFT JOIN Job_Resume JRM ON JRM.CandidateResume_Id = RM.Resume_Id
LEFT JOIN INTERVIEW_STATUS_MASTER ISM ON JRM.JR_STATUS_ID = ISM.STATUS_ID
JOIN EmployeeDetails ED ON RM.FromEmployeeDetails_Id = ED.EmployeeDetails_Id
LEFT JOIN App_ref_data ARF ON RM.JobSearchStatus = ARF.KeyID
WHERE JR.EmployeeDetails_Id = @employeeDetailsId
ORDER BY JR.JobReferral_Id DESC
END
/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_usp_GetJobReferrals_new]    Script Date: 2/8/2018 5:46:09 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[API_SP_usp_GetJobReferrals_new]
 @employeeDetailsId INT,
  @pageNum INT,
  @pageSize INT
AS
BEGIN

DECLARE @TotalCount INT = (SELECT COUNT(*) totalCount FROM JobReferral WHERE EmployeeDetails_Id = @employeeDetailsId)
SELECT @TotalCount totalCount

DECLARE @CurrentPage INT= [dbo].API_FN_GetPageCount(@TotalCount,@pageSize,@pageNum)
SELECT @CurrentPage currentPage

 SELECT 
	ED.EmployeeDetails_Id,
	ED.First_Name firstName,
	ED.Last_Name lastName,
	ED.email_Id email,
	--JR.Created_Date referralDate,
	CJM.cjmJobId jobId,
	CJM.jobTitle,
	CJM.cjmAssessmentType as assesmentType,
	CJM.cjmStatus jobStatus,
	CJM.employerName,
	CJM.cjmAnnualSalary annualSalary,
	CJM.experienceRange as experience,
	ARF.KeyName jobSearchStatus,
	--CJM.cityId,
	--CJM.city,
	--CJM.locationStateId stateId,
	--CJM.state,
	JRM.JR_STATUS_ID as jobStatusId,
	ISM.STATUS_DESC applicationStatus,
	JRM.JR_UPDATED_ON appliedOn 
FROM JobReferral JR
LEFT JOIN API_VIEW_GetAllJobsList CJM ON JR.Job_Id = CJM.cjmJobId
LEFT JOIN Resume_Master RM ON JR.Resume_Id = RM.Resume_Id
LEFT JOIN Job_Resume JRM ON JRM.CandidateResume_Id = RM.Resume_Id
LEFT JOIN INTERVIEW_STATUS_MASTER ISM ON JRM.JR_STATUS_ID = ISM.STATUS_ID
JOIN EmployeeDetails ED ON RM.FromEmployeeDetails_Id = ED.EmployeeDetails_Id
LEFT JOIN App_ref_data ARF ON RM.JobSearchStatus = ARF.KeyID
WHERE JR.EmployeeDetails_Id = @employeeDetailsId
ORDER BY JR.JobReferral_Id DESC
OFFSET @pageSize*(@CurrentPage - 1) ROWS  FETCH NEXT @pageSize ROWS ONLY OPTION (RECOMPILE)

END
/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_usp_GetLegalDetailsByLegalAppId]    Script Date: 2/8/2018 5:46:10 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

--[MVC_API_LegalDetailsByLegalAppId] 27048
CREATE PROCEDURE [dbo].[API_SP_usp_GetLegalDetailsByLegalAppId]
(
	@LegalAppId int
)	
AS  
BEGIN  
	SELECT
		(isnull(LE.FirstName,'') + ' ' + isnull(LE.LASTNAME,'')) AS ApplicantName,
		APP_EMAIL ApplicantEmailId,
		HOME_PHONE Phone,
		APPForData.KeyName ApplicationFor,
		AppPri.KeyName AppPriority,    	
		--APP_TYPE AppType,
		LEGALAPPTYPE.APPTYPENAME AppType,
		CURRENT_STATUS,
		skillCat.HL_CATEGORY_DESC SkillCategory,
		APP_COMMENT,	
		--CASE APP_STATUS
		--	 WHEN 'APPRD' THEN 'Application Approved'
		--	 WHEN 'CLSD' THEN 'Application Closed/Not Filed'
		--	 WHEN 'FILED' THEN 'Application Filed'
		--	 WHEN 'ATTR' THEN 'Attorney Review'
		--	 WHEN 'CMPLT' THEN 'Completed'
		--	 WHEN 'EAC' THEN 'Receipt(EAC) received'
		--	 ELSE 'Pending'
		-- END as APPStatus,
		ARD1.KeyName APPStatus,
		isnull(Recruiter_ED.First_Name,'') + ' ' + isnull(Recruiter_ED.Last_Name,'') as RecruiterName, 
		Recruiter_ED.Email_Id as RecruiterEmailid,
		isnull(LegalRep_ED.First_Name,'') + ' ' + isnull(LegalRep_ED.Last_Name,'') as LegalRepName, 
		LegalRep_ED.Email_Id as LegalRepEmailid,
		isnull(RM.First_Name,'') as UserFirstName,
		isnull(RM.First_Name,'') + ' ' + isnull(RM.Last_Name,'') as UserName,
		isnull(RM.Email_Id,'') as UserEmailId
    FROM 
		LegalRequest LE 
	LEFT JOIN 
		APP_REF_DATA APPForData ON LE.APP_FOR = APPForData.KeyID
	LEFT JOIN 
		APP_REF_DATA AppPri ON lE.APP_PRIORITY = AppPri.KeyID 
	LEFT JOIN 
		HOTLIST_CATEGORY skillCat on skillCat.HL_CATEGORY_ID=LE.SkillCategoryId
	LEFT JOIN
		EmployeeDetails ED ON ED.EmployeeDetails_Id = LE.EmployeeDetail_id
	LEFT JOIN
		Resume_Master RM ON RM.FromEmployeeDetails_Id = LE.EmployeeDetail_id 
	LEFT JOIN
		EmployeeDetails Recruiter_ED ON Recruiter_ED.EmployeeDetails_id = ED.recruiter 
	LEFT JOIN
		EmployeeDetails LegalRep_ED ON LegalRep_ED.EmployeeDetails_Id = LE.EmployeeDetailsId_LegalRep 
	LEFT JOIN 
		APP_REF_DATA ARD1 on ARD1.KeyID = LE.APP_STATUS
	LEFT JOIN 
		LEGALAPPTYPE  on LE.APP_TYPE = LEGALAPPTYPE.APPTYPECODE
    WHERE 
		LE.LEGALAPPID = @LegalAppId
END  



GO

/****** Object:  StoredProcedure [dbo].[API_SP_usp_GetUserById]    Script Date: 2/8/2018 5:46:12 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

--[MVC_API_LegalDetailsByLegalAppId] 27048
CREATE PROCEDURE [dbo].[API_SP_usp_GetUserById]
(
	@employeeDetailsId int
)	
AS  
BEGIN  
	SELECT ED.EmployeeDetails_Id, ED.PJEmployee_Id, RM.Email_Id, RM.First_Name, RM.Last_Name, ED.Employee_Type, ED.ProfilePicture, ED.emp_status, ED.isAccountActivated, ED.password 
	FROM EmployeeDetails ED 
	LEFT JOIN Resume_Master RM ON ED.EmployeeDetails_Id = RM.FromEmployeeDetails_Id 
	WHERE ED.EmployeeDetails_Id = @employeeDetailsId
END  



GO

/****** Object:  StoredProcedure [dbo].[API_SP_uspGet_MessageCenter]    Script Date: 2/8/2018 5:46:13 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_uspGet_MessageCenter] 
 @loggedinEmpId INT,
 @where NVARCHAR(MAX)= '  '
AS
BEGIN

DECLARE @SQLQuery AS NVARCHAR(MAX)
	SET @where =' 1=1  ' +@where	
	SET @SQLQuery =' CREATE TABLE #tempMessage(message_Id int null, parentmessage_id int null)

		INSERT INTO #tempMessage(message_Id,parentmessage_id)
		SELECT MAX(message_Id),parentmessage_id 
		FROM messagecenter WHERE (Created_By = '+CONVERT(VARCHAR(150),@loggedinEmpId)+' or Recipient_Id = '+CONVERT(VARCHAR(150),@loggedinEmpId)+') 
		AND parentmessage_id is not null 
		GROUP BY parentmessage_id

		INSERT INTO #tempMessage(message_Id,parentmessage_id)
		SELECT message_Id,parentmessage_id 
		FROM messagecenter 
		WHERE (Created_By = '+CONVERT(VARCHAR(150),@loggedinEmpId)+' or Recipient_Id ='+CONVERT(VARCHAR(150),@loggedinEmpId)+') 
		AND parentmessage_id is null 
		AND message_Id NOT IN (SELECT parentmessage_id FROM #tempMessage)

		SELECT MC.Message_Id messageId, MC.ParentMessage_Id parentMessageId, CONCAT(ED.First_Name ,'' '', ED.Last_Name) senderName, MC.Subject subject, MC.MessageBody messageBody, 
		MSTYPE.KeyName AS messageType, MC.TypeRef_Id typeRefId, MC.Recipient_Id employeeDetailsId, MC.Created_By createdBy, MC.Created_Date createdDate, MCA.IsRead isRead, MCA.IsFlag isFlag, 
		MCA.IsPriority isPriority, MCA.IsArchive isArchive, MCA.IsRecipient isRecipient,
		(CASE MessageType 
			WHEN 6002 THEN (SELECT CJM_JOB_TITLE +'' (''+CAST(CJM_JOB_ID AS VARCHAR(50))+'')''  FROM CLIENT_JOB_MASTER WHERE CJM_JOB_ID=TypeRef_Id)
			WHEN 6001 THEN (SELECT Project_Description  FROM ProjectDetails (NOLOCK) WHERE ProjectDetail_Id=TypeRef_Id)
			ELSE (SELECT First_Name+'' ''+Last_Name  FROM EmployeeDetails (NOLOCK) WHERE EmployeeDetails_Id=TypeRef_Id)
		END)typeRef,
		(SELECT COUNT(Message_Id) FROM MessageCenter RMS (NOLOCK) WHERE (RMS.Recipient_Id= '+CONVERT(VARCHAR(150),@loggedinEmpId)+' OR RMS.Created_By= '+CONVERT(VARCHAR(150),@loggedinEmpId)+') 
		AND RMS.ParentMessage_Id IS NOT NULL AND RMS.ParentMessage_Id=MC.ParentMessage_Id) replyCount
		FROM messagecenter MC 
		INNER JOIN #tempMessage SP on MC.message_Id = SP.message_Id
		INNER JOIN MessageCenterActivity MCA on MC.message_Id = MCA.message_id AND MCA.EmployeeDetails_Id = '+CONVERT(VARCHAR(150),@loggedinEmpId)+' 
		INNER JOIN EmployeeDetails ED ON ED.EmployeeDetails_Id = MC.Created_By
		LEFT JOIN APP_REF_DATA MSTYPE ON MC.MessageType = MSTYPE.KeyId AND MSTYPE.KeyId <> 0
		WHERE '+ @where+' 
		ORDER BY MC.Message_Id DESC
		DROP TABLE #tempMessage'

	print @SQLQuery
	EXEC(@SQLQuery)
	
END

/*
[API_SP_uspGet_MessageCenter] 42723 , 'AND isRead=0'
EXEC API_SP_uspGet_MessageCenter 42723,''

*/
GO

/****** Object:  StoredProcedure [dbo].[API_SP_uspGet_MessageCenter_paging]    Script Date: 2/8/2018 5:46:15 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_uspGet_MessageCenter_paging] 
 @loggedinEmpId INT,
 @where NVARCHAR(MAX)= '  ',
 @pageNum INT,
 @pageSize INT
AS
BEGIN

DECLARE @SQLQuery AS NVARCHAR(MAX)
	SET @where =' 1=1  ' +@where	
	SET @SQLQuery =' CREATE TABLE #tempMessage(message_Id int null, parentmessage_id int null)

		INSERT INTO #tempMessage(message_Id,parentmessage_id)
		SELECT MAX(message_Id),parentmessage_id 
		FROM messagecenter WHERE (Created_By = '+CONVERT(VARCHAR(150),@loggedinEmpId)+' or Recipient_Id = '+CONVERT(VARCHAR(150),@loggedinEmpId)+') 
		AND parentmessage_id is not null 
		GROUP BY parentmessage_id

		INSERT INTO #tempMessage(message_Id,parentmessage_id)
		SELECT message_Id,parentmessage_id 
		FROM messagecenter 
		WHERE (Created_By = '+CONVERT(VARCHAR(150),@loggedinEmpId)+' or Recipient_Id ='+CONVERT(VARCHAR(150),@loggedinEmpId)+') 
		AND parentmessage_id is null 
		AND message_Id NOT IN (SELECT parentmessage_id FROM #tempMessage)

		
		DECLARE @TotalCount INT = (
			SELECT COUNT(*) totalCount FROM messagecenter MC 
			INNER JOIN #tempMessage SP on MC.message_Id = SP.message_Id
			INNER JOIN MessageCenterActivity MCA on MC.message_Id = MCA.message_id AND MCA.EmployeeDetails_Id = '+CONVERT(VARCHAR(150),@loggedinEmpId)+' 
			INNER JOIN EmployeeDetails ED ON ED.EmployeeDetails_Id = MC.Created_By 
			WHERE '+ @where+' 
		)
		SELECT @TotalCount totalCount

		DECLARE @CurrentPage INT =  [dbo].API_FN_GetPageCount(@TotalCount,'+CONVERT(VARCHAR(50),@pageSize)+','+CONVERT(VARCHAR(50),@pageNum)+')
		SELECT @CurrentPage currentPage


		SELECT MC.Message_Id messageId, MC.ParentMessage_Id parentMessageId, CONCAT(ED.First_Name ,'' '', ED.Last_Name) senderName, MC.Subject subject, MC.MessageBody messageBody, 
		MSTYPE.KeyName AS messageType, MC.TypeRef_Id typeRefId, MC.Recipient_Id employeeDetailsId, MC.Created_By createdBy, MC.Created_Date createdDate, MCA.IsRead isRead, MCA.IsFlag isFlag, 
		MCA.IsPriority isPriority, MCA.IsArchive isArchive, MCA.IsRecipient isRecipient,
		(CASE MessageType 
			WHEN 6002 THEN (SELECT CJM_JOB_TITLE +'' (''+CAST(CJM_JOB_ID AS VARCHAR(50))+'')''  FROM CLIENT_JOB_MASTER WHERE CJM_JOB_ID=TypeRef_Id)
			WHEN 6001 THEN (SELECT Project_Description  FROM ProjectDetails (NOLOCK) WHERE ProjectDetail_Id=TypeRef_Id)
			ELSE (SELECT First_Name+'' ''+Last_Name  FROM EmployeeDetails (NOLOCK) WHERE EmployeeDetails_Id=TypeRef_Id)
		END)typeRef,
		(SELECT COUNT(Message_Id) FROM MessageCenter RMS (NOLOCK) WHERE (RMS.Recipient_Id= '+CONVERT(VARCHAR(150),@loggedinEmpId)+' OR RMS.Created_By= '+CONVERT(VARCHAR(150),@loggedinEmpId)+') 
		AND RMS.ParentMessage_Id IS NOT NULL AND RMS.ParentMessage_Id=MC.ParentMessage_Id) replyCount
		FROM messagecenter MC 
		INNER JOIN #tempMessage SP on MC.message_Id = SP.message_Id
		INNER JOIN MessageCenterActivity MCA on MC.message_Id = MCA.message_id AND MCA.EmployeeDetails_Id = '+CONVERT(VARCHAR(150),@loggedinEmpId)+' 
		INNER JOIN EmployeeDetails ED ON ED.EmployeeDetails_Id = MC.Created_By
		LEFT JOIN APP_REF_DATA MSTYPE ON MC.MessageType = MSTYPE.KeyId AND MSTYPE.KeyId <> 0
		WHERE '+ @where+' 
		ORDER BY MC.Message_Id DESC
		OFFSET '+CONVERT(VARCHAR(50),@pageSize)+'*(@CurrentPage - 1) ROWS  FETCH NEXT '+CONVERT(VARCHAR(50),@pageSize)+' ROWS ONLY OPTION (RECOMPILE)

		--UPDATE MessageCenterActivity set IsRead=1 WHERE Message_Id in (SELECT parentmessage_id FROM #tempMessage)

		DROP TABLE #tempMessage'

	print @SQLQuery
	EXEC(@SQLQuery)
	
END

/*
[API_SP_uspGet_MessageCenter] 42723 , 'AND isRead=0'
EXEC API_SP_uspGet_MessageCenter 42723,''

[API_SP_uspGet_MessageCenter_paging] 57883, '  ',1,10



*/
GO

/****** Object:  StoredProcedure [dbo].[API_SP_uspGet_MessageCenterDetails]    Script Date: 2/8/2018 5:46:16 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_uspGet_MessageCenterDetails] 
 @messageId INT,
 @loggedinEmpId INT
AS
BEGIN

	CREATE TABLE #tempMessageDtl(message_Id int null, parentmessage_id int null)
	INSERT INTO #tempMessageDtl(message_Id, parentmessage_id)
	SELECT Message_Id, ParentMessage_Id from MessageCenter where ParentMessage_Id = (
		SELECT ParentMessage_Id from MessageCenter where Message_Id = @messageId
	)
	UNION
	SELECT Message_Id, ParentMessage_Id from MessageCenter where Message_Id = (
		SELECT ParentMessage_Id from MessageCenter where Message_Id = @messageId
	)
	UNION
	SELECT Message_Id, ParentMessage_Id from MessageCenter where Message_Id = @messageId

	SELECT MC.Message_Id messageId, MC.ParentMessage_Id parentMessageId, CONCAT(ED.First_Name ,' ', ED.Last_Name) senderName, MC.Subject subject, MC.MessageBody messageBody, 
	MSTYPE.KeyName messageType, MC.TypeRef_Id typeRefId, MC.Recipient_Id employeeDetailsId, MC.Created_By createdBy, MC.Created_Date createdDate, MCA.IsRead isRead, MCA.IsFlag isFlag, 
	MCA.IsPriority isPriority, MCA.IsArchive isArchive, MCA.IsRecipient isRecipient,
	(CASE MessageType 
		WHEN 6002 THEN (SELECT CJM_JOB_TITLE + (CAST(CJM_JOB_ID AS VARCHAR(50)))  FROM CLIENT_JOB_MASTER WHERE CJM_JOB_ID=TypeRef_Id)
		WHEN 6001 THEN (SELECT Project_Description  FROM ProjectDetails (NOLOCK) WHERE ProjectDetail_Id=TypeRef_Id)
		ELSE (SELECT First_Name+' '+Last_Name  FROM EmployeeDetails (NOLOCK) WHERE EmployeeDetails_Id=TypeRef_Id)
	END)typeRef
	FROM MessageCenter MC 
	INNER JOIN #tempMessageDtl SP on MC.message_Id = SP.message_Id
	INNER JOIN MessageCenterActivity MCA on MC.message_Id = MCA.message_id AND MCA.EmployeeDetails_Id = @loggedinEmpId
	INNER JOIN EmployeeDetails ED ON ED.EmployeeDetails_Id = MC.Created_By
	LEFT JOIN APP_REF_DATA MSTYPE ON MC.MessageType = MSTYPE.KeyId AND MSTYPE.KeyId <> 0
	ORDER BY MC.Message_Id DESC

	-- Mark Message and its old threads as read
	UPDATE MessageCenterActivity set IsRead = 1 WHERE Message_Id in (SELECT message_id FROM #tempMessageDtl) AND EmployeeDetails_Id = @loggedinEmpId

	DROP TABLE #tempMessageDtl
END

/*
[API_SP_uspGet_MessageCenterDetails] 8257, 42723 
select * from #tempMessageDtl
*/
GO

/****** Object:  StoredProcedure [dbo].[API_SP_uspGet_MessageCenterThread]    Script Date: 2/8/2018 5:46:17 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_uspGet_MessageCenterThread] 
 @messageId INT
AS
BEGIN

	CREATE TABLE #tempMessages(message_Id int null, parentmessage_id int null)
	INSERT INTO #tempMessages(message_Id, parentmessage_id)
	SELECT Message_Id, ParentMessage_Id from MessageCenter where ParentMessage_Id = (
		SELECT ParentMessage_Id from MessageCenter where Message_Id = @messageId
	)
	UNION
	SELECT Message_Id, ParentMessage_Id from MessageCenter where Message_Id = (
		SELECT ParentMessage_Id from MessageCenter where Message_Id = @messageId
	)
	UNION
	SELECT Message_Id, ParentMessage_Id from MessageCenter where Message_Id = @messageId

	SELECT message_id FROM #tempMessages
	--UPDATE MessageCenterActivity set IsRead = 1 WHERE Message_Id in (SELECT message_id FROM ##tempMessages) AND EmployeeDetails_Id = @loggedinEmpId

	DROP TABLE #tempMessages
END

/*
[API_SP_uspGet_MessageCenterThread] 8256

*/
GO

/****** Object:  StoredProcedure [dbo].[API_SP_uspGetSupportContacts]    Script Date: 2/8/2018 5:46:19 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_uspGetSupportContacts]
 @contactAppId  INT,
 @emailAppId INT
 
AS
BEGIN

	SELECT keyname as 'key', Keyvalue as 'Value', (case when Isnull(displayFlag,0) = 1 then 'y' else 'n' end) as 'Default'  from KeyValueData
	WHERE KeyType_AppRefID = @contactAppId and status = 1
	ORDER BY OrderBy, KeyName

	SELECT keyname as 'key', Keyvalue as 'Value', (case when Isnull(displayFlag,0) = 1 then 'y' else 'n' end) as 'Default'  from KeyValueData
	WHERE KeyType_AppRefID = @emailAppId and status = 1
	ORDER BY OrderBy, KeyName
END
 


/******===========================================================================================================================================================******/

GO

/****** Object:  StoredProcedure [dbo].[API_SP_uspMessage_GetMessageCenter]    Script Date: 2/8/2018 5:46:20 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

/*
select * from MessageCenter
exec [MVC_uspMessage_GetMessageCenter] 71,'  EmployeeDetails_Id= ''17084'' '--  AND Charindex(cast(MessageType as varchar(8000)), ''6002, 6003'') > 0 '
*/
CREATE PROCEDURE [dbo].[API_SP_uspMessage_GetMessageCenter] 
(
@loggedinEmpId INT,
@where NVARCHAR(MAX)= ' 1=1 '
)
AS
BEGIN
	DECLARE @sqlQuery  NVARCHAR(MAX);



	SET @sqlQuery= 'SELECT DISTINCT  parentmessage_id INTO #tempParentId FROM MessageCenter (NOLOCK) WHERE '+@where+'
				;WITH CTE_FilteredAction_Messages AS (
					SELECT * FROM  MessageCenter (NOLOCK) WHERE '+@where+'
					UNION
					SELECT * FROM MessageCenter (NOLOCK) WHERE 
					 (EmployeeDetails_Id='+CONVERT(VARCHAR(150),@loggedinEmpId)+' OR Created_By='+CONVERT(VARCHAR(150),@loggedinEmpId)+ ' ) 
					 AND MessageCenter.parentmessage_id IN (SELECT parentmessage_id FROM #tempParentId) 
					 OR( MessageCenter.message_id IN (SELECT parentmessage_id FROM #tempParentId)) AND	'+@where+'				 
				)

				SELECT *  INTO #tFilteredMessages FROM CTE_FilteredAction_Messages					
	'

	SET @sqlQuery = @sqlQuery+ 'CREATE TABLE #tMessageCenter(
				   [Message_Id] [INT] NULL,
				   [ParentMessage_Id] [INT] NULL,
				   [Subject] [VARCHAR](500) NULL,
				   [MessageBody] [VARCHAR](MAX) NULL,
				   [MessageType] [INT] NULL,
				   [TypeRef_Id] [INT] NULL,
				   [IsRead] [BIT] NULL,
				   [IsFlag] [BIT] NULL,
				   [IsPriority] [BIT] NULL,
				   [IsArchive] [BIT] NULL,
				   [Created_By] [INT] NULL,
				   [Created_Date] [DATETIME] NULL,
				   [EmployeeDetails_Id] [INT] NULL )
 
				CREATE TABLE #t (id INT IDENTITY(1, 1) NOT NULL, ParnetId INT )
				INSERT INTO #t SELECT DISTINCT ParentMessage_Id FROM #tFilteredMessages WHERE ParentMessage_Id IS NOT NULL AND ParentMessage_Id > 0 AND (EmployeeDetails_Id='+CONVERT(VARCHAR(150),@loggedinEmpId)+' OR Created_By='+CONVERT(VARCHAR(150),@loggedinEmpId)+ ')
 
				DECLARE @iCount INT  = (SELECT COUNT(*) FROM #t)
				DECLARE @I INT=1;
				START:                  
					   ;WITH tblCTE AS
					   (
							  SELECT * FROM #tFilteredMessages WHERE Message_Id IN (SELECT ParnetId FROM #t WHERE id = @I)
							  UNION ALL
							  SELECT MC.* FROM #tFilteredMessages MC
							  INNER JOIN tblCTE tblChild  ON MC.ParentMessage_Id = tblChild.Message_Id
					   )
					   INSERT INTO #tMessageCenter (Message_Id, ParentMessage_Id, Subject,  MessageBody, MessageType, TypeRef_Id, IsRead, IsFlag, IsPriority, IsArchive, Created_By, Created_Date, EmployeeDetails_Id)
					   SELECT TOP 1 Message_Id, ParentMessage_Id, Subject,    MessageBody, MessageType, TypeRef_Id, IsRead, IsFlag, IsPriority, IsArchive, Created_By, Created_Date, EmployeeDetails_Id
					   FROM tblCTE ORDER BY 1 DESC
				  SET @I+=1;
				IF NOT(@I > @iCount) GOTO START'

SET @sqlQuery =	@sqlQuery+ ' ;WITH CTEMessages AS
				(
					SELECT * FROM #tFilteredMessages WHERE ParentMessage_Id IS NULL AND Message_Id NOT IN (SELECT ISNULL(ParentMessage_Id, -1) FROM #tFilteredMessages) AND ( EmployeeDetails_Id='+CONVERT(VARCHAR(150),@loggedinEmpId)+' OR Created_By='+CONVERT(VARCHAR(150),@loggedinEmpId)+ ')
					UNION
					SELECT * FROM #tMessageCenter								
				)	'

SET @sqlQuery =	@sqlQuery+ 'SELECT 
				Message_Id 
				,ParentMessage_Id parentMessageId
				,Subject subject
				,MessageBody messageBody
				,concat(ED.First_Name,'' '', ED.Last_Name) as senderName
				,MessageType messageTypeId
				,MSTYPE.KeyName messageType
				,TypeRef_Id 
				,(CASE MessageType 
					WHEN 6002 THEN (SELECT CJM_JOB_TITLE +'' (''+CAST(CJM_JOB_ID AS VARCHAR(50))+'')''  FROM CLIENT_JOB_MASTER WHERE CJM_JOB_ID=TypeRef_Id)
					WHEN 6001 THEN (SELECT Project_Description  FROM ProjectDetails (NOLOCK) WHERE ProjectDetail_Id=TypeRef_Id)
					ELSE (SELECT First_Name+'' ''+Last_Name  FROM EmployeeDetails (NOLOCK) WHERE EmployeeDetails_Id=TypeRef_Id)
				END)TypeRef
				,IsRead isRead
				,IsFlag isFlag
				,IsPriority isPriority
				,IsArchive isArchive
				,MS.Created_By createdBy
				,MS.Created_Date createdDate
				,MS.EmployeeDetails_Id employeeDetailsId
				,(SELECT COUNT(Message_Id) FROM MessageCenter RMS (NOLOCK) WHERE (RMS.EmployeeDetails_Id= '+CONVERT(VARCHAR(150),@loggedinEmpId)+' OR RMS.Created_By= '+CONVERT(VARCHAR(150),@loggedinEmpId)+') AND RMS.ParentMessage_Id IS NOT NULL AND RMS.ParentMessage_Id=MS.ParentMessage_Id) replyCount
				into #MessagesTemp
				FROM CTEMessages MS
				LEFT JOIN APP_REF_DATA MSTYPE ON MS.MessageType = MSTYPE.KeyId AND MSTYPE.KeyId <> 0
				LEFT JOIN EmployeeDetails ED ON MS.Created_By = ED.EmployeeDetails_Id
				ORDER BY Message_Id DESC 
				'
--SET @sqlQuery =	@sqlQuery+ ' UPDATE MS SET IsRead = 1 FROM MessageCenter MS INNER JOIN  #MessagesTemp TEMP ON MS.Message_Id = TEMP.Message_Id '

SET @sqlQuery =	@sqlQuery+ ' SELECT * FROM  #MessagesTemp '

SET @sqlQuery =	@sqlQuery+ 'DROP TABLE  #tempParentId
				DROP TABLE #tFilteredMessages
				DROP TABLE #tMessageCenter
				DROP TABLE #t
				DROP TABLE #MessagesTemp '
/*
SET @sqlQuery =	@sqlQuery+ 'SELECT DISTINCT 
				(SELECT COUNT(Message_Id) FROM MessageCenter (NOLOCK) WHERE EmployeeDetails_Id= '+CONVERT(VARCHAR(150),@loggedinEmpId)+') TotalMessageCount
				,(SELECT COUNT(IsRead)  FROM MessageCenter (NOLOCK) WHERE EmployeeDetails_Id= '+CONVERT(VARCHAR(150),@loggedinEmpId)+' AND IsRead=0) UnReadMessageCount
				,(SELECT COUNT(IsFlag)  FROM MessageCenter (NOLOCK) WHERE EmployeeDetails_Id= '+CONVERT(VARCHAR(150),@loggedinEmpId)+' AND IsFlag=1 AND IsRead=0) FlaggedMessageCount
				,(SELECT COUNT(IsArchive)  FROM MessageCenter (NOLOCK) WHERE EmployeeDetails_Id= '+CONVERT(VARCHAR(150),@loggedinEmpId)+' AND IsArchive=1 AND IsRead=0) ArchiveMessageCount
				FROM MessageCenter (NOLOCK)
	'
	*/

	PRINT(@sqlQuery)
	EXEC(@sqlQuery)
END





GO

/****** Object:  StoredProcedure [dbo].[API_SP_uspMessage_GetMessageCenterReplyList]    Script Date: 2/8/2018 5:46:21 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

/*
[MVC_uspMessage_GetMessageCenterReplyList] 1,5,71,43,1
[MVC_uspMessage_GetMessageCenterReplyList] 2,5,71,43,1
*/
CREATE PROCEDURE [dbo].[API_SP_uspMessage_GetMessageCenterReplyList]	
	@loggedinEmpId INT,
	@Message_Id INT,
	@ParentMessage_Id INT,
	@PageIndex INT = 1,
    @PageSize INT = 20
As
BEGIN 

	DECLARE @PageCount int

	;WITH tblCTE AS
       (
              SELECT * FROM MessageCenter (NOLOCK) WHERE Message_Id = @ParentMessage_Id
              UNION ALL
              SELECT MC.* FROM MessageCenter MC (NOLOCK)
              INNER JOIN tblCTE tblChild  ON MC.ParentMessage_Id = tblChild.Message_Id
       )
		SELECT 
			ROW_NUMBER() OVER(ORDER BY MS.Message_Id DESC) AS rowNumber
			,MS.Message_Id
			,ParentMessage_Id parentMessageId
			,Subject subject
			,MessageBody messageBody
			,MessageType messageTypeId
			,MSTYPE.KeyName messageType
			,TypeRef_Id
			,(CASE MessageType 
				WHEN 6002 THEN (SELECT CJM_JOB_TITLE +' ('+CAST(CJM_JOB_ID AS VARCHAR(50))+')'  FROM CLIENT_JOB_MASTER WHERE CJM_JOB_ID=TypeRef_Id)
				WHEN 6001 THEN (SELECT Project_Description  FROM ProjectDetails (NOLOCK) WHERE ProjectDetail_Id=TypeRef_Id)
				ELSE (SELECT First_Name+' '+Last_Name  FROM EmployeeDetails (NOLOCK) WHERE EmployeeDetails_Id=TypeRef_Id)
			END)TypeRef
			,IsRead isRead
			,IsFlag isFlag
			,IsPriority isPriority
			,IsArchive isArchive
			,Created_By createdBy
			,Created_Date createdDate
			,Recipient_Id employeeDetailsId
			into #Temp
		 FROM tblCTE MS
		 JOIN APP_REF_DATA MSTYPE (NOLOCK) ON MS.MessageType =MSTYPE.KeyId
		 JOIN MessageCenterActivity MCA ON MS.Message_Id = MCA.Message_Id ANd MCA.Employeedetails_Id = @loggedinEmpId
		 --WHERE  Message_Id != @Message_Id
	ORDER BY 1 DESC

		DECLARE @RecordCount INT
		SELECT @RecordCount = COUNT(*) FROM #Temp
 
		SET @PageCount = CEILING(CAST(@RecordCount AS DECIMAL(10, 2)) / CAST(@PageSize AS DECIMAL(10, 2)))
		PRINT @PageCount
         
		 
		UPDATE MS SET IsRead = 1 FROM MessageCenter MS INNER JOIN  #Temp TEMP ON MS.Message_Id = TEMP.Message_Id 
		   
		SELECT * FROM #Temp
		WHERE RowNumber BETWEEN(@PageIndex -1) * @PageSize + 1 AND(((@PageIndex -1) * @PageSize + 1) + @PageSize) - 1
		ORDER BY MS.Message_Id DESC
     
		DROP TABLE #Temp
		/*
	SELECT DISTINCT 
	(SELECT COUNT(Message_Id) FROM MessageCenter (NOLOCK) WHERE EmployeeDetails_Id= @loggedinEmpId) TotalMessageCount
    ,(SELECT COUNT(IsRead)  FROM MessageCenter (NOLOCK) WHERE EmployeeDetails_Id=@loggedinEmpId AND IsRead=0) UnReadMessageCount
	,(SELECT COUNT(IsFlag)  FROM MessageCenter (NOLOCK) WHERE EmployeeDetails_Id=@loggedinEmpId AND IsFlag=1 AND IsRead=0) FlaggedMessageCount
	,(SELECT COUNT(IsArchive)  FROM MessageCenter (NOLOCK) WHERE EmployeeDetails_Id= @loggedinEmpId AND IsArchive=1 AND IsRead=0) ArchiveMessageCount
	FROM MessageCenter
	*/
END



GO

/****** Object:  StoredProcedure [dbo].[API_SP_uspSupportContacts]    Script Date: 2/8/2018 5:46:22 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[API_SP_uspSupportContacts]
 @appId  INT 
AS
BEGIN
	SELECT '1' as employeeOnly, keyname as 'key', Keyvalue as 'value', (case when Isnull(displayFlag,0) = 1 then 'y' else 'n' end) as 'default'  
	FROM KeyValueData
	WHERE KeyType_AppRefID = @appId and status = 1
	ORDER BY OrderBy, KeyName
END
 


/******===========================================================================================================================================================******/

--[API_SP_uspGetSupportContacts] 9151, 9152
GO

/****** Object:  StoredProcedure [dbo].[API_spLegalGetNews]    Script Date: 2/8/2018 5:46:23 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

Create PROCEDURE [dbo].[API_spLegalGetNews]  
(   
	@intFromNo Int,
	@intToNo Int
)    
AS  
BEGIN

	Declare @intTotal INT
	Declare @isRemain INT = 0
    
	Select * into #Temp From (
	Select Row_Number() Over(Order By cast(NewsDate as datetime) Desc) SrNo,  NewsID, NewsName, Convert(varchar(10), NewsDate,101) NewsDate , NewsDetails, MoreDetails, Active, NEWSCATEGORY, NewsType  
	FROM News where Active = 'Y' And NewsType = 2 and NEWSCATEGORY in (1,2) ) T

	Select @intTotal = Count(*) From #Temp
	if(@intToNo < @intTotal)
	Set @isRemain = 1

	Select * from #Temp
	Where SrNo >= @intFromNo And SrNo <= @intToNo
	ORDER  BY cast(NewsDate as datetime) DESC

	Select @isRemain
END

GO

