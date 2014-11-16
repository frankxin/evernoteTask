var Evernote = require('evernote').Evernote;
var http = require('http');

//my token
var developerToken = "S=s1:U=8fda7:E=150f5a91e69:C=1499df7ef80:P=1cd:A=en-devtoken:V=2:H=1e6f64f806f98280427f8376416f29fc";
//just form sandbox
var prefix = 'https://sandbox.evernote.com/shard/s1/thm/note/';

var client = new Evernote.Client({
	token: developerToken
});

// Set up the NoteStore client 
var noteStore = client.getNoteStore();


exports.index = function(req, res) {

	var noteList = [];

	//get list of notes
	noteStore.listNotebooks(function(err, notebooks) {
		if (err) {
			console.log(err);
		} else {
			for (var i in notebooks) {
				console.log("Notebook: " + notebooks[i].name);
			};
			var noteFilter = new Evernote.NoteFilter();
			noteFilter.words = '';
			noteFilter.ascending = false;
			noteFilter.inactive = false;
			console.log("!!!!!!!!!");
			noteStore.findNotes(noteFilter, 0, 50, function(err, response) {
				if (err) {
					console.log(err);
				} else {
					console.log(response);
					console.log('\nthis is detail' + response.notes[2].title + '\n' + response.notes[2].tagGuids);
					for (var i = 0, max = response.notes.length; i < max; i++) {
						noteList[i] = {};
						console.log('!!!!!!!!!!!!!!!!!!!');
						noteList[i].title = response.notes[i].title;
						noteList[i].created = new Date(parseInt(response.notes[i].created, 10)).format("yyyy-MM-dd HH:mm");
						noteList[i].guid = response.notes[i].guid;
						//get thumbnail pic url form sandbox
						var s = prefix + noteList[i].guid + '.jpg';
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
};

exports.renderDetail = function(req , res){

	var guid = req.params.id;

	noteStore.getNote(guid, true, true, true, false, function(err, response) {
		while (response) {
			processContent(response,res);
			break;
		};
	});
};


//10进制 to 16进制
Number.prototype.toHexString = function() {
	return this.toString(16);
}

//处理接收到的bodyHash to 字符串
function toHex(data) {
	var char = [];
	for (var i = 0; i < data.length; i++) {
		var d = data[i];
		char[i * 2] = Math.floor(d / 16).toHexString(); //why
		char[i * 2 + 1] = (d % 16).toHexString();
	};
	return char.join('');
};

function processContent(note ,res) {
	var patternEnNote = /<en-note[^>]*/i,
		patternEnMedia = /(<en-media[^<]+<\/en-media>)/ig,
		urlPrefix = "https://sandbox.evernote.com/shard/s1/";

	var content = note.content,
		resource = note.resources,
		out = content.match(patternEnNote),
		startIndex = out.index + out[0].length,
		endIndex = content.lastIndexOf("</en-note>"),
		body = content.substring(startIndex, endIndex);
	console.log(body);
	console.log(startIndex);

	var newContent = body.replace(patternEnMedia, function(match, pos, originalText) {
		var patternHash = /hash=\"([0-9a-f]+)\"/,
			patternStyle = /style=\"[^"]+\"/i,
			style;

		var key = match.match(patternHash),
			hash = key[1];

		var styleIsNuLL = match.match(patternStyle);

		if (styleIsNuLL != null) {
			style = styleIsNuLL;
		} else {
			style = '';
		}

		for (var i = 0; i < resource.length; i++) {
			var toHexHash = toHex(resource[i].data.bodyHash);
			if (toHexHash == hash) {
				var imgBlock = makeImgUrl(urlPrefix, resource[i].guid, style);
				return imgBlock;
			};
		};
	});
	var allContent = "<div " + newContent + "</div>";

	res.render('article' , { content : allContent});
}

function makeImgUrl(urlPrefix, guid, style) {
	var s = "<img src=\"" + urlPrefix + "res/" + guid + "\" " + style + " />";
	console.log(s);
	return s;
}

//format timestamp to localTime

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



// noteStore.getNoteTagNames(response.notes[i].guid,function(err,tag){
// 	 if(note.tag&&note.title&&note.created){
// 	 	console.log('succesful!!!' + '\n' + note.title + '\n' + note.tag + '\n' + note.created);
// 	 	res.render('index',{note : note});
// 	 };
// 	console.log(tag);
// 	console.log(noteList[1]);
// });