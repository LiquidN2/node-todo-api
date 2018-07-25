const {MongoClient, ObjectID} = require('mongodb');

// const obj = new ObjectID();
// console.log(obj);

const dbUrl = 'mongodb://localhost:27017';
const dbOptions = { useNewUrlParser: true };
const dbName = 'TodoApp';

// connect to mongo database
MongoClient.connect(dbUrl, dbOptions, (err, client) => {
    if (err) {
        return console.log('Unable to connect to MongoDB server');
    }
    console.log('Connected to MongoDB server');

    const db = client.db(dbName);

    const collectionName = 'Todos';

    // insert document to collection
    db.collection(collectionName).insertOne({
        text: 'Walk the dog',
        completed: true
    }, (err, result) => {
        if (err) {
            return console.log(`Unable to insert item to ${collectionName}`, err);            
        }

        console.log(JSON.stringify(result.ops, undefined, 2));
    });


    // disconnect from mongodb
    client.close();
});