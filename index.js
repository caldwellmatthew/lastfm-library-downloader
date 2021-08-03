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
        // load first page
        const recentTracks = await lastfm.getRecentTracks(username);
        const totalPages = recentTracks['@attr'].totalPages;
        // store first page
        libraries.insertOne({ 
            username, 
            scrobbles: recentTracks.track, 
            timestamp: new Date 
        });
        // load remaining pages
        let scrobbles = [];
        for (let page = 2; page <= totalPages; page++) {
            await new Promise(res => setTimeout(res, 2000));
            const resp = await lastfm.getRecentTracks(username, page);
            scrobbles.push(...resp.track);
            if (page % 5 === 0) {
                console.log(`Page ${page} / ${totalPages}`);
            }
            if (page % 10 === 0) {
                // update db with last 10 pages scrobbles
                libraries.updateOne({ username }, {
                    $push: { 
                        scrobbles: {
                            $each: scrobbles
                        }
                    }
                });
                scrobbles = [];
            }
        }
        library = { username, scrobbles, timestamp: new Date };
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
