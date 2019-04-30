/******===========================================================================================================================================================******/
GO


GO
/****** Object:  StoredProcedure [dbo].[API_SP_AddImmigrationApplication]    Script Date: 9/11/2017 5:59:44 PM ******/
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
		,ModifiedDate
	  )
	  VALUES(
		 @EmployeeDetail_id
		,@FIRST_NAME
		,@LAST_NAME
		--,(CASE  @APP_FOR WHEN 'SELF' THEN (select First_Name from EmployeeDetails where EmployeeDetails_Id=@EmployeeDetail_id)  ELSE @FIRST_NAME END)
		--,(CASE @APP_FOR WHEN 'SELF' THEN (select Last_Name from EmployeeDetails where EmployeeDetails_Id=@EmployeeDetail_id)  ELSE @LAST_NAME END)
		,@APP_EMAIL
		,@HOME_PHONE 
		,@APP_FOR_ID
		--,(select KeyID from APP_REF_DATA where KeyName=@APP_FOR)
		,@APP_PRIORITY 
		,@APP_TYPE 
		,'PENDG'
		,@CURRENT_STATUS 
		,@APP_COMMENT 
		,@SkillCategoryId
		,@EmployeeDetail_id
		,GETDATE()
		,@EmployeeDetail_id
		,GETDATE()
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
GO
/******===========================================================================================================================================================******/

GO
/****** Object:  StoredProcedure [dbo].[API_SP_AddLegalDocuments]    Script Date: 9/11/2017 5:59:44 PM ******/
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

SET @LEGALDOCID =((SELECT MAX(LEGALDOCID) FROM LEGALDOC)+1)
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
 )
END

---update data in VISACHECKLISTDETAILS table

UPDATE VISACHECKLISTDETAILS
 SET LEGALDOCID=@LEGALDOCID
 WHERE CHECKLISTID=@CHECKLISTID


/*
select * from LEGALDOC
select * from VISACHECKLISTDETAILS
*/
GO
/******===========================================================================================================================================================******/

GO
/****** Object:  StoredProcedure [dbo].[API_SP_Candidate_Active_Job_List]    Script Date: 9/11/2017 5:59:44 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[API_SP_Candidate_Active_Job_List] 
@Resume_Id INT
AS
BEGIN
 
	SELECT cjm.CJM_JOB_ID AS cjmJobId, CJM_JOB_TITLE AS	cjmJobTitle, cjm.CJM_CLIENT_NAME AS cjmClientName, cjm.CJM_POSTING_DATE AS cjmPostingDate, JR.JR_STATUS_ID as jobStatusId, ism.STATUS_DESC as jobStatus
	FROM Resume_Master rm 
	JOIN Job_Resume JR ON JR.CandidateResume_Id = RM.Resume_Id
	JOIN CLIENT_JOB_MASTER cjm ON JR.CJM_JOB_ID = cjm.CJM_JOB_ID
	JOIN INTERVIEW_STATUS_MASTER ism ON JR.JR_STATUS_ID = ism.STATUS_ID
	WHERE rm.Resume_Id = @Resume_Id AND JR.JR_STATUS_ID not in (4, 14, 16, 17, 24)

END
GO
/******===========================================================================================================================================================******/

GO
/****** Object:  StoredProcedure [dbo].[API_SP_CheckOldPassword]    Script Date: 9/11/2017 5:59:44 PM ******/
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
	WHERE (Email_Id=@Login AND Password=@Password) OR (PJEmployee_Id=@Login  AND Password=@Password)
END
GO
/******===========================================================================================================================================================******/

GO
/****** Object:  StoredProcedure [dbo].[API_SP_CheckTimesheet]    Script Date: 9/11/2017 5:59:44 PM ******/
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

GO
/****** Object:  StoredProcedure [dbo].[API_SP_DeleteLegalDocuments]    Script Date: 9/11/2017 5:59:44 PM ******/
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
/******===========================================================================================================================================================******/

GO
/****** Object:  StoredProcedure [dbo].[API_SP_GetAllApplicationDocListByLegalAppId]    Script Date: 9/11/2017 5:59:44 PM ******/
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
	WHERE Charindex(','+cast(vcl.LEGALAPPID as varchar(8000))+',', @Ids) >= 0 order by CHECKLISTID DESC
END

GO
/******===========================================================================================================================================================******/

GO
/****** Object:  StoredProcedure [dbo].[API_SP_GetAllTimeCardDocumentsByDateRange]    Script Date: 9/11/2017 5:59:44 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[API_SP_GetAllTimeCardDocumentsByDateRange] --1112,2017
@EmployeeDetails_Id INT,
@StartDate DATETIME,
@EndDate DATETIME,
@ProjectDetailId INT =NULL
AS
BEGIN


IF(@ProjectDetailId IS NOT NULL)
BEGIN
	SELECT DISTINCT TotalTimeSheetHrs AS totalTimeSheetHrs
	,UploadedTimeSheet_Id AS uploadedTimeSheetId
	,UploadedTimesheetName AS uploadedTimesheetName
	,UploadedTimeSheetLocation AS uploadedTimeSheetLocation
	,TSFromDate AS tsFromDate
	,TSToDate AS tsToDate
	,TotalTimeSheetHrs AS totalTimeSheetHrs
	,IUCT.Created_Date AS createdDate
	,PP.ProjectId AS projectId
	,PP.ProjectTitle AS projectTitle
	FROM Invoice_ClientTimeSheet ICT
	JOIN Invoice_UploadedClientTimeSheets IUCT on ICT.TSUpload_ID =IUCT.TSUpload_Id
	JOIN ProjectDetails DTL on ICT.ProjectID = DTL.ProjectDetail_Id
	JOIN ProjectProfile PP on DTL.ProjectDetail_Id = PP.ProjectId
	WHERE EmployeeID=@EmployeeDetails_Id 
	 AND ICT.ProjectID=@ProjectdetailId
	 AND CAST(TSFromDate AS DATE)>= CAST(@StartDate AS DATE) 
	 AND CAST(TSToDate AS DATE) <= CAST(@EndDate AS DATE)

END
ELSE
BEGIN
	SELECT DISTINCT TotalTimeSheetHrs AS totalTimeSheetHrs
	,UploadedTimeSheet_Id AS uploadedTimeSheetId
	,UploadedTimesheetName AS uploadedTimesheetName
	,UploadedTimeSheetLocation AS uploadedTimeSheetLocation
	,TSFromDate AS tsFromDate
	,TSToDate AS tsToDate
	,TotalTimeSheetHrs AS totalTimeSheetHrs
	,IUCT.Created_Date AS createdDate
	,PP.ProjectId AS projectId
	,PP.ProjectTitle AS projectTitle
	FROM Invoice_ClientTimeSheet ICT
	JOIN Invoice_UploadedClientTimeSheets IUCT on ICT.TSUpload_ID =IUCT.TSUpload_Id
	JOIN ProjectDetails DTL on ICT.ProjectID = DTL.ProjectDetail_Id
	JOIN ProjectProfile PP on DTL.ProjectDetail_Id = PP.ProjectId
	WHERE EmployeeID=@EmployeeDetails_Id 	
	 AND CAST(TSFromDate AS DATE)>= CAST(@StartDate AS DATE) 
	 AND CAST(TSToDate AS DATE) <= CAST(@EndDate AS DATE)
	 END
END

/*
Select * from [dbo].[Invoice_UploadedClientTimeSheets]
select * from Invoice_ClientTimeSheet
update Invoice_ClientTimeSheet set EmployeeID=1112
*/

