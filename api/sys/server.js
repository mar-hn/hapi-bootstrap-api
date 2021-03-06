/**
 * File: server.js
 * Author: Mario Nuñez
 * Version: 1.0
 * Description: Project startup, inits server instance
 */
'use strict';

require('./fw');
require('dotenv').config();
const Hapi  = require('@hapi/hapi');

fw.server = new Hapi.Server({
    port: process.env.PORT || 3030,
    host: process.env.HOST || 'localhost',
    routes: 
    {
        cors: true,
        // {
        //     origin: ['http://*.domain.com']
        // } 
    },
    debug: false
    // debug: 
    // { 
    //     request: ['*'],
    //     log: ['*']
    // }
});

function getRoutes()
{
    let routesPaths = fw.utils.getFiles('routes/**/*.js', true);
    let routes = [];
    let index = 0;

    if(Array.isArray(routesPaths))
    {
        for(let r of routesPaths )
            routes.push(require(r));
    }

    for(let r of routes )
    {        
        if(!fw.utils.isObject(r) || fw.lodash.isEmpty(r))
            throw "Invalid route definition in "+routesPaths[index];

        // Force all routes to display in swagger
        for(let rx of r)
        {
            if( Array.isArray(rx.options.tags) )
                rx.options.tags.push('api');
            else
                rx.options.tags = ['api']
        }

        index++;
    }

    return routes;
}

function getPlugins() 
{
    let pluginsPaths = fw.utils.getFiles('sys/Plugins/**/*.js', true);
    let plugins = [];

    if (Array.isArray(pluginsPaths)) 
    {
        for (let p of pluginsPaths)
            plugins.push(require(p));
    }

    return plugins;
}


async function start(){

    console.log('Starting...');

    try 
    {        
        for (let plugin of getPlugins())
            await plugin(fw.server);

        for(let route of getRoutes())
            fw.server.route(route);
        
        // Start server
        await fw.server.start();
        console.log(`Server is running on ${fw.server.info.uri}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    }
    catch(error)
    {        
        console.error(error);
        throw(error);
    }
}

start();