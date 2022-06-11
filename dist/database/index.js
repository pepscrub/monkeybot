"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataBase = exports.CONFIG = void 0;
const mongodb_1 = require("mongodb");
require("dotenv/config");
exports.CONFIG = process.env;
const url = `mongodb+srv://admin:${exports.CONFIG.DB_PASS}@${exports.CONFIG.DB_NAME}.xbm61.mongodb.net/bot?retryWrites=true&w=majority`;
class Database {
    client;
    connected = false;
    db;
    constructor() {
        this.client = new mongodb_1.MongoClient(url);
        this.client.connect((error) => {
            if (error)
                throw error;
            this.connected = true;
        });
        this.db = this.client.db();
        ;
    }
    close() { this.client.close(); }
    async table(column) {
        return await this.db.collection(column);
    }
    async tableQuery(column, query) {
        const table = query ? this.db.collection(column).find(query) : this.db.collection(column).find();
        return await table.toArray();
    }
    async update(column, query, update, options) {
        if (options)
            this.db.collection(column).findOneAndUpdate(query, update, options);
        this.db.collection(column).findOneAndUpdate(query, update);
    }
    async randomDocument(column, min = 0) {
        const table = await this.db.collection(column).aggregate([
            {
                '$sample': { size: 1 }
            }
        ]);
        return await table.toArray();
    }
    async delete(column, query) {
        return this.db.collection(column).deleteMany(query);
    }
    async insertinto(collection = undefined, data = undefined, callback) {
        if (!collection || !data)
            throw collection || data;
        this.db.collection(collection).insertOne(data).then(callback);
    }
}
exports.DataBase = new Database();
