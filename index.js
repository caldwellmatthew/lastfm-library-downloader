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
    if (!library) {
        const recentTracks = await lastfm.getRecentTracks(username);
        library = {
            username,
            timestamp: new Date,
            scrobbles: recentTracks.track || []
        };
        libraries.insertOne(library);
    }
    
    res.send(library);
});

app.listen(port, () => {
    console.log(`Last.fm Library Downloader listening at http://localhost:${port}`);
});
