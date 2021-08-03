const config = require('./config.json');
const fetch = require('node-fetch');

async function loadLibraryPages(user, callback, from) {
    const recentTracks = await getRecentTracks(user, 1, from);
    const totalPages = recentTracks['@attr'].totalPages;
    let tracks = recentTracks.track;
    for (let page = 2; page <= totalPages; page++) {
        await new Promise(res => setTimeout(res, 2000));
        const resp = await getRecentTracks(user, page, from);
        tracks.push(...resp.track);
        await callback(page, totalPages, tracks);
    }
}

async function getRecentTracks(user, page = 1, from) {
    const params = {
        method: 'user.getrecenttracks',
        limit: 200,
        user,
        page,
        ...from && { from }
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

module.exports = { getRecentTracks, loadLibraryPages };
