# MongoDatasource

MongoDatasource is a simple CRUD interface for a MongoDB collection that presents the datasource interface expected by the [ExpressMicroserviceController](https://github.com/jmussman/express-microservice-controller).

The class will have the path to the MongoDB server, the database name, and the collection name injected through the constructor.

The methods of this class rely on the Promise technology used in the MongoDB Node.js driver version 3. Async/await from ES7 is used to handle the MongoDB Promises in this class, and the class methods all return Promises using async.

## Getting Started

### Prerequisites

This JavaScript class is dependent on JavaScript 2017 and async/await. Node 7.6.0 has the V8 5.5 engine, which is the earliest version to support async/await.

### Installing

$ npm install mongo-datasource --save

### Using

Require the class and create an instance. Dependencies are injected through the constructor: the path to the MongoDB server, the database name, and the collection name. This class provides the following interface:

* async query(constraints) - returns a list of records, the constraints may be passed directly from express.urlencoded parsing the query string and leaving it in req.params.query.
* async retrieve(id).
* async insert(record) - returns the record with the the primary key updated.
* async update(id, oldRecord, newRecord) - the oldrecord and newRecord must have a primary key that matches id (the key cannot be updated), and will use optimistic concurrency to update the record (only if the oldRecord is an exact match for all fields).
* async delete(id).

All of these methods are asynchronous (or return Promises). If there is any error, it will be thrown (or the Promise rejected).

The reference project example using this creates an instance of the datasource for a particular database and collection, and then passes it to an instance of [ExpressMicroserviceController](http://github.com/jmussman/express-microservice-controller) that handles network requests:

```
let MongoDatasource = require('./MongoDatasource');
let ExpressMicroserviceController = require('./ExpressMicroserviceController');

class Server {

    constructor() {

        let collection = process.env.MDBCOLLECTION || 'customers'
        let database = process.env.MDBDATABASE || 'customers'
        let mongodb = process.env.MONGODB || 'mongodb://localhost:27017'
        let port = parseInt(process.env.PORT) || 8080
        
        let datasource = new MongoDatasource(mongodb, database, collection)
        let microservice = new ExpressMicroserviceController(port, datasource)

        microservice.launch()
        console.log(`Service is listening on port ${microservice.port} and connecting to ${mongodb}/${database}/${collection}`)
    }
}

exports = module.exports = new Server()
```

### Extending

See the code for details. The class may be easily extended. The constructor and CRUD methods may be overriden to provide additional business logic as necessary. For example the constructor and methods could be extended to make sure that a sales order record has a corresponding customer record in another collection by adding the name of the second collection to the constructor, and using the second collection to verify the record in the insert method.

## Built With

* ES7

## Contributing

Please read [contributing.md](https://gist.github.com/jmussman/616e291cd7b97f66a3af68298e51c40d) for details on the code of conduct, and the process for submitting pull requests.

## Versioning

[SemVer](http://semver.org/) is used for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

* **Joel Mussman** - *Initial work* - [jmussman](https://github.com/jmussman)

See also the list of [contributors](https://github.com/jmussman/express-microservice-controller/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [License.md](License.md) file for details
