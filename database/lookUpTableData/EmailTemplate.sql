
/******===========================================================================================================================================================******/
GO
SET IDENTITY_INSERT [dbo].[EmailTemplate] ON 

GO
INSERT [dbo].[EmailTemplate] ([EmailTemplateID], [EventName], [EmailSubject], [TemplateHtml], [CreatedBy], [CreatedOn], [UpdatedBy], [UpdatedOn], [Status], [RowVersion], [RowGuid]) VALUES (1001, N'welcome', N'Welcome to Staffline', N'<html>
<head>
    <title></title>
    <meta name="viewport" content="width=device-width">
    <meta http-equiv="Content-Type" content="text/html; charset=windows-1252">
    <style type="text/css">
        body {
            -webkit-text-size-adjust: 100%;
            margin: 0;
            padding: 0;
            border: 0px;
            font-family: Arial, sans-serif;
        }

        table,
        table td {
            border-collapse: collapse;
            border: 0px;
        }

        a:link,
        a:active {
            text-decoration: none!important;
        }

        @media only screen and (max-width: 600px) {
            table[class="wrapper"] {
                width: 100% !important;
            }
            .container,
            .whiteContainer {
                padding-left: 15px !important;
                padding-right: 15px !important;
            }
            .socialLinks {
                text-align: center !important;
            }
            .socialLinks span {
                display: block !important;
            }
            .socialLinks a {
                font-size: 12px !important;
                padding-left: 5px !important;
                padding-right: 5px !important;
                margin-top: 10px !important;
            }
            .copyRight {
                font-size: 14px !important;
                text-align: center !important;
            }
        }
    </style>
</head>

<body>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" bgcolor="#fff" style="table-layout:fixed;">
        <tr>
            <td width="100%" valign="top" align="left">
                <table class="wrapper" width="620" cellpadding="0" cellspacing="0" border="0" align="center" bgcolor="#144991">
                    <tr>
                        <td class="container" width="100%" valign="top" align="left" style="padding-top:12px;padding-bottom:12px;padding-left:30px;padding-right:30px;">

                            <!--main body start here-->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center">
                                <tr>
                                    <td width="100%" valign="top" align="left" style="padding:0px 0px 12px;">
                                        <img alt="logo" src="http://www.compunnel.com/siteassets/right-menu/logo.png" style="border:0; display:inline-block;margin:0;"/>
                                    </td>
                                </tr>
                                <tr>
                                    <td width="100%" valign="top" align="left" style="padding:0px 0px 10px;">
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="background-color:#fff;">
                                            <tr>
                                                <td class="whiteContainer" width="100%" valign="top" align="left" style="padding-top:30px;padding-bottom:30px;padding-left:20px;padding-right:20px;">
                                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center">
                                                        <tr>
                                                            <td width="100%" valign="top" align="left" style="padding-bottom:30px;font-size: 15px;font-family: Arial, sans-serif;">
                                                                Hi [NAME],
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td width="100%" valign="top" align="left" style="padding-bottom:15px;font-size: 15px;font-family: Arial, sans-serif;">
                                                                Thank you for registering with StaffLine.
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td width="100%" valign="top" align="left" style="padding-bottom:15px;font-size: 15px;font-family: Arial, sans-serif;">
                                                                We have created your account using <b style="color:#659CEF">[EMAIL].</b>
                                                                <br /><br /> If you wish to use your email address for future
                                                                login to Staffline then you may activate your account here.
                                                                <br /><br />
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td width="100%" valign="top" align="left" style="padding-bottom:15px;">
                                                                <table border="0" cellpadding="0" cellspacing="0">
                                                                    <tr>
                                                                        <td align="center" bgcolor="#144991" class="btn" style="background: #144991;"><strong><a href="[REDIRECTURL]" style="text-decoration:none !important;font-size: 15px;padding: 12px 40px;border: 0px solid #144991; display: inline-block;color: #ffffff;">Activate Account</a><label></label> </strong></td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <td width="100%" valign="top" align="left" style="padding-bottom:15px;font-size: 15px;font-family: Arial, sans-serif;">
                                                                <br></br>Please use this link if above button is not working. <br/>
                                                                <a href="[REDIRECTURL1]">[REDIRECTURL2]</a>
                                                            </td>
                                                        </tr>
                                                         <tr>
                                                            <td width="100%" valign="top" align="left" style="padding-bottom:15px;font-size: 15px;font-family: Arial, sans-serif;">
                                                            You need to activate your account to get full access to Staffline. Please use this code to activate your account.<br></br>
                                                               <br></br>Your One Time Password (OTP) is &nbsp;<b style="color:#659CEF">[OTP]</b>                                                                
                                                              <br><br>
                                                                <span style="font-size:12px;color:#666">[Note: OTP is valid for 5 minutes only]</span><br><br>
                                                                <br /><br />
                                                            </td>
                                                        </tr>
                                                         <tr>
                                                            <td width="100%" valign="top" align="left" style="padding-bottom:15px;font-size: 15px;font-family: Arial, sans-serif;">
                                                                Cheers, <br/> 
                                                                StaffLine Team
                                                            </td>
                                                        </tr>

                                                        <!-- footer HTML Start here -->

                                                        <tr>
                                                            <td width="100%" valign="top" align="left" style="border-top: 1px solid #808080;padding-top: 35px;">
                                                                <p class="copyRight" style="margin: 0;padding: 0;display: block;font-weight: normal;font-size: 15px;font-family: Arial, sans-serif;">Compunnel Inc., 103 Morgan Lane, Suite 102, Plainsboro, NJ
                                                                    08536
                                                                </p>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td class="socialLinks" width="100%" valign="top" align="left" style="padding-top: 20px;">
                                                                <span style="margin: 0;padding: 0;display: inline-block;font-weight: normal;font-size: 15px;font-family: Arial, sans-serif;">Remember to follow us on:</span>
                                                                <a href="javascript:void(0)" style="margin: 0;padding-bottom: 0;padding-bottom: 0;display: inline-block;font-weight: normal;text-decoration: none;font-size: 15px;font-family: Arial, sans-serif;line-height: 15px;color: #1ba0e1;">Facebook</a>                                                                <label style="font-size:13px;line-height: 14px;color: #ccc;">|</label>
                                                                <a href="javascript:void(0)" style="margin: 0;padding-bottom: 0;padding-bottom: 0;display: inline-block;font-weight: normal;text-decoration: none;font-size: 15px;font-family: Arial, sans-serif;line-height: 15px;color: #1ba0e1;">Twitter</a>                                                                <label style="font-size:13px;line-height: 14px;color: #ccc;">|</label>
                                                                <a href="javascript:void(0)" style="margin: 0;padding-bottom: 0;padding-bottom: 0;display: inline-block;font-weight: normal;text-decoration: none;font-size: 15px;font-family: Arial, sans-serif;line-height: 15px;color: #1ba0e1;">YouTube</a>                                                                <label style="font-size:13px;line-height: 14px;color: #ccc;">|</label>
                                                                <a href="javascript:void(0)" style="margin: 0;padding-bottom: 0;padding-bottom: 0;display: inline-block;font-weight: normal;text-decoration: none;font-size: 15px;font-family: Arial, sans-serif;line-height: 15px;color: #1ba0e1;">LinkedIn</a>
                                                            </td>
                                                        </tr>
                                                        <!-- footer HTML End Here -->
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td width="100%" valign="top" align="left" style="padding-top:10px;padding-bottom: 12px;padding-left: 10px;">
                                        <p style="margin: 0;padding: 0;display: block;font-weight: normal;font-size: 14px;font-family: Arial, sans-serif;color: #fff;text-align: center;">Copyright &copy; 2017. All rights reserved. Use is subject to <a href="javascript:void(0)"
                                                style="text-decoration: none;font-size: 14px;font-family: Arial, sans-serif;color: #1d92cc;display: inline-block;">Terms and Conditions</a></p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>', 1, CAST(N'2017-03-09 15:54:50.880' AS DateTime), 1, CAST(N'2017-03-09 15:54:50.880' AS DateTime), 1, 1, N'f5f6d903-c561-4dd7-98df-70f8727fa0b9')
GO
INSERT [dbo].[EmailTemplate] ([EmailTemplateID], [EventName], [EmailSubject], [TemplateHtml], [CreatedBy], [CreatedOn], [UpdatedBy], [UpdatedOn], [Status], [RowVersion], [RowGuid]) VALUES (1002, N'welcomeSocialMedia', N'Welcome to Staffline', N'<html>

<head>
    <title></title>
    <meta name="viewport" content="width=device-width">
    <meta http-equiv="Content-Type" content="text/html; charset=windows-1252">
    <style type="text/css">
        body {
            -webkit-text-size-adjust: 100%;
            margin: 0;
            padding: 0;
            border: 0px;
            font-family: Arial, sans-serif;
        }

        table,
        table td {
            border-collapse: collapse;
            border: 0px;
        }

        a:link,
        a:active {
            text-decoration: none!important;
        }

        @media only screen and (max-width: 600px) {
            table[class="wrapper"] {
                width: 100% !important;
            }
            .container,
            .whiteContainer {
                padding-left: 15px !important;
                padding-right: 15px !important;
            }
            .socialLinks {
                text-align: center !important;
            }
            .socialLinks span {
                display: block !important;
            }
            .socialLinks a {
                font-size: 12px !important;
                padding-left: 5px !important;
                padding-right: 5px !important;
                margin-top: 10px !important;
            }
            .copyRight {
                font-size: 14px !important;
                text-align: center !important;
            }
        }
    </style>
</head>

<body>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" bgcolor="#fff" style="table-layout:fixed;">
        <tr>
            <td width="100%" valign="top" align="left">
                <table class="wrapper" width="620" cellpadding="0" cellspacing="0" border="0" align="center" bgcolor="#144991">
                    <tr>
                        <td class="container" width="100%" valign="top" align="left" style="padding-top:12px;padding-bottom:12px;padding-left:30px;padding-right:30px;">

                            <!--main body start here-->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center">
                                <tr>
                                    <td width="100%" valign="top" align="left" style="padding:0px 0px 12px;">
                                        <img alt="" src="http://www.compunnel.com/siteassets/right-menu/logo.png" style="border:0; display:inline-block;margin:0;">
                                    </td>
                                </tr>
                                <tr>
                                    <td width="100%" valign="top" align="left" style="padding:0px 0px 10px;">
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="background-color:#fff;">
                                            <tr>
                                                <td class="whiteContainer" width="100%" valign="top" align="left" style="padding-top:30px;padding-bottom:30px;padding-left:20px;padding-right:20px;">
                                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center">
                                                        <tr>
                                                            <td width="100%" valign="top" align="left" style="padding-bottom:30px;font-size: 15px;font-family: Arial, sans-serif;">
                                                                Hi [NAME],
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td width="100%" valign="top" align="left" style="padding-bottom:15px;font-size: 15px;font-family: Arial, sans-serif;">
                                                                Thank you for registering with StaffLine.
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td width="100%" valign="top" align="left" style="padding-bottom:15px;font-size: 15px;font-family: Arial, sans-serif;">
                                                                We have created your account using <b style="color:#659CEF">[EMAIL].</b>
                                                                <br /><br /> If you wish to use your email address for future
                                                                login to Staffline then you may create your password here.
                                                                <br /><br />
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td width="100%" valign="top" align="left" style="padding-bottom:15px;">
                                                                <table border="0" cellpadding="0" cellspacing="0">
                                                                    <tr>
                                                                        <td align="center" bgcolor="#144991" class="btn" style="background: #144991;"><strong><a href="[REDIRECTURL]" style="text-decoration:none !important;font-size: 15px;padding: 12px 40px;border: 0px solid #144991; display: inline-block;color: #ffffff;">Create My Password</a><label></label> </strong></td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <td width="100%" valign="top" align="left" style="padding-bottom:15px;font-size: 15px;font-family: Arial, sans-serif;">
                                                                Please use this link if above button is not working. <br/><br />
                                                                <a href="[REDIRECTURL1]">[REDIRECTURL2]</a>
                                                            </td>
                                                        </tr>
                                                          <tr>
                                                            <td width="100%" valign="top" align="left" style="padding-bottom:15px;font-size: 15px;font-family: Arial, sans-serif;">
                                                            You need to activate your account to get full access to Staffline. Please use this code to activate your account.<br></br>
                                                               <br></br>Your One Time Password (OTP) is &nbsp;<b style="color:#659CEF">[OTP]</b>                                                                
                                                              <br><br>
                                                                <span style="font-size:12px;color:#666">[Note: OTP is valid for 5 minutes only]</span><br><br>
                                                                <br /><br />
                                                            </td>
                                                        </tr>
                                                         <tr>
                                                            <td width="100%" valign="top" align="left" style="padding-bottom:15px;font-size: 15px;font-family: Arial, sans-serif;">
                                                                Cheers, <br/> 
                                                                StaffLine Team
                                                            </td>
                                                        </tr>

                                                        <!-- footer HTML Start here -->

                                                        <tr>
                                                            <td width="100%" valign="top" align="left" style="border-top: 1px solid #808080;padding-top: 35px;">
                                                                <p class="copyRight" style="margin: 0;padding: 0;display: block;font-weight: normal;font-size: 15px;font-family: Arial, sans-serif;">Compunnel Inc., 103 Morgan Lane, Suite 102, Plainsboro, NJ
                                                                    08536
                                                                </p>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td class="socialLinks" width="100%" valign="top" align="left" style="padding-top: 20px;">
                                                                <span style="margin: 0;padding: 0;display: inline-block;font-weight: normal;font-size: 15px;font-family: Arial, sans-serif;">Remember to follow us on:</span>
                                                                <a href="javascript:void(0)" style="margin: 0;padding-bottom: 0;padding-bottom: 0;display: inline-block;font-weight: normal;text-decoration: none;font-size: 15px;font-family: Arial, sans-serif;line-height: 15px;color: #1ba0e1;">Facebook</a>                                                                <label style="font-size:13px;line-height: 14px;color: #ccc;">|</label>
                                                                <a href="javascript:void(0)" style="margin: 0;padding-bottom: 0;padding-bottom: 0;display: inline-block;font-weight: normal;text-decoration: none;font-size: 15px;font-family: Arial, sans-serif;line-height: 15px;color: #1ba0e1;">Twitter</a>                                                                <label style="font-size:13px;line-height: 14px;color: #ccc;">|</label>
                                                                <a href="javascript:void(0)" style="margin: 0;padding-bottom: 0;padding-bottom: 0;display: inline-block;font-weight: normal;text-decoration: none;font-size: 15px;font-family: Arial, sans-serif;line-height: 15px;color: #1ba0e1;">YouTube</a>                                                                <label style="font-size:13px;line-height: 14px;color: #ccc;">|</label>
                                                                <a href="javascript:void(0)" style="margin: 0;padding-bottom: 0;padding-bottom: 0;display: inline-block;font-weight: normal;text-decoration: none;font-size: 15px;font-family: Arial, sans-serif;line-height: 15px;color: #1ba0e1;">LinkedIn</a>
                                                            </td>
                                                        </tr>
                                                        <!-- footer HTML End Here -->
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td width="100%" valign="top" align="left" style="padding-top:10px;padding-bottom: 12px;padding-left: 10px;">
                                        <p style="margin: 0;padding: 0;display: block;font-weight: normal;font-size: 14px;font-family: Arial, sans-serif;color: #fff;text-align: center;">Copyright &copy; 2017. All rights reserved. Use is subject to <a href="javascript:void(0)"
                                                style="text-decoration: none;font-size: 14px;font-family: Arial, sans-serif;color: #1d92cc;display: inline-block;">Terms and Conditions</a></p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>', 1, CAST(N'2017-03-09 15:54:54.917' AS DateTime), 1, CAST(N'2017-03-09 15:54:54.917' AS DateTime), 1, 1, N'f19ccb17-4112-42ba-bc89-3f95ffd9c757')
GO
INSERT [dbo].[EmailTemplate] ([EmailTemplateID], [EventName], [EmailSubject], [TemplateHtml], [CreatedBy], [CreatedOn], [UpdatedBy], [UpdatedOn], [Status], [RowVersion], [RowGuid]) VALUES (1003, N'otp', N'One time password request', N'<html>

<head>
    <title></title>
    <meta name="viewport" content="width=device-width">
    <meta http-equiv="Content-Type" content="text/html; charset=windows-1252">
    <style type="text/css">
        body {
            -webkit-text-size-adjust: 100%;
            margin: 0;
            padding: 0;
            border: 0px;
            font-family: Arial, sans-serif;
        }

        table,
        table td {
            border-collapse: collapse;
            border: 0px;
        }

        a:link,
        a:active {
            text-decoration: none!important;
        }

        @media only screen and (max-width: 600px) {
            table[class="wrapper"] {
                width: 100% !important;
            }
            .container,
            .whiteContainer {
                padding-left: 15px !important;
                padding-right: 15px !important;
            }
            .socialLinks {
                text-align: center !important;
            }
            .socialLinks span {
                display: block !important;
            }
            .socialLinks a {
                font-size: 12px !important;
                padding-left: 5px !important;
                padding-right: 5px !important;
                margin-top: 10px !important;
            }
            .copyRight {
                font-size: 14px !important;
                text-align: center !important;
            }
        }
    </style>
</head>

<body>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" bgcolor="#fff" style="table-layout:fixed;">
        <tr>
            <td width="100%" valign="top" align="left">
                <table class="wrapper" width="620" cellpadding="0" cellspacing="0" border="0" align="center" bgcolor="#144991">
                    <tr>
                        <td class="container" width="100%" valign="top" align="left" style="padding-top:12px;padding-bottom:12px;padding-left:30px;padding-right:30px;">

                            <!--main body start here-->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center">
                                <tr>
                                    <td width="100%" valign="top" align="left" style="padding:0px 0px 12px;">
                                        <img alt="" src="http://www.compunnel.com/siteassets/right-menu/logo.png" style="border:0; display:inline-block;margin:0;">
                                    </td>
                                </tr>
                                <tr>
                                    <td width="100%" valign="top" align="left" style="padding:0px 0px 10px;">
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="background-color:#fff;">
                                            <tr>
                                                <td class="whiteContainer" width="100%" valign="top" align="left" style="padding-top:30px;padding-bottom:30px;padding-left:20px;padding-right:20px;">
                                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center">
                                                        <tr>
                                                            <td width="100%" valign="top" align="left" style="padding-bottom:30px;font-size: 15px;font-family: Arial, sans-serif;">
                                                                Hi [NAME],
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td width="100%" valign="top" align="left" style="padding-bottom:15px;font-size: 15px;font-family: Arial, sans-serif;">
                                                                Your One Time Password (OTP) is &nbsp;<b style="color:#659CEF">[OTP]</b>                                                                
                                                                <br><br> Please enter this OTP to complete the process.<br><br>
                                                                <span style="font-size:12px;color:#666">[Note: OTP is valid for 5 minutes only]</span><br><br>
                                                            </td>
                                                        </tr>                                                                                                             
                                                    
                                                        <tr>
                                                            <td width="100%" valign="top" align="left" style="padding-bottom:15px;font-size: 15px;font-family: Arial, sans-serif;">
                                                                Cheers, <br/>StaffLine Team
                                                            </td>
                                                        </tr>

                                                        <!-- footer HTML Start here -->

                                                        <tr>
                                                            <td width="100%" valign="top" align="left" style="border-top: 1px solid #808080;padding-top: 35px;">
                                                                <p class="copyRight" style="margin: 0;padding: 0;display: block;font-weight: normal;font-size: 15px;font-family: Arial, sans-serif;">Compunnel Inc., 103 Morgan Lane, Suite 102, Plainsboro, NJ
                                                                    08536
                                                                </p>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td class="socialLinks" width="100%" valign="top" align="left" style="padding-top: 20px;">
                                                                <span style="margin: 0;padding: 0;display: inline-block;font-weight: normal;font-size: 15px;font-family: Arial, sans-serif;">Remember to follow us on:</span>
                                                                <a href="javascript:void(0)" style="margin: 0;padding-bottom: 0;padding-bottom: 0;display: inline-block;font-weight: normal;text-decoration: none;font-size: 15px;font-family: Arial, sans-serif;line-height: 15px;color: #1ba0e1;">Facebook</a>                                                                <label style="font-size:13px;line-height: 14px;color: #ccc;">|</label>
                                                                <a href="javascript:void(0)" style="margin: 0;padding-bottom: 0;padding-bottom: 0;display: inline-block;font-weight: normal;text-decoration: none;font-size: 15px;font-family: Arial, sans-serif;line-height: 15px;color: #1ba0e1;">Twitter</a>                                                                <label style="font-size:13px;line-height: 14px;color: #ccc;">|</label>
                                                                <a href="javascript:void(0)" style="margin: 0;padding-bottom: 0;padding-bottom: 0;display: inline-block;font-weight: normal;text-decoration: none;font-size: 15px;font-family: Arial, sans-serif;line-height: 15px;color: #1ba0e1;">YouTube</a>                                                                <label style="font-size:13px;line-height: 14px;color: #ccc;">|</label>
                                                                <a href="javascript:void(0)" style="margin: 0;padding-bottom: 0;padding-bottom: 0;display: inline-block;font-weight: normal;text-decoration: none;font-size: 15px;font-family: Arial, sans-serif;line-height: 15px;color: #1ba0e1;">LinkedIn</a>
                                                            </td>
                                                        </tr>
                                                        <!-- footer HTML End Here -->
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td width="100%" valign="top" align="left" style="padding-top:10px;padding-bottom: 12px;padding-left: 10px;">
                                        <p style="margin: 0;padding: 0;display: block;font-weight: normal;font-size: 14px;font-family: Arial, sans-serif;color: #fff;text-align: center;">Copyright &copy; 2017. All rights reserved. Use is subject to <a href="javascript:void(0)"
                                                style="text-decoration: none;font-size: 14px;font-family: Arial, sans-serif;color: #1d92cc;display: inline-block;">Terms and Conditions</a></p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>', 1, CAST(N'2013-03-10 00:00:00.000' AS DateTime), 1, CAST(N'2017-03-10 00:00:00.000' AS DateTime), 1, 1, N'a1efbd0a-a5fc-4818-a090-75ac636f455c')
GO
INSERT [dbo].[EmailTemplate] ([EmailTemplateID], [EventName], [EmailSubject], [TemplateHtml], [CreatedBy], [CreatedOn], [UpdatedBy], [UpdatedOn], [Status], [RowVersion], [RowGuid]) VALUES (1004, N'acknowledgement', N'Your password has been changed', N'<html>

<head>
    <title></title>
    <meta name="viewport" content="width=device-width">
    <meta http-equiv="Content-Type" content="text/html; charset=windows-1252">
    <style type="text/css">
        body {
            -webkit-text-size-adjust: 100%;
            margin: 0;
            padding: 0;
            border: 0px;
            font-family: Arial, sans-serif;
        }

        table,
        table td {
            border-collapse: collapse;
            border: 0px;
        }

        a:link,
        a:active {
            text-decoration: none!important;
        }

        @media only screen and (max-width: 600px) {
            table[class="wrapper"] {
                width: 100% !important;
            }
            .container,
            .whiteContainer {
                padding-left: 15px !important;
                padding-right: 15px !important;
            }
            .socialLinks {
                text-align: center !important;
            }
            .socialLinks span {
                display: block !important;
            }
            .socialLinks a {
                font-size: 12px !important;
                padding-left: 5px !important;
                padding-right: 5px !important;
                margin-top: 10px !important;
            }
            .copyRight {
                font-size: 14px !important;
                text-align: center !important;
            }
        }
    </style>
</head>

<body>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" bgcolor="#fff" style="table-layout:fixed;">
        <tr>
            <td width="100%" valign="top" align="left">
                <table class="wrapper" width="620" cellpadding="0" cellspacing="0" border="0" align="center" bgcolor="#144991">
                    <tr>
                        <td class="container" width="100%" valign="top" align="left" style="padding-top:12px;padding-bottom:12px;padding-left:30px;padding-right:30px;">

                            <!--main body start here-->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center">
                                <tr>
                                    <td width="100%" valign="top" align="left" style="padding:0px 0px 12px;">
                                        <img alt="" src="http://www.compunnel.com/siteassets/right-menu/logo.png" style="border:0; display:inline-block;margin:0;">
                                    </td>
                                </tr>
                                <tr>
                                    <td width="100%" valign="top" align="left" style="padding:0px 0px 10px;">
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="background-color:#fff;">
                                            <tr>
                                                <td class="whiteContainer" width="100%" valign="top" align="left" style="padding-top:30px;padding-bottom:30px;padding-left:20px;padding-right:20px;">
                                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center">
                                                        <tr>
                                                            <td width="100%" valign="top" align="left" style="padding-bottom:30px;font-size: 15px;font-family: Arial, sans-serif;">
                                                                Dear [NAME],
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td width="100%" valign="top" align="left" style="padding-bottom:15px;font-size: 15px;font-family: Arial, sans-serif;">
                                                                 This is an acknowledgement mail for your request.<br><br> <b>[MSG]</b><br><br>
                                                            </td>
                                                        </tr>                                                                                                             
                                                    
                                                        <tr>
                                                            <td width="100%" valign="top" align="left" style="padding-bottom:15px;font-size: 15px;font-family: Arial, sans-serif;">
                                                                Cheers, <br/>StaffLine Team
                                                            </td>
                                                        </tr>

                                                        <!-- footer HTML Start here -->

                                                        <tr>
                                                            <td width="100%" valign="top" align="left" style="border-top: 1px solid #808080;padding-top: 35px;">
                                                                <p class="copyRight" style="margin: 0;padding: 0;display: block;font-weight: normal;font-size: 15px;font-family: Arial, sans-serif;">Compunnel Inc., 103 Morgan Lane, Suite 102, Plainsboro, NJ
                                                                    08536
                                                                </p>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td class="socialLinks" width="100%" valign="top" align="left" style="padding-top: 20px;">
                                                                <span style="margin: 0;padding: 0;display: inline-block;font-weight: normal;font-size: 15px;font-family: Arial, sans-serif;">Remember to follow us on:</span>
                                                                <a href="javascript:void(0)" style="margin: 0;padding-bottom: 0;padding-bottom: 0;display: inline-block;font-weight: normal;text-decoration: none;font-size: 15px;font-family: Arial, sans-serif;line-height: 15px;color: #1ba0e1;">Facebook</a>                                                                <label style="font-size:13px;line-height: 14px;color: #ccc;">|</label>
                                                                <a href="javascript:void(0)" style="margin: 0;padding-bottom: 0;padding-bottom: 0;display: inline-block;font-weight: normal;text-decoration: none;font-size: 15px;font-family: Arial, sans-serif;line-height: 15px;color: #1ba0e1;">Twitter</a>                                                                <label style="font-size:13px;line-height: 14px;color: #ccc;">|</label>
                                                                <a href="javascript:void(0)" style="margin: 0;padding-bottom: 0;padding-bottom: 0;display: inline-block;font-weight: normal;text-decoration: none;font-size: 15px;font-family: Arial, sans-serif;line-height: 15px;color: #1ba0e1;">YouTube</a>                                                                <label style="font-size:13px;line-height: 14px;color: #ccc;">|</label>
                                                                <a href="javascript:void(0)" style="margin: 0;padding-bottom: 0;padding-bottom: 0;display: inline-block;font-weight: normal;text-decoration: none;font-size: 15px;font-family: Arial, sans-serif;line-height: 15px;color: #1ba0e1;">LinkedIn</a>
                                                            </td>
                                                        </tr>
                                                        <!-- footer HTML End Here -->
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td width="100%" valign="top" align="left" style="padding-top:10px;padding-bottom: 12px;padding-left: 10px;">
                                        <p style="margin: 0;padding: 0;display: block;font-weight: normal;font-size: 14px;font-family: Arial, sans-serif;color: #fff;text-align: center;">Copyright &copy; 2017. All rights reserved. Use is subject to <a href="javascript:void(0)"
                                                style="text-decoration: none;font-size: 14px;font-family: Arial, sans-serif;color: #1d92cc;display: inline-block;">Terms and Conditions</a></p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>', 1, CAST(N'2017-03-15 00:00:00.000' AS DateTime), 1, CAST(N'2017-03-15 00:00:00.000' AS DateTime), 1, 1, N'4a83ebc9-e375-43c8-937a-db46f292a563')
GO
INSERT [dbo].[EmailTemplate] ([EmailTemplateID], [EventName], [EmailSubject], [TemplateHtml], [CreatedBy], [CreatedOn], [UpdatedBy], [UpdatedOn], [Status], [RowVersion], [RowGuid]) VALUES (1006, N'contactus', N'Recruiter not assigned', N'<html>
<head>
    <title></title>
    <meta name="viewport" content="width=device-width">
    <meta http-equiv="Content-Type" content="text/html; charset=windows-1252">
    <style type="text/css">
        body {
            -webkit-text-size-adjust: 100%;
            margin: 0;
            padding: 0;
            border: 0px;
            font-family: Arial, sans-serif;
        }

        table,
        table td {
            border-collapse: collapse;
            border: 0px;
        }

        a:link,
        a:active {
            text-decoration: none!important;
        }

        @media only screen and (max-width: 600px) {
            table[class="wrapper"] {
                width: 100% !important;
            }
            .container,
            .whiteContainer {
                padding-left: 15px !important;
                padding-right: 15px !important;
            }
            .socialLinks {
                text-align: center !important;
            }
            .socialLinks span {
                display: block !important;
            }
            .socialLinks a {
                font-size: 12px !important;
                padding-left: 5px !important;
                padding-right: 5px !important;
                margin-top: 10px !important;
            }
            .copyRight {
                font-size: 14px !important;
                text-align: center !important;
            }
        }
    </style>
</head>

<body>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" bgcolor="#fff" style="table-layout:fixed;">
        <tr>
            <td width="100%" valign="top" align="left">
                <table class="wrapper" width="620" cellpadding="0" cellspacing="0" border="0" align="center" bgcolor="#144991">
                    <tr>
                        <td class="container" width="100%" valign="top" align="left" style="padding-top:12px;padding-bottom:12px;padding-left:30px;padding-right:30px;">

                            <!--main body start here-->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center">
                                <tr>
                                    <td width="100%" valign="top" align="left" style="padding:0px 0px 12px;">
                                        <img alt="logo" src="http://www.compunnel.com/siteassets/right-menu/logo.png" style="border:0; display:inline-block;margin:0;"/>
                                    </td>
                                </tr>
                                <tr>
                                    <td width="100%" valign="top" align="left" style="padding:0px 0px 10px;">
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="background-color:#fff;">
                                            <tr>
                                                <td class="whiteContainer" width="100%" valign="top" align="left" style="padding-top:30px;padding-bottom:30px;padding-left:20px;padding-right:20px;">
                                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center">
                                                        <tr>
                                                            <td width="100%" valign="top" align="left" style="padding-bottom:30px;font-size: 15px;font-family: Arial, sans-serif;">
                                                                Hi Admin,
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td width="100%" valign="top" align="left" style="padding-bottom:15px;font-size: 15px;font-family: Arial, sans-serif;">
                                                                 [BODY]
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td width="100%" valign="top" align="left" style="padding-bottom:15px;font-size: 15px;font-family: Arial, sans-serif;">
                                                                Thanks & Regards,<br />
                                                                 [NAME] [LASTNAME] <br />
					                                              [FROMEMAIL]
                                                                <br /><br />
                                                            </td>
                                                        </tr>
                                                    
                                                        <!-- footer HTML Start here -->

                                                        <tr>
                                                            <td width="100%" valign="top" align="left" style="border-top: 1px solid #808080;padding-top: 35px;">
                                                                <p class="copyRight" style="margin: 0;padding: 0;display: block;font-weight: normal;font-size: 15px;font-family: Arial, sans-serif;">Compunnel Inc., 103 Morgan Lane, Suite 102, Plainsboro, NJ
                                                                    08536
                                                                </p>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td class="socialLinks" width="100%" valign="top" align="left" style="padding-top: 20px;">
                                                                <span style="margin: 0;padding: 0;display: inline-block;font-weight: normal;font-size: 15px;font-family: Arial, sans-serif;">Remember to follow us on:</span>
                                                                <a href="javascript:void(0)" style="margin: 0;padding-bottom: 0;padding-bottom: 0;display: inline-block;font-weight: normal;text-decoration: none;font-size: 15px;font-family: Arial, sans-serif;line-height: 15px;color: #1ba0e1;">Facebook</a>                                                                <label style="font-size:13px;line-height: 14px;color: #ccc;">|</label>
                                                                <a href="javascript:void(0)" style="margin: 0;padding-bottom: 0;padding-bottom: 0;display: inline-block;font-weight: normal;text-decoration: none;font-size: 15px;font-family: Arial, sans-serif;line-height: 15px;color: #1ba0e1;">Twitter</a>                                                                <label style="font-size:13px;line-height: 14px;color: #ccc;">|</label>
                                                                <a href="javascript:void(0)" style="margin: 0;padding-bottom: 0;padding-bottom: 0;display: inline-block;font-weight: normal;text-decoration: none;font-size: 15px;font-family: Arial, sans-serif;line-height: 15px;color: #1ba0e1;">YouTube</a>                                                                <label style="font-size:13px;line-height: 14px;color: #ccc;">|</label>
                                                                <a href="javascript:void(0)" style="margin: 0;padding-bottom: 0;padding-bottom: 0;display: inline-block;font-weight: normal;text-decoration: none;font-size: 15px;font-family: Arial, sans-serif;line-height: 15px;color: #1ba0e1;">LinkedIn</a>
                                                            </td>
                                                        </tr>
                                                        <!-- footer HTML End Here -->
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td width="100%" valign="top" align="left" style="padding-top:10px;padding-bottom: 12px;padding-left: 10px;">
                                        <p style="margin: 0;padding: 0;display: block;font-weight: normal;font-size: 14px;font-family: Arial, sans-serif;color: #fff;text-align: center;">Copyright &copy; 2017. All rights reserved. Use is subject to <a href="javascript:void(0)"
                                                style="text-decoration: none;font-size: 14px;font-family: Arial, sans-serif;color: #1d92cc;display: inline-block;">Terms and Conditions</a></p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>', 1, CAST(N'2017-07-19 19:08:15.723' AS DateTime), 1, CAST(N'2017-07-19 19:08:15.723' AS DateTime), 1, 1, N'21b38e3c-c01c-4a67-9bcc-acf262b5e82d')
GO
INSERT [dbo].[EmailTemplate] ([EmailTemplateID], [EventName], [EmailSubject], [TemplateHtml], [CreatedBy], [CreatedOn], [UpdatedBy], [UpdatedOn], [Status], [RowVersion], [RowGuid]) VALUES (1016, N'accountActivate', N'Account Activation', N'<html>

<head>
    <title></title>
    <meta name="viewport" content="width=device-width">
    <meta http-equiv="Content-Type" content="text/html; charset=windows-1252">
    <style type="text/css">
        body {
            -webkit-text-size-adjust: 100%;
            margin: 0;
            padding: 0;
            border: 0px;
            font-family: Arial, sans-serif;
        }

        table,
        table td {
            border-collapse: collapse;
            border: 0px;
        }

        a:link,
        a:active {
            text-decoration: none!important;
        }

        @media only screen and (max-width: 600px) {
            table[class="wrapper"] {
                width: 100% !important;
            }
            .container,
            .whiteContainer {
                padding-left: 15px !important;
                padding-right: 15px !important;
            }
            .socialLinks {
                text-align: center !important;
            }
            .socialLinks span {
                display: block !important;
            }
            .socialLinks a {
                font-size: 12px !important;
                padding-left: 5px !important;
                padding-right: 5px !important;
                margin-top: 10px !important;
            }
            .copyRight {
                font-size: 14px !important;
                text-align: center !important;
            }
        }
    </style>
</head>

<body>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" bgcolor="#fff" style="table-layout:fixed;">
        <tr>
            <td width="100%" valign="top" align="left">
                <table class="wrapper" width="620" cellpadding="0" cellspacing="0" border="0" align="center" bgcolor="#144991">
                    <tr>
                        <td class="container" width="100%" valign="top" align="left" style="padding-top:12px;padding-bottom:12px;padding-left:30px;padding-right:30px;">

                            <!--main body start here-->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center">
                                <tr>
                                    <td width="100%" valign="top" align="left" style="padding:0px 0px 12px;">
                                        <img alt="" src="http://www.compunnel.com/siteassets/right-menu/logo.png" style="border:0; display:inline-block;margin:0;">
                                    </td>
                                </tr>
                                <tr>
                                    <td width="100%" valign="top" align="left" style="padding:0px 0px 10px;">
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="background-color:#fff;">
                                            <tr>
                                                <td class="whiteContainer" width="100%" valign="top" align="left" style="padding-top:30px;padding-bottom:30px;padding-left:20px;padding-right:20px;">
                                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center">
                                                        <tr>
                                                            <td width="100%" valign="top" align="left" style="padding-bottom:30px;font-size: 15px;font-family: Arial, sans-serif;">
                                                                Hi [NAME],
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td width="100%" valign="top" align="left" style="padding-bottom:15px;font-size: 15px;font-family: Arial, sans-serif;">
                                                                Thank you for registering with StaffLine.
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td width="100%" valign="top" align="left" style="padding-bottom:15px;font-size: 15px;font-family: Arial, sans-serif;">
                                                                We have created your account using <b style="color:#659CEF">[EMAIL].</b>
                                                                <br /><br /> If you wish to use your email address for future
                                                                login to Staffline then you may create your password here.
                                                                <br /><br />
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td width="100%" valign="top" align="left" style="padding-bottom:15px;">
                                                                <table border="0" cellpadding="0" cellspacing="0">
                                                                    <tr>
                                                                        <td align="center" bgcolor="#144991" class="btn" style="background: #144991;"><strong><a href="[REDIRECTURL]" style="text-decoration:none !important;font-size: 15px;padding: 12px 40px;border: 0px solid #144991; display: inline-block;color: #ffffff;">Activate Account</a><label></label> </strong></td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <td width="100%" valign="top" align="left" style="padding-bottom:15px;font-size: 15px;font-family: Arial, sans-serif;">
                                                                <br></br>Please use this link if above button is not working. <br/>
                                                                <a href="[REDIRECTURL1]">[REDIRECTURL2]</a>
                                                            </td>
                                                        </tr>
                                                         <tr>
                                                            <td width="100%" valign="top" align="left" style="padding-bottom:15px;font-size: 15px;font-family: Arial, sans-serif;">
                                                               Your One Time Password (OTP) is &nbsp;<b style="color:#659CEF">[OTP]</b>                                                                
                                                                <br><br> Please enter this OTP to complete the process.<br><br>
                                                                <span style="font-size:12px;color:#666">[Note: OTP is valid for 5 minutes only]</span><br><br>
                                                            </td>
                                                        </tr>
                                                         <tr>
                                                            <td width="100%" valign="top" align="left" style="padding-bottom:15px;font-size: 15px;font-family: Arial, sans-serif;">
                                                                Cheers, <br/> 
                                                                StaffLine Team
                                                            </td>
                                                        </tr>

                                                        <!-- footer HTML Start here -->

                                                        <tr>
                                                            <td width="100%" valign="top" align="left" style="border-top: 1px solid #808080;padding-top: 35px;">
                                                                <p class="copyRight" style="margin: 0;padding: 0;display: block;font-weight: normal;font-size: 15px;font-family: Arial, sans-serif;">Compunnel Inc., 103 Morgan Lane, Suite 102, Plainsboro, NJ
                                                                    08536
                                                                </p>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td class="socialLinks" width="100%" valign="top" align="left" style="padding-top: 20px;">
                                                                <span style="margin: 0;padding: 0;display: inline-block;font-weight: normal;font-size: 15px;font-family: Arial, sans-serif;">Remember to follow us on:</span>
                                                                <a href="javascript:void(0)" style="margin: 0;padding-bottom: 0;padding-bottom: 0;display: inline-block;font-weight: normal;text-decoration: none;font-size: 15px;font-family: Arial, sans-serif;line-height: 15px;color: #1ba0e1;">Facebook</a>                                                                <label style="font-size:13px;line-height: 14px;color: #ccc;">|</label>
                                                                <a href="javascript:void(0)" style="margin: 0;padding-bottom: 0;padding-bottom: 0;display: inline-block;font-weight: normal;text-decoration: none;font-size: 15px;font-family: Arial, sans-serif;line-height: 15px;color: #1ba0e1;">Twitter</a>                                                                <label style="font-size:13px;line-height: 14px;color: #ccc;">|</label>
                                                                <a href="javascript:void(0)" style="margin: 0;padding-bottom: 0;padding-bottom: 0;display: inline-block;font-weight: normal;text-decoration: none;font-size: 15px;font-family: Arial, sans-serif;line-height: 15px;color: #1ba0e1;">YouTube</a>                                                                <label style="font-size:13px;line-height: 14px;color: #ccc;">|</label>
                                                                <a href="javascript:void(0)" style="margin: 0;padding-bottom: 0;padding-bottom: 0;display: inline-block;font-weight: normal;text-decoration: none;font-size: 15px;font-family: Arial, sans-serif;line-height: 15px;color: #1ba0e1;">LinkedIn</a>
                                                            </td>
                                                        </tr>
                                                        <!-- footer HTML End Here -->
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td width="100%" valign="top" align="left" style="padding-top:10px;padding-bottom: 12px;padding-left: 10px;">
                                        <p style="margin: 0;padding: 0;display: block;font-weight: normal;font-size: 14px;font-family: Arial, sans-serif;color: #fff;text-align: center;">Copyright &copy; 2017. All rights reserved. Use is subject to <a href="javascript:void(0)"
                                                style="text-decoration: none;font-size: 14px;font-family: Arial, sans-serif;color: #1d92cc;display: inline-block;">Terms and Conditions</a></p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>', 1, CAST(N'2017-08-02 13:24:09.890' AS DateTime), 1, CAST(N'2017-08-02 13:24:09.890' AS DateTime), 1, 1, N'0f3d64a1-4843-4f9d-9a8b-762c336c2f65')
GO
INSERT [dbo].[EmailTemplate] ([EmailTemplateID], [EventName], [EmailSubject], [TemplateHtml], [CreatedBy], [CreatedOn], [UpdatedBy], [UpdatedOn], [Status], [RowVersion], [RowGuid]) VALUES (1024, N'contactusnew', N'Email from the User', N'<html><head></head><body><div style="background:#eee; padding:15px;font-family:Arial;">
        <table cellpadding="15" border="0" width="750" align="center">
            <tbody><tr style="background: #1a366b"><td><img style="width:124px;height:60px" src="http://staffing.compunnel.com/Static/gfx/logo.png"></td></tr>
            <tr style="background:#fff">
                <td colspan="2">
                    <h5 style="font-size:18px;">
					[REQUESTTYPE] <br /><br />
                    Hi Admin,<br />
					</h5><p style="font-size:15px;">
                   [COMMENTS]

                    </p>
                    <p style="font-size:14px;">
                        Thanks & Regards,<br />
                       [NAME] [LASTNAME] <br />
					   [FROMEMAIL]
	<br />				   [MOBILENO]
                    </p>
                </td>
            </tr>
            <tr style="background: #1a366b">
                <td colspan="2" align="center"><a href="https://twitter.com/InfoProLearning" target="_blank" style="margin: 0 15px;"><img alt="Twitter" src="http://www.infoprolearning.com/emailers/thankyou/images/twitter.png" width="26" border="0" height="22"> </a><a style="margin: 0 15px;" href="https://www.linkedin.com/company/infopro-worldwide" target="_blank"><img alt="LinkedIn" src="http://www.infoprolearning.com/emailers/thankyou/images/linkedin.png" width="22" border="0" height="22"> </a><a style="margin: 0 15px;" href="https://www.facebook.com/InfoProLearning" target="_blank"><img alt="Facebook" src="http://www.infoprolearning.com/emailers/thankyou/images/facebook.png" width="11" border="0" height="22"> </a></td>
            </tr>
        </table>
    </div>', 1, CAST(N'2017-08-29 16:48:53.323' AS DateTime), NULL, CAST(N'2017-08-29 16:48:53.323' AS DateTime), 1, 1, N'95aabcec-feb2-4fa4-a137-042940d07c9a')
GO
SET IDENTITY_INSERT [dbo].[EmailTemplate] OFF
GO
/******===========================================================================================================================================================******/
GO