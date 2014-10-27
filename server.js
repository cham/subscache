'use strict';
var routemaster = require('routemaster');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(routemaster({
    directory: './routes',
    Router: express.Router
}));

module.exports = app;
