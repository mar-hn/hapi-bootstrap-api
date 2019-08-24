/**
 * File: Utils.js
 * Author: Mario Nuñez
 * Version: 1.0
 * Description: Misc Utilities
 * 
 * TODO: Clean this
 */
class utils
{
    constructor()
    {
        this.fs = require('fs');
        this.glob = require('glob');
        this.uuid = require('uuid/v1');
        this.crypto = require('crypto');
        this.dateformat = require('dateformat');
        this.stream = require('stream');
        this.os = require('os');
        this.path = require('path');        
    }

    getMD5(data)
    {
        return this.crypto.createHash('md5').update(data).digest("hex");
    }

    getUUID()
    {
        return this.uuid();
    }

    encrypt(algorithm ,data)
    {
        return this.crypto.createHmac(algorithm, fw.settings.EncryptionKey)
                            .update(data)
                            .digest('hex');
    }

    getSalt()
    {
        return this.encrypt('SHA256',this.getUUID());
    }

    getFiles(path, realpath) 
    {
        return this.glob.sync(path, 
        {
            cwd: require('path').join(__dirname, '..'),
            nodir: true,
            realpath: realpath
        });
    };

    loadFiles(path) 
    {
        return this.getFiles(path, true).map(function(file) 
        {
            return require(file);
        });
    };

    isFile(path) 
    {
        try {
            var check = fs.lstatSync(path).isFile();
        } catch(e) {
            throw e;
            return false;
        }
        return check;
    };

    isDirectory(path) 
    {
        return !isFile(path);
    };

    isObject(arg) 
    {
        return arg !== null && typeof arg === 'object';
    };
    
    isString(arg) 
    {
        return typeof arg === 'string';
    };
    
    isFunction(arg) 
    {
        return typeof arg === 'function';
    };

    pad(n, width, z) 
    {
        z = z || '0';
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }

    arraymove(arr,from, to) 
    {
        arr.splice(to, 0, arr.splice(from, 1)[0]);
        return arr;
    };    
}

module.exports = new utils();