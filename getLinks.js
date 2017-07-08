var fs = require('fs');
var request = require('request');

var songs = JSON.parse(fs.readFileSync('amTracks.json', 'utf8'));       // This needs to vary
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
    // console.log("Successfully got the token.");
    var info = JSON.parse(body);
    token = info.access_token;
    passTrack(token);
  }
  else {
    console.log("Something went wrong while trying to get the authorization token from Spotify.");
    console.log(response.statusCode);
  }
});

function passTrack(authToken) {
  var results;
  var songLinks = [];
  var counter = 0;
  for (var i = 0; i < 3; i++) {
    var randomSong = Math.floor(Math.random() * (songs.tracks.length));
    console.log(songs.tracks[randomSong].track + " by " + songs.tracks[randomSong].artist);
    // var formedUrl = 'https://api.spotify.com/v1/search?q=artist:' + songs.tracks[randomSong].artist.replace(/\s/g, "+") + "%20track:" + songs.tracks[randomSong].track.replace(/\s/g, "+") + "&type=track";
    var formedUrl = 'https://api.spotify.com/v1/search?q=artist:' + fixedEncodeURIComponent(songs.tracks[randomSong].artist) + "%20track:" + fixedEncodeURIComponent(songs.tracks[randomSong].track) + "&type=track";

    options = {
      url: formedUrl,
      headers: {"Authorization": "Bearer " + authToken}
    };

    request(options, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        results = JSON.parse(body).tracks.total;
        if (results == 0) {
          console.log("No results for given track. Trying another...");
        }
        else {
          console.log(JSON.parse(body).tracks.items[0].external_urls.spotify);
          songLinks.push(JSON.parse(body).tracks.items[0].external_urls.spotify);
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
      if (counter == 3) {
        processResults(songLinks); 
      }
    });
  } 
}

function processResults(songs) {
  console.log("In processResults function");
  if (songs.length == 0) {
    console.log("All search attempts failed. Try again later / with other songs.");
  }
  else {
    console.log("There were " + (3 - songs.length) + " failures out of 3 attempts.");
    // console.log("Here's the first song: " + songs[0]); 
  }
  songsJson = {
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
  else {}
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

