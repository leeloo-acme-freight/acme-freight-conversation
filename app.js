var express = require("express");
var app = express();
var http = require('http');
var Conversation = require('watson-developer-cloud/conversation/v1');

// Used for setting environment locally via `.env` file
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').load();
}

// Send index.html to all requests
var server = http.createServer(app);

// Socket.io server listens to our app
var io = require('socket.io').listen(server);

console.log("Checking if credentials were correctly received");

const username = process.env.WAT_CONV_USERNAME;
const password = process.env.WAT_CONV_PASSWORD;
const workspace = process.env.WAT_CONV_WORKSPACE;

console.log(username);
console.log(password);
console.log(workspace);

// Watson Services
const conversation = new Conversation({
  username: username,
  password: password,
  path: { workspace_id: workspace },
  version_date: '2016-07-11'
});

var context = null;
const askWatson = (question, socket) => {
  // Start conversation with empty message.
  console.log("Question: " + question);
  conversation.message({
    input: {
      text: question
    },
    context: context
  }, processResponse);

  // Process the conversation response.
  function processResponse(err, response) {
    if (err) {
      console.error(err); // something went wrong
      return;
    }

    // Display the output from dialog, if any.
    if (response.output.text.length != 0) {
      console.log("Answer: " + response.output.text[0]);
      context = response.context;
      socket.emit('resWatson', response.output.text[0])
    }
  }
}

io.origins('*:*');

// Socket.io
io.on('connection', function(socket){
  socket.on('reqWatson', (data) => {
    askWatson(data, socket);
  });
});

app.use(express.static('public'))

app.get("/", (req, res) => {
  res.send("alive and well");
})

var port = (process.env.VCAP_APP_PORT || process.env.PORT || 8080);
var host = (process.env.VCAP_APP_HOST || process.env.HOST || 'localhost');
console.log("listening on " + host + ':' + port);
server.listen(port, host);
