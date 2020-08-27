require('dotenv').config();
const mongo = require('mongodb');
const assert = require('assert');
const password = process.env.DBPASS || 'Your password here'
const clustername = process.env.DBCLUSTER || 'Your cluster here'
const dbname = process.env.DBNAME || 'Your db name here'
const { log } = require('../commands/helpers.js');

const url = `mongodb+srv://admin:${password}@${dbname}.xbm61.mongodb.net/${clustername}?retryWrites=true&w=majority`


module.exports.DB = class DB
{
    constructor()
    {
        this.client = mongo.MongoClient(url, { useUnifiedTopology: true } );
        this.db = null;
        this.dbinfo = null;
    }

    /**
     * Accepts:
     *  - Tables
     * @param {String} args what to grab
     * @param {String[]} options Optional arguments
     * @example DB.get('tables')
     */
    async get(args, ...options)
    {
        const test = (query) => {return (new RegExp(`^${query}$`)).test(args)}
        console.log(options)
        switch(true)
        {
            case test('tables'):
                return await this.tables();
            break;
            case test('table'):
                return await this.table(args, options);
            break;
            default:
                return null;
        }
    }

    /**
     * You need to await this function when calling since we are
     * connecting to the server and requesting the Collections (Tables)
     * @async
     * @returns {String[]}
     */
    async tables()
    {
        return await this.db.listCollections().toArray();
    }

    /**
     * 
     * @param {*} collection Table to query
     * @param  {{}} query Query selector
     */
    table(collection, query = {})
    {
        this.db.collection.find(collection, query);
    }

    insertinto(collection, data)
    {
        // Todo add code
    }
    

    /**
     * @description Connects our worker to an Atlas Server
     * @augments this.db With database entry point
     */
    connect()
    {
        this.client.connect((err, res)=>
        {
            log(null,'Connected to database') // Default null for log
            this.db = res.db();
        })
    }

    close()
    {
        this.client.close();
    }
}