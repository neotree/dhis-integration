
const { Pool } = require('pg');
const config = require("../config/dev");
const mapper = require("./mapper");
const { logError, logInfo } = require("../helper/logger");

const connectionString = `postgresql://${config.DB_USER}:${config.DB_PW}@${config.DB_HOST}:${config.DB_PORT}/${config.DB}`;


const pool = new Pool({
  connectionString: connectionString,
})

async function getUnsyncedData() {
  //SELECT DATA TO UPDATE
  return await pool.query(`SELECT id,scriptid, data FROM public.dhis_sync WHERE synced is false`)
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

async function getDHISSyncData(failed) {

  let query = `SELECT id,value,element,period,category FROM public.dhis_aggregate WHERE value_changed=TRUE`
  if(failed){
    query=`SELECT id,value,element,period,category FROM public.dhis_aggregate WHERE status='FAILED'`
  }

  return await pool.query(query)
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
  try {
    //CREATE SYNC TABLE
    await pool.query(`CREATE TABLE IF NOT EXISTS public.dhis_sync (
        id serial PRIMARY KEY,
        data JSONB,
        uid VARCHAR (255),
        scriptid VARCHAR (255),
        ingested_at TIMESTAMP WITHOUT TIME ZONE,
        synced BOOLEAN NOT NULL DEFAULT FALSE
     )`).then(async () => {
      logInfo("dhis_sync table verified/created");
      await pool.query(`CREATE TABLE IF NOT EXISTS public.dhis_aggregate (
        id serial PRIMARY KEY,
        value INT DEFAULT 0,
        element VARCHAR (255),
        period  VARCHAR (255),
        category VARCHAR (255),
        last_update TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() at time zone 'Africa/Johannesburg'),
        last_attempt TIMESTAMP WITHOUT TIME ZONE,
        last_success_date TIMESTAMP WITHOUT TIME ZONE,
        status VARCHAR (255),
        error_msg VARCHAR (255),
        value_changed BOOLEAN DEFAULT FALSE
     )`).then(() => {
        logInfo("dhis_aggregate table verified/created");
      }).catch(e => {
        logError("CREATE DHIS AGGREGATE TABLE ERROR", e)
      })
    }).catch(err => {
      logError("CREATE DHIS SYNC TABLE ERROR", err)
    })

    const scripts = [config.ADMISSIONS, config.DISCHARGE, config.MATERNALS];
    let sync_start_date = config.START_DATE
    // DEDUPLICATE AND SYNC DATA
    for (const s of scripts) {
      //TODO Take Data From Cleaned Sessions
      let query = `
        INSERT INTO public.dhis_sync (data,uid,scriptid,ingested_at)
        SELECT DISTINCT ON (uid,scriptid) data::jsonb,uid,scriptid,ingested_at
        FROM public.sessions
        WHERE scriptid ='${s}'
        AND ((uid IN ('D06F-0136','D06F-0137','D06F-0138','D06F-0139','D06F-0140','D06F-0141','D06F-0142'))
        OR (ingested_at >= '${sync_start_date}'))
        AND ((uid,scriptid) not in (select uid,scriptid from public.dhis_sync))`
      await pool.query(query).catch(err => {
        if (!String(err).includes("does not exist")) {
          logError(`Error syncing data for script ${s}`, err.message);
        }
      })
    }
    logInfo("Database sync completed successfully");
  } catch (err) {
    logError("Fatal error in updateDhisSyncDB", err.message);
  }
}

async function updateDHISSyncStatus(entryId) {
  if (entryId) {
    await pool.query(`UPDATE public.dhis_sync SET synced = TRUE WHERE id=${entryId}`);
  }
}
async function updateDHISAggregateStatus(id,status,msg) {
  if (id) {
   await pool.query(`UPDATE public.dhis_aggregate SET status='${status}',error_msg='${msg}'
    ,last_attempt=now() at time zone 'Africa/Johannesburg'  WHERE id=${id}`);
  }
}

async function updateValues(mapper, period, value) {
  await seedZeroesForPeriod(period);

  // Get current value before update
  const currentResult = await pool.query(`
    SELECT value FROM public.dhis_aggregate
    WHERE element='${mapper['element']}'
    AND category='${mapper['categoryOptionCombo']}'
    AND period='${period}'
  `);

  const currentValue = currentResult.rows && currentResult.rows.length > 0 ? currentResult.rows[0].value : 0;
  const newValue = currentValue + value;
  const valueHasChanged = currentValue !== newValue;

  // Update value and set value_changed flag only if value actually changed
  await pool.query(`
    UPDATE public.dhis_aggregate
    SET value=${newValue},
        last_update = now() at time zone 'Africa/Johannesburg',
        value_changed=${valueHasChanged}
    WHERE element='${mapper['element']}'
    AND category='${mapper['categoryOptionCombo']}'
    AND period='${period}'
  `);
}

// USE THIS FUNCTION TO SET ZERO VALUES TO ALL DATA ELEMENTS ON ENCOUNTER OF A NEW PERIOD
async function seedZeroesForPeriod(period) {
  const periodSeeded = await pool.query(`select exists(select 1 from public.dhis_aggregate where "period"='${period}') AS "exists"`)
    .then(res => {
      if (res && res.rows && Array.isArray(res.rows) && res.rows.length > 0) {
        var jsonString = JSON.stringify(res.rows[0]);
        var jsonObj = JSON.parse(jsonString);
        return jsonObj['exists'];
      }
    }).catch(e => {
      return false
    })
  if (!periodSeeded) {
    for (const key in mapper) {
      await pool.query(`INSERT INTO public.dhis_aggregate(element,category,period,value,status,last_attempt)
        VALUES('${mapper[key]['element']}','${mapper[key]['categoryOptionCombo']}','${period}',0,'PENDING',now() at time zone 'Africa/Johannesburg')`);

    }
  }
}


async function updateDHISAggregateStatusWithSuccess(id, status, msg) {
  if (id) {
    if (status === 'SUCCESS') {
      await pool.query(`UPDATE public.dhis_aggregate SET status='${status}',error_msg='${msg}',
        last_attempt=now() at time zone 'Africa/Johannesburg',
        last_success_date=now() at time zone 'Africa/Johannesburg',
        value_changed=FALSE WHERE id=${id}`);
    } else {
      await pool.query(`UPDATE public.dhis_aggregate SET status='${status}',error_msg='${msg}',
        last_attempt=now() at time zone 'Africa/Johannesburg' WHERE id=${id}`);
    }
  }
}

async function updateLastAttemptTimestamp(id) {
  if (id) {
    await pool.query(`UPDATE public.dhis_aggregate SET last_attempt=now() at time zone 'Africa/Johannesburg' WHERE id=${id}`);
  }
}

async function resetValueChangedFlag(id) {
  if (id) {
    await pool.query(`UPDATE public.dhis_aggregate SET value_changed=FALSE WHERE id=${id}`);
  }
}

module.exports = {
  getUnsyncedData, updateValues,
  getValueFromKey, getMatched,
  getUid, getMatchedAdmission,
  getDHISSyncData, updateDHISSyncStatus,
  updateDhisSyncDB,
  seedZeroesForPeriod,
  updateDHISAggregateStatus,
  updateDHISAggregateStatusWithSuccess,
  updateLastAttemptTimestamp,
  resetValueChangedFlag
}