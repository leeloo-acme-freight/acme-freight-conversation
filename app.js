var express = require("express");
var app = express();
var http = require('http');
var server = http.createServer(app);
var Conversation = require('watson-developer-cloud/conversation/v1');

// Used for setting environment locally via `.env` file
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').load();
}

// Watson Services SDK wrapper
const conversation = new Conversation({
  username: process.env.WAT_CONV_USERNAME,
  password: process.env.WAT_CONV_PASSWORD,
  path: { workspace_id: process.env.WAT_CONV_WORKSPACE },
  version_date: '2016-07-11'
});

// Logic for sending requests to Watson Conversation Service
var context = null;
const askWatson = (question, socket) => {
  console.log("Question: " + question);
  conversation.message({
    input: {
      text: question
    },
    context: context
  }, processResponse);

  // Upon receiving the response, relay the message via the socket to frontend
  function processResponse(err, response) {
    if (err) {
      console.error(err);
      return;
    }

    if (response.output.text.length != 0) {
      console.log("Answer: " + response.output.text[0]);
      context = response.context;
      socket.emit('resWatson', response.output.text[0])
    }
  }
}

// Setup socket as the middleman for communication with frontend.
var io = require('socket.io').listen(server);

io.origins('*:*');

io.on('connection', function(socket){
  socket.on('reqWatson', (data) => {
    askWatson(data, socket);
  });
});

// Configure app (although, really only the socket is being used)
app.use(express.static('public'))

app.get("/", (req, res) => {
  res.send("alive and well");
})

var port = (process.env.VCAP_APP_PORT || process.env.PORT || 8080);
var host = (process.env.VCAP_APP_HOST || process.env.HOST || 'localhost');
console.log("listening on " + host + ':' + port);
server.listen(port, host);
