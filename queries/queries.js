
const { Pool } = require('pg');
const config = require("../config/dev");
const getReportingPeriod = require("../helper/utils").getReportingPeriod
const mapper = require('../queries/mapper')
const fetch = require("cross-fetch");
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

  return await pool.query(`SELECT value,element,period FROM public.dhis_aggregate`)
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

  if (entry && entry.data && entry.data.entries) {
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
      || entry.data.entries.hasOwnProperty('Extremely Premature (<28 weeks)') ||
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
      || entry.data.entries?.hasOwnProperty('Neonatal Sepsis (Late onset - Asymptomatic)')) {
      await updateValues(mapper.NEWBORN_COMPLICATIONS_SEPSIS, period);
    } else {
      // SEPSIS BY RISK FACTORS
      const riskFactors = entry.data.entries['RFSepsis']?.values.value
      if (riskFactors && Array.isArray(riskFactors) && !riskFactors.includes('NONE')) {
        await updateValues(mapper.NEWBORN_COMPLICATIONS_SEPSIS, period);
      }
    }
  }
}

async function aggregateComplicationsManagement(entry, period, isAdmission) {

  if (entry && entry.data && entry.data.entries) {

    if (isAdmission) {
      const plan = entry.data.entries['Plan']?.values.value || []
      if (plan && Array.isArray(plan) && plan.length > 0) {
        //KANGAROO
        if (plan.includes('KMC')) {
          await updateValues(mapper.NEWBORN_COMPLICATIONS_MNGT_KMC, period);
        }

        // OTHER
        const filteredPlan = plan.filter(p => !String(p) == 'KMC' && !String(p) == 'Res')
        if (filteredPlan.length > 0) {
          await updateValues(mapper.NEWBORN_COMPLICATIONS_MNGT_OTHER, period);
        }

      }
    } else {
      const meds = entry.data.entries['MedsGiven']?.values.value || []
      if (meds && Array.isArray(meds) && meds.length > 0) {
        const filteredMeds = meds.filter(m => String(m) == 'BP' || String(m) == 'GENT' || String(m) == 'CEF'
          || String(m) == 'AMOX' || String(m) == 'FLU' || String(m) == 'IMI' || String(m) == 'MET' || String(m) == 'Mero')
        if (filteredMeds.length > 0) {
          await updateValues(mapper.NEWBORN_COMPLICATIONS_MNGT_ANTIBIOTICS, period);
        }
      }
      //RESUSCITATION
      const resus = entry.data.entries['Resus']?.values.value || []
      if (resus.length > 0 && Array.isArray(resus) && !resus.includes('NONE')) {
        await updateValues(mapper.NEWBORN_COMPLICATIONS_MNGT_RESC, period);
      }
    }
  }
}


async function aggregateNewBornSurvival(entry, period, isMaternity) {
  if (entry && entry.data && entry.data.entries) {
    if (isMaternity) {
      const outcome = e.data.entries['NeoTreeOutcome']?.values.value[0];
      if (outcome == 'SBF') {
        await updateValues(mapper.NEWBORN_SURVIVAL_PMTCT_ALIVE_STILL_FRESH, period);
      } else if (outcome == 'SBM') {
        await updateValues(mapper.NEWBORN_SURVIVAL_PMTCT_ALIVE_STILLBIRTH_MASCERATED, period);
      }

    } else {
      //IN DISCHARGE SCRIPT
      const outcome = e.data.entries['NeoTreeOutcome']?.values.value[0];
      const hivExposure = e.data.entries['HIVtestResultDC']?.values.value[0];
      const nvpGiven = e.data.entries['NVPgiven']?.values.value[0];
      if (outcome == 'BID' || outcome == 'NND>24' || outcome == 'NND<24') {
        await updateValues(mapper.NEWBORN_SURVIVAL_PMTCT_ALIVE_NEONATAL_DEATH, period);
      }
      if (hivExposure == 'R' && nvpGiven == 'N') {
        await updateValues(mapper.NEWBORN_SURVIVAL_PMTCT_ALIVE_EXP_NO_NVP, period);
      } else if (hivExposure == 'R' && nvpGiven == 'Y') {
        await updateValues(mapper.NEWBORN_SURVIVAL_PMTCT_ALIVE_EXP_NVP_STARTED, period);
      } else if (hivExposure == 'UNK') {
        await updateValues(mapper.NEWBORN_SURVIVAL_PMTCT_ALIVE_UNKOWN_EXP, period);
      } else if (hivExposure == 'NR') {
        await updateValues(mapper.NEWBORN_SURVIVAL_PMTCT_ALIVE_NOT_HIV_EXP, period);
      }

    }

  }
}


