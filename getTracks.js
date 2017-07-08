 
// Set environment variable TIME at runtime, either to am, pm, sat, or sun

var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

var json = {tracks: []};
var targetUrl, targetFile;

if (process.env.TIME == 'am') {
  targetUrl = 'http://www.npr.org/programs/morning-edition/';
  targetFile = 'amTracks.json';
}
else if (process.env.TIME == 'pm') {
  targetUrl = 'http://www.npr.org/programs/all-things-considered/';
  targetFile = 'pmTracks.json';
}
else if (process.env.TIME == 'sat') {
  targetUrl = 'http://www.npr.org/programs/weekend-edition-saturday/';
  targetFile = 'weekendTracks.json';
}
else {
  targetUrl = 'http://www.npr.org/programs/weekend-edition-sunday/';
  targetFile = 'weekendTracks.json';
}

request(targetUrl, function(error, response, html) {
  if(!error) {
    var $ = cheerio.load(html);
    $('.song-meta-wrap').each(function(index) {
      var songs = $(this);
      if (songs.children().length > 1) {                                  // both track name & artist available
        var thisSong = {track: "", artist: ""};
        thisSong.track = songs.children().first().text();
        thisSong.artist = songs.children().last().text();
        json.tracks.push(thisSong);
      }
      fs.writeFile(targetFile, JSON.stringify(json, null, 3), function(err) {
        if(err) {
          console.log("An error happened during file operations.");
        }
      });
    });
  }
});