GO
/******===========================================================================================================================================================******/

GO
/****** Object:  StoredProcedure [dbo].[API_SP_GetAllTimeCardListByEmployeeId]    Script Date: 9/11/2017 5:59:44 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[API_SP_GetAllTimeCardListByEmployeeId] --1112,2017
@EmployeeDetails_Id INT,
@Year INT
AS
BEGIN
	-- Define the CTE expression name and column list.
	WITH TimeSheet_CTE (year,month,monthYear, weekEndingDate, tsEntryId,totalHours,statusIdStatus)
	AS
	-- Define the CTE query.
	(
		SELECT DISTINCT 	
		YEAR( PW.we_date) year
		,MONTH( PW.we_date) month
		,(Convert(char(3), PW.we_date, 0))+char(39)+ CAST((YEAR(PW.we_date) % 100) as CHAR(2)) monthYear	
		,PW.we_date weekEndingDate
		,TED.TSEntery_ID tsEntryId
		,ISNULL(TES.TotalHrs,0) totalHours
		,(SELECT [dbo].API_FN_GetTimecardStatusByTsEntryIdAndEmployeeId(@EmployeeDetails_Id,TES.TSEntery_ID))  AS statusIdStatus 
		FROM PJWEEK PW
		LEFT JOIN Invoice_TimesheetEntrySummary TES on CAST(TES.WeekEnd_Date AS DATE) = CAST(PW.we_date AS DATE)
		LEFT JOIN Invoice_TimeSheetEntryDetails TED on TED.TSEntery_ID = TES.TSEntery_ID	
		WHERE (TES.EmployeeID=@EmployeeDetails_Id OR TES.EmployeeID IS NULL)
		AND Year(PW.we_date)=@Year
	)
	-- Define the outer query referencing the CTE name.

	SELECT year,month,monthYear, weekEndingDate, tsEntryId,totalHours,statusIdStatus
	FROM TimeSheet_CTE
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
/******===========================================================================================================================================================******/

GO
/****** Object:  StoredProcedure [dbo].[API_SP_GetAllTimeCardWeekEndingDatesByDateRange]    Script Date: 9/11/2017 5:59:44 PM ******/
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
/******===========================================================================================================================================================******/
GO



GO
/****** Object:  StoredProcedure [dbo].[API_SP_GetApplicationDocListByLegalAppId]    Script Date: 9/11/2017 6:10:36 PM ******/
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
	FROM VISACHECKLISTDETAILS vcl
	LEFT JOIN LEGALDOC ld on vcl.LEGALDOCID=ld.LEGALDOCID
	LEFT JOIN LEGALAPPCHECKLIST lacl on vcl.DOCUMENTID=lacl.DOCUMENTID
	LEFT JOIN LegalRequest lr on vcl.LEGALAPPID=lr.LEGALAPPID
	WHERE vcl.LEGALAPPID=@LEGALAPPID AND lr.EmployeeDetail_id=@EmployeeDetail_Id order by CHECKLISTID DESC
END

/******===========================================================================================================================================================******/
GO

GO
/****** Object:  StoredProcedure [dbo].[API_SP_GetCandidateAchievementByEmployeeDetId]    Script Date: 9/11/2017 6:11:34 PM ******/
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
GO
/****** Object:  StoredProcedure [dbo].[API_SP_GetCertificationByEmployeeDetId]    Script Date: 9/11/2017 6:14:43 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[API_SP_GetCertificationByEmployeeDetId] 
 @EmployeeDetails_Id  int

AS
BEGIN
	SELECT EmpCertificationDetails_Id empCertificationDetailsId
	,CertificateExam_Name certificateExamName
	--,Institution_Name issuedBy
	--,ExpiryRenewal_Date expiryRenewalDate 
	FROM EmployeeCertificationDetails	
    WHERE EmployeeDetails_Id=@EmployeeDetails_Id
END

/******===========================================================================================================================================================******/
GO
GO
/****** Object:  StoredProcedure [dbo].[API_SP_GetDocumentByWeekDay]    Script Date: 9/11/2017 6:14:57 PM ******/
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
GO
/****** Object:  StoredProcedure [dbo].[API_SP_GetDocumentListByApplicationType]    Script Date: 9/11/2017 6:15:10 PM ******/
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
GO
GO
/****** Object:  StoredProcedure [dbo].[API_SP_GetDocumentsByEmployeeDetId]    Script Date: 9/11/2017 6:15:21 PM ******/
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
GO
/****** Object:  StoredProcedure [dbo].[API_SP_GetEducationDetailsByEmployeeDetId]    Script Date: 9/11/2017 6:15:46 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[API_SP_GetEducationDetailsByEmployeeDetId] 
 @EmployeeDetails_Id  int

AS
BEGIN
	SELECT EmployeeEducation_Id employeeEducationId
	,Qualification qualificationId
	,data.KeyName qualification
	,Institution_Name institutionName
	,PassingYear passingYear
	FROM EmployeeEducationDetails eed
	LEFT JOIN APP_REF_DATA data on eed.Qualification=data.KeyID
	LEFT JOIN Country_Master cou on eed.Country_Id=cou.Country_Id
    WHERE EmployeeDetails_Id=@EmployeeDetails_Id
END


/*
select * from EmployeeEducationDetails

*/
/******===========================================================================================================================================================******/
GO
GO
/****** Object:  StoredProcedure [dbo].[API_SP_GetEmailTemplateByEventName]    Script Date: 9/11/2017 6:16:05 PM ******/
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

