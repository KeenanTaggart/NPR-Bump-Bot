var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

request('http://www.npr.org/programs/all-things-considered/', function(error, response, html) {
  if(!error) {
    var $ = cheerio.load(html);
    var json = {tracks: []};
    $('.song-meta-wrap').each(function(index) {
      var songs = $(this);
      if (songs.children().length > 1) {                                  // track name & artist available
        var thisSong = {track: "", artist: ""};
        thisSong.track = songs.children().first().text();
        thisSong.artist = songs.children().last().text();
        json.tracks.push(thisSong);
      }
      fs.writeFile('pmTracks.json', JSON.stringify(json, null, 3), function(err) {
        if(err) {
          console.log("An error happened during file operations.");
        }
      });
      
    });
  }
});
    
