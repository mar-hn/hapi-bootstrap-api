/**
 * File: hapi-custom-logger.js
 * Author: Mario Nuñez
 * Version: 1.1
 * Description: Custom logger made for HapiJS
 * 
 * TODO: Clean and separate this to multiple files.
 */

// Set error levels
const LogPath = fw.utils.path.join(__dirname, '/../../../logs/');
const winstonlevels = 
{
    levels: 
    {
      error: 0,
      warn: 1,
      info: 2,
      request: 3,
      debug: 4
    },
    colors: 
    {
      error: 'red',
      warn: 'yellow',
      info: 'blue',
      request: 'white',
      debug: 'blue'
    },
    settings: 
    {
        error: 
        {
            LogToFile: true,
            filepath: fw.utils.path.join(LogPath,'/errors.log'),
            LogToNodeOut: true
        },
        info: 
        {
            LogToFile: false,
            filepath: fw.utils.path.join(LogPath,'/info.log'),
            LogToNodeOut: true
        },
        warn:
        {
            LogToFile: false,
            filepath: fw.utils.path.join(LogPath,'/warn.log'),
            LogToNodeOut: true
        },
        request:
        {
            LogToFile: true,
            filepath: fw.utils.path.join(LogPath,'/requests.log'),
            LogToNodeOut: false
        },
        debug:
        {
            LogToFile: true,
            filepath: fw.utils.path.join(LogPath,'/debug.log'),
            LogToNodeOut: false
        }
    }
};  


class Logger 
{
    constructor()
    {
        this.winston = require('winston');
        this.winston.addColors(winstonlevels.colors);
        this.Loggers = {};
        for(let level of fw.lodash.keys(winstonlevels.levels))
        {
            let tLogger = this.winston.createLogger(
            {
                level: 'debug',
                levels: winstonlevels.levels,
                format: this.winston.format.simple(),
            });

            if(winstonlevels.settings[level].LogToFile)
                tLogger.add(new this.winston.transports.File({ filename: winstonlevels.settings[level].filepath, level }));
            
            if(winstonlevels.settings[level].LogToNodeOut)
                tLogger.add(new this.winston.transports.File({ filename: fw.utils.path.join(LogPath,'/node-out.log')}));
                        
            // Output to console if on local/Dev environment
            if (process.env.NODE_ENV !== 'production' && (winstonlevels.settings[level].LogToNodeOut || level === 'debug')) 
            {
                tLogger.add(new this.winston.transports.Console({
                    format: this.winston.format.combine(
                        this.winston.format.colorize(),
                        this.winston.format.simple()
                    )
                }));
            }

            this.Loggers[level] = tLogger;
        }
    }
    
    info(logtext)
    {        
        this.Loggers.info.log('info',logtext);
    }

    request(logtext)
    {
        this.Loggers.request.log('request',logtext);
    }

    error(logtext)
    {
        this.Loggers.error.log('error',logtext);
    }
    
    warn(logtext)
    {
        this.Loggers.warn.log('warn',logtext);
    }

    debug(logtext)
    {
        this.Loggers.debug.log('debug',logtext);
    }
}

function formatError(event)
{

    const errInstance = event instanceof Error;
    
    if(errInstance === false)
    {
        if(!('error' in event))
            return null;
    }

    let error = {};
    let message = errInstance ? event.message : null;
    let stack = null;
    const err = errInstance ? event : event.error;

    if (err.isJoi) {
        message = err.details.message;
    }

    if (err.isBoom) {
        message = err.message;
    }

    stack = err.stack;
    error = { message, stack };
    error.isServer = err.isServer;
    error.isDeveloperError = err.isDeveloperError;

    return { error };
};

// Save logger for later use
fw.logger = new Logger();

// Escape logs
function elog(str)
{
    return str.replace(/\"/g,"'");
}

function eventLog(event,tags)
{
    let strLog = `timestamp="${event.timestamp ? new Date(event.timestamp) : new Date()}" `+
                 `tags="${elog(JSON.stringify(fw.lodash.keys(tags)))}" ` +
                 `hostname="${elog(fw.utils.os.hostname())}" `;

    if (tags.error || event.error) 
    {
        event.error = event.error || {message:'', stack:''};
        strLog += `type="exception" ` +
                  `errorMessage="${elog(event.error ? event.error.message : 'unknown')}" ` + 
                  `stacktrace="${elog(event.error.stack.replace(event.error + '\n',"").split("\n", 1).join("").trim())}" `;
    }

    if(event.data)
        strLog += `data="${elog(JSON.stringify(event.data))}" `;

    if (tags.error || event.error) 
        fw.logger.error(strLog);
    else
        fw.logger.info(strLog);
}

function requestLog(event,tags)
{
    const totalTime = new Date(event.info.responded) - new Date(event.info.received);
    let strLog = `timestamp="${new Date()}" `+
                 `remoteAddress="${event.location.ip}" `+
                 `tags="${elog(tags ? JSON.stringify(tags) : '')}" `+
                 `hostname="${elog(fw.utils.os.hostname())}" `+
                 `method="${elog(event.method.toUpperCase())}" `+
                 `URL="${elog(event.url.href)}" `+
                 `statuscode="${event.response.statusCode}" `+
                 `statusmessage="${elog(event.raw.res.statusMessage)}" `+
                 `responsetime=${totalTime} `+
                 `user-agent="${elog(event.headers['user-agent'])}" `+
                 `referer="${elog(event.headers.referer)}" ` +
                 `isAuthenticated=${event.auth.isAuthenticated} `;

    if(event.auth.token)
        strLog +=`token="${elog(event.auth.token)}" `;

    if( event.response.statusCode != 200 )
         strLog +=`payload="${elog(JSON.stringify(event.payload))}" response="${elog(JSON.stringify(event.response.source))}" `;

    fw.logger.request(strLog);    
}

function exceptionHandler(err)
{
    fw.logger.error(`timestamp="${new Date()}" ` +
                    `hostname="${elog(fw.utils.os.hostname())}" ` +
                    `type="uncaughtException" ` +
                    `errorMessage="${elog(err ? err.message : 'unknown')}" ` +
                    `stacktrace="${elog(err.stack.replace(err + '\n',"").split("\n", 1).join("").trim())}" `);
}

function RejectionHandler(reason, promise)
{
    fw.logger.error(`timestamp="${new Date()}" ` +
                    `hostname="${elog(fw.utils.os.hostname())}" ` +
                    `type="unhandledRejection" ` +
                    `errorMessage="${elog(reason)}" ` +
                    `stacktrace="${elog(reason.stack.replace(reason + '\n',"").split("\n", 1).join("").trim())}" `);
}

function shutdownHandler(Signal)
{           
    fw.logger.warn(`timestamp="${new Date()}" ` +
                    `hostname="${elog(fw.utils.os.hostname())}" ` +
                    `type="shutdown" ` +
                    `message="Received signal '${elog(Signal)}' -  Server shutting down" `);

    process.exit(1);    
}

module.exports = async (server) => 
{   
    process.on('uncaughtException', exceptionHandler);
    process.on('unhandledRejection', RejectionHandler);
    
    process.once('SIGTERM', () => shutdownHandler('SIGTERM'));
    process.once('SIGINT', () => shutdownHandler('SIGINT')); 
    // process.once('SIGUSR2', () => shutdownHandler('SIGUSR2')); 
       
    server.events.on('log', eventLog);    
    server.events.on('response', requestLog);

    console.log(['info', 'plugin'], 'plugin: Hapi-logger registered');
    
    return true;
};