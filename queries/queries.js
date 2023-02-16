const { Pool } = require('pg');
const config = require("../config/dev");
const utils = require('../helper/utils')

const connectionString = `postgresql://${config.DB_USER}:${config.DB_PW}@${config.DB_HOST}:${config.DB_PORT}/${config.DB}`;

const pool = new Pool({
  connectionString: connectionString,
})

const getUnsyncedData =async () => {
    //SELECT DATA TO UPDATE
    return await pool.query(`SELECT id,scriptid, data FROM public.dhis_sync WHERE synced = False `)
           .then(res=>{
             if(res && res.rows){
            var jsonString = JSON.stringify(res.rows);
            var jsonObj = JSON.parse(jsonString);
            return jsonObj;
             } else{
               return []
             }
           })
           .catch(err=>{
             if(String(err).includes("does not exist")){
               return []
             } else{
               throw new Error(err)
             }
           }) 
          }

const updateDhisSyncDB = async () => {
    //CREATE SYNC TABLE
 await pool.query(`CREATE TABLE IF NOT EXISTS public.dhis_sync (
      id serial PRIMARY KEY,
      data JSONB,
      uid VARCHAR (255),
      scriptid VARCHAR (255),
      ingested_at TIMESTAMP WITHOUT TIME ZONE,
      synced BOOLEAN NOT NULL DEFAULT FALSE
   )`).then(async res=>{
    await pool.query(`CREATE TABLE IF NOT EXISTS public.dhis_aggregate (
      id serial PRIMARY KEY,
      value INT DEFAULT 0,
      element VARCHAR (255),
      last_update TIMESTAMP WITHOUT TIME ZONE
   )`).catch(e=>{
     console.log("CREATE DHIS AGGREGATE TABLE ERROR",e)
   })
   }).catch(err=>{
     console.log("CREATE DHIS SYNC ERROR==",err)
   })
    const scripts = [config.ADMISSIONS, config.DISCHARGE, config.MATERNALS];
    let sync_start_date = config.START_DATE
    // DEDUPLICATE AND SYNC DATA
   scripts.forEach(async (s) => {
      let query = `
      INSERT INTO public.dhis_sync 
      SELECT DISTINCT ON (uid) id,data::jsonb,uid,scriptid,ingested_at
      FROM public.sessions
      WHERE scriptid ='${s}' AND ingested_at>= ingested_at - interval '14 day' 
      AND ingested_at >= '${sync_start_date}'
      AND uid NOT IN (SELECT uid FROM public.dhis_sync WHERE scriptid ='${s}')
      ORDER BY uid,id`
      await pool.query(query)
    })
}
  

const syncDhisAggregate = async () => {
  try{
  await updateDhisSyncDB();
  const data = await getUnsyncedData();
  console.log("===DATA===",data)
}catch(e){
  console.log(e)
}

  
}


module.exports = {
  getUnsyncedData, syncDhisAggregate
}
