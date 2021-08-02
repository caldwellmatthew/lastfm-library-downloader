const config = require('./config.json');
const fetch = require('node-fetch');

async function getRecentTracks(user, page = 1) {
    const params = {
        method: 'user.getrecenttracks',
        limit: 200,
        user,
        page
    };
    const resp = await apiCall(params);
    return resp.recenttracks;
}

async function apiCall(params) {
    params.api_key = config.lastfmKey;
    params.format = 'json';
    const url = 'http://ws.audioscrobbler.com/2.0/';
    return get(url, params);
}

async function get(url, params) {
    const fetchUrl = new URL(url);
    if (params) {
        fetchUrl.search = new URLSearchParams(params);
    }
    const resp = await fetch(fetchUrl);
    const data = await resp.json();
    return data;
}

module.exports = { getRecentTracks };
