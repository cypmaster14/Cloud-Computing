const http = require('http');
const PORT = 7888;
const requestHandler = require('./handler');
const mongoose = require('mongoose');
const config = require('./config');

mongoose.connect(config.mongoUrl);
const server = http.createServer(function (req, res) {
    requestHandler(res, req);
});
server.listen(PORT, function () {
    console.log(`Server waiting at:${PORT}`);
});