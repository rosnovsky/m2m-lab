import winston from 'winston'

const logger = new winston.createLogger({
	transports: [
		new winston.transports.Console({
			timestamp: true,
			level: 'debug',
			handleExceptions: true,
			json: false,
			colorize: true
		})
	],
	exitOnError: false
});

module.exports = logger;
module.exports.stream = {
	write: function(message, encoding) {
		logger.info(message.replace(/\n$/, ''));
	}
};
