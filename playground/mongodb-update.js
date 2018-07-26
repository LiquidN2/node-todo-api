/** To START MongoDB server on local Windows machine, do the followings:
 * 1. Navigate to C:\Program Files\MongoDB\Server\4.0\bin
 * 2. Start Powershell as Admin
 * 3. Run command  .\mongod.exe --dbpath \Users\Hugh\mongo-data
 */

/** To SHUTDOWN MongoDB server on local Windows machine, do the followings:
 * 1. Navigate to C:\Program Files\MongoDB\Server\4.0\bin
 * 2. Start Powershell as Admin
 * 3. Run command  net stop MongoDB
 */

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

    // db.collection(collectionName).findOneAndUpdate({
    //     _id: new ObjectID("5b581a138c01525b9b5fcf14")
    // }, {
    //     /** must use mongoDB update operators
    //      * see more at https://docs.mongodb.com/manual/reference/operator/update/
    //     */
    //     $set: {
    //         completed: true
    //     }
    // }, {
    //     returnOriginal: false
    // }).then(result => {
    //     console.log(result);        
    // }, error => {
    //     console.log(error);
    // });

    db.collection("Users").findOneAndUpdate({
        _id: new ObjectID("5b57c46fa8412d290816a611")
    }, {
        $set: { name: 'Josh' },
        $inc: { age: 1 }
    }, {
        returnOriginal: false
    }).then(result => {
        console.log(result);        
    }, error => {
        console.log(error);        
    });

    client.close();
});