/**
 *  -------Import all classes and packages -------------
 */
import redis from 'redis';
import util from 'util';
import configContainer from '../config/localhost';
import logger from './logger';

/*
let config = configContainer.loadConfig(),
    redisClient = redis.createClient({
        host: config.redisConfig.REDIS_HOST,
        port: config.redisConfig.REDIS_PORT
    });

redisClient.on('error', (err) => {
    logger.error('Redis server encountered an error: ', err);
});

redisClient.on('connect', (err, res) => {
    // logger.info('Redis server connected..');
});

redisClient.monitor((err, res) => {
    if (!err) {
       // logger.info('Entering monitoring mode..');
    } else {
        logger.error(err);
    }
});

redisClient.on('monitor', (time, args, rawReply) => {
    //logger.info('Redis request received...', (args && args.length ? args[0] : ""));
});
*/

let redisClient = {};

module.exports = redisClient;