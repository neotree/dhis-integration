const { Pool} = require('pg');
const { DATABASE } = require('./config/server.config.json');
const utils = require('./helper/utils')

const connectionString = `postgresql://${DATABASE.USERNAME}:${DATABASE.PASSWORD}@${DATABASE.HOST}:${DATABASE.PORT}/${DATABASE.DBNAME}`;

const pool = new Pool({
  connectionString: connectionString,
})

const getSessionsByScriptId = async (request) => {
  const scriptid = request
  var date = new Date();
  var firstDay = utils.getFirstDayOfMonth(date);
  var lastDay = utils.getLastDayOfMonth(date);
 return new Promise((resolve, reject) => { 
  //data?'exportedToDHIS' OR 
   return pool.query(`SELECT id,scriptid, ingested_at, data FROM public.sessions WHERE scriptid= $1 AND 
   ingested_at BETWEEN $2 AND $3 `,[scriptid,firstDay,lastDay], (error, results) => {
    if (error) {
      reject (error)
    }
 
    var jsonString = JSON.stringify(results.rows);
    var jsonObj = JSON.parse(jsonString);
 return resolve(jsonObj);

  })
})
}


module.exports = {
  getSessionsByScriptId
}