GO
/****** Object:  StoredProcedure [dbo].[API_SP_GetEmployeeBenefit]    Script Date: 9/11/2017 6:16:14 PM ******/
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

GO
/****** Object:  StoredProcedure [dbo].[API_SP_GetEmployeeProjects]    Script Date: 9/11/2017 6:16:39 PM ******/
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
 SELECT pd.ProjectDetail_Id projectDetailId
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
 END
 ELSE
 BEGIN
  SELECT pd.ProjectDetail_Id projectDetailId
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
 isNull(PD.End_Date, '12/12/9999') < getdate()  
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

GO
/****** Object:  StoredProcedure [dbo].[API_SP_GetEmployeeResumeDocumentsByEmployeeDetId]    Script Date: 9/11/2017 6:17:24 PM ******/
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
GO
/****** Object:  StoredProcedure [dbo].[API_SP_GetExpenseList]    Script Date: 9/11/2017 6:17:46 PM ******/
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
	IEE.DocumentExpenseLocation AS documentExpenseLocation,
	IEE.DocumentExpenseName AS documentExpenseName,
	IEE.DocumentExpenseLocation+IEE.DocumentExpenseName AS documentExpenseFileLocation,
	IEE.Created_Date createdDate
    FROM Invoice_ExpenseEntry IEE 
    LEFT JOIN ProjectDetails PD ON IEE.ProjectDetail_Id = PD.ProjectDetail_Id	
	LEFT JOIN ProjectProfile PP ON PP.Assignmentid = PD.Project_Id	
	LEFT JOIN APP_REF_DATA ARD ON IEE.Status = ARD.KeyID
    WHERE IEE.EmployeeDetails_Id = @EmployeeDetails_Id
END

/******===========================================================================================================================================================******/
GO
GO
/****** Object:  StoredProcedure [dbo].[API_SP_GetExperienceByEmployeeDetId]    Script Date: 9/11/2017 6:17:59 PM ******/
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
	,CEE.Position_StartDate as positionStartDate
	,CEE.Position_EndDate as positionEndDate
	,CEE.CityId as cityId
	,CM.City_Name as cityName
	,CEE.StateId as stateId
	,SM.State_Name as stateName
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
GO
/****** Object:  StoredProcedure [dbo].[API_SP_GetFormsList]    Script Date: 9/11/2017 6:18:26 PM ******/
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
 WHERE FAT.type = 'F'
 AND DEP.Dept_Name = @Dept_Name
ENd


/*
select * from employeeOtp where employeeDetails_id=21540
delete from employeeOtp where employeeDetails_id=21540
update employeeOtp set isactive=1 where employeeDetails_id=21540
*/

/******===========================================================================================================================================================******/
GO
GO
/****** Object:  StoredProcedure [dbo].[API_SP_GetImmigrationApplications]    Script Date: 9/11/2017 6:18:56 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[API_SP_GetImmigrationApplications] 
 @EmployeeDetails_Id  int

AS
BEGIN
	SELECT
	-- (CASE APP_FOR WHEN 'SELF' THEN ed.First_Name  ELSE lr.FIRSTNAME END) firstName
	--,(CASE APP_FOR WHEN 'SELF' THEN ed.Last_Name  ELSE lr.LASTNAME END) lastName	
	 FIRSTNAME as firstName	
	,LASTNAME as lastName
	,LEGALAPPID as legalAppId
    , APPLICANTID applicationId 
    --,APP_FOR appFor
    , APPForData.KeyName appFor
	, lr.APP_FOR appForId
	, LEGALAPPTYPE.APPTYPEID appTypeId	
    , APP_TYPE appType 
	, LEGALAPPTYPE.APPTYPENAME appTypeName
    , APP_PRIORITY appPriority
	,(select keyid from app_ref_data where (keyname=lr.APP_PRIORITY AND ParentId=3580))as appPriorityId
	, (CASE APP_STATUS
     WHEN 'APPRD' THEN 'Application Approved'
     WHEN 'CLSD' THEN 'Application Closed/Not Filed'
     WHEN 'FILED' THEN 'Application Filed'
     WHEN 'ATTR' THEN 'Attorney Review'
	 WHEN 'CMPLT' THEN 'Completed'
	 WHEN 'EAC' THEN 'Receipt(EAC) received'
     ELSE 'Pending'-------PENDG
  END) appStatus
    , CURRENT_STATUS currentStatus
	, ACTIVITIES_MASTER.ACTIVITY_ID currentStatusId
    , APP_EACNUM eacNumber 
     ,APP_COMMENT comments 
     ,APP_EMAIL email 
     ,HOME_PHONE contactNumber 
     ,EmployeeDetail_id employeeDetailsId 
     ,SkillCategoryId skillCategoryId 
	 ,lr.ModifiedDate modifiedDate
	FROM LegalRequest lr
	LEFT JOIN EmployeeDetails ed on lr.EmployeeDetail_id=ed.EmployeeDetails_Id
	LEFT JOIN LEGALAPPTYPE  on lr.APP_TYPE=LEGALAPPTYPE.APPTYPECODE
	LEFT JOIN APP_REF_DATA on (lr.APP_FOR=APP_REF_DATA.KeyName AND APP_REF_DATA.ParentID=3550)
	LEFT JOIN APP_REF_DATA APPForData on ( CAST(lr.APP_FOR AS VARCHAR(50))=CAST(APPForData.KeyID AS VARCHAR(50)) AND APPForData.ParentID=3550 )
	LEFT JOIN ACTIVITIES_MASTER on (lr.CURRENT_STATUS=ACTIVITIES_MASTER.ACTIVITY_NAME and ACTIVITY_TYPE = 'LS' and ACTIVITY_STATUS = 1)
    WHERE lr.EmployeeDetail_id=@EmployeeDetails_Id order by LEGALAPPID DESC
END


/******===========================================================================================================================================================******/
GO
GO
/****** Object:  StoredProcedure [dbo].[API_SP_GetImmigrationApplicationsByLegalAppId]    Script Date: 9/11/2017 6:19:08 PM ******/
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
	-- (CASE APP_FOR WHEN 'SELF' THEN ed.First_Name  ELSE lr.FIRSTNAME END) firstName
	--,(CASE APP_FOR WHEN 'SELF' THEN ed.Last_Name  ELSE lr.LASTNAME END) lastName
	 FIRSTNAME as firstName	
	,LASTNAME as lastName
	,rec.First_Name recruiterFirstName
	,rec.Last_Name recruiterLastName
	,leg.First_Name legRepFirstName
	,leg.Last_Name legRepLastName
	 ,LEGALAPPID as legalAppId
     ,APPLICANTID applicationId 
    -- ,APP_FOR appFor 
	 , APPForData.KeyName appFor
	 ,lr.APP_FOR appForId
	 ,LEGALAPPTYPE.APPTYPEID appTypeId
     ,APP_TYPE appType 
	 ,LEGALAPPTYPE.APPTYPENAME appTypeName
     ,APP_PRIORITY appPriority 
    	 ,(CASE APP_STATUS
     WHEN 'APPRD' THEN 'Application Approved'
     WHEN 'CLSD' THEN 'Application Closed/Not Filed'
     WHEN 'FILED' THEN 'Application Filed'
     WHEN 'ATTR' THEN 'Attorney Review'
	 WHEN 'CMPLT' THEN 'Completed'
	 WHEN 'EAC' THEN 'Receipt(EAC) received'
     ELSE 'Pending'-------PENDG
  END) appStatus,
     CURRENT_STATUS currentStatus ,
     APP_EACNUM eacNumber ,
     APP_COMMENT comments ,
     APP_EMAIL email ,
     HOME_PHONE contactNumber ,
     EmployeeDetail_id employeeDetailsId ,
     SkillCategoryId skillCategoryId ,
	 lr.ModifiedDate modifiedDate
	FROM LegalRequest lr
	LEFT JOIN EmployeeDetails ed on lr.EmployeeDetail_id=ed.EmployeeDetails_Id
	LEFT JOIN EmployeeDetails rec on ed.Recruiter=rec.EmployeeDetails_Id
	LEFT JOIN EmployeeDetails leg on ed.LegalRepresentative=leg.EmployeeDetails_Id
	LEFT JOIN LEGALAPPTYPE  on lr.APP_TYPE=LEGALAPPTYPE.APPTYPECODE
	LEFT JOIN APP_REF_DATA APPForData on ( CAST(lr.APP_FOR AS VARCHAR(50))=CAST(APPForData.KeyID AS VARCHAR(50)) AND APPForData.ParentID=3550 )
    WHERE lr.EmployeeDetail_id=@EmployeeDetails_Id ANd lr.LEGALAPPID=@LEGALAPPID order by LEGALAPPID DESC
