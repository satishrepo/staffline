USE [CSG_2001_Staging]
GO

/****** Object:  UserDefinedFunction [dbo].[API_FN_FullTextJobSearch]    Script Date: 2/8/2018 5:59:36 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

/*
select * from [API_FN_FullTextJobSearch] ('Quality Assurance Technician I')
*/
CREATE FUNCTION [dbo].[API_FN_FullTextJobSearch] 
(
	@words NVARCHAR(4000)
)  
RETURNS @tblRtnValue TABLE 
(
	Id 		INT IDENTITY(1,1),
	cjm_job_id INT,
	City_Id INT, 
	[RANK] INT
) 
AS  
BEGIN 
	IF(@words='')
	BEGIN
		INSERT INTO @tblRtnValue(cjm_job_id,City_Id,[RANK])
		SELECT TOP 5000 table1.cjm_job_id, table1.City_Id,0
		FROM 
		dbo.client_job_master AS table1
		LEFT JOIN dbo.City_Master CM ON  ISNULL(table1.City_Id,-999) = CM.City_Id 		
		WHERE ISNULL(table1.cjm_job_id, 0) > 0 AND table1.CJM_STATUS = 'A' AND table1.city_id IS NOT NULL

		ORDER BY CJM_UPDATED_ON DESC
		
	END
	ELSE
	BEGIN
	   --truncate word to 300 char
	     SET @words =(SUBSTRING(@words,1,300))

		--SET @words = (SELECT REPLACE(@words,' AND ',' '))
		--SET @words = (SELECT REPLACE(REPLACE(REPLACE(REPLACE(@words,', ',' '),' ,',' '),' , ',' '),',',' '))
		SET @words=(Select dbo.[API_FN_RemoveSpecialCharFromString](@words))
		
		DECLARE @ANDKeyword VARCHAR(500)= (SELECT REPLACE(@words, ' ', ' AND '))
		DECLARE @NEARKeyword VARCHAR(500)= (SELECT REPLACE(@words, ' ', ' NEAR '))
		DECLARE @ORKeyword VARCHAR(500)= (SELECT REPLACE(@words, ' ', ' OR '))

		DECLARE @tempAND TABLE(Id INT IDENTITY(1,1), CJM_JOB_ID INT,  CITY_ID INT,  [RANK] INT) 
		DECLARE @tempNEAR TABLE(Id INT IDENTITY(1,1), CJM_JOB_ID INT, CITY_ID INT,  [RANK] INT) 
		DECLARE @tempOR TABLE(Id INT IDENTITY(1,1), CJM_JOB_ID INT, CITY_ID INT,  [RANK] INT) 
		DECLARE @tempMERGE TABLE(Id INT IDENTITY(1,1), CJM_JOB_ID INT, CITY_ID INT,  [RANK] INT) 

		--SELECT search on AND condition
		INSERT INTO @tempAND(CJM_JOB_ID,CITY_ID,KEY_TBL.RANK  )
		SELECT CJM_JOB_ID,CITY_ID,KEY_TBL.RANK  
		FROM CLIENT_JOB_MASTER AS CJM 
		INNER JOIN CONTAINSTABLE (CLIENT_JOB_MASTER, (CJM_JOB_TITLE,KEYWORDS,CJM_JOB_DETAILS), @ANDKeyword) AS KEY_TBL  
		ON CJM.cjm_job_id = KEY_TBL.[KEY] 
		WHERE ISNULL(CJM.CJM_JOB_ID, 0) > 0 AND CJM.CJM_STATUS = 'A' AND CJM.CITY_ID IS NOT NULL
		ORDER BY KEY_TBL.RANK DESC;  




		--SELECT search on NEAR condition
		INSERT INTO @tempNEAR(CJM_JOB_ID,CITY_ID,KEY_TBL.RANK  )
		SELECT CJM_JOB_ID,CITY_ID,KEY_TBL.RANK  			
		FROM CLIENT_JOB_MASTER AS CJM 
		INNER JOIN CONTAINSTABLE (CLIENT_JOB_MASTER, (CJM_JOB_TITLE,KEYWORDS,CJM_JOB_DETAILS), @NEARKeyword) AS KEY_TBL  
		ON CJM.cjm_job_id = KEY_TBL.[KEY] 
		WHERE ISNULL(CJM.CJM_JOB_ID, 0) > 0 AND CJM.CJM_STATUS = 'A' AND CJM.CITY_ID IS NOT NULL
		ORDER BY KEY_TBL.RANK DESC;  


		--SELECT search on OR condition
		INSERT INTO @tempOR(CJM_JOB_ID,CITY_ID,KEY_TBL.RANK  )
		SELECT CJM_JOB_ID,CITY_ID,KEY_TBL.RANK  			
		FROM CLIENT_JOB_MASTER AS CJM 
		INNER JOIN CONTAINSTABLE (CLIENT_JOB_MASTER, (CJM_JOB_TITLE,KEYWORDS,CJM_JOB_DETAILS), @ORKeyword) AS KEY_TBL  
		ON CJM.cjm_job_id = KEY_TBL.[KEY] 
		WHERE  ISNULL(CJM.CJM_JOB_ID, 0) > 0 AND CJM.CJM_STATUS = 'A' AND CJM.CITY_ID IS NOT NULL
		ORDER BY KEY_TBL.RANK DESC;  


		--Merge
		INSERT INTO @tempMERGE(CJM_JOB_ID,CITY_ID,[RANK])
		SELECT CJM_JOB_ID,CITY_ID,(([RANK]+(SELECT MAX([RANK]) FROM @tempOR))+1) AS [RANK]  FROM @tempAnd
		UNION
		SELECT CJM_JOB_ID,CITY_ID,([RANK]+(SELECT MAX([RANK]) FROM @tempOR)) AS [RANK] FROM @tempNEAR 
		WHERE CJM_JOB_ID NOT IN (SELECT CJM_JOB_ID FROM @tempAnd)	
		UNION
		SELECT CJM_JOB_ID,CITY_ID,[RANK] AS [RANK] FROM @tempOR
		WHERE CJM_JOB_ID NOT IN (SELECT CJM_JOB_ID FROM @tempAnd) AND CJM_JOB_ID NOT IN (SELECT CJM_JOB_ID FROM @tempNEAR)
		ORDER BY [RANK]  desc


		INSERT INTO @tblRtnValue(CJM_JOB_ID,CITY_ID,[RANK])
		SELECT CJM_JOB_ID,CITY_ID,[RANK] FROM @tempMerge
		

		/*
		Insert Into @tblRtnValue(cjm_job_id,City_Id,[RANK])
		Select top 5000 table1.cjm_job_id, table1.City_Id, CT.[RANK]
		From 
		FREETEXTTABLE(client_job_master, (cjm_job_title,Keywords,CJM_JOB_DETAILS), @words) AS CT
		INNER JOIN dbo.client_job_master AS table1 
		Left Join dbo.City_Master CM ON  ISNULL(table1.City_Id,-999) = CM.City_Id 
		ON CT.[KEY] = table1.CJM_JOB_ID
		Where isnull(table1.cjm_job_id, 0) > 0 And table1.CJM_STATUS = 'A' AND table1.city_id IS NOT NULL
		ORDER BY CT.[RANK] DESC ,CJM_UPDATED_ON DESC 		 
		*/
		

	END
	RETURN