async function aggregateBreastFeedingInitiated(entry, period) {
  if (entry && entry.data && entry.data.entries) {
    const feeds = entry.data.entries['FeedsAdm']?.values.value || []
    if (feeds && Array.isArray(feeds) && feeds.length > 0) {
      if (feeds.includes('BF')) {
        await updateValues(mapper.BREAST_FEEDING_INITIATED, period);
      }
    }
  }
}

async function aggregateRoutineCare(entry, period) {
  if (entry && entry.data && entry.data.entries) {
    const meds = entry.data.entries['MedsGiven']?.values.value || []
    const vitK = entry.data.entries['VitK']?.values.value[0]
    const chlx = entry.data.entries['Chlor']?.values.value[0]
    if (meds && Array.isArray(meds) && meds.length > 0) {
      // Chlorohexidine
      if ((chlx && chlx == 'Y') || meds.includes('CHLX')) {
        await updateValues(mapper.ROUTINE_CARE_CHLOROHEXIDINE_GIVEN, period);
      }
      //Vitamin K
      if ((vitK && vitK == 'Y') || meds.includes('VitK')) {
        await updateValues(mapper.ROUTINE_CARE_VITK_GIVEN, period);
      }

    }

  }

}

async function aggregateAllData() {

  await updateDhisSyncDB();
  const data = await getUnsyncedData();
  if (Array.isArray(data) && data.length > 0) {
    for (e of data) {
      if (e.scriptid =='-KO1TK4zMvLhxTw6eKia') {
        const admissionDate = e.data.entries['DateTimeAdmission']?.values.value[0];
        if (admissionDate) {
          const period = getReportingPeriod(admissionDate)
          if (period != null) {
            await aggregateNewBornComplications(e, period);
            await aggregateComplicationsManagement(e, period, true);
          }
        }
      } else if (e.scriptid =='-KYDiO2BTM4kSGZDVXAO') {
        const dischargeDate = e.data.entries['DateTimeDischarge']?.values.value[0] || e.data.entries['DateTimeDeath']?.values.value[0];
        if (dischargeDate) {
          const period = getReportingPeriod(dischargeDate)
          if (period != null) {
            await aggregateComplicationsManagement(e, period, false);
            await aggregateNewBornSurvival(e, period, false);
            await aggregateBreastFeedingInitiated(e, period)
            await aggregateRoutineCare(e, period);
          }
        }
      } else if (e.scriptid =='-MOAjJ_In4TOoe0l_Gl5') {
        console.log("===MAT")
        const admissionDate = e.data.entries['DateAdmission']?.values.value[0];
        if (admissionDate) {
          const period = getReportingPeriod(admissionDate)
          if (period) {
            await aggregateNewBornSurvival(e, period, true);
          }

        }

      } else {
    
      }
      //UPDATE dhis_sync STATUS HERE
     await updateDHISSyncStatus(e.id)
    }
  }
}
async function updateDhisSyncDB(){
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
  for (s of scripts){
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
    const url = `${config.DHIS_HOST}:${config.DHIS_PORT}/api/dataValueSets`;
    var auth = "Basic " + Buffer.from(config.DHIS_USER + ":" + config.DHIS_PW).toString("base64");
    for (d of data) {
      let body = {
        dataSet: dataSet,
        period: d.period,
        dataValues: {
          dataElement: d.element,
          value: d.value,
          orgUnit: orgUnit,
        },
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
          console.log("res===",res)
        })
        .catch((err) => {
          console.log("err===",err)
        });

    }
  }
  }

  module.exports = {
    aggregateAllData, syncToDhis
  }