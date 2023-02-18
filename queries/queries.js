
const { Pool } = require('pg');
const config = require("../config/dev");
const getReportingPeriod = require("../helper/utils").getReportingPeriod
const connectionString = `postgresql://${config.DB_USER}:${config.DB_PW}@${config.DB_HOST}:${config.DB_PORT}/${config.DB}`;


const pool = new Pool({
  connectionString: connectionString,
})

const getUnsyncedData = async () => {
  //SELECT DATA TO UPDATE
  return await pool.query(`SELECT id,scriptid, data FROM public.dhis_sync WHERE synced = False `)
    .then(res => {
      if (res && res.rows) {
        var jsonString = JSON.stringify(res.rows);
        var jsonObj = JSON.parse(jsonString);
        return jsonObj;
      } else {
        return []
      }
    })
    .catch(err => {
      if (String(err).includes("does not exist")) {
        return []
      } else {
        throw new Error(err)
      }
    })
}



function aggregateNewBornComplications(entry,period) {

}

function aggregateComplicationsManagement(entry,period) {

}


function aggregateNewBornSurvival(entry,period) {
  // IN CASES OF ADM & DISCH, GET DISCHARGE OUTCOME FIRST AND FIND MATCHING ADM FROM SESSIONS TO CHECK IF ADM RULES ARE MET
  // UPDATE STATUS IN dhis_sync after full entry is processed
}


function aggregateBreastFeedingInitiated(entry,period) {

}

function aggregateRoutineCare(entry,period) {

}

async function aggregateAllData() {
  
  // UPDATE SYNC DATABASE FIRST
  await updateDhisSyncDB();
  // GET ALL UNSYNCED DATA
  const data = await getUnsyncedData();
  // PROCESS UNSYNCED DATA
  if(Array.isArray(data) && data.length>0){
    data.forEach(e => {
      if (e.scriptid === '-KO1TK4zMvLhxTw6eKia') {
        const admissionDate = e.data.entries['DateTimeAdmission']?.values.value[0];
        if(admissionDate){
          const period = getReportingPeriod(admissionDate)
          if(period!=null){
            console.log("===ADDATE==",period)
            aggregateNewBornComplications(e,period);
            aggregateComplicationsManagement(e,period);
          }
        }
        
      } else if (e.scriptid === '-KYDiO2BTM4kSGZDVXAO') {
        const dischargeDate =  e.data.entries['DateTimeDischarge']?.values.value[0] || e.data.entries['DateTimeDeath']?.values.value[0];
        if(dischargeDate){
          const period = getReportingPeriod(dischargeDate) 
        if(period!=null){ 
        console.log("===DSDATE==",period)
        aggregateNewBornSurvival(e,period);
        aggregateBreastFeedingInitiated(e,period)
        aggregateRoutineCare(e,period);
        }
        }
      } else if (e.scriptid === '-MOAjJ_In4TOoe0l_Gl5') {
        const admissionDate =e.data.entries['DateAdmission']?.values.value[0];
        if(admissionDate){
          const period = getReportingPeriod(admissionDate)
          if(period){
            aggregateNewBornSurvival(e,period);
          }
        
        }

      } else {
        //DO NOTHING
      }
      //UPDATE dhis_sync STATUS HERE
     // updateDHISSyncStatus(e.id)
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
   )`).then(async res => {
    await pool.query(`CREATE TABLE IF NOT EXISTS public.dhis_aggregate (
      id serial PRIMARY KEY,
      value INT DEFAULT 0,
      element VARCHAR (255),
      period  VARCHAR (255),
      last_update TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() at time zone 'ist')
   )`).catch(e => {
      console.log("CREATE DHIS AGGREGATE TABLE ERROR", e)
    })
  }).catch(err => {
    console.log("CREATE DHIS SYNC ERROR==", err)
  })
  const scripts = [config.ADMISSIONS, config.DISCHARGE, config.MATERNALS];
  let sync_start_date = config.START_DATE
  // DEDUPLICATE AND SYNC DATA
  scripts.forEach(async (s) => {
    let query = `
      INSERT INTO public.dhis_sync 
      SELECT DISTINCT ON (uid,scriptid) id,data::jsonb,uid,scriptid,ingested_at
      FROM public.sessions
      WHERE scriptid ='${s}' AND ingested_at>= ingested_at - interval '14 day' 
      AND ingested_at >= '${sync_start_date}'
      AND uid NOT IN (SELECT uid FROM public.dhis_sync WHERE scriptid ='${s}')
      ORDER BY uid,scriptid,id`
    await pool.query(query)
  })
}

function updateDHISSyncStatus(entryId) {
  if (entryId) {
    pool.query(`UPDATE public.dhis_sync SET synced = TRUE WHERE id=${entryId}`);
  }
}

async function updateValues(element, period) {
  const exists = await columnExists(element, period);
  if (exists) {
    pool.query(`UPDATE public.dhis_aggregate SET value=value+1,last_update = now() at time zone 'ist' 
      where element='${element}' and period='${period}'`);
  } else{
    pool.query(`INSERT INTO public.dhis_aggregate(element,period,value) VALUES('${element}','${period}',1)`);
  }
}

async function columnExists(element, period) {
  return await pool.query(`select exists(select 1 from public.dhis_aggregate where element='${element}' and period='${period}') AS "exists"`)
    .then(res => {
      if (res && res.rows) {
        var jsonString = JSON.stringify(res.rows);
        var jsonObj = JSON.parse(jsonString);
        return jsonObj['exists'];
      }
    }).catch(e => {
      return false
    })
}

module.exports = {
 aggregateAllData
}