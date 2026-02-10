const config = require("../config/dev");
const fetch = require("cross-fetch");
const { logError, logInfo, logSuccess, logWarning, clearOldLogs } = require("../helper/logger");
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
const updateDHISAggregateStatusWithSuccess = require("./query_helper").updateDHISAggregateStatusWithSuccess
const aggregateRoutineCareDischarge = require("./pmtct_routine_care_discharge").aggregateRoutineCareDischarge


async function aggregateAllData() {
    try {
      logInfo("Starting data aggregation process");
      clearOldLogs(5000); // Clear logs if they exceed 5000 lines

      await updateDhisSyncDB();
      const data = await getUnsyncedData();

      if (Array.isArray(data) && data.length > 0) {
        logInfo(`Found ${data.length} unsynced records to process`);

        for (const e of data) {
          try {
            if (e.scriptid === config.ADMISSIONS) {
              const admissionDate = getValueFromKey(e, "DateTimeAdmission", false, false)
              if (admissionDate) {
                const period = getReportingPeriod(admissionDate)
                if (period != null) {
                    await aggregateDeliveryInAdmission(e, period)
                    await aggregateNewBornComplicationsInAdmission(e, period)
                    await aggregateRoutineCareAdmission(e, period)
                    await aggregateTEOAdmission(e, period)
                    logInfo(`Aggregated ADMISSIONS record (UID: ${e.data?.uid}, Period: ${period})`);
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
                logInfo(`Aggregated MATERNALS record (UID: ${e.data?.uid}, Period: ${period})`);
              }
            }
            else if (e.scriptid === config.DISCHARGE) {
              await aggregateNewBornComplicationsMngtDischarge(e)
              await aggregatePMTCTDischarge(e)
              await aggregateRoutineCareDischarge(e)
              logInfo(`Aggregated DISCHARGE record (UID: ${e.data?.uid})`);
            }

            await updateDHISSyncStatus(e.id)
          } catch (err) {
            logError(`Error aggregating record (ID: ${e.id})`, err.message);
          }
        }
        logSuccess(`Data aggregation completed for ${data.length} records`);
      } else {
        logInfo("No unsynced records found");
      }
    } catch (err) {
      logError("Fatal error in aggregateAllData", err.message);
      throw err;
    }
  }


  async function syncToDhis(failed) {
    try {
      const syncType = failed ? 'FAILED_RETRY' : 'NORMAL';
      logInfo(`Starting DHIS2 sync (Type: ${syncType})`);

      const data = await getDHISSyncData(failed)
      const orgUnit = config.DHIS_ORGUNIT
      const dataSet = config.DHIS_DATASET

      if (data && Array.isArray(data) && data.length > 0) {
        logInfo(`Syncing ${data.length} records to DHIS2 (Type: ${syncType})`);
        const url = `${config.DHIS_HOST}/api/dataValueSets`;
        var auth = "Basic " + Buffer.from(config.DHIS_USER + ":" + config.DHIS_PW).toString("base64");

        let successCount = 0;
        let failCount = 0;

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
          reqOpts.timeout = 300000;

          try {
            const response = await fetch(url, {
              method: "POST",
              ...reqOpts,
            });

            // Extract error message from response
            let errorMsg = 'N/A';
            if (!response.ok) {
              try {
                const responseData = await response.json();
                errorMsg = responseData?.message || responseData?.error?.message || JSON.stringify(responseData);
              } catch {
                errorMsg = `HTTP ${response.status}: ${response.statusText}`;
              }
              await updateDHISAggregateStatusWithSuccess(d.id, 'FAILED', errorMsg);
              logWarning(`DHIS2 sync FAILED for element ${d.element} (Period: ${d.period})`, errorMsg);
              failCount++;
            } else {
              // Success response
              await updateDHISAggregateStatusWithSuccess(d.id, 'SUCCESS', 'N/A');
              logSuccess(`DHIS2 sync SUCCESS for element ${d.element} (Period: ${d.period}, Value: ${d.value})`);
              successCount++;
            }
          } catch (err) {
            // Capture detailed error information
            const errorMsg = err?.message || String(err) || 'Unknown error occurred';
            const detailedError = `${errorMsg}${err?.code ? ` (${err.code})` : ''}`;
            await updateDHISAggregateStatusWithSuccess(d.id, 'FAILED', detailedError);
            logError(`DHIS2 sync ERROR for element ${d.element} (Period: ${d.period})`, detailedError);
            failCount++;
          }
        }

        logSuccess(`DHIS2 sync completed`, {
          type: syncType,
          total: data.length,
          success: successCount,
          failed: failCount
        });
      } else {
        logInfo(`No data to sync (Type: ${syncType})`);
      }
    } catch (err) {
      logError("Fatal error in syncToDhis", err.message);
      throw err;
    }
  }

  module.exports = {
    aggregateAllData, syncToDhis
  }
  