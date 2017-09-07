# Acme Freight Watson Conversation Service

This backend server acts as a simple wrapper for making requests to [Watson Conversation Services](https://www.ibm.com/watson/services/conversation/). It uses a [Socket.io](https://socket.io/) socket to communicate with the [acme-freight-webui](https://github.com/leeloo-acme-freight/acme-freight-webui) frontend to make requests on its behalf. It simply waits for a connection to send a `reqWatson` message with the query, then sends the request using the `watson-developer-cloud` SDK to the Acme-freight configured conversation service. Upon receiving the response, it relays it through the socket using `resWatson` message.

### Developer Notes

All Watson credentials (`WAT_CONV_USERNAME`, `WAT_CONV_PASSWORD`, `WAT_CONV_WORKSPACE`) must be set through environment variables. If running locally, this is achieved by creating a `.env` file. If deploying to Bluemix, this must be done by setting runtime environment variables (`App Dashboard -> Runtime -> Environment Variables`).