
/******===========================================================================================================================================================******/
GO

GO
/****** Object:  UserDefinedFunction [dbo].[API_FN_GetAvailabilityByAvailabilityId]    Script Date: 9/11/2017 6:36:43 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE Function [dbo].[API_FN_GetAvailabilityByAvailabilityId]
(	
@AvailabilityId INT
)  
RETURNS VARCHAR(100)
AS  
BEGIN  
 DECLARE @Availability VARCHAR(100)

 select @Availability =  CASE 
		WHEN @AvailabilityId=1 THEN 'Immediate' 
		WHEN @AvailabilityId=2 THEN 'TwoWeeksNotice'
		WHEN @AvailabilityId=3 THEN 'OnProject'
		WHEN @AvailabilityId=4 THEN 'Other'
		WHEN @AvailabilityId=5 THEN 'ThreeWeeksNotice'
		WHEN @AvailabilityId=6 THEN 'FourWeeksNotice'		
		ELSE '' 
		END 
	  --print @Status
	return(@Availability)

END  
 
 
 /*
 SELECT [dbo].API_FN_GetAvailabilityByAvailabilityId(1)  AS Availability 
 */

/******===========================================================================================================================================================******/
GO

CREATE FUNCTION [dbo].[API_FN_GetDesiredEmployementByDesiredEmployementKey] 
(	
 @string NVARCHAR(MAX), 
 @delimiter CHAR(1) ,
 @returnDelimiter CHAR(1) 
)  
RETURNS  NVARCHAR(MAX) 
AS  
BEGIN  
 DECLARE @DesiredEmployement VARCHAR(100)='';
 DECLARE @start INT, @end INT ;

    SELECT @start = 1, @end = CHARINDEX(@delimiter, @string) 

    WHILE @start < LEN(@string) + 1 BEGIN 
        IF @end = 0  
            SET @end = LEN(@string) + 1

		IF (@DesiredEmployement='')
			SET	@DesiredEmployement=

			CASE  WHEN (SUBSTRING(@string, @start, @end - @start)) ='C' THEN 'Consulting'
				  WHEN (SUBSTRING(@string, @start, @end - @start)) ='F' THEN 'FullTime'
				  WHEN (SUBSTRING(@string, @start, @end - @start)) ='R' THEN 'RightToHire'	 
				  ELSE '' 
			END
		ELSE
			SET	@DesiredEmployement=@DesiredEmployement + @returnDelimiter+ 
			
			CASE  WHEN (SUBSTRING(@string, @start, @end - @start)) ='C' THEN 'Consulting'
				  WHEN (SUBSTRING(@string, @start, @end - @start)) ='F' THEN 'FullTime'
				  WHEN (SUBSTRING(@string, @start, @end - @start)) ='R' THEN 'RightToHire'	 
				  ELSE '' 
			END

        SET @start = @end + 1 
        SET @end = CHARINDEX(@delimiter, @string, @start)
        
    END 
	RETURN(@DesiredEmployement)

END  


/*
SELECT [dbo].[API_FN_GetDesiredEmployementByDesiredEmployementKey]  ('C||R||F','||','||')
*/

  /******===========================================================================================================================================================******/
GO


