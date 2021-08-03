const express = require('express');
const lastfm = require('./lastfm');
const { connect } = require('./db');

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());

app.post('/load', async (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).send({ error: 'Username not provided' });
    }

    const db = await connect();
    const libraries = db.collection('libraries');
    let library = await libraries.findOne({ username });
    let fromDb = true;
    if (!library) {
        fromDb = false;
        const recentTracks = await lastfm.getRecentTracks(username);
        library = {
            username,
            timestamp: new Date,
            scrobbles: recentTracks.track || []
        };
        libraries.insertOne(library);
    }

    res.send({
        username,
        fromDb,
        count: library.scrobbles.length,
        timestamp: library.timestamp
    });
});

app.listen(port, () => {
    console.log(`Last.fm Library Downloader listening at http://localhost:${port}`);
});
