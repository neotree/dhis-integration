
const { Pool } = require('pg');
const config = require("../config/dev");

const connectionString = `postgresql://${config.DB_USER}:${config.DB_PW}@${config.DB_HOST}:${config.DB_PORT}/${config.DB}`;


const pool = new Pool({
  connectionString: connectionString,
})

async function getUnsyncedData() {
  //SELECT DATA TO UPDATE
  return await pool.query(`SELECT id,scriptid, data FROM public.dhis_sync WHERE synced is false limit 1000`)
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

async function getDHISSyncData() {

  return await pool.query(`SELECT value,element,period,category FROM public.dhis_aggregate`)
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


async function getMatched(uid) {

  return await pool.query(`SELECT data FROM public.sessions where uid='${uid}'`)
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

async function getMatchedAdmission(uid) {
  const matchedAdmission = await getMatched(uid);
  if (matchedAdmission && Array.isArray(matchedAdmission) && matchedAdmission.length > 0) {
    return matchedAdmission[0];
  }
  return null;
}

function getValueFromKey(entry, key, isMulti, isDiagnoses) {
  if (isMulti) {
    return entry?.data?.entries[`${key}`]?.values?.value
  }
  else {
    if (isDiagnoses) {
      return entry?.data[`${key}`]
    }
    else
      return entry?.data?.entries[`${key}`]?.values?.value[0]
  }
}
function getUid(entry) {
  return entry?.data?.["uid"]
}
async function updateDhisSyncDB() {
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
      category VARCHAR (255),
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
  for (s of scripts) {
    //TODO Take Data From Cleaned Sessions
    let query = `
      INSERT INTO public.dhis_sync 
      SELECT DISTINCT ON (uid,scriptid) id,data::jsonb,uid,scriptid,ingested_at
      FROM public.sessions
      WHERE scriptid ='${s}'
      AND ingested_at >= '${sync_start_date}'
      AND uid NOT IN (SELECT uid FROM public.dhis_sync WHERE scriptid ='${s}')
      AND uid IN ('D06F-0136','D06F-0137','D06F-0138','D06F-0139','D06F-0140','D06F-0141','D06F-0142')
      ORDER BY uid,scriptid,id`
    await pool.query(query)
  }
}

async function updateDHISSyncStatus(entryId) {
  if (entryId) {
    await pool.query(`UPDATE public.dhis_sync SET synced = TRUE WHERE id=${entryId}`);
  }
}

async function updateValues(mapper, period, value) {
  console.log("----RUNNING---")
  const exists = await columnExists(mapper['element'], mapper['categoryOptionCombo'], period);
  if (exists===true) {
    await pool.query(`UPDATE public.dhis_aggregate SET value=value+${value},last_update = now() at time zone 'ist' 
      where element='${mapper['element']}' and category='${mapper['categoryOptionCombo']}' and period='${period}'`);
  } else {
    await pool.query(`INSERT INTO public.dhis_aggregate(element,category,period,value)
     VALUES('${mapper['element']}','${mapper['categoryOptionCombo']}','${period}',${value})`);
  }
}

async function columnExists(element, categoryOptionCombo, period) {
  return await pool.query(`select exists(select 1 from public.dhis_aggregate where element='${element}'
  and category='${categoryOptionCombo}' and period='${period}') AS "exists"`)
    .then(res => {
      if (res && res.rows && Array.isArray(res.rows) && res.rows.length > 0) {
        var jsonString = JSON.stringify(res.rows[0]);
        var jsonObj = JSON.parse(jsonString);
        return jsonObj['exists'];
      }
    }).catch(e => {
      return false
    })
}


module.exports = {
  getUnsyncedData, updateValues, 
  getValueFromKey, getMatched,
   getUid, getMatchedAdmission,
   getDHISSyncData,updateDHISSyncStatus,
   updateDhisSyncDB
}