GO
/****** Object:  UserDefinedFunction [dbo].[API_FN_GetNearestCoOrdinatesInMiles]    Script Date: 9/13/2017 7:03:14 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE Function [dbo].[API_FN_GetNearestCoOrdinatesInMiles]
(	
@Latitude Decimal(18,2),
@Longitude Decimal(18,2),
@DisiredDistanceInMiles INT,
@searchText NVARCHAR(MAX)='',
@city NVARCHAR(500)='',
@state NVARCHAR(500)=''
)  
RETURNS INT
AS  
BEGIN  
	DECLARE @citiesCount  INT;

	DECLARE @flag VARCHAR(500)
	IF(@city = @state)
		SET @flag =  'N';
	ELSE 
		SET @flag =  'Y';

	WITH CTE (cityId,distanceInMiles) AS
	(		
		SELECT cityId,ROUND(3959 * ACOS(COS(RADIANS(@Latitude)) * COS(RADIANS(ISNULL(latitude,0.0))) ----3959 miles 6371 for KM
				* COS(RADIANS(ISNULL(Longitude,0.0)) - RADIANS(@Longitude))
				+ SIN(RADIANS(@Latitude)) * SIN(RADIANS(ISNULL(latitude,0.0)))),2) AS distanceInMiles
		FROM API_VIEW_GetAllJobsList
		WHERE (RTRIM(LTRIM(jobTitle)) LIKE '%'+ RTRIM(LTRIM(@searchText))+'%' OR RTRIM(LTRIM(keywords)) LIKE '%'+ RTRIM(LTRIM(@searchText))+'%')
		AND 
		(
			(@flag = 'N' AND ((RTRIM(LTRIM(cjmJobcity)) LIKE '%'+ RTRIM(LTRIM(@city))+'%'	OR RTRIM(LTRIM(city)) LIKE '%'+ RTRIM(LTRIM(@city))+'%') OR  (RTRIM(LTRIM(state)) LIKE '%'+ RTRIM(LTRIM(@state))+'%')))
			OR (@flag = 'Y' AND ((RTRIM(LTRIM(cjmJobcity)) LIKE '%'+ RTRIM(LTRIM(@city))+'%'	OR RTRIM(LTRIM(city)) LIKE '%'+ RTRIM(LTRIM(@city))+'%') AND  (RTRIM(LTRIM(state)) LIKE '%'+ RTRIM(LTRIM(@state))+'%')))
		)
	)

	SELECT  @citiesCount= COUNT(cityId)  FROM CTE WHERE distanceInMiles <= @DisiredDistanceInMiles	
	RETURN @citiesCount

END  
  
  /*
  SELECT [dbo].[API_FN_GetNearestCoOrdinatesInMiles]('-74.006','40.7143',20,'','','') 
  */

/******===========================================================================================================================================================******/



/******===========================================================================================================================================================******/
GO

GO
/****** Object:  UserDefinedFunction [dbo].[API_FN_GetPageCount]    Script Date: 9/11/2017 6:38:54 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE Function [dbo].[API_FN_GetPageCount]
(	
@TotalCount INT,
@PageSize INT,
@PageNumber INT
)  
RETURNS INT
AS  
BEGIN  

IF(@TotalCount>0)
BEGIN
	  DECLARE @PageCountDifference INT = CEILING((CAST(@TotalCount AS FLOAT)/ CAST(@PageSize AS FLOAT)))

	  IF(@PageCountDifference<@PageNumber)
	  BEGIN
		SET	@PageNumber=(@PageCountDifference)
	  END

	  ELSE IF(@PageNumber<=0 )
	  BEGIN
		SET @PageNumber=1
	  END
	  ELSE
	  BEGIN
		SET @PageNumber=@PageNumber
	  END
END
ELSE
BEGIN
	SET @PageNumber=1
END 
  RETURN (@PageNumber)

END  


 /*
 SELECT [dbo].API_FN_GetPageCount(2,30,1)  AS PageCount 
select  CEILING(CAST(100 as float)/CAST(30 as float))
*/

/******===========================================================================================================================================================******/
GO

