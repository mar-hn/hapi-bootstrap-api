/**
 * File: hapi-geo-locate.js
 * Author: Mario Nuñez
 * Version: 1.0
 * Source: https://github.com/futurestudio/hapi-geo-locate
 * Description: A hapi plugin to geo locate requests by IP and provide 'request.location' in your route handlers. 
 * The plugin uses ipinfo.io for the IP geo location.
 */

module.exports = async (server) => 
{
    try 
    {
        await server.register({
            plugin: require('hapi-geo-locate')
        });

    } catch (e) {
        console.error('Error on hapi-geo-locate Plugin', e);
        throw e;
    }
    
    console.log(['info', 'plugin'], 'plugin: Hapi-geo-locate registered');
    return true;
};