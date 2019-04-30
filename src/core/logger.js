
'use strict';
const winston = require('winston');
const fs = require('fs');
const env = process.env.NODE_ENV || 'development';
const logDir = 'log';

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}
const tsFormat = () => (new Date()).toISOString().replace(/T/, ' ').replace(/\..+/, '') ;
const logger = new (winston.Logger)({
  transports: [
    
    new (winston.transports.Console)({
      timestamp: tsFormat,
      handleExceptions: true,
      colorize: true,
      level: 'debug'
    }),
    new (require('winston-daily-rotate-file'))({
      filename: `${logDir}/-errors.log`,
      timestamp: tsFormat,
      handleExceptions: true,
      datePattern: 'yyyy-MM-dd',
      prepend: true,
      level: env === 'development' ? 'debug' : 'info'
    })
  ]
});
// logger.debug('Debugging info');
// logger.verbose('Verbose info');
// logger.info('Hello world');
// logger.warn('Warning message');
// logger.error('Error info');

module.exports = logger;
// module.exports.stream = {
//     write: function(message, encoding){
//         logger.info(message);
//     }
// };