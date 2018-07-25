const {MongoClient, ObjectID} = require('mongodb');

const dbUrl = 'mongodb://localhost:27017';
const dbOptions = { useNewUrlParser: true };
const dbName = 'TodoApp';

MongoClient.connect(dbUrl, dbOptions, (err, client) => {
    if (err) {
        return console.log('Unable to connect to Mongo database', err);
    }
    console.log('Connected to Mongo database');
    
    const db = client.db(dbName);

    const collectionName = 'Todos';

    // deleteMany
    // db.collection(collectionName).deleteMany({text: "Eat lunch"}).then(result => {
    //     console.log(result);        
    // }, error => {
    //     console.log(error);        
    // });

    // deleteOne
    // db.collection(collectionName).deleteOne({text: "Go to the bank"}).then(result => {
    //     console.log(result);        
    // }, error => {
    //     console.log(error);        
    // });

    // findOneAndDelete - delete and result the document 
    db.collection(collectionName).findOneAndDelete({"completed": false}).then(result => {
        console.log(result);
    }, err => {
        console.log(err);
    });

    client.close();
});