GO
/****** Object:  UserDefinedFunction [dbo].[API_FN_GetTimecardStatusByTsEntryIdAndEmployeeId]    Script Date: 9/11/2017 6:39:33 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE Function [dbo].[API_FN_GetTimecardStatusByTsEntryIdAndEmployeeId]
(	
@EmployeeId INT,
@TsEntryId INT
)  
RETURNS VARCHAR(100)
AS  
BEGIN  
 DECLARE @Status VARCHAR(100)
 --set @Status= 
 -- CASE 
 --   WHEN (SELECT COUNT(TSEntryStatus) FROM Invoice_TimeSheetEntryDetails WHERE  TSEntryStatus=123)>0  THEN 'APPLE' 
	--else 'ac'
 -- END 
 SELECT @Status =  CASE 
		WHEN (SELECT COUNT(TSEntryStatus) FROM Invoice_TimeSheetEntryDetails  WHERE  EmployeeID=@EmployeeId ANd TSEntery_ID=@TsEntryId AND  TSEntryStatus=3301)>0  THEN '3301:Data' 
		WHEN (SELECT COUNT(TSEntryStatus) FROM Invoice_TimeSheetEntryDetails  WHERE   EmployeeID=@EmployeeId ANd TSEntery_ID=@TsEntryId AND  TSEntryStatus=3302)>0  THEN '3302:Authorized' 
		WHEN (SELECT COUNT(TSEntryStatus) FROM Invoice_TimeSheetEntryDetails  WHERE   EmployeeID=@EmployeeId ANd TSEntery_ID=@TsEntryId AND  TSEntryStatus=3303)>0  THEN '3303:Approve' 
		WHEN (SELECT COUNT(TSEntryStatus) FROM Invoice_TimeSheetEntryDetails  WHERE   EmployeeID=@EmployeeId ANd TSEntery_ID=@TsEntryId AND  TSEntryStatus=3304)>0  THEN '3304:Allocation' 
		WHEN (SELECT COUNT(TSEntryStatus) FROM Invoice_TimeSheetEntryDetails  WHERE   EmployeeID=@EmployeeId ANd TSEntery_ID=@TsEntryId AND  TSEntryStatus=3305)>0  THEN '3305:Invoice Created' 
		ELSE '0:Pending' 
		END 
	  --print @Status
	return(@Status )
	--select * from Invoice_TimeSheetEntryDetails
END 
 
  /* 
  SELECT [dbo].API_FN_GetTimecardStatusByTsEntryIdAndEmployeeId(1112,2)  AS status 

  */


/******===========================================================================================================================================================******/
GO

GO
/****** Object:  UserDefinedFunction [dbo].[API_FN_GetWeekStartDateByWeekEndingDate]    Script Date: 9/11/2017 6:40:11 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE Function [dbo].[API_FN_GetWeekStartDateByWeekEndingDate]
(	
@WeekEndingDate DATETIME
)  
RETURNS DATE
AS  
BEGIN  
  DECLARE @WeekStartDate DATETIME

  SELECT @WeekStartDate=DATEADD(day, DATEDIFF(day, 0, @WeekEndingDate) /7*7, 0)
                         FROM PJWEEK WHERE we_date=@WeekEndingDate
  RETURN (@WeekStartDate)
  --SELECT  @WeekEndingDate,
  --DATENAME(WEEKDAY,@WeekEndingDate),
  --DATEADD(day, DATEDIFF(day, 0, @WeekEndingDate) /7*7, 0) AS weekstart,
  --DATEADD(day, DATEDIFF(day, 6, (@WeekEndingDate)-1) /7*7 + 7, 6) AS WeekEnd
  --from PJWEEK
  --where Year(@WeekEndingDate)=2017 and Month(@WeekEndingDate)=7


  --SELECT we_date,
  --  DATENAME(WEEKDAY,we_date),
  --  DATEADD(DD,-(CHOOSE(DATEPART(dw, we_date), 7,1,2,3,4,5,6)-1),we_date) AS WeekStartDate,
  --  DATEADD(DD,7-CHOOSE(DATEPART(dw, we_date), 7,1,2,3,4,5,6),we_date) AS WeekEndDate
		--from PJWEEK where Year(we_date)=2017 and Month(we_date)=7
END  
 /*
 SELECT [dbo].API_FN_GetWeekStartDateByWeekEndingDate('2017-07-23 00:00:00')  AS WeekStartDate 
 */

/******===========================================================================================================================================================******/
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