END


--'(PowerShell AND Windows AND rewards) OR (PowerShell NEAR Windows NEAR  rewards)'  


--SELECT REPLACE('PowerShell Windows rewards', ' ', ' AND ')


--select CJM_JOB_TITLE,KEYWORDS,CJM_JOB_DETAILS,* from client_job_master where  cjm_job_id=143811
GO

/****** Object:  UserDefinedFunction [dbo].[API_FN_GetCityDetailsFromClientJobMaster]    Script Date: 2/8/2018 5:59:37 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE FUNCTION [dbo].[API_FN_GetCityDetailsFromClientJobMaster] 
( 
@City_Id INT,
@CJM_JOBCITY NVARCHAR(50),
@Location_State_Id INT
) 
RETURNS @output TABLE(cityId INT NULL,city NVARCHAR(50) NULL,longitude NVARCHAR(50) NULL,latitude NVARCHAR(50) NULL,state NVARCHAR(50) NULL) 
BEGIN 
 
 IF(@City_Id > 0 )
 BEGIN
	INSERT INTO @output (cityId,city,longitude,latitude,state)  
	SELECT TOP 1 City_Id,City_Name,Langitude,Latitude,SM.State_Name FROM City_Master CM
	JOIN State_Master SM ON SM.State_IEU_Id=CM.State_Id 
	WHERE City_Id=@City_Id
 END
 ELSE IF(@CJM_JOBCITY IS NOT NULL)
 BEGIN
	INSERT INTO @output (cityId,city,longitude,latitude,state)  
	SELECT TOP 1 City_Id,City_Name,Langitude,Latitude,SM.State_Name  FROM City_Master CM
	JOIN State_Master SM ON SM.State_IEU_Id=CM.State_Id
	WHERE (City_Name= @CJM_JOBCITY OR SM.State_Name =@CJM_JOBCITY) AND SM.State_ID=@Location_State_Id
END
 ELSE
 BEGIN
	INSERT INTO @output (cityId,city,longitude,latitude,state)  
	VALUES(0,'',0,0,'')
	  
 END


  
    RETURN 
END

/*
 SELECT * from [dbo].[API_FN_GetCityDetailsFromClientJobMaster](null,'New York',32)
*/


