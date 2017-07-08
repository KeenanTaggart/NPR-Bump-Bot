var fs = require('fs');
var request = require('request');

var songs = JSON.parse(fs.readFileSync('songLinks.json', 'utf8'));
var cred = JSON.parse(fs.readFileSync('twitterCred.json', 'utf8'));
var chosenSong;

if (songs.numRemain != 0) {
  
  if (songs.numRemain == 2) {
    chosenSong = songs.firstTrack;
  }
  else {
    chosenSong = songs.secondTrack;
  }
  
  var baseURL = 'https://api.twitter.com/1.1/statuses/update.json';
  var auth_options = {
    oauth: {
      consumer_key: cred.consumer_key,
      consumer_secret: cred.consumer_secret,
      token: cred.access_token,
      token_secret: cred.access_token_secret
    }
  };
  var options = {
    accept: '*/*',
    Connection: 'close',
    url: baseURL,
    oauth: auth_options.oauth,
    form: {status: chosenSong}
  };


  request.post(options, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      // console.log("Successful status post!");
    }
    else {
      console.log("Something went wrong when making the status post.");
      console.log(error);
      console.log(response.statusCode);
    }
    songs.numRemain--;
    fs.writeFile('songLinks.json', JSON.stringify(songs, null, 3), function(err) {
      if (err) {
        console.log("An error happened when rewriting the track links file.");
      }
    });
  });
  
}
else {
  console.log("No more links to post.");
}

