const config = require("../config/dev");
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
const getReportingPeriod = require("../helper/utils").getReportingPeriod
const getUnsyncedData = require("./query_helper").getUnsyncedData
const getValueFromKey = require("./query_helper").getValueFromKey
const updateDHISSyncStatus = require("./query_helper").updateDHISSyncStatus
const updateDhisSyncDB = require("./query_helper").updateDhisSyncDB
const getDHISSyncData = require("./query_helper").getDHISSyncData
const updateDHISAggregateStatus = require("./query_helper").updateDHISAggregateStatus
const aggregateRoutineCareDischarge = require("./pmtct_routine_care_discharge").aggregateRoutineCareDischarge


async function aggregateAllData() {

    await updateDhisSyncDB();
    const data = await getUnsyncedData();
    if (Array.isArray(data) && data.length > 0) {
      for (const e of data) {
        if (e.scriptid === config.ADMISSIONS) {
          const admissionDate = getValueFromKey(e, "DateTimeAdmission", false, false)
          if (admissionDate) {
            const period = getReportingPeriod(admissionDate)
            if (period != null) {
                await aggregateDeliveryInAdmission(e, period)
                await aggregateNewBornComplicationsInAdmission(e, period)
                await aggregateRoutineCareAdmission(e, period)
                await aggregateTEOAdmission(e, period)
  
              }
             }
            }  
             else if(e.scriptid === config.MATERNALS) {
              const admissionDate = getValueFromKey(e, "DateAdmission", false, false)
              if (admissionDate) {
                const period = getReportingPeriod(admissionDate)
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
           else if (e.scriptid === config.DISCHARGE) {
          await aggregateNewBornComplicationsMngtDischarge(e)
          await aggregatePMTCTDischarge(e)
          await aggregateRoutineCareDischarge(e)
  
        }
        await updateDHISSyncStatus(e.id)
      }
    }
  }

  async function syncToDhis() {
  console.log("---RUNNING---")
    //GET ALL THE DATA
    const data = await getDHISSyncData()
    const orgUnit = config.DHIS_ORGUNIT
    const dataSet = config.DHIS_DATASET
    if (data && Array.isArray(data) && data.length > 0) {
      const url = `${config.DHIS_HOST}/api/dataValueSets`;
      var auth = "Basic " + Buffer.from(config.DHIS_USER + ":" + config.DHIS_PW).toString("base64");
  
      for (const d of data) {
        let body = {
          dataSet: dataSet,
          period: d.period,
          dataValues: [{
            dataElement: d.element,
            value: d.value,
            orgUnit: orgUnit,
            categoryOptionCombo: d.category
          }],
        };
        let reqOpts = {};
        reqOpts.headers = { Authorization: auth };
        reqOpts.headers["Content-Type"] = "application/json";
        reqOpts.body = JSON.stringify({ ...body });
        reqOpts.timeout = 30000; 

        fetch(url, {
          method: "POST",
          ...reqOpts,
        })
          .then((res) => res.json())
          .then(async (res) => {
          await updateDHISAggregateStatus(d.id,'SUCCESS','N/A')
          })
          .catch(async (err) => {
          await updateDHISAggregateStatus(d.id,'FAILED',err.message)
          })
      }
    }
  }

  module.exports = {
    aggregateAllData, syncToDhis
  }
  