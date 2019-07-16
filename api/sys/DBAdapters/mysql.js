/**
 * File: mysql.js
 * Author: Mario Nuñez
 * Version: 1.1
 * Description: MYSQL Adapter, Handles connections made to MYSQL databases
 */

class mysqlAdapter 
{
    constructor(config)
    {
        this.dbconfig = config;
        this.mysql = require('mysql2');
        this.pool = null;
    }

    async getConnection()
    {
        if(!this.pool)
        {
            this.pooltmp = this.mysql.createPool({
                connectionLimit : 20,
                host: this.dbconfig.SERVER,
                user: this.dbconfig.USERNAME,
                password: this.dbconfig.PASSWORD,
                database: this.dbconfig.DATABASE,
                port: (this.dbconfig.PORT) ? this.dbconfig.PORT : 3306
              });
            this.pool = this.pooltmp.promise();
            this.startTime = new Date();     
        }

        return await this.pool.getConnection();
    }


    async execute(sql,options,otherOptions = {})
    {
        return await this.pool.query(sql,options);
    }

    async executeProcedure()
    {
        throw new Error('executeProcedure not used on MYSQL, use execute instead.');
    }

    async close()
    {
        await this.closePool();
    }

    async closePool()
    {
        if(this.pool)
        {
            await this.pool.end();
            this.pool = null;
            return true;
        }            
        
        return false;
    }    
}


module.exports = mysqlAdapter;