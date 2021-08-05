const { MongoClient } = require('mongodb');
const config = require('./config.json');

const client = new MongoClient(config.mongodbUri);

async function connect() {
    let db;
    try {
        await client.connect();
        db = client.db('lastfm-library-downloader');
    } catch (err) {
        console.log(err);
    }
    return db;
}

module.exports = { connect };