/******===========================================================================================================================================================******/
GO
GO
/****** Object:  UserDefinedFunction [dbo].[API_FN_StripHTML]    Script Date: 9/13/2017 7:06:07 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[API_FN_StripHTML] (@HTMLText VARCHAR(MAX))
RETURNS VARCHAR(MAX) AS
BEGIN
    DECLARE @Start INT
    DECLARE @End INT
    DECLARE @Length INT
    SET @Start = CHARINDEX('<',@HTMLText)
    SET @End = CHARINDEX('>',@HTMLText,CHARINDEX('<',@HTMLText))
    SET @Length = (@End - @Start) + 1
    WHILE @Start > 0 AND @End > 0 AND @Length > 0
    BEGIN
        SET @HTMLText = STUFF(@HTMLText,@Start,@Length,'')
        SET @Start = CHARINDEX('<',@HTMLText)
        SET @End = CHARINDEX('>',@HTMLText,CHARINDEX('<',@HTMLText))
        SET @Length = (@End - @Start) + 1
    END

	SET @HTMLText= REPLACE(REPLACE(@HTMLText,'&nbsp;',''),'&bull;','');
    RETURN LTRIM(RTRIM(@HTMLText))
END

/*
SELECT dbo.[API_FN_StripHTML]('&nbsp; sfzsdzsdgdg &bull; &bull;&nbsp;&nbsp; &bull;fbfnbfgn fgcnfg')
*/

/******===========================================================================================================================================================******/
GO
CREATE FUNCTION [dbo].[API_FN_GetSearchScoreDifference](@left  VARCHAR(100),
                                    @right VARCHAR(100))
returns INT
AS
  BEGIN
      DECLARE @difference    INT,
              @lenRight      INT,
              @lenLeft       INT,
              @leftIndex     INT,
              @rightIndex    INT,
              @left_char     CHAR(1),
              @right_char    CHAR(1),
              @compareLength INT

      SET @lenLeft = LEN(@left)
      SET @lenRight = LEN(@right)
      SET @difference = 0

      IF @lenLeft = 0
        BEGIN
            SET @difference = @lenRight

            GOTO done
        END

      IF @lenRight = 0
        BEGIN
            SET @difference = @lenLeft

            GOTO done
        END

      GOTO comparison

      COMPARISON:

      IF ( @lenLeft >= @lenRight )
        SET @compareLength = @lenLeft
      ELSE
        SET @compareLength = @lenRight

      SET @rightIndex = 1
      SET @leftIndex = 1

      WHILE @leftIndex <= @compareLength
        BEGIN
            SET @left_char = substring(@left, @leftIndex, 1)
            SET @right_char = substring(@right, @rightIndex, 1)

            IF @left_char <> @right_char
              BEGIN -- Would an insertion make them re-align?
                  IF( @left_char = substring(@right, @rightIndex + 1, 1) )
                    SET @rightIndex = @rightIndex + 1
                  -- Would an deletion make them re-align?
                  ELSE IF( substring(@left, @leftIndex + 1, 1) = @right_char )
                    SET @leftIndex = @leftIndex + 1

                  SET @difference = @difference + 1
              END

            SET @leftIndex = @leftIndex + 1
            SET @rightIndex = @rightIndex + 1
        END

      GOTO done

      DONE:

      RETURN @difference
  END
  
  /*
  SELECT[dbo].[API_FN_GetSearchScoreDifference] ('abc','ab')
  */ 
/******===========================================================================================================================================================******/
GO
CREATE FUNCTION [dbo].[API_FN_GetSearchScore]
(
	 @string1 NVARCHAR(100)
    ,@string2 NVARCHAR(100)
)
RETURNS INT
AS
BEGIN

    DECLARE @levenShteinNumber INT

    DECLARE @string1Length INT = LEN(@string1)
    , @string2Length INT = LEN(@string2)
    DECLARE @maxLengthNumber INT = CASE WHEN @string1Length > @string2Length THEN @string1Length ELSE @string2Length END

    SELECT @levenShteinNumber = [dbo].[API_FN_GetSearchScoreDifference] (@string1  ,@string2)

    DECLARE @percentageOfBadCharacters INT = @levenShteinNumber * 100 / @maxLengthNumber

    DECLARE @percentageOfGoodCharacters INT = 100 - @percentageOfBadCharacters

    -- Return the result of the function
    RETURN @percentageOfGoodCharacters

END


/*
SELECT  [dbo].[API_FN_GetSearchScore]('valnetin123456'  ,'valentin123456')
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



