/**
 * File: fw.js
 * Author: Mario Nuñez
 * Version: 1.0
 * Description: Framework Main
 */
class fwClass 
{
    constructor()
    {
        this.utils = require('./utils');
        this.db = new (require('./dbmanager'));
        this.settings = require('../../config/settings.json');
        this.joi = require('@hapi/joi');
        this.boom = require('@hapi/boom');
        this._ = require('lodash');

        // Alias
        this.param = this.joi;
        this.lodash = this._;
    }

    promise(fn)
    {
        return new Promise(async function(resolve,reject)
        {
            let err = '';
            await fn(resolve,reject).catch(function(ex)
            {            
                if(ex.constructor.name === 'Error')
                    console.error(ex);
                else
                    fw.server.log(['error'],ex,ex)
                    
                reject(ex);
            });
        });
    }

    getController(name)
    {
        return require('../controllers/'+name+'.js');
    }

    getDAO(name)
    {
        return require('../models/DAO/'+name+'DAO.js');
    }

    getService(name)
    {
        return require('../models/services/'+name+'Service.js');
    }
}

const fw = global['fw'] = new fwClass();