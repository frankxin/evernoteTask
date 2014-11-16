var Evernote = require('evernote').Evernote;


var developerToken = "S=s1:U=8fda7:E=150f5a91e69:C=1499df7ef80:P=1cd:A=en-devtoken:V=2:H=1e6f64f806f98280427f8376416f29fc";
 

exports.main = function(req, res) {
	var client = new Evernote.Client({ 
		token: developerToken
	});

	// Set up the NoteStore client 
	var noteStore = client.getNoteStore();
	var userStore = client.getUserStore();

	//10进制 to 16进制
	Number.prototype.toHexString = function(){
    	return this.toString(16);
	}

	//处理接收到的bodyHash to 字符串
	function toHex(data) {
		var char = [];
		for (var i = 0; i < data.length; i++) {
			var d = data[i];
			char[i * 2] = Math.floor(d / 16).toHexString();
			char[i * 2 + 1] = (d % 16).toHexString();
		};
		return char.join('');
	};

	function processContent(note){
		var patternEnNote = /<en-note[^>]*/i,
			patternEnMedia = /(<en-media[^<]+<\/en-media>)/ig,
			urlPrefix = "https://sandbox.evernote.com/shard/s1/";

		var content = note.content,
			resource = note.resources,
		    out = content.match(patternEnNote),
		    startIndex = out.index + out[0].length,
		    endIndex = content.lastIndexOf("</en-note>"),
		    body = content.substring(startIndex,endIndex);
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

		res.send(allContent);
	}

	function makeImgUrl(urlPrefix,guid,style){
		var s = "<img src=\"" + urlPrefix + "res/" + guid + "\" " + style + " />";
		 console.log(s);
		return s;
	}

	// Make API calls
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
			console.log("!!!!!!!!!")
			noteStore.findNotes(noteFilter,0,3,function(err , response){
				if(err){
					console.log(err);
				}else{
					// res.send(response);
					// console.log(response);
					console.log('\nthis is detail' + response.notes[0].title);
					return ;
				}
			});
		};
	});

	//get detail
	
	noteStore.getNote('395e9c6a-d26e-4991-b52f-1fde6599f9dc',true,true,true,false,function(err , response){
		while(response){
			processContent(response);
			break;
		}
	
		// res.send(body);
		// var pattern = /<en-note[^>]/i;

		// var out = body.match(pattern);
		// var startIndex = out.index + out[0].length;
		// // var endIndex = body.LastIndexOf("</en-note>");
		// console.log(endIndex);
		// res.send(body);
	});
	// userStore.getPublicUserInfo('frankxin93', function(userInfo) {
 //  		console.log('webApiUrlPrefix is :  ' + userInfo.webApiUrlPrefix);
	// });
};

