
const { Pool } = require('pg');
const config = require("../config/dev");
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



function aggregateNewBornComplications(entry){

}

function aggregateComplicationsManagement(entry){

}


function aggregateNewBornSurvival(entry){
// IN CASES OF ADM & DISCH, GET DISCHARGE OUTCOME FIRST AND FIND MATCHING ADM FROM SESSIONS TO CHECK IF ADM RULES ARE MET
// UPDATE STATUS IN dhis_sync after full entry is processed
}


function aggregateBreastFeedingInitiated(entry){

}

function aggregateRoutineCare(entry){

}

function aggregateAllData(entries){
    // CALL ALL THE ABOVE FUNCTIONS BASED ON SCRIPT ID
    // CALL THE AGGREGATE FUNCTION IN THE QUERIES FUNCTION
    if(Array.isArray(entries) && entries.length>0){
        entries.forEach(e=>{
            if(e.scriptid==='-KO1TK4zMvLhxTw6eKia'){
                aggregateNewBornComplications(e);
                aggregateComplicationsManagement(e);   
            } else if(e.scriptid==='-KYDiO2BTM4kSGZDVXAO'){
                aggregateNewBornSurvival(e);
                aggregateBreastFeedingInitiated(e)
                aggregateRoutineCare(e);
            } else if(e.scriptid==='-MOAjJ_In4TOoe0l_Gl5'){
                aggregateNewBornSurvival(e);

            } else{
                //DO NOTHING
            }
            //UPDATE dhis_sync STATUS HERE
            updateDHISSyncStatus(e.id)
        })
    }
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

function updateDHISSyncStatus(entryId){
if(entryId){
    pool.query(`UPDATE public.dhis_sync SET synced = TRUE WHERE id=${entryId}`);
}
}

module.exports = {
    aggregateNewBornComplications, aggregateComplicationsManagement,aggregateNewBornSurvival,
    aggregateBreastFeedingInitiated,aggregateRoutineCare,aggregateAllData, updateDhisSyncDB, getUnsyncedData
  }