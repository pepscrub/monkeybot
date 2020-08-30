require('dotenv').config();
const mongo = require('mongodb');
const assert = require('assert');
const password = process.env.DBPASS || 'Your password here'
const clustername = process.env.DBCLUSTER || 'Your cluster here'
const dbname = process.env.DBNAME || 'Your db name here'
const { log } = require('../commands/helpers.js');


const url = `mongodb+srv://admin:${password}@${dbname}.xbm61.mongodb.net/${clustername}?retryWrites=true&w=majority`

/**
 * @classdesc Wrapper for MongoDB because I hate the mongoose wrapper. Why do you need schemas??????????
 */
module.exports.DataBase = class DataBase
{
    constructor()
    {
        this.client = mongo.MongoClient(url, { useUnifiedTopology: true } );
        this.db = null;
        this.dbinfo = null;
    }

    connected()
    {
        return this.db === null ? false : true;
    }

    async db()
    {
        return this.client;
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


    async update(coll, query = {}, update = {}, options = {})
    {
        coll.findOneAndUpdate(query,update,options);
    }

    async table(coll)
    {
        return await this.db.collection(coll);
    }

    /**
     * 
     * @param {*} collection Table to query
     * @param  {{}} query Query selector
     */
     async tablequery(coll, query = {})
    {
        return await this.db.collection(coll).find(query);
    }

    /**
     * 
     * @param {String} collection name of collection 
     * @param {Array} data 
     */
    insertinto(collection = null, data = null)
    {
        if(!(collection || data)) throw collection || data;
        this.db.collection(collection).insertOne(data)
    }
    

    /**
     * @description Connects our worker to an Atlas Server
     * @augments this.db With database entry point
     */
    conn()
    {
        return new Promise((resolve, rej)=>
        {
            this.client.connect((err, res)=>
            {
                if(err) throw err
                resolve(true)
                log('Connected to database')
                this.db = res.db();
            })
        })
    }

    close()
    {
        this.client.close(()=>
        {
            log('Disconnected from database')
        });
    }
}