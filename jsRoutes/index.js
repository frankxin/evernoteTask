//include evernote module
var Evernote = require('evernote').Evernote;
var config = require('../config.json');

//just form sandbox prefix , used to get the thumbnail for each notes

var webApiUrlPrefix = '',
    prefixThm = '';


var client = new Evernote.Client({
	token: config.developerToken
});

// Set up the NoteStore client 
var noteStore = client.getNoteStore();

var userStore = client.getUserStore();


/*handle request for '/' */
exports.index = function(req, res) {

	// all things will be here , sended by handlebars
	var noteList = [];

	userStore.getPublicUserInfo(config.userName, function(err, userInfo) {

		webApiUrlPrefix = userInfo.webApiUrlPrefix;
		prefixThm = webApiUrlPrefix + 'thm/note/';
		console.log('webApiUrlPrefix is :  ' + userInfo.webApiUrlPrefix);
		//get list of notes
		noteStore.listNotebooks(function(err, notebooks) {
			if (err) {
				console.log(err);
			} else {

				//just for test
				for (var i in notebooks) {
					console.log("Notebook: " + notebooks[i].name);
				};
				var noteFilter = new Evernote.NoteFilter();
				noteFilter.words = '';
				noteFilter.ascending = false;
				noteFilter.inactive = false;
				//just for test
				console.log("!!!!!!!!!");
				//request max 20 notes
				noteStore.findNotes(noteFilter, 0, 20, function(err, response) {
					if (err) {
						console.log(err);
					} else {
						//just for test
						console.log(response);
						for (var i = 0, max = response.notes.length; i < max; i++) {
							noteList[i] = {};
							noteList[i].title = response.notes[i].title;
							noteList[i].created = new Date(parseInt(response.notes[i].created, 10)).format("yyyy-MM-dd HH:mm");
							noteList[i].guid = response.notes[i].guid;

							//get thumbnail pic url form sandbox
							//if don't use token , you must be login
							var s = prefixThm + noteList[i].guid + '.jpg' + '?auth=' + config.developerToken;
							noteList[i].thumbnail = s;
							noteList[i].index = i;
							noteList[i].url = '/article/' + noteList[i].guid;
							console.log(noteList[i]);
						};
						res.render('index', {
							note: noteList
						});
					};
				});
			};
		});
	});
};

/*handle request for 'detail/id' */
exports.renderDetail = function(req, res) {

	//get guid form url
	var guid = req.params.id;
    
    //get note by guid
	noteStore.getNote(guid, true, true, true, false, function(err, response) {
		while (response) {
			processContent(response, res);
			break;
		};
	});
};

/*======== some func , render detail will use (start) =============*/

/*10 system to 16 system*/
Number.prototype.toHexString = function() {
	return this.toString(16);
}

/*handle bodyHash to String*/
function toHex(data) {
	var char = [];
	for (var i = 0; i < data.length; i++) {
		var d = data[i];
		char[i * 2] = Math.floor(d / 16).toHexString(); //why i have to devide by 16
		char[i * 2 + 1] = (d % 16).toHexString();
	};
	return char.join('');
};


/*process content <en-note> and <en-media> to "body" and "img"*/
function processContent(note, res) {
	var patternEnNote = /<en-note[^>]*/i,
		patternEnMedia = /(<en-media[^<]+<\/en-media>)/ig;
		//hard code urlPrefix for test, used to get img in  content 
		// urlPrefix = "https://sandbox.evernote.com/shard/s1/";

	var content = note.content,
		resource = note.resources,
		out = content.match(patternEnNote),
		startIndex = out.index + out[0].length,
		endIndex = content.lastIndexOf("</en-note>"),
		body = content.substring(startIndex, endIndex);

	//replace the en-media
	var newContent = body.replace(patternEnMedia, function(match, pos, originalText) {
		var patternHash = /hash=\"([0-9a-f]+)\"/,
			patternStyle = /style=\"[^"]+\"/i,
			style;

		var key = match.match(patternHash),
			hash = key[1];
		//match the style of img
		var styleIsNuLL = match.match(patternStyle);

		if (styleIsNuLL != null) {
			style = styleIsNuLL;
		} else {
			style = '';
		}

		for (var i = 0; i < resource.length; i++) {
			var toHexHash = toHex(resource[i].data.bodyHash);
			if (toHexHash == hash) {
				var imgBlock = makeImgUrl(webApiUrlPrefix, resource[i].guid, style);
				return imgBlock;
			};
		};
	});
	//prepare a entire content to render
	var allContent = "<div " + newContent + "</div>";

	res.render('article', {
		content: allContent
	});
}

/*construct the img Url*/
function makeImgUrl(urlPrefix, guid, style) {

	//if i don't login i must send developerToken
	var s = "<img src=\"" + urlPrefix + "res/" + guid + '?auth=' + config.developerToken + "\" " + style + " />";
	console.log(s);
	return s;
}
/**
*format timestamp to localTime , 
*copy form the internet override format method
*/
Date.prototype.format = function(e) {

	var a = function(m, l) {
		var n = "",
			k = (m < 0),
			j = String(Math.abs(m));
		if (j.length < l) {
			n = (new Array(l - j.length + 1)).join("0")
		}
		return (k ? "-" : "") + n + j
	};
	if ("string" != typeof e) {
		return this.toString()
	}
	var b = function(k, j) {
		e = e.replace(k, j)
	};
	var f = this.getFullYear(),
		d = this.getMonth() + 1,
		i = this.getDate(),
		g = this.getHours(),
		c = this.getMinutes(),
		h = this.getSeconds();
	b(/yyyy/g, a(f, 4));
	b(/yy/g, a(parseInt(f.toString().slice(2), 10), 2));
	b(/MM/g, a(d, 2));
	b(/M/g, d);
	b(/dd/g, a(i, 2));
	b(/d/g, i);
	b(/HH/g, a(g, 2));
	b(/H/g, g);
	b(/hh/g, a(g % 12, 2));
	b(/h/g, g % 12);
	b(/mm/g, a(c, 2));
	b(/m/g, c);
	b(/ss/g, a(h, 2));
	b(/s/g, h);
	return e
};

/*======== some func , render detail will use (end)=============*/

/*==================don't use oauth now ================================*/

/*oauth*/
var callbackUrl = "http://127.0.0.1:3000/oauth_callback";

exports.oauth = function(req, res) {
  var client = new Evernote.Client({
    consumerKey: "ericzhang93",
    consumerSecret: "35eb507bffb08911",
    sandbox: true
  });

  client.getRequestToken(callbackUrl, function(error, oauthToken, oauthTokenSecret, results){
    if(error) {
      req.session.error = JSON.stringify(error);
      res.redirect('/');
    }
    else { 
      // store the tokens in the session , when call back will use it
      req.session.oauthToken = oauthToken;
      req.session.oauthTokenSecret = oauthTokenSecret;

      // redirect the user to authorize the token
      res.redirect(client.getAuthorizeUrl(oauthToken));
    }
  });
};

// oAuth callback
exports.oauth_callback = function(req, res) {
  var client = new Evernote.Client({
    consumerKey: "ericzhang93",
    consumerSecret: "35eb507bffb08911",
    sandbox: true
  });

  client.getAccessToken(
    req.session.oauthToken, 
    req.session.oauthTokenSecret, 
    req.param('oauth_verifier'), 
    function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
      if(error) {
        console.log('error : '+error);
        res.redirect('/');
      } else {
        // store the access token in the session
        req.session.oauthAccessToken = oauthAccessToken;
        req.session.edamUserId = results.edam_userId;

        //the webApiUrlPrefix can't be used directly , /notestore should be delete
        req.session.edamWebApiUrlPrefix = results.edam_webApiUrlPrefix;
        res.redirect('/');
      }
    });
};

/*some problem*/
// noteStore.getNoteTagNames(response.notes[i].guid,function(err,tag){
// 	 if(note.tag&&note.title&&note.created){
// 	 	console.log('succesful!!!' + '\n' + note.title + '\n' + note.tag + '\n' + note.created);
// 	 	res.render('index',{note : note});
// 	 };
// 	console.log(tag);
// 	console.log(noteList[1]);
// });