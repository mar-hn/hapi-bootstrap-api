/**
 * File: DBManager.js
 * Author: Mario Nuñez
 * Version: 1.1
 * Description: DBManager Class declaration, handles connections to database
 */

class dbmanager
{
    constructor()
    {
        this.fs = require('fs');
    }

    getEnvironment()
    {
        return process.env.NODE_ENV || 'DEV';
    }

    getDBConfig()
    {
        // return JSON.parse(this.fs.readFileSync(__dirname + '/../../../config/db_credentials.json', 'utf8'));
        return require('../../../config/db_credentials.json');
    }

    getConnection(datasource)
    {
        const dbconfig = this.getDBConfig()[this.getEnvironment()][datasource];
        if(!dbconfig) throw new Error(`Datasource '${datasource}' was not found on ${this.getEnvironment()} environment.`);

        let Adapter = null;
        fw.Adapter = fw.Adapter || {};
        try
        {
            Adapter = require('./DBAdapters/' + dbconfig.TYPE.toLowerCase());
        } catch(e)
        {
            throw('Unhandled database type: ' + dbconfig.TYPE);
        }
        
        let Conn = fw.Adapter[datasource];
        if(!Conn) 
        {
            console.log('Creating adapter for datasoure: ' + datasource);
            Conn = fw.Adapter[datasource] = new Adapter(dbconfig);
        }

        return Conn;
    }


    async execute(datasource,sql,parameters,options)
    {
        const Conn = this.getConnection(datasource);        
        const stack = new Error().stack.split("\n").slice(2).join("\n").trim();
        let result = null;
        try
        {
            result = await Conn.execute(sql,parameters,options);
        }catch(e)
        {
            const dbException = new Error(e.message);
            dbException.stack = stack;
            throw(dbException);
        }
        
        return result;
    }

    async executeProcedure(datasource, sql, parameters)
    {
        const Conn = this.getConnection(datasource);        
        const stack = new Error().stack.split("\n").slice(2).join("\n").trim();
        let result = null;
        try
        {
            result = await Conn.executeProcedure(sql,parameters);
        }catch(e)
        {
            const dbException = new Error(e.message);
            dbException.stack = stack;
            throw(dbException);
        }
        return result;
    }    
}

module.exports = dbmanager;