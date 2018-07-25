const {MongoClient, ObjectID} = require('mongodb');

const dbUrl = 'mongodb://localhost:27017';
const dbOptions = { useNewUrlParser: true };
const dbName = 'TodoApp';

MongoClient.connect(dbUrl, dbOptions, (err, client) => {
    if (err) {
        return console.log('Unable to connect to Mongo database', err);
    }
    console.log('Connectd to Mongo database');
    
    const db = client.db(dbName);
    
    const collectionName = 'Todos';

    // query all 
    // db.collection(collectionName).find().toArray().then(docs => {
    //     console.log(`Todos ${docs.length}`);
    //     console.log(JSON.stringify(docs, undefined, 2));        
    // }, err => {
    //     console.log('Unable to fecth todos', err);        
    // });

    // query by values
    db.collection(collectionName).find({completed: false}).toArray().then(docs => {
        console.log(`Todos ${docs.length}`);
        console.log(JSON.stringify(docs, undefined, 2));        
    }, err => {
        console.log('Unable to fecth todos', err);        
    });

    // query by id
    // db.collection(collectionName)
    //     .find({
    //         _id: new ObjectID('5b57c9e6f338f1051823dcc6')
    //     })
    //     .toArray()
    //     .then(docs => {
    //         console.log(`Todos ${docs.length}`);
    //         console.log(JSON.stringify(docs, undefined, 2));        
    //     }, err => {
    //         console.log('Unable to fecth todos', err);        
    //     });

    db.collection('Users').find({name: 'Hugh'}).toArray().then(docs => {
        console.log(`Users ${docs.length}`);
        console.log(JSON.stringify(docs, undefined, 2));
    }, err => {
        console.log('Unable to fetch users', err);        
    });

    client.close();
});