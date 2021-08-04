const express = require('express');
const ws = require('ws');
const lastfm = require('./lastfm');
const { connect } = require('./db');

const app = express();
const port = 3000;
const wsServer = new ws.Server({ noServer: true });

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
        library = { username, timestamp: new Date };
        const result = await libraries.insertOne(library);
        await lastfm.loadLibraryPages(username, async (page, totalPages, tracks) => {
            wsServer.clients.forEach((client) => {
                if (client.readyState === ws.OPEN) {
                    client.send(JSON.stringify({ page, totalPages }));
                }
            });
            if (page % 10 === 0 || page === totalPages) {
                tracks.forEach(track => track.library_id = result.insertedId);
                await scrobbles.insertMany(tracks);
                tracks = [];
            }
        });
    }

    res.send({
        username,
        fromDb,
        count: await scrobbles.find({ library_id: library._id }).count(),
        timestamp: library.timestamp
    });
});

app.post('/refresh', async (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).send({ error: 'Username not provided' });
    }

    const db = await connect();
    const libraries = db.collection('libraries');
    const scrobbles = db.collection('scrobbles');
    let library = await libraries.findOne({ username });
    if (!library) {
        return res.status(400).send({ error: `No library found for user ${username}` });
    }

    const from = Math.round(library.timestamp.getTime() / 1000);
    const timestamp = new Date;
    libraries.updateOne({ _id: library._id }, { $set: { timestamp } });
    await lastfm.loadLibraryPages(username, async (page, totalPages, tracks) => {
        wsServer.clients.forEach((client) => {
            if (client.readyState === ws.OPEN) {
                client.send(JSON.stringify({ page, totalPages }));
            }
        });
        if (page % 10 === 0 || page === totalPages) {
            tracks.forEach(track => track.library_id = library._id);
            await scrobbles.insertMany(tracks);
            tracks = [];
        }
    }, from);

    res.send({
        username,
        count: await scrobbles.find({ library_id: library._id }).count(),
        timestamp
    });
});

const server = app.listen(port, () => {
    console.log(`Last.fm Library Downloader listening at http://localhost:${port}`);
});
server.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, (socket) => {
        wsServer.emit('connection', socket, request);
    });
});
