

Alter table employeedetails Add isAccountActivated bit NULL Default 0;

/****** Object:  Table [dbo].[EmailTemplate]    Script Date: 9/11/2017 5:23:50 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[EmailTemplate](
	[EmailTemplateID] [bigint] IDENTITY(1001,1) NOT NULL,
	[EventName] [nvarchar](256) NOT NULL,
	[EmailSubject] [nvarchar](250) NOT NULL,
	[TemplateHtml] [nvarchar](max) NOT NULL,
	[CreatedBy] [bigint] NOT NULL,
	[CreatedOn] [datetime] NOT NULL CONSTRAINT [DF_EmailTemplate_CreatedOn]  DEFAULT (getdate()),
	[UpdatedBy] [bigint] NULL,
	[UpdatedOn] [datetime] NULL CONSTRAINT [DF_EmailTemplate_UpdatedOn]  DEFAULT (getdate()),
	[Status] [bit] NOT NULL CONSTRAINT [DF_EmailTemplate_Status]  DEFAULT ((1)),
	[RowVersion] [int] NOT NULL CONSTRAINT [DF_EmailTemplate_RowVersion]  DEFAULT ((1)),
	[RowGuid] [uniqueidentifier] NOT NULL CONSTRAINT [DF_EmailTemplate_RowGuid]  DEFAULT (newid()),
 CONSTRAINT [PK__EmailTem__BC0A38555E323DCC] PRIMARY KEY CLUSTERED 
(
	[EmailTemplateID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO
/****** Object:  Table [dbo].[EmployeeLicense]    Script Date: 9/11/2017 5:23:51 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [dbo].[EmployeeLicense](
	[EmployeeLicense_Id] [int] IDENTITY(1,1) NOT NULL,
	[EmployeeDetails_Id] [int] NOT NULL,
	[LicenseType] [int] NOT NULL,
	[RegisteredState] [int] NOT NULL,
	[LicenceNumber] [varchar](200) NOT NULL,
	[ExpirationDate] [datetime] NULL,
	[IsActive] [bit] NOT NULL DEFAULT ((1)),
	[CreatedBy] [int] NOT NULL,
	[CreatedDate] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[EmployeeLicense_Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [dbo].[EmployeeOTP]    Script Date: 9/11/2017 5:23:51 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [dbo].[EmployeeOTP](
	[EmployeeOTP_Id] [int] IDENTITY(1,1) NOT NULL,
	[EmployeeDetails_Id] [int] NOT NULL,
	[Secret_Key] [varchar](32) NOT NULL,
	[Token] [varchar](12) NOT NULL,
	[Expiry] [datetime] NULL,
	[IsActive] [bit] NOT NULL DEFAULT ((1)),
PRIMARY KEY CLUSTERED 
(
	[EmployeeOTP_Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [dbo].[UserSession]    Script Date: 9/11/2017 5:23:51 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserSession](
	[SessionId] [bigint] IDENTITY(1001,1) NOT NULL,
	[EmployeeDetails_Id] [int] NOT NULL,
	[SessionUniqueId] [nvarchar](1024) NOT NULL CONSTRAINT [DF_UserSession_SessionUniqueId]  DEFAULT (newid()),
	[CreatedBy] [bigint] NOT NULL,
	[CreatedOn] [datetime] NOT NULL CONSTRAINT [DF_UserSession_CreatedOn]  DEFAULT (getdate()),
	[UpdatedBy] [bigint] NULL,
	[UpdatedOn] [datetime] NULL CONSTRAINT [DF_UserSession_UpdatedOn]  DEFAULT (getdate()),
	[LastLoggedIn] [datetime] NULL,
	[Status] [bigint] NOT NULL CONSTRAINT [DF_UserSession_Status]  DEFAULT ((1)),
	[RowVersion] [int] NOT NULL CONSTRAINT [DF_UserSession_RowVersion]  DEFAULT ((1)),
	[RowGuid] [uniqueidentifier] NOT NULL CONSTRAINT [DF_UserSession_RowGuid]  DEFAULT (newid()),
 CONSTRAINT [UserSession_PK] PRIMARY KEY CLUSTERED 
(
	[SessionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO