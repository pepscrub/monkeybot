import {Db, MongoClient, Document, FindOneAndUpdateOptions} from 'mongodb';
import 'dotenv/config';
import { ENVConfig } from "../types/env";
export const CONFIG = process.env as unknown as ENVConfig;
const url = `mongodb+srv://admin:${CONFIG.DB_PASS}@${CONFIG.DB_NAME}.xbm61.mongodb.net/bot?retryWrites=true&w=majority`

class Database {
    client: MongoClient;
    connected: boolean = false;
    db: Db;

    constructor()
    {
        this.client = new MongoClient(url);
        this.client.connect((error)=> {
            if(error) throw error;
            this.connected = true
        });
        this.db = this.client.db();;
    }

    close() { this.client.close(); }

    async table(column: string) {
        return await this.db.collection(column);
    }

    async tableQuery(column: string, query?: Document)
    {
        const table = query ? this.db.collection(column).find(query) : this.db.collection(column).find();
        return await table.toArray();
    }

    async update(column: string, query: Document, update: Document, options?: FindOneAndUpdateOptions)
    {
        if(options) this.db.collection(column).findOneAndUpdate(query, update, options);
        this.db.collection(column).findOneAndUpdate(query, update);
    }

    async randomDocument(column: string, min = 0)
    {
        const table = await this.db.collection(column).aggregate(
            [
                {
                '$sample': { size: 1 }
                }
            ]);
        return await table.toArray();
    }

    async delete(column: string, query: Record<string, string>){
        return this.db.collection(column).deleteMany(query);
    }

    async insertinto(collection: string | undefined = undefined, data: Document | undefined = undefined, callback?: () => void) {
        if(!collection || !data) throw collection || data;
        this.db.collection(collection).insertOne(data).then(callback);
    }
}

export const DataBase = new Database();