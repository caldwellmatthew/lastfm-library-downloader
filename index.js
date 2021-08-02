const express = require('express');

const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send('Last.fm library downloader');
});

app.listen(port, () => {
    console.log(`Last.fm Library Downloader listening at http://localhost:${port}`);
});
