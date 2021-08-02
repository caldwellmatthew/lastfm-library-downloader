const { MongoClient } = require('mongodb');
const config = require('./config.json');

async function connect() {
    return new Promise((resolve) => {
        const client = new MongoClient(config.mongodbUri, {
            useNewUrlParser: true, 
            useUnifiedTopology: true
        });
        client.connect((err) => {
            if (err) console.log(err);
            const db = client.db('lastfm-library-downloader');
            resolve(db);
        });
    })
}

module.exports = { connect };
