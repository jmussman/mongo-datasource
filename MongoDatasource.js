// MongoDatasource.js
//
// Generic entity management for querying, retrieving, inserting, updating, and deleting documents in a collection. This class
// provides basic operations, it can be extended to implement additional business logic for managing entities. All of the
// functions behave asychronously; any errors will be thrown to the delegating class.
//

let { MongoClient, ObjectID } = require('mongodb')

class MongoDatasource {

    constructor(mongoDb, database, collection) {

        this.mongoDb = mongoDb
        this.database = database
        this.collection = collection
    }

    get mongoDb() {

        return this._mongoDb
    }

    set mongoDb(value) {

        this._mongoDb = value
    }

    get database() {

        return this._database
    }

    set database(value) {

        this._database = value
    }

    get collection() {

        return this._collection
    }

    set collection(value) {

        this._collection = value
    }

    // delete
    // Delete an individual document by id.
    //

    async delete(id) {

        let client = await MongoClient.connect(this.mongoDb)
        
        await client.db(this.database).collection(this.collection).remove({ _id: id })
        await client.close()
    }

    // insert
    // Insert a new document.
    //

    async insert(document) {

        // Note: the this.mongoDb Node.js driver updates the document inserted with a new _id field if it did not have one.

        let client = await MongoClient.connect(this.mongoDb)
        let results = await client.db(this.database).collection(this.collection).insert(document)

        await client.close()

        return results.ops[0]
    }

    // query
    // Query the this.collection of documents. A query string translates directly into a constraint object,
    // so there isn't any need to do any translation.
    //

    async query(constraints) {

        let queryConstraints = { ...constraints }
        
        queryConstraints.address = { ...constraints.address }
                
        // Convert _id to an ObjectID if it looks like a string ObjectID (24 hex digits).

        if (queryConstraints._id && typeof queryConstraints._id == 'string' && queryConstraints._id.match(/^(\d|[a-f]){24}$/)) {

            queryConstraints._id = new ObjectID(queryConstraints._id)
        }

        let client = await MongoClient.connect(this.mongoDb)
        let results = await client.db(this.database).collection(this.collection).find(constraints).toArray()

        await client.close()

        return results
    }

    // retrieve
    // Get an individual document by id.
    //

    async retrieve(id) {

        let client = await MongoClient.connect(this.mongoDb)
        let results = await client.db(this.database).collection(this.collection).find(new ObjectID(id)).toArray()

        return results[0]
    }

    // update
    // Update an individual record, using optimistic concurrency to avoid overwrites. If the record
    // with all of it's original fields cannot be located, then the update cannot happen.
    //
    
    async update(id, oldRecord, newRecord) {

        let client = await MongoClient.connect(this.mongoDb)

        if (id !== oldRecord._id && oldRecord._id !== newRecord._id) {

            throw new Error('Updating a record with a different id.')
        }
        
        // Convert _id to an ObjectID if it looks like a string ObjectID (24 hex digits).

        if (typeof oldRecord._id == 'string' && oldRecord._id.match(/^(\d|[a-f]){24}$/)) {

            oldRecord._id = new ObjectID(oldRecord._id)
            newRecord._id = new ObjectID(newRecord._id)
        }

        // Optimistic concurrency; the update will not succeed unless the this.database matches the old record.
        
        let results = await client.db(this.database).collection(this.collection).update(oldRecord, newRecord)

        await client.close()

        if (!results || !results.result || !results.result.nModified) {

            throw new Error('Not found.')
        }
    }
}

exports = module.exports = MongoDatasource