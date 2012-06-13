var express = require('express')
  , app = express.createServer()
  , io = require('socket.io').listen(app)
  , cradle = require("cradle");



var port = process.env["app_port"] || 3001;
app.listen(port);

console.log("environment is", process.env["NODE_ENV"]);


app.configure(function(){
	app.use(express.static(__dirname + '/public'));
    app.use(express.bodyParser());
});

app.get('/', function (req, res) {
	res.sendfile(__dirname + '/index.html');
});


// Realtime publish via post
// accepts { recipient_ids : array, message : json}
app.post('/publish', function(req, res){
  	console.log("POST /publish");

  	var data = {};
  	data.recipient_ids = req.body.recipient_ids;
  	data.message = JSON.parse(req.body.message);

  	if(data.recipient_ids){
  		var recipients = data.recipient_ids;

  		// send to each recipient
		for (var i = recipients.length - 1; i >= 0; i--) {

			var id = recipients[i];
			App.emit_to_user(id, data.message);
		}

		// save to db
		if(data.message.group == "comment"){
			App.db.save(data.message, function (err, res) {
			  if (err) {
			  	console.log("error saving comment");
			  } else {
			    // console.log("saved comment");
			  }
			});
		}
	}

	res.send({ok : true});
});



io.configure('production', function(){
	io.enable('browser client minification');  // send minified client
	io.enable('browser client etag');          // apply etag caching logic based on version number
	io.enable('browser client gzip');          // gzip the file
	io.set('log level', 1);                    // reduce logging
	io.set('transports', [                     // enable all transports (optional if you want flashsocket)
	  // 'websocket',
	  'flashsocket',
	  'htmlfile',
	  'xhr-polling',
	  'jsonp-polling'
	]);
});

io.configure('development', function(){
	io.set('log level', 1);                    // reduce logging
	io.set('transports', [                     // enable all transports (optional if you want flashsocket)
	  'websocket',
	  'flashsocket',
	  'htmlfile',
	  'xhr-polling',
	  'jsonp-polling'
	]);
});





var App = {

	users : {},

	emit_to_user : function(user_id, message){

		var user_socket_id = App.users[user_id];

		if (user_socket_id) {

			var socket = io.sockets.sockets[user_socket_id];
			socket.emit("message", message);
		}
	}
}






var host = process.env["DBHOST"] ? process.env["DBHOST"] : "127.0.0.1";
console.log("dbhost is", process.env["DBHOST"]);

console.log("HOST is", process.env["HOST"]);
console.log("app_host is", process.env["app_host"]);

if(process.env["DBHOST"]){ // cloudnode
	var connection = new(cradle.Connection)(host, 5984, {
		// secure: true,
		auth: { username: process.env["DBUSER"], password: process.env["DBPWD"] }
	});
	App.db = connection.database("tofuapp");
	console.log("cloudnode db connected");

} else if(process.env["app_port"] == 18310 || process.env["app_port"] == "18310"){ // nodester

	host = "http://rollingbuddy.iriscouch.com";
	var connection = new(cradle.Connection)(host, 80, {
		// secure: true,
		auth: { username: "sachin", password: "tooocuuul" }
	});
	App.db = connection.database("tofuapp");
	console.log("iriscouch db connected");
} else { // local
	App.db = new(cradle.Connection)(host).database('tofuapp'); 
	console.log("local db connected");
}





App.publish = function(socket, data, fn){

	// console.log("publisher", socket.id, data)

	// send realtime for all and save to db for all
	if(data.recipient_ids){

		for (var i = data.recipient_ids.length - 1; i >= 0; i--) {
			var recipient_id = data.recipient_ids[i];
			App.emit_to_user(recipient_id, data);
		}
	}


	// save to db
	socket.get("user_id", function(err, user_id){

		App.db.save(data, function (err, res) {
		  if (err) {
		    fn({ error : true}); // Handle error
		  } else {
		    fn(res); // Handle success
		  }
		});

	});
};



// resource is type of doc, comments, or other things
App.history = function(socket, resource, fn){

	socket.get("user_id", function(err, user_id){

		App.db.view('tofuapp/' + resource, { key: parseInt(user_id), limit : 100 }, function (err, data) {

			var  docs = [];
			for(var item in data){
				docs.push(data[item].value);
			}

			if(err)
				fn({error : true});
			else
				fn(docs)
		});

	});
};





io.sockets.on("connection", function(socket){

	// data must contain recipient_ids (array of ids) and a message
	socket.on("publish", function(data, fn){

		// validate
		if(data)
			App.publish(socket, data, fn);
	});


	socket.on('register', function(user_id, fn) {
		
		// set user_id into socket and socketid in allUsers 
		socket.set('user_id', user_id, function () {
      		App.users[user_id] = socket.id;
      		console.log("registered", user_id);
    	});

    	// fire response to author
		if(fn)
			fn({ok : true});
		
    });



    socket.on('history', function(backend, fn){
    	if(fn)
    		App.history(socket, backend, fn);
    });



    socket.on('disconnect', function() {

    	socket.get("user_id", function(err, user_id){
    		delete App.users[user_id];
    		console.log("disconnected", user_id);
    	});
    });

});





// client api usage
// var socket = io.connect('http://localhost:8080');
//   socket.on('connect', function (data) {
//     console.log(data);
//    socket.emit("register", 123)
//   });

// socket.emit("publish", "comment", {recipient_ids : [222], greeting : "Hey lolay!", author_id : 111}, function(reply){console.log(reply)})
//socket.emit("history", "comments", function(d){console.log(d)})
