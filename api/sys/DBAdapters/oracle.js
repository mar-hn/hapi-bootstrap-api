/**
 * File: oracle.js
 * Author: Mario Nuñez
 * Version: 1.1
 * Description: Oracle Adapter, Handles connections made to oracle databases
 */

class oracleAdapter 
{
    constructor(config)
    {
        this.oracledb = require('oracledb');
        this.SimpleOracleDB = require('simple-oracledb');
        this.SimpleOracleDB.extend(this.oracledb);
        this.oracledb.outFormat = this.oracledb.OBJECT;
        this.oracledb.autoCommit = true;
        this.pool = null;
        this.dbconfig = config;
        this.MAX_ROWS = 1000;    
    }
    
    buildConnectionString()
    {
        return `( DESCRIPTION = 
                    ( ADDRESS_LIST = 
                        ( ADDRESS = 
                            (PROTOCOL = TCP)
                            (HOST = ${this.dbconfig.SERVER})
                            (PORT = ${this.dbconfig.PORT})
                        ) 
                    ) 
                    ( CONNECT_DATA = 
                        (SID = ${this.dbconfig.SID}) 
                        (SERVER = DEDICATED) 
                    )
                )`;
    }
    
    async getConnection()
    {
        if(!this.pool)
        {
            this.pool = await this.oracledb.createPool ({
                user            : this.dbconfig.USERNAME,
                password        : this.dbconfig.PASSWORD,
                connectionString: this.buildConnectionString(),
            });
            this.startTime = new Date();
        }

        return await this.pool.getConnection();
    }
        
    async closePool()
    {
        if(this.pool && this.pool.connectionsOpen)
        {
            await this.pool.close();
            this.pool = null;
            return true;
        }            
        
        return false;
    }
    
    async execute(sql,props)
    {        
        const conn = await this.getConnection(); 
        const result = await conn.execute(sql,props);
        conn.release();
        return result;
    }


    async executeProcedure(SQL,Parameters)
    {
        SQL = `
        BEGIN
            ${( SQL.endsWith(';') ) ? SQL : `${SQL};`}
        END;
        `;

        const conn =  await this.getConnection(); 
        const result = await conn.execute(SQL,Parameters);

        for( let i in Parameters )
        {
            const Param = Parameters[i];
            if(Param.type === this.oracledb.CURSOR && Param.dir === this.oracledb.BIND_OUT)
            {
                const outBindRef = result.outBinds[i];
                outBindRef.rows = await outBindRef.getRows(this.MAX_ROWS);
                await outBindRef.close();
            }
        }

        conn.release();
        return result;
    }
    
    async close()
    {
        await this.closePool();
    }    
}

module.exports = oracleAdapter;