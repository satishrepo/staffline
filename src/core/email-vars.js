import enums from './enums';

let welcome = {
	eventName:enums.emailTemplateEvents.emailEventWelcome,
		params:{
		 	NAME : '',
		    REDIRECTURL : '',
		    OTP : ''
		}
}

let reportABug = {
	eventName:enums.emailTemplateEvents.emailReportABug,
		params:{		 	
		    USERNAME : '',
		    EMAIL : '',
		    PHONE : '',
		    COMMENTS : '',
		}
}

module.exports = {
	welcome : welcome,
	reportABug : reportABug
}
