
'use strict';
const winston = require('winston');
const fs = require('fs');
const env = process.env.NODE_ENV || 'development';
const logDirInfo = 'info';

if (!fs.existsSync(logDirInfo)) {
  fs.mkdirSync(logDirInfo);
}
const tsFormat = () => (new Date()).toISOString().replace(/T/, ' ').replace(/\..+/, '') ;
const loggerInfo = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      timestamp: tsFormat,
      handleExceptions: true,
      colorize: true,
      level: 'debug'
    }),
    new (require('winston-daily-rotate-file'))({
      filename: `${logDirInfo}/-info.log`,
      timestamp: tsFormat,
      handleExceptions: true,
      datePattern: 'yyyy-MM-dd',
      prepend: true,
      level: env === 'development' ? 'debug' : 'info'
    })
  ]
});



module.exports = loggerInfo;
// module.exports.stream = {
//     write: function(message, encoding){
//         logger.info(message);
//     }
// };