// var app_server = require('http').createServer(handler)
//   , io = require('socket.io').listen(app_server)
//   , cradle = require("cradle")
//   , fs = require('fs');


// var port = process.env["app_port"] || 3000;
// app_server.listen(port);

// console.log("environment is", process.env["NODE_ENV"]);


// function handler (req, res) {
//   fs.readFile(__dirname + '/index.html',
//   function (err, data) {
//     if (err) {
//       res.writeHead(500);
//       return res.end('Error loading index.html');
//     }

//     res.writeHead(200);
//     res.end(data);
//   });
// }



// // io.configure('production', function(){
// // 	io.enable('browser client minification');  // send minified client
// // 	io.enable('browser client etag');          // apply etag caching logic based on version number
// // 	io.enable('browser client gzip');          // gzip the file
// // 	io.set('log level', 1);                    // reduce logging
// // 	io.set('transports', [                     // enable all transports (optional if you want flashsocket)
// // 	    'websocket'
// // 	  , 'flashsocket'
// // 	  , 'htmlfile'
// // 	  , 'xhr-polling'
// // 	  , 'jsonp-polling'
// // 	]);
// // });

// // io.configure('development', function(){
// // 	io.set('log level', 1);                    // reduce logging
// // });





// var App = {

// 	users : {},

// 	emit_to_user : function(user_id, message){
// 		var user_socket_id = App.users[user_id];

// 		if (user_socket_id) {
// 			var socket = io.sockets.sockets[user_socket_id];
// 			socket.emit("message", message);
// 			console.log('emit to user ', user_id);
// 		}
// 	}
// }

// var host = process.env["DBHOST"] ? process.env["DBHOST"] : "127.0.0.1";
// console.log("dbhost is", process.env["DBHOST"]);


// if(process.env["DBHOST"]){
// 	var connection = new(cradle.Connection)(host, 5984, {
// 		// secure: true,
// 		auth: { username: process.env["DBUSER"], password: process.env["DBPWD"] }
// 	});
// 	App.db = connection.database("tofuapp");
// 	console.log("cloud db connected");
// } else {
// 	App.db = new(cradle.Connection)(host).database('tofuapp');
// 	console.log("local db connected");
// }


// App.publish = function(socket, data){

// 	console.log("publisher", socket.id, data)

// 	// send realtime for all and save to db for all
// 	if(data.recipient_ids){

// 		for (var i = data.recipient_ids.length - 1; i >= 0; i--) {
// 			var recipient_id = data.recipient_ids[i];
// 			App.emit_to_user(recipient_id, data);
// 		}
// 	}


// 	// save to db
// 	socket.get("user_id", function(err, user_id){

// 		App.db.save(data, function (err, res) {
// 		  if (err) {
// 		      console.log("error aaya", err);// Handle error
// 		  } else {
// 		      console.log("saved doc")// Handle success
// 		  }
// 		});

// 	});
// };



// App.history = function(socket, limit, fn){

// 	socket.get("user_id", function(err, user_id){

// 		App.db.view('tofuapp/comments', { key: user_id }, function (err, data) {
// 			var  docs = [];
// 			for(var item in data){
// 				docs.push(data[item].value);
// 			}

// 			// fire response to author
// 			if(fn)
// 				fn(docs);
// 		});

// 	});
// };





// io.sockets.on("connection", function(socket){

// 	// data must contain recipient_ids (array of ids) and a message
// 	socket.on("publish", function(data, fn){

// 		// validate
// 		if(data)
// 			App.publish(socket, data)

// 		// fire response to author
// 		if(fn)
// 			fn({ok : true});
		
// 	});


// 	socket.on('register', function(user_id, fn) {
		
// 		// set user_id into socket and socketid in allUsers 
// 		socket.set('user_id', user_id, function () {
//       		App.users[user_id] = socket.id;
//       		console.log("registered", user_id);
//     	});

//     	// fire response to author
// 		if(fn)
// 			fn({ok : true});
		
//     });



//     socket.on('history', function(limit, fn){
//     	App.history(socket, limit, fn);
//     });



//     socket.on('disconnect', function() {

//     	socket.get("user_id", function(err, user_id){
//     		delete App.users[user_id];
//     		console.log("disconnected", user_id);
//     	});
//     });

// });





// // client api usage
// // var socket = io.connect('http://localhost:8080');
// //   socket.on('connect', function (data) {
// //     console.log(data);
// //    socket.emit("register", 123)
// //   });

// // socket.emit("publish", "comment", {recipient_ids : [222], greeting : "Hey lolay!", author_id : 111}, function(reply){console.log(reply)})
// //socket.emit("history", 100, function(d){console.log(d)})




var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')

var port = process.env["app_port"] || 3000;
app.listen(port);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});