var express = require("express");
var cfenv = require('cfenv');
var app = express();
var http = require('http');
var Conversation = require('watson-developer-cloud/conversation/v1');

// Used for setting environment locally via `.env` file
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').load();
}

// Socket.io server listens to our app
var io = require('socket.io').listen(server);

// Watson Services
const conversation = new Conversation({
  username: process.env.WAT_CONV_USERNAME,
  password: process.env.WAT_CONV_PASSWORD,
  path: { workspace_id: process.env.WAT_CONV_WORKSPACE },
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

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();
app.listen(appEnv.port, appEnv.bind, function() {
  console.log("server starting on " + appEnv.url);
});
