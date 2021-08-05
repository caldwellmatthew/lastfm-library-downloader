# lastfm-library-downloader
Express app for downloading a [Last.fm](https://last.fm/) library to MongoDB.

## Getting started
1. Create a `config.json` file in the root directory with the following contents:
```
{
    "lastfmKey": "yourLastfmApiKeyHere",
    "mongodbUri": "yourMongoDBConnectionStringHere"
}
```
1. Install dependencies: `npm ci`
1. Start the server: `npm start`
1. Navigate to <https://localhost:3000>
