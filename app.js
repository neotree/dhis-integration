'use strict'
require('dotenv').config()
const express = require('express')
const http = require('http');
const app = express()
const server = http.createServer(app);
const dhisServices = require('./helper/cronJob');


app.get('/', (request, response) => {
  response.json({ info: 'WELLCOME TO NEOTREE-DHIS2 INTEGRATION' })
})

dhisServices.updateSyncDBMorning();
// dhisServices.updateSyncDBMidMorning();
// dhisServices.updateSyncDBAfternoon();
// dhisServices.updateSyncDBNight();

server.listen(3008, () =>
  console.log(`Server is listening on port 3008.`)
)


module.exports = app