--SELECT TOP 1 City_Id,City_Name,Langitude,Latitude
--,SM.State_Name  
--FROM City_Master CM
--LEFT JOIN State_Master SM ON SM.State_IEU_Id=CM.State_Id
--	WHERE (City_Name='New York' OR SM.State_Name ='New York') AND SM.State_ID=32

--select CityId,CJMJOBCITY,locationStateId,* from API_VIEW_GetAllJobsList where city='New York' and  cjmStatus ='A'

GO

/****** Object:  UserDefinedFunction [dbo].[API_FN_GetJobIdForFullTextSearch]    Script Date: 2/8/2018 5:59:38 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE FUNCTION [dbo].[API_FN_GetJobIdForFullTextSearch] 
( 
@CJM_JOBCITY NVARCHAR(500)
) 
RETURNS @output TABLE(cjmJobId INT NULL) 
BEGIN
	INSERT INTO @output (cjmJobId)  
	SELECT DISTINCT CJM_JOB_ID   
	FROM CLIENT_JOB_MASTER   
	WHERE CONTAINS(CJM_JOB_TITLE,@CJM_JOBCITY) OR CONTAINS(CJM_JOB_TITLE,@CJM_JOBCITY) AND CJM_STATUS='A' AND City_Id IS NOT NULL 	
    RETURN 
END

/*
 SELECT * from [dbo].[API_FN_GetJobIdForFullTextSearch]('Critical AND care')
*/


GO

/****** Object:  UserDefinedFunction [dbo].[API_FN_SplitString]    Script Date: 2/8/2018 5:59:38 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE FUNCTION [dbo].[API_FN_SplitString] 
( 
    @string NVARCHAR(MAX), 
    @delimiter CHAR(1) 
) 
RETURNS @output TABLE(splitdata NVARCHAR(MAX) NULL) 
BEGIN 
    DECLARE @start INT, @end INT 
    SELECT @start = 1, @end = CHARINDEX(@delimiter, @string) 
    WHILE @start < LEN(@string) + 1 BEGIN 
        IF @end = 0  
            SET @end = LEN(@string) + 1
       
        INSERT INTO @output (splitdata)  
        VALUES(SUBSTRING(@string, @start, @end - @start)) 
        SET @start = @end + 1 
        SET @end = CHARINDEX(@delimiter, @string, @start)
        
    END 
    RETURN 
END

/*
select *from dbo.API_FN_SplitString('Querying SQL Server','')
*/
GO

/****** Object:  UserDefinedFunction [dbo].[API_FN_SplitString_New]    Script Date: 2/8/2018 5:59:39 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE FUNCTION [dbo].[API_FN_SplitString_New] 
( 
    @string NVARCHAR(MAX), 
    @delimiter CHAR(1),
	@delimiterOther CHAR(1) 
) 
RETURNS @output TABLE(col1 NVARCHAR(MAX) NULL, col2 NVARCHAR(MAX) NULL) 
BEGIN 
    DECLARE @start INT, @end INT 
    Declare @col1  INT --varchar(max)
	Declare @col2  INT --varchar(max)
    Declare @tdata varchar(max)

   SELECT @start = 1, @end = CHARINDEX(@delimiter, @string) 
    WHILE @start < LEN(@string) + 1 BEGIN 
        IF @end = 0  
            SET @end = LEN(@string) + 1
      

		set @tdata = SUBSTRING(@string, @start, @end - @start)
		set @col1 = SUBSTRING(@tdata, 1,  CHARINDEX(@delimiterOther,@tdata)-1)
		 set @col2 =  SUBSTRING(@tdata, CHARINDEX(@delimiterOther, @tdata)+1, len(@tdata))

        INSERT INTO @output (col1, col2)  
        VALUES(@col1,@col2) 
        SET @start = @end + 1 
        SET @end = CHARINDEX(@delimiter, @string, @start)
        
    END 
    RETURN 
END
GO

