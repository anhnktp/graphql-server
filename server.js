//server.js
const graphql = require ('graphql').graphql
const express = require('express')
const graphQLHTTP = require('express-graphql')
const Schema = require('./schema')
const mongoose = require('mongoose');
const config = require('./config/database');
// Connect To Database
mongoose.connect(config.database);
// On Connection
mongoose.connection.on('connected', () => {
  console.log('Connected to database '+config.database);
});
// On Error
mongoose.connection.on('error', (err) => {
  console.log('Database error: '+ err);
});

// Port Number
const port = process.env.PORT || 8080;

// var query = 'query { todos { id, title, completed } }'
const app = express()

app.use('/', graphQLHTTP({ schema: Schema, graphiql:true, pretty: true }))
app.listen(port, (err) => {
    console.log('GraphQL Server is now running on localhost:8080');
});

// graphql(Schema, query).then( (result) => {
//   console.log(JSON.stringify(result,null," "));
// });
