
const { Pool } = require('pg');
const config = require("../config/dev");
const getReportingPeriod = require("../helper/utils").getReportingPeriod
const fetch = require("cross-fetch");
const aggregateArt = require("./art").aggregateArt
const aggregateBreastFeeding = require("./breast_feeding").aggregateBreastFeeding
const aggregateDeliveryInAdmission = require("./delivery_admission").aggregateDeliveryInAdmission
const aggregateDeliveryInMaternity = require("./delivery_maternity").aggregateDeliveryInMaternity
const aggregateEmergencyObstetric = require("./emergency_obstetric").aggregateEmergencyObstetric
const aggregateHiv = require("./hiv").aggregateHiv
const aggregateMaternalOutcome = require("./mat_outcome").aggregateMaternalOutcome
const aggregateNewBornComplicationsInAdmission = require("./newborn_complications_admissions").aggregateNewBornComplicationsInAdmission
const aggregateNewBornComplicationsInMaternity = require("./newborn_complications_maternity").aggregateNewBornComplicationsInMaternity
const aggregateNewBornComplicationsMngtDischarge = require("./newborn_complications_mngt_discharge").aggregateNewBornComplicationsMngtDischarge
const aggregateObstetricComplications = require("./obs_complications").aggregateObstetricComplications
const aggregatePMTCTDischarge = require("./pmtct_discharge").aggregatePMTCTDischarge
const aggregatePMTCTMaternity = require("./pmtct_maternity").aggregatePMTCTMaternity
const aggregateRoutineCareAdmission = require("./pmtct_routine_care_admission").aggregateRoutineCareAdmission
const aggregateRoutineCareMaternity = require("./pmtct_routine_care_maternity").aggregateRoutineCareMaternity
const aggregateTEOAdmission = require("./pmtct_teo_admission").aggregateTEOAdmission
const aggregateTEOMaternity = require("./pmtct_teo_maternity").aggregateTEOMaternity
const aggregateReferrals = require("./referral").aggregateReferrals
const aggregateSingleTwinsTriplets = require("./single_twins_triplets").aggregateSingleTwinsTriplets
const aggregateStaffMaternity = require("./staff").aggregateStaffMaternity
const aggregateVitA = require("./vitamin_a").aggregateVitA

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

  return await pool.query(`SELECT value,element,period,categoryOptionCombo FROM public.dhis_aggregate`)
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
    return matchedAdmission;
  }
  return null;
}

async function aggregateAllData() {

  await updateDhisSyncDB();
  const data = await getUnsyncedData();
  if (Array.isArray(data) && data.length > 0) {
    for (e of data) {
      if (e.scriptid === config.ADMISSIONS || e.scriptid === config.MATERNALS) {
        const admissionDate = getValueFromKey(e, "DateTimeAdmission", false, false)
        if (admissionDate) {
          const period = getReportingPeriod(admissionDate)
          if (period != null) {
            if (e.scriptid === config.ADMISSIONS) {
              await aggregateDeliveryInAdmission(e, period)
              await aggregateNewBornComplicationsInAdmission(e, period)
              await aggregateRoutineCareAdmission(e, period)
              await aggregateTEOAdmission(e, period)

            } else {
              await aggregateArt(e, period);
              await aggregateBreastFeeding(e, period);
              await aggregateDeliveryInMaternity(e, period);
              await aggregateEmergencyObstetric(e, period);
              await aggregateHiv(e, period)
              await aggregateMaternalOutcome(e, period)
              await aggregateNewBornComplicationsInMaternity(e, period)
              await aggregateObstetricComplications(e, period)
              await aggregatePMTCTMaternity(e, period)
              await aggregateRoutineCareMaternity(e, period)
              await aggregateTEOMaternity(e, period)
              await aggregateReferrals(e, period)
              await aggregateSingleTwinsTriplets(e, period)
              await aggregateStaffMaternity(e, period)
              await aggregateVitA(e, period)

            }

          }
        }
      } else if (e.scriptid === config.DISCHARGE) {

        await aggregateNewBornComplicationsMngtDischarge(e)
        await aggregatePMTCTDischarge(e)


      }
      await updateDHISSyncStatus(e.id)
    }
  }
}
function getValueFromKey(entry, key, isMulti, isDiagnoses) {
  if (isMulti) {
    return entry?.data?.entries[`${key}`]?.values?.value
  }
  else {
    if (isDiagnoses) {
      return entry?.data?.entries[`${key}`]
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
      categoryOptionCombo VARCHAR (255),
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
    let query = `
      INSERT INTO public.dhis_sync 
      SELECT DISTINCT ON (uid,scriptid) id,data::jsonb,uid,scriptid,ingested_at
      FROM public.sessions
      WHERE scriptid ='${s}' AND ingested_at>= ingested_at - interval '14 day' 
      AND ingested_at >= '${sync_start_date}'
      AND uid NOT IN (SELECT uid FROM public.dhis_sync WHERE scriptid ='${s}')
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
  const exists = await columnExists(mapper['element'], mapper['categoryOptionCombo'], period);
  if (exists) {
    await pool.query(`UPDATE public.dhis_aggregate SET value=value+${value},last_update = now() at time zone 'ist' 
      where element='${mapper['element']}' and categoryOptionCombo='${mapper['categoryOptionCombo']}' and period='${period}'`);
  } else {
    await pool.query(`INSERT INTO public.dhis_aggregate(element,categoryOptionCombo,period,value)
     VALUES('${mapper['element']}','${mapper['categoryOptionCombo']}','${period}',${value})`);
  }
}

async function columnExists(element, categoryOptionCombo, period) {
  return await pool.query(`select exists(select 1 from public.dhis_aggregate where element='${element}'
  and categoryOptionCombo='${categoryOptionCombo}' and period='${period}') AS "exists"`)
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

async function syncToDhis() {
  //GET ALL THE DATA
  const data = await getDHISSyncData()
  const orgUnit = config.DHIS_ORGUNIT
  const dataSet = config.DHIS_DATASET
  if (data && Array.isArray(data) && data.length > 0) {
    const url = `${config.DHIS_HOST}/api/dataValueSets`;
    var auth = "Basic " + Buffer.from(config.DHIS_USER + ":" + config.DHIS_PW).toString("base64");

    for (d of data) {
      let body = {
        dataSet: dataSet,
        period: d.period,
        dataValues: [{
          dataElement: d.element,
          value: d.value,
          orgUnit: orgUnit,
          categoryOptionCombo: d.categoryOptionCombo
        }],
      };
      let reqOpts = {};
      reqOpts.headers = { Authorization: auth };
      reqOpts.headers["Content-Type"] = "application/json";
      reqOpts.body = JSON.stringify({ ...body });

      fetch(url, {
        method: "POST",
        ...reqOpts,
      })
        .then((res) => res.json())
        .then((res) => {
          console.log("res===", res)
        })
        .catch((err) => {
          console.log("err===", err)
        });

    }
  }
}

module.exports = {
  aggregateAllData, syncToDhis, updateValues, getValueFromKey, getMatched, getUid, getMatchedAdmission
}