END

/******===========================================================================================================================================================******/
GO

GO
/****** Object:  StoredProcedure [dbo].[API_SP_GetJobLocationAndKeyword]    Script Date: 9/11/2017 6:19:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[API_SP_GetJobLocationAndKeyword]
(
  @jobId Int  
)
AS
BEGIn
    SELECT (CASE WHEN city = '' THEN cjmJobcity ELSE city END) +', '+state as location, keywords FROM API_VIEW_GetAllJobsList WHERE cjmJobId = @jobId	  
END


/******===========================================================================================================================================================******/
GO
GO
/****** Object:  StoredProcedure [dbo].[API_SP_GetLca]    Script Date: 9/11/2017 6:19:28 PM ******/
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

GO
/****** Object:  StoredProcedure [dbo].[API_SP_GetLicenseByEmployeeDetId]    Script Date: 9/11/2017 6:19:38 PM ******/
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
GO
/****** Object:  StoredProcedure [dbo].[API_SP_GetMyReferrals]    Script Date: 9/11/2017 6:19:59 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[API_SP_GetMyReferrals]
 @employeeDetailsId INT
AS
BEGIN
 SELECT rm.Resume_Id AS resumeId, rm.First_Name AS firstName, rm.Last_Name AS lastName, rm.Email_Id AS email, Created_On AS createdOn, rm.JobSearchStatus AS jobSearchStatusId, 
arf.KeyName as JobSearchStatus,
    (
        SELECT count(*) from Job_Resume JR where JR.CandidateResume_Id = RM.Resume_Id and JR_STATUS_ID not in (4, 14, 16, 17, 24)
    ) AS activeApplications
FROM CandidateReferral as rf
JOIN Resume_Master rm ON rf.Resume_Id = rm.Resume_Id
LEFT JOIN App_ref_data arf ON rm.JobSearchStatus = arf.KeyID
WHERE rf.EmployeeDetails_Id = @employeeDetailsId
ORDER BY rf.Referral_Id DESC
ENd
/******===========================================================================================================================================================******/
GO
GO
/****** Object:  StoredProcedure [dbo].[API_SP_GetProfileLookupData]    Script Date: 9/11/2017 6:20:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[API_SP_GetProfileLookupData]
AS
BEGIN
 
    SELECT 'ASL' as KeyType, KeyID keyId,KeyName keyName,ParentID parentId from APP_REF_DATA WHERE ParentID=2600 ---------------authorizationStatusList
	SELECT 'JSSL' as KeyType,KeyID keyId,KeyName keyName,ParentID parentId from APP_REF_DATA WHERE ParentID=4750 ---------------jobSearchStatusList
	SELECT 'LTL' as KeyType,KeyID keyId,KeyName keyName,ParentID parentId from APP_REF_DATA WHERE ParentID=4800 ---------------licenseTypeList
	SELECT 'DL' as KeyType, KeyID keyId,KeyName keyName,ParentID parentId from APP_REF_DATA WHERE ParentID=2100 ---------------degreeList
	SELECT 'IV' as KeyType, KeyID keyId,KeyName keyName,ParentID parentId from APP_REF_DATA WHERE ParentID=3000 ---------------Industry Vertical list
	--SELECT 'COUNTRY' as KeyType, Country_Id countryId,Country_Code countryCode,Country_Name countryName FROM Country_Master where IsActive=1
	--SELECT 'STATE' as KeyType, State_ID stateId,State_Code stateCode,State_Name stateName,Country_Id countryId FROM State_Master where Status=1
	--SELECT 'CITY' as KeyType, City_Id cityId,Country_Id countryId,State_Id stateId,City_Name cityName FROM City_Master where Status=1
	
END

/******===========================================================================================================================================================******/
GO
GO
/****** Object:  StoredProcedure [dbo].[API_SP_GetProjectByProjectDetailId]    Script Date: 9/11/2017 6:20:50 PM ******/
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
GO
/****** Object:  StoredProcedure [dbo].[API_SP_GetSkillsByEmployeeDetId]    Script Date: 9/11/2017 6:21:31 PM ******/
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
    WHERE cs.EmployeeDetails_Id=@EmployeeDetails_Id
END


/******===========================================================================================================================================================******/
GO
GO
/****** Object:  StoredProcedure [dbo].[API_SP_GetStaticPageContent]    Script Date: 9/11/2017 6:21:49 PM ******/
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
 WHERE PageReference_Id=@PageReferenceId
ENd

/******===========================================================================================================================================================******/
GO
GO
/****** Object:  StoredProcedure [dbo].[API_SP_GetTimeCardListByTimeRange]    Script Date: 9/11/2017 6:21:58 PM ******/
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

GO
/****** Object:  StoredProcedure [dbo].[API_SP_GetUserByUserName]    Script Date: 9/11/2017 6:22:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[API_SP_GetUserByUserName] --'p@yopmail.com' ,'4321'
 @UserName  varchar(250)

AS
BEGIN
	SELECT *
	,APP_REF_DATA.KeyName EmployeeType 
	FROM EmployeeDetails
	LEFT JOIN  APP_REF_DATA on EmployeeDetails.Employee_Type = APP_REF_DATA.KeyID
    WHERE (Email_Id=@UserName COLLATE SQL_Latin1_General_CP1_CS_AS) OR (PJEmployee_Id=@UserName COLLATE SQL_Latin1_General_CP1_CS_AS)
END
/******===========================================================================================================================================================******/
GO
GO
/****** Object:  StoredProcedure [dbo].[API_SP_GetUserDashboardById]    Script Date: 9/11/2017 6:22:17 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[API_SP_GetUserDashboardById] --1015
 @EmployeeDetails_Id  INT

AS
BEGIN
SELECT DISTINCT ed.EmployeeDetails_Id employeeDetailsId
    ,ed.Recruiter recruiterId
	,IsNull(ed.PJEmployee_Id,'') employeeId	
	,ed.Employee_Type employeeTypeId
	,empTypedata.KeyName employeeType
	,IsNull(recu.First_Name,'') recFirstName
	,IsNull(recu.Last_Name,'') recLastName
	,IsNull(recu.Email_Id,'') recEmailId
	,IsNull(recu.ProfilePicture,'') recProfilePicture
	, IIF(ecd.Phone_Cell <> '(___) ___-____',ecd.Phone_Cell,'') recContactNumber
	,ed.Modified_Date modifiedDate 	

	FROM EmployeeDetails ed	
	LEFT JOIN EmployeeDetails recu on ed.Recruiter =recu.EmployeeDetails_Id	
	LEFT JOIN EmployeeContactDetails ecd on recu.EmployeeDetails_Id =ecd.EmployeeDetails_Id
	LEFT JOIN APP_REF_DATA empTypedata on ed.Employee_Type =empTypedata.KeyID	
	WHERE ed.EmployeeDetails_Id=@EmployeeDetails_Id

END



/*
select IsNull(PJEmployee_Id,'') employeeId , * from employeedetails
*/
/******===========================================================================================================================================================******/
GO
GO
/****** Object:  StoredProcedure [dbo].[API_SP_GetUserDashboardTimeCard]    Script Date: 9/11/2017 6:22:33 PM ******/
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
GO
/****** Object:  StoredProcedure [dbo].[API_SP_GetUserProfileById]    Script Date: 9/11/2017 6:23:11 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[API_SP_GetUserProfileById] --1015
 @EmployeeDetails_Id  INT

AS
BEGIN
	SELECT DISTINCT ed.EmployeeDetails_Id employeeDetailsId
	,leg.First_Name legRepFirstName
	,leg.Last_Name legRepLastName
	,IsNull(recu.First_Name,'') recruiterFirstName
	,IsNull(recu.Last_Name,'') recruiterLastName
	,ed.PJEmployee_Id employeeId
	,ed.First_Name firstName
	,ed.Last_Name lastName
	,rm.PublicProfile publicProfile
	,ed.ProfilePicture profilePicture
	,ed.Email_Id emailId
	,ed.DOB dob
	,ed.Employee_Type employeeTypeId
	,empTypedata.KeyName employeeType
	,ed.CurrentJobTitle  currentJobTitle
	,rm.Total_Exp totalExp
	,rm.TotalUSExp	totalUsExp
	,rm.Availability availabilityId
	,(SELECT [dbo].API_FN_GetAvailabilityByAvailabilityId(rm.Availability))  AS availability
	,ecd.Address1 currentLocation
	,ecd.Country countryId
	,ISNULL(cm.Country_Name,'') country
	,ecd.State stateId
	,sm.State_Name	state
	,ecd.City_Id cityId
	,cim.City_Name city	
	,ecd.Zip_Code zipCode
	,ed.LegalFilingStatus authorisationStatusId
	,authdata.KeyName authorisationStatus
	,rm.JobSearchStatus jobSearchStatusId 
	,jobdata.KeyName jobSearchStatus
	,rm.IndustryVertical industryVerticalId 
	,industryVer.KeyName industryVertical
	, IIF(ecd.Phone_Cell <> '(___) ___-____',ecd.Phone_Cell,null) contactNumber
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
	,rm.Comments  careerProfile
	,ed.LastLogin lastLogin

	--,(SELECT COUNT(*) FROM EmployeeReferenceDetails WHERE EmployeeDetails_Id=@EmployeeDetails_Id) peopleReferred
	--,(SELECT COUNT(*) FROM Job_Resume WHERE JR_RESUME_ID=rm.Resume_Id) jobsAppliedCount

	FROM EmployeeDetails ed
	LEFT JOIN EmployeeDetails leg on ed.LegalRepresentative=leg.EmployeeDetails_Id
	LEFT JOIN EmployeeDetails recu on ed.Recruiter =recu.EmployeeDetails_Id	
	LEFT JOIN Resume_Master rm on ed.EmployeeDetails_Id =rm.FromEmployeeDetails_Id
	LEFT JOIN EmployeeContactDetails ecd on ed.EmployeeDetails_Id =ecd.EmployeeDetails_Id
	LEFT JOIN Country_Master cm on ecd.Country=cm.Country_Id
	LEFT JOIN State_Master sm on ecd.State=sm.State_ID
	LEFT JOIN City_Master cim on ecd.City_Id=cim.City_Id
	LEFT JOIN APP_REF_DATA empTypedata on ed.Employee_Type =empTypedata.KeyID
	LEFT JOIN APP_REF_DATA jobdata on rm.JobSearchStatus =jobdata.KeyID
	LEFT JOIN APP_REF_DATA authdata on ed.LegalFilingStatus =authdata.KeyID
	LEFT JOIN APP_REF_DATA rateTypeData on rm.RateType =rateTypeData.KeyID
	LEFT JOIN APP_REF_DATA industryVer on rm.IndustryVertical =industryVer.KeyID
	WHERE ed.EmployeeDetails_Id=@EmployeeDetails_Id

END



/*
select * from EmployeeContactDetails
select * from EmployeeReferenceDetails
select top 200 RateType,* from Resume_Master  where FromEmployeeDetails_Id=1015
select * from Job_Resume where JR_RESUME_ID = 1
select * from app_ref_data where keyid=1101
*/


/******===========================================================================================================================================================******/
GO
GO
/****** Object:  StoredProcedure [dbo].[API_SP_Jobs_JobAlertCount]    Script Date: 9/11/2017 6:23:43 PM ******/
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
			  (@flag = 'N' AND ((RTRIM(LTRIM(cjmJobcity)) LIKE '%'+ RTRIM(LTRIM(@city))+'%'	OR RTRIM(LTRIM(city)) LIKE '%'+ RTRIM(LTRIM(@city))+'%') OR  (RTRIM(LTRIM(state)) LIKE '%'+ RTRIM(LTRIM(@state))+'%')))
			  OR (@flag = 'Y' AND ((RTRIM(LTRIM(cjmJobcity)) LIKE '%'+ RTRIM(LTRIM(@city))+'%'	OR RTRIM(LTRIM(city)) LIKE '%'+ RTRIM(LTRIM(@city))+'%') AND  (RTRIM(LTRIM(state)) LIKE '%'+ RTRIM(LTRIM(@state))+'%')))
		  )
	  )  

	SELECT @TotalCount totalCount	
END


/******===========================================================================================================================================================******/
GO
GO
/****** Object:  StoredProcedure [dbo].[API_SP_Jobs_JobAssignmentTypeAndCount]    Script Date: 9/11/2017 6:23:54 PM ******/
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

GO
/****** Object:  StoredProcedure [dbo].[API_SP_Jobs_JobCategoryAndCount]    Script Date: 9/11/2017 6:24:06 PM ******/
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
GO
/****** Object:  StoredProcedure [dbo].[API_SP_Jobs_JobCountByLocationByEmpId]    Script Date: 9/11/2017 6:24:17 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[API_SP_Jobs_JobCountByLocationByEmpId] --21543
@EmployeeDetails_Id INT
AS
BEGIN
 SELECT COUNT(CJM_JOB_ID)  localJobCount
 FROM CLIENT_JOB_MASTER WHERE CJM_Status='A' AND City_Id=(SELECT City_Id FROM employeecontactDetails WHERE EmployeeDetails_Id=@EmployeeDetails_Id) 

 SELECT COUNT(CJM_JOB_ID)  otherLocationJobCount
 FROM CLIENT_JOB_MASTER WHERE CJM_Status='A' AND City_Id <> (SELECT City_Id FROM employeecontactDetails WHERE EmployeeDetails_Id=@EmployeeDetails_Id)

END
/*
select City_Id,* from employeecontactDetails where City_Id is not null 
select count(City_Id) from CLIENT_JOB_MASTER  where  CJM_Status='A' AND City_Id is not null
select * from city_master where city_id in (79694)

*/



/******===========================================================================================================================================================******/
GO
GO
/****** Object:  StoredProcedure [dbo].[API_SP_Jobs_JobLocationAndCount]    Script Date: 9/11/2017 6:24:37 PM ******/
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

/******===========================================================================================================================================================******/
GO
GO
/****** Object:  StoredProcedure [dbo].[API_SP_Jobs_JobTypeAndCount]    Script Date: 9/11/2017 6:24:50 PM ******/
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

GO
/****** Object:  StoredProcedure [dbo].[API_SP_Jobs_ProjectType]    Script Date: 9/11/2017 6:25:01 PM ******/
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
	WHERE CJM_Status='A'
	GROUP BY  ProjectType
END

/*
select * from APP_REF_DATA where ParentID=4650
select top 10 ProjectType,* from CLIENT_JOB_MASTER 
*/
/******===========================================================================================================================================================******/
GO
GO
/****** Object:  StoredProcedure [dbo].[API_SP_Jobs_Search]    Script Date: 9/11/2017 6:25:23 PM ******/
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
  @state NVARCHAR(500)=''
)
AS
BEGIN
DECLARE @selectCountQuery AS VARCHAR(MAX)
DECLARE @selectQuery AS VARCHAR(MAX)
DECLARE @where AS VARCHAR(5000)
DECLARE @TotalCount INT
DECLARE @flag VARCHAR(1)

IF(@city = @state) SET @flag =  'N' ELSE SET @flag =  'Y'	

SET @where ='(RTRIM(LTRIM(jobTitle)) LIKE ''%'+ RTRIM(LTRIM(@searchText))+'%'' OR RTRIM(LTRIM(keywords)) LIKE ''%'+ RTRIM(LTRIM(@searchText))+'%'')
		AND 
		  (
			  ('''+ @flag+''' = ''N'' AND ((RTRIM(LTRIM(cjmJobcity)) LIKE ''%'+ RTRIM(LTRIM(@city))+'%''	OR RTRIM(LTRIM(city)) LIKE ''%'+ RTRIM(LTRIM(@city))+'%'') OR  (RTRIM(LTRIM(state)) LIKE ''%'+ RTRIM(LTRIM(@state))+'%'')))
			  OR ('''+ @flag+''' = ''Y'' AND ((RTRIM(LTRIM(cjmJobcity)) LIKE ''%'+ RTRIM(LTRIM(@city))+'%''	OR RTRIM(LTRIM(city)) LIKE ''%'+ RTRIM(LTRIM(@city))+'%'') AND  (RTRIM(LTRIM(state)) LIKE ''%'+ RTRIM(LTRIM(@state))+'%'')))
		  )'

PRINT(@where)

