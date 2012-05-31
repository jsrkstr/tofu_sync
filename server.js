var http = require('http');
var cradle = require('cradle');

var host = process.env["DBHOST"] ? process.env["DBHOST"] : "127.0.0.1";
console.log("dbhost is");
console.log(process.env["DBHOST"]);

if(process.env["DBHOST"]){
	var connection = new(cradle.Connection)(host, 5884, {
	// secure: true,
	auth: { username: process.env["DBUSER"], password: process.env["DBPWD"] }
	});
	var db = connection.database("tofuapp");
	console.log("connection 1");
} else {
	var db = new(cradle.Connection)(host).database('tofuapp');
	console.log("connection 2");
}

db.get('123', function (err, doc) {
	if(err)
		console.log("error ayayaa");
	else
	  console.log(doc.title); // 'Darth Vader'
  // assert.equal(doc.force, 'dark');
});

// db.save('skywalker', {
//   force: 'light',
//   name: 'Luke Skywalker'
// }, function (err, res) {
//   if (err) {
//       console.log("error aaya");// Handle error
//   } else {
//       console.log("success hua!!")// Handle success
//   }
// });




http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\nApp (tofuapp) is running..');
}).listen(8954);
