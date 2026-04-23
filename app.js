'use strict'
require('dotenv').config()
const express = require('express')
const http = require('http');
const app = express()
const server = http.createServer(app);
const dhisServices = require('./helper/cronJob');
const port = Number(process.env.PORT) || 3009;


app.get('/', (request, response) => {
  response.json({ info: 'WELLCOME TO NEOTREE-DHIS2 INTEGRATION' })
})

dhisServices.updateSyncDBMorning();
dhisServices.updateSyncDBMidMorning();
dhisServices.updateSyncDBAfternoon();
dhisServices.updateSyncDBNight();
dhisServices.updateSyncFailed();

server.listen(port, () =>
  console.log(`Server is listening on port ${port}.`)
)


module.exports = app
