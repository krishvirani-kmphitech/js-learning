let http = require("http");

// http.createServer(function (req, res) {

//     res.writeHead(200, {'Content-Type': 'text/plain'})
//     res.end("hello world")

// }).listen(8000);

const server = http.createServer(function (req, res) {
  const { method, url } = req;
  console.log("method : " + method);
  console.log("url : " + url);
  res.writeHead(200);
  res.end("hello world");
});

server.listen(8000, () => {
  console.log("Server run at port 8000");
});
