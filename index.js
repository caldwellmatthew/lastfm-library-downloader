const express = require('express');
const lastfm = require('./lastfm');
const { connect }= require('./db');

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());

app.post('/load', async (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).send({ error: 'Username not provided' });
    }
    const library = await lastfm.getRecentTracks(username);

    const db = await connect();
    db.collection('libraries').insertOne({
        username,
        timestamp: new Date,
        scrobbles: library.track || []
    });

    res.send(library);
});

app.listen(port, () => {
    console.log(`Last.fm Library Downloader listening at http://localhost:${port}`);
});
