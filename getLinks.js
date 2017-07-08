
// Set environment variable TIME at runtime (am, pm, sat, or sun)

var fs = require('fs');
var request = require('request');
var songs;

if (process.env.TIME == 'am') {
  songs = JSON.parse(fs.readFileSync('amTracks.json', 'utf8'));
}
else if (process.env.TIME == 'pm') {
  songs = JSON.parse(fs.readFileSync('pmTracks.json', 'utf8'));
}
else {
  songs = JSON.parse(fs.readFileSync('weekendTracks.json', 'utf8'));
}

var cred = JSON.parse(fs.readFileSync('spotifyCred.json', 'utf8'));

var client_id = cred.client_id;
var client_secret = cred.client_secret;

var options = {
  url: 'https://accounts.spotify.com/api/token',
  headers: {"Authorization": "Basic " + (new Buffer(client_id + ":" + client_secret).toString('base64'))},
  form: { grant_type : "client_credentials" }
};
var token;

request.post(options, function(error, response, body) {
  if (!error && response.statusCode == 200) {
    var info = JSON.parse(body);
    token = info.access_token;
    passTrack(token);
  }
  else {
    console.log("Something went wrong while trying to get the authorization token from Spotify.");
    console.log(response.statusCode);
  }
});

// We make 5 search attempts. The end goal is to have 2 unique links to post, so 5 tries allows for a few duplicates or failed searches.
function passTrack(authToken) {
  var results;
  var songLinks = [];
  var counter = 0;
  for (var i = 0; i < 5; i++) {
    var randomSong = Math.floor(Math.random() * (songs.tracks.length));
    var formedUrl = 'https://api.spotify.com/v1/search?q=artist:' + fixedEncodeURIComponent(songs.tracks[randomSong].artist) + "%20track:" + fixedEncodeURIComponent(songs.tracks[randomSong].track) + "&type=track";

    options = {
      url: formedUrl,
      headers: {"Authorization": "Bearer " + authToken}
    };

    request(options, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        results = JSON.parse(body).tracks.total;
        if (results == 0) {
        }
        else {
          var returnedLink = JSON.parse(body).tracks.items[0].external_urls.spotify;
          if (!songLinks.includes(returnedLink)) {
            songLinks.push(returnedLink);
          }
        }
      }
      else {
        console.log("Something went wrong when searching for the track.");
        console.log(error);
        console.log(response.statusCode);
        console.log(response.body.error);
        console.log(response.body.error_description);
      }
      counter++;
      if (counter == 5) {
        processResults(songLinks); 
      }
    });
  } 
}

function processResults(songs) {
  if (songs.length == 0) {
    console.log("All search attempts failed. Try again later / with other songs.");
    // This could be the result of a failed scrape or NPR provided no information on the relevant pages
  }
  var songsJson = {
    "numRemain" : 0,
    "firstTrack" : songs[0],
    "secondTrack" : songs[1]
  }
  if (songs.length >= 2) {
    songsJson.numRemain = 2;
  }
  else if (songs.length == 1) {
    songsJson.numRemain = 1;
  }
  else {}                         // numRemain remains at default (0) and tweet script will skip majority of execution
  fs.writeFile('songLinks.json', JSON.stringify(songsJson, null, 3), function(err) {
    if (err) {
      console.log("An error happened when writing the track links to the file.");
    }
  });
}

function fixedEncodeURIComponent(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
    return '%' + c.charCodeAt(0).toString(16);
  });
}

