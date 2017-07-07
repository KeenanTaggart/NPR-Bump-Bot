var fs = require('fs');
var request = require('request');
// var hmacsha1 = require('hmacsha1');
var crypto = require('crypto');

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
  
  // chosenSong = "Gallia est omnis divisa in partes tres.";
  var auth_nonce = randomString(32);
  var signature_method = 'HMAC-SHA1';
  var timestamp = Math.floor(Date.now() / 1000);
  var auth_version = 1.0;

  var baseURL = 'https://api.twitter.com/1.1/statuses/update.json';
  var param_string = 'include_entities=true'
                        + '&oauth_consumer_key=' + fixedEncodeURIComponent(consumer_key) 
                        + '&oauth_nonce=' + fixedEncodeURIComponent(auth_nonce)  
                        + '&oauth_signature_method=' + fixedEncodeURIComponent(signature_method) 
                        + '&oauth_timestamp=' + fixedEncodeURIComponent(timestamp) 
                        + '&oauth_token=' + fixedEncodeURIComponent(access_token) 
                        + '&oauth_version=' + '1.0'  //fixedEncodeURIComponent(auth_version) + 
                        + '&status=' + fixedEncodeURIComponent(chosenSong);

  var signature_base_string = 'POST&' + fixedEncodeURIComponent(baseURL)
                              + '&' + fixedEncodeURIComponent(param_string);

  var signing_key = fixedEncodeURIComponent(consumer_secret) + '&' + fixedEncodeURIComponent(token_secret);

  var hmac = crypto.createHmac('sha1', signing_key);
  hmac.update(signature_base_string);
  var finalHash = hmac.digest('base64');
  console.log("Signing key: " + signing_key);
  console.log("Signature base string: " + signature_base_string);
  console.log("Hashed results: " + finalHash);
  var oauth_signature = finalHash;

  var header_string =  'OAuth ' + fixedEncodeURIComponent("oauth_consumer_key")     + '="' + fixedEncodeURIComponent(consumer_key)
                        + '", ' + fixedEncodeURIComponent("oauth_nonce")            + '="' + fixedEncodeURIComponent(auth_nonce)
                        + '", ' + fixedEncodeURIComponent("oauth_signature")        + '="' + fixedEncodeURIComponent(oauth_signature)
                        + '", ' + fixedEncodeURIComponent("oauth_signature_method") + '="' + fixedEncodeURIComponent(signature_method)
                        + '", ' + fixedEncodeURIComponent("oauth_timestamp")        + '="' + fixedEncodeURIComponent(timestamp)
                        + '", ' + fixedEncodeURIComponent("oauth_token")            + '="' + fixedEncodeURIComponent(access_token)
                        + '", ' + fixedEncodeURIComponent("oauth_version")          + '="' + '1.0"'//fixedEncodeURIComponent(auth_version);

  var formedUrl = baseURL + '?status=' + fixedEncodeURIComponent(chosenSong);
  var options = {
    method: "POST",
    url: baseURL,
    headers: {"Authorization": header_string},
    form: {
      include_entities: "true",
      status: fixedEncodeURIComponent(chosenSong)  
    }
  }

  console.log(header_string);
  console.log(formedUrl);

  var auth_options = {
    oauth: {
      consumer_key: cred.consumer_key,
      consumer_secret: cred.consumer_secret,
      token: cred.access_token,
      token_secret: cred.access_token_secret
    }
  };
  var improvedOptions = {
    accept: '*/*',
    Connection: 'close',
    url: baseURL,
    oauth: auth_options.oauth,
    form: {status: chosenSong}
  };

  options = improvedOptions;

  request.post(options, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log("Successful status post!");
    }
    else {
      console.log("Something went wrong when making the status post.");
      console.log(error);
      //console.log(response);
      console.log(response.statusCode);
      //console.log(response.body.error);
      //console.log(response.body.error_description); 
    }
    // Adjust track file here maybe 
    songs.numRemain--;
    fs.writeFile('songLinks.json', JSON.stringify(songs, null, 3), function(err) {
      if (err) {
        console.log("An error happened when rewriting the track links file.");
      }
    });
  });
  
}


// Used for OAuth nonce generation
function randomString(length) {
  var randomText = "";
  var possibleChar = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < length; i++) {
    var randNum = Math.floor(Math.random() * possibleChar.length);
    randomText += possibleChar.charAt(randNum);
  }
  return randomText;
}

// RFC 3986 compliant. Thanks MDN!
function fixedEncodeURIComponent(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
    return '%' + c.charCodeAt(0).toString(16);
  });
}
