
const { Pool } = require('pg');
const config = require("../config/dev");
const getReportingPeriod = require("../helper/utils").getReportingPeriod
const mapper = require('../queries/mapper')
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



async function aggregateNewBornComplications(entry, period) {

  if(entry && entry.data && entry.data.entries){
  //ASPHYXIA
  if (entry.data.entries.hasOwnProperty('Birth Asphyxia')) {
   await updateValues(mapper.NEWBORN_COMPLICATIONS_ASPHYXIA, period);
  } else {
    const apgar5 = entry.data.entries['Apgar5']?.values.value[0]
    if (apgar5 && apgar5 < 7) {
     await updateValues(mapper.NEWBORN_COMPLICATIONS_ASPHYXIA, period);
    }
  }

  //OTHER 
    const diagnoses = entry.data['diagnoses'] || []
    if (Array.isArray(diagnoses) && diagnoses.length > 0) {
      let filtered = diagnoses.filter(d => (!d['Birth Asphyxia']
      && !d['Neonatal Sepsis'] && 
      !d['Neonatal Sepsis (Early onset - Asymptomatic)']
      && !d['Neonatal Sepsis (Early onset - Symptomatic)']
      && !d['Neonatal Sepsis (Late onset - Asymptomatic)']
      && !d['Low Birth Weight (1500-2499g)']
      && !d['Very Low Birth Weight (1000-1499g)']
      && !d['Extremely low birth weight (<1000g)']
      && !d['Extremely Low Birth Weight (<1000g)']
      && !d['Premature (32-36 weeks)']
      && !d['Very Premature (28-31 weeks)']
      && !d['Extremely Premature (<28 weeks)']
      && !d['Prematurity with RD']
      ));
      
      if (filtered.length > 0) {
       await updateValues(mapper.NEWBORN_COMPLICATIONS_OTHER, period);
      }
    } else {
      // NONE
     await updateValues(mapper.NEWBORN_COMPLICATIONS_NONE, period);
    }
  
  // PREMATURITY
  if (entry.data.entries.hasOwnProperty('Premature (32-36 weeks)') || entry.data.entries.hasOwnProperty('Very Premature (28-31 weeks)')
    || entry.data.entries.hasOwnProperty('Extremely Premature (<28 weeks)')||
    entry.data.entries.hasOwnProperty('Prematurity with RD')) {
   await updateValues(mapper.NEWBORN_COMPLICATIONS_PREMATURITY, period);
  } else {
    // PREMATURITY BY GESTATION
    const gestation = entry.data.entries['Gestation']?.values.value[0]
    if (gestation && gestation < 37) {
     await updateValues(mapper.NEWBORN_COMPLICATIONS_PREMATURITY, period);
    } else {
      // PREMATURITY BY BIRTH WEIGHT
      const birthWeight = entry.data.entries['BirthWeight']?.values.value[0]
      if (birthWeight && birthWeight < 2500) {
       await updateValues(mapper.NEWBORN_COMPLICATIONS_PREMATURITY, period);  
        // LOW BIRTH WEIGHT
       await updateValues(mapper.NEWBORN_COMPLICATIONS_LBW, period);
      }

    }

  }
  // SEPSIS
  if (entry.data.entries?.hasOwnProperty('Neonatal Sepsis')
    || entry.data.entries?.hasOwnProperty('Neonatal Sepsis (Early onset - Asymptomatic)')
    || entry.data.entries?.hasOwnProperty('Neonatal Sepsis (Early onset - Symptomatic)')
      || entry.data.entries?.hasOwnProperty('Neonatal Sepsis (Late onset - Asymptomatic)')){
     await updateValues(mapper.NEWBORN_COMPLICATIONS_SEPSIS, period);
  } else{
    // SEPSIS BY RISK FACTORS
    const riskFactors= entry.data.entries['RFSepsis']?.values.value
    if(riskFactors && Array.isArray(riskFactors)){
      if(riskFactors[0]!=='NONE'){
       await updateValues(mapper.NEWBORN_COMPLICATIONS_SEPSIS, period);
      }
    }
  }
  }
}

async function aggregateComplicationsManagement(entry, period) {

}


async function aggregateNewBornSurvival(entry, period) {
  // IN CASES OF ADM & DISCH, GET DISCHARGE OUTCOME FIRST AND FIND MATCHING ADM FROM SESSIONS TO CHECK IF ADM RULES ARE MET
  // UPDATE STATUS IN dhis_sync after full entry is processed
}


async function aggregateBreastFeedingInitiated(entry, period) {

}

async function aggregateRoutineCare(entry, period) {

}

async function aggregateAllData() {

  await updateDhisSyncDB();
  const data = await getUnsyncedData();
  if (Array.isArray(data) && data.length > 0) {
    for (e of data) {
      if (e.scriptid === '-KO1TK4zMvLhxTw6eKia') {
        const admissionDate = e.data.entries['DateTimeAdmission']?.values.value[0];
        if (admissionDate) {
          const period = getReportingPeriod(admissionDate)
          if (period != null) {
            await aggregateNewBornComplications(e, period);
            await aggregateComplicationsManagement(e, period);
          }
        }

      } else if (e.scriptid === '-KYDiO2BTM4kSGZDVXAO') {
        const dischargeDate = e.data.entries['DateTimeDischarge']?.values.value[0] || e.data.entries['DateTimeDeath']?.values.value[0];
        if (dischargeDate) {
          const period = getReportingPeriod(dischargeDate)
          if (period != null) {
           await aggregateNewBornSurvival(e, period);
           await aggregateBreastFeedingInitiated(e, period)
           await aggregateRoutineCare(e, period);
          }
        }
      } else if (e.scriptid === '-MOAjJ_In4TOoe0l_Gl5') {
        const admissionDate = e.data.entries['DateAdmission']?.values.value[0];
        if (admissionDate) {
          const period = getReportingPeriod(admissionDate)
          if (period) {
           await aggregateNewBornSurvival(e, period);
          }

        }

      } else {
        //DO NOTHING
      }
      //UPDATE dhis_sync STATUS HERE
      // updateDHISSyncStatus(e.id)
    }
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
    await pool.query(`UPDATE public.dhis_aggregate SET value=value+1,last_update = now() at time zone 'ist' 
      where element='${element}' and period='${period}'`);
  } else {
    await pool.query(`INSERT INTO public.dhis_aggregate(element,period,value) VALUES('${element}','${period}',1)`);
  }
}

async function columnExists(element, period) {
  return await pool.query(`select exists(select 1 from public.dhis_aggregate where element='${element}' and period='${period}') AS "exists"`)
    .then(res => {
      if (res && res.rows && Array.isArray(res.rows) && res.rows.length>0) {
        var jsonString = JSON.stringify(res.rows[0]);
        var jsonObj = JSON.parse(jsonString);
        return jsonObj['exists'];
      }
    }).catch(e => {
      return false
    })
}

async function syncToDhis() {
  //GET ALL THE DATA
  // POSSIBILITY TO AGGREGATE AND SYNC AT ONE GOAL
}

module.exports = {
  aggregateAllData
}