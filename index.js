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
    const scrobbles = db.collection('scrobbles');
    let library = await libraries.findOne({ username });
    let fromDb = true;
    if (!library) {
        fromDb = false;
        // load first page
        const recentTracks = await lastfm.getRecentTracks(username);
        const totalPages = recentTracks['@attr'].totalPages;
        let tracks = recentTracks.track;
        // store library info
        library = { username, timestamp: new Date };
        const result = await libraries.insertOne(library);
        // load remaining pages
        for (let page = 2; page <= totalPages; page++) {
            await new Promise(res => setTimeout(res, 2000));
            const resp = await lastfm.getRecentTracks(username, page);
            tracks.push(...resp.track);
            if (page % 5 === 0) {
                console.log(`Page ${page} / ${totalPages}`);
            }
            if (page % 10 === 0 || page === totalPages) {
                // update db with last 10 pages scrobbles
                tracks.forEach(track => track.library_id = result.insertedId);
                await scrobbles.insertMany(tracks);
                tracks = [];
            }
        }
    }

    res.send({
        username,
        fromDb,
        count: await scrobbles.find({ library_id: library._id }).count(),
        timestamp: library.timestamp
    });
});

app.listen(port, () => {
    console.log(`Last.fm Library Downloader listening at http://localhost:${port}`);
});
