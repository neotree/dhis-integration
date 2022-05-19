'use strict'
require('dotenv').config()
const express = require('express')
const http = require('http');
const app = express()
const server = http.createServer(app);
const bodyParser = require('body-parser')
const dhisServices = require('./helper/dhisCronJob');

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)
app.get('/', (request, response) => {
  response.json({ info: 'Node.js, Express, and Postgres API' })
})

dhisServices.exportToDHIS();

server.listen(3008, () =>
  console.log(`Server is listening on port 3008.`)
)


module.exports = app