SET @selectCountQuery=' DECLARE @TotalCount INT = (SELECT COUNT(*) totalCount FROM API_VIEW_GetAllJobsList WHERE '+@where +')'
SET @selectCountQuery=@selectCountQuery+ ' SELECT @TotalCount totalCount'
SET @selectCountQuery=@selectCountQuery+ ' DECLARE @CurrentPage INT= [dbo].API_FN_GetPageCount(@TotalCount,'+CONVERT(VARCHAR(50),@pageSize)+','+CONVERT(VARCHAR(50),@pageCount)+') SELECT @CurrentPage currentPage'
SET @selectCountQuery=@selectCountQuery+ ' SELECT *	,(SELECT COUNT(CandidateResume_Id) FROM Job_resume WHERE CandidateResume_Id= (SELECT Resume_Id FROM Resume_Master WHERE FromEmployeeDetails_Id='+CONVERT(VARCHAR(50),@EmployeeDetails_Id)+')) applied FROM API_VIEW_GetAllJobsList WHERE '+@where
SET @selectCountQuery=@selectCountQuery+ ' ORDER BY cjmPostingDate desc OFFSET '+CONVERT(VARCHAR(50),@pageSize)+' * (@CurrentPage - 1) ROWS  FETCH NEXT '+CONVERT(VARCHAR(50),@pageSize)+' ROWS ONLY OPTION (RECOMPILE) '

PRINT(@selectCountQuery)

 EXEC (@selectCountQuery)  

END

/*
[API_SP_Jobs_Search] 0,1,30,'testfresher','Gladstone','New Jersey'
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
GO
/****** Object:  StoredProcedure [dbo].[API_SP_Jobs_Search_Back]    Script Date: 9/11/2017 6:25:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[API_SP_Jobs_Search_Back]
(
  @EmployeeDetails_Id INT=0,
  @pageCount INT=1,
  @pageSize INT=30,
  @searchText NVARCHAR(MAX)='',
  @city NVARCHAR(500)='',
  @state NVARCHAR(500)=''
)
AS
BEGIN
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
			  (@flag = 'N' AND ((RTRIM(LTRIM(cjmJobcity)) LIKE '%'+ RTRIM(LTRIM(@city))+'%'	OR RTRIM(LTRIM(city)) LIKE '%'+ RTRIM(LTRIM(@city))+'%') OR  (RTRIM(LTRIM(state)) LIKE '%'+ RTRIM(LTRIM(@state))+'%')))
			  OR (@flag = 'Y' AND ((RTRIM(LTRIM(cjmJobcity)) LIKE '%'+ RTRIM(LTRIM(@city))+'%'	OR RTRIM(LTRIM(city)) LIKE '%'+ RTRIM(LTRIM(@city))+'%') AND  (RTRIM(LTRIM(state)) LIKE '%'+ RTRIM(LTRIM(@state))+'%')))
		  )
	  )
	  

	SELECT @TotalCount totalCount

	DECLARE @CurrentPage INT= [dbo].API_FN_GetPageCount(@TotalCount,@pageSize,@pageCount) 
	SELECT @CurrentPage currentPage

	SELECT *
	,(SELECT COUNT(CandidateResume_Id) FROM Job_resume WHERE CandidateResume_Id= (SELECT Resume_Id FROM Resume_Master WHERE FromEmployeeDetails_Id=@EmployeeDetails_Id)) applied
	
	FROM API_VIEW_GetAllJobsList  
	WHERE (RTRIM(LTRIM(jobTitle)) LIKE '%'+ RTRIM(LTRIM(@searchText))+'%' OR RTRIM(LTRIM(keywords)) LIKE '%'+ RTRIM(LTRIM(@searchText))+'%')
	AND 
		(
			(@flag = 'N' AND ((RTRIM(LTRIM(cjmJobcity)) LIKE '%'+ RTRIM(LTRIM(@city))+'%'	OR RTRIM(LTRIM(city)) LIKE '%'+ RTRIM(LTRIM(@city))+'%') OR  (RTRIM(LTRIM(state)) LIKE '%'+ RTRIM(LTRIM(@state))+'%')))
			OR (@flag = 'Y' AND ((RTRIM(LTRIM(cjmJobcity)) LIKE '%'+ RTRIM(LTRIM(@city))+'%'OR RTRIM(LTRIM(city)) LIKE '%'+ RTRIM(LTRIM(@city))+'%') AND  (RTRIM(LTRIM(state)) LIKE '%'+ RTRIM(LTRIM(@state))+'%')))
		)
	

	ORDER BY cjmPostingDate desc
	OFFSET @pageSize * (@CurrentPage - 1) ROWS
    FETCH NEXT @pageSize ROWS ONLY OPTION (RECOMPILE); 

END

/*
select CJM_JOB_ID from CLIENT_JOB_MASTER
ORDER BY CJM_JOB_ID
OFFSET 10 * (2 - 1) ROWS
FETCH NEXT 6 ROWS ONLY OPTION (RECOMPILE); 

select  * from CLIENT_JOB_MASTER  ORDER BY CJM_JOB_ID   OFFSET 10 ROWS

API_SP_Jobs_Search] 0,2,2,'java','oh'
EXEC API_SP_Jobs_Search @EmployeeDetails_Id ='0' ,@pageCount ='1' ,@pageSize ='1'

*/
/******===========================================================================================================================================================******/
GO
GO
/****** Object:  StoredProcedure [dbo].[API_SP_SetEmailQueue]    Script Date: 9/11/2017 6:30:22 PM ******/
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
GO
/****** Object:  StoredProcedure [dbo].[API_SP_StaffContacts]    Script Date: 9/11/2017 6:30:36 PM ******/
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

API_SP_StaffContacts] 1,20, AND name=Nikhil Nair'
SELECT *   from API_VIEW_StaffContacts where  name like '%anu%'

EXEC API_SP_StaffContacts @pageNum='2', @pageSize='2' , @where=' AND name like ''%anu%'''
*/

/******===========================================================================================================================================================******/
GO

GO
/****** Object:  StoredProcedure [dbo].[API_SP_TimeCardByDateRange]    Script Date: 9/11/2017 6:31:07 PM ******/
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
	, CONCAT(DATENAME(weekday, c.EntryDate),+' '+ DATENAME(month, c.EntryDate), +' '+ format(c.EntryDate, 'dd yyyy') ) as EntryDate
	, c.TSEnteryDetail_ID as detailId
	, c.RegHrs, c.TotalHrs
	, c.OT1Hrs
	, c.TSEntryStatus
	, c.Modified_Date
	, d.ProjectDetail_Id as projectId
	, d.Project_Description as projectName
	, e.KeyName

		FROM PJWEEK a
		LEFT JOIN [dbo].[Invoice_TimesheetEntrySummary] b ON CAST(a.we_date AS DATE) = CAST(b.WeekEnd_Date AS DATE) AND b.EmployeeID = @employeeDetailsId
		LEFT JOIN  [dbo].[Invoice_TimesheetEntryDetails] c ON b.TSEntery_ID = c.TSEntery_ID AND b.EmployeeID = @employeeDetailsId
		LEFT JOIN [dbo].[ProjectDetails] d ON c.ProjectID = d.ProjectDetail_Id AND b.EmployeeID = @employeeDetailsId
        LEFT JOIN [dbo].[APP_REF_DATA] e ON c.TSEntryStatus = e.KeyID
		WHERE a.we_date BETWEEN @startDate AND @endDate ORDER BY a.we_date ASC
   
END

/******===========================================================================================================================================================******/
GO
GO
/****** Object:  StoredProcedure [dbo].[API_SP_TimeCardBySummaryId]    Script Date: 9/11/2017 6:31:20 PM ******/
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
GO
/****** Object:  StoredProcedure [dbo].[API_SP_UpdateEmployeeProject]    Script Date: 9/11/2017 6:31:36 PM ******/
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

GO
/****** Object:  StoredProcedure [dbo].[API_SP_UpdateImmigrationApplication]    Script Date: 9/11/2017 6:32:19 PM ******/
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


--Update LegalRequest 
	UPDATE LegalRequest
		SET 
		 FIRSTNAME = @FIRST_NAME
		 --(CASE  @APP_FOR WHEN 'SELF' THEN (select First_Name from EmployeeDetails where EmployeeDetails_Id=@EmployeeDetails_Id)  ELSE @FIRST_NAME END)
		,LASTNAME = @LAST_NAME
		--(CASE @APP_FOR WHEN 'SELF' THEN (select Last_Name from EmployeeDetails where EmployeeDetails_Id=@EmployeeDetails_Id)  ELSE @LAST_NAME END)
		,APP_FOR = @APP_FOR_ID
		,APP_EMAIL = @APP_EMAIL
		,HOME_PHONE = @HOME_PHONE
		,APP_EACNUM = @APP_EACNUM
		,APP_PRIORITY = @APP_PRIORITY
		,APP_TYPE = @APP_TYPE
		,CURRENT_STATUS = @CURRENT_STATUS
		,APP_COMMENT = @APP_COMMENT
		,SkillCategoryId = @SkillCategoryId

WHERE LEGALAPPID=@LEGALAPP_ID

END
	


/******===========================================================================================================================================================******/
GO

GO
/****** Object:  StoredProcedure [dbo].[API_SP_UpdateUserProfile]    Script Date: 9/11/2017 6:33:09 PM ******/
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
GO
/****** Object:  StoredProcedure [dbo].[API_SP_UserChangePassword]    Script Date: 9/11/2017 6:33:35 PM ******/
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

GO
/****** Object:  StoredProcedure [dbo].[API_SP_UserSignIn]    Script Date: 9/11/2017 6:33:46 PM ******/
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
	,Email_Id emailId
	,PJEmployee_Id employeeId
	,First_Name firstName
	,Last_Name lastName
	,Employee_Type  employeeTypeId
	,APP_REF_DATA.KeyName employeeType 
	,ProfilePicture profilePicture
	FROM EmployeeDetails 
	LEFT JOIN  APP_REF_DATA on EmployeeDetails.Employee_Type= APP_REF_DATA.KeyID 
	WHERE EmployeeDetails_Id=@EmployeeDetails_Id

END



/******===========================================================================================================================================================******/
GO

GO
/****** Object:  StoredProcedure [dbo].[API_SP_UserSignOut]    Script Date: 9/11/2017 6:34:01 PM ******/
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

GO
/****** Object:  StoredProcedure [dbo].[API_SP_UserSignUp]    Script Date: 9/11/2017 6:34:14 PM ******/
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

AS
BEGIN
DECLARE @EmployeeDetails_Id	INT
BEGIN TRANSACTION
	INSERT INTO [dbo].[EmployeeDetails]
           (
			[First_Name]
           ,[Last_Name]
		   ,[Email_Id]
		   ,[Password]
		   ,[Employee_Type]
           ,[emp_status]
		   ,[isAccountActivated]
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
		  ,GETDATE()
		   )

SELECT @EmployeeDetails_Id = SCOPE_IDENTITY()

if @@ERROR <> 0
BEGIN
	ROLLBACK
	RETURN
END

INSERT INTO [dbo].[Resume_Master]
           (          
            [First_Name]
           ,[Last_Name]
           ,[Email_Id]	
		   ,[FromEmployeeDetails_Id]
		   ,[Status]
		   ,[Created_On]
           )
	VALUES
           (
		   @FirstName
		  ,@LastName
		  ,@EmailId	
		  ,@EmployeeDetails_Id
		  ,1
		  ,GETDATE()
		   )

if @@ERROR <> 0
BEGIN
	ROLLBACK
	RETURN
END

if Exists (Select * from EmployeeDetails where Email_Id = @EmailID)
Begin
SELECT @EmployeeDetails_Id EmployeeDetails_Id ;
END

else
Begin
	SELECT 0 EmployeeDetails_Id ;
End

COMMIT

END



/******===========================================================================================================================================================******/
GO
GO
/****** Object:  StoredProcedure [dbo].[API_SP_Jobs_DistanceAndCount]    Script Date: 9/13/2017 7:08:40 PM ******/
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



/******===========================================================================================================================================================******/
GO


/******===========================================================================================================================================================******/
GO

/******===========================================================================================================================================================******/
GO


/******===========================================================================================================================================================******/
GO

/******===========================================================================================================================================================******/
GO


/******===========================================================================================================================================================******/
GO

/******===========================================================================================================================================================******/
GO


/******===========================================================================================================================================================******/
GO


/******===========================================================================================================================================================******/
GO


/******===========================================================================================================================================================******/
GO


/******===========================================================================================================================================================******/
GO

/******===========================================================================================================================================================******/
GO


/******===========================================================================================================================================================******/
GO

/******===========================================================================================================================================================******/
GO




