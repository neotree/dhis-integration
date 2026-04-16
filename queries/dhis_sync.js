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
const updateLastAttemptTimestamp = require("./query_helper").updateLastAttemptTimestamp
const aggregateRoutineCareDischarge = require("./pmtct_routine_care_discharge").aggregateRoutineCareDischarge
const REQUEST_TIMEOUT_MS = 60000;
let syncInProgress = false;

function trimConfigValue(value) {
  return typeof value === 'string' ? value.trim() : value;
}

function getDhisResponseMessage(response, responseData) {
  if (responseData == null) {
    return `HTTP ${response.status}: ${response.statusText}`;
  }

  if (typeof responseData === 'string') {
    return responseData;
  }

  const conflicts = Array.isArray(responseData.conflicts)
    ? responseData.conflicts.map(conflict => conflict?.value || conflict?.message).filter(Boolean)
    : [];

  const details = [
    responseData.message,
    responseData.description,
    responseData.error?.message,
    responseData.response?.message,
    responseData.response?.description,
    conflicts.length > 0 ? conflicts.join("; ") : null
  ].filter(Boolean);

  if (details.length > 0) {
    return details.join(" | ");
  }

  return JSON.stringify(responseData);
}

function isDhisImportFailure(response, responseData) {
  if (!response.ok) {
    return true;
  }

  if (!responseData || typeof responseData !== 'object') {
    return false;
  }

  const ignored = Number(responseData.importCount?.ignored || 0);
  const hasConflicts = Array.isArray(responseData.conflicts) && responseData.conflicts.length > 0;
  const status = typeof responseData.status === 'string' ? responseData.status.toUpperCase() : '';

  return ignored > 0 || hasConflicts || status === 'ERROR';
}

async function parseDhisResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return await response.json();
  }

  const text = await response.text();
  return text || null;
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}


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
    if (syncInProgress) {
      logWarning(`Skipping DHIS2 sync because another sync is still running`, {
        type: failed ? 'FAILED_RETRY' : 'NORMAL'
      });
      return;
    }

    syncInProgress = true;

    try {
      const syncType = failed ? 'FAILED_RETRY' : 'NORMAL';
      logInfo(`Starting DHIS2 sync (Type: ${syncType})`);

      const data = await getDHISSyncData(failed)
      const orgUnit = trimConfigValue(config.DHIS_ORGUNIT)
      const dataSet = trimConfigValue(config.DHIS_DATASET)
      const attributeOptionCombo = trimConfigValue(config.DHIS_ATTRIBUTE_OPTION_COMBO)

      logInfo(`=======ORG UNIT (Type: ${orgUnit})`);
      logInfo(`=======ORG DSET (Type: ${dataSet})`);
      if (attributeOptionCombo) {
        logInfo(`=======ORG AOC (Type: ${attributeOptionCombo})`);
      }
     
      if (data && Array.isArray(data) && data.length > 0) {
        logInfo(`Syncing ${data.length} records to DHIS2 (Type: ${syncType})`);
        const url = `${config.DHIS_HOST}/api/dataValueSets`;
        var auth = "Basic " + Buffer.from(config.DHIS_USER + ":" + config.DHIS_PW).toString("base64");

        let successCount = 0;
        let failCount = 0;

        for (let index = 0; index < data.length; index++) {
          const d = data[index];
          if (index === 0 || (index + 1) % 25 === 0 || index === data.length - 1) {
            logInfo(`DHIS2 sync progress ${index + 1}/${data.length} (Type: ${syncType})`);
          }

          let body = {
            dataSet: dataSet,
            orgUnit: orgUnit,
            period: d.period,
            ...(attributeOptionCombo ? { attributeOptionCombo } : {}),
            dataValues: [{
              dataElement: d.element,
              value: d.value,
              orgUnit: orgUnit,
              categoryOptionCombo: d.category,
              ...(attributeOptionCombo ? { attributeOptionCombo } : {})
            }],
          };
          let reqOpts = {};
          reqOpts.headers = {
            Authorization: auth,
            "Content-Type": "application/json"
          };
          reqOpts.body = JSON.stringify({ ...body });

          let retryCount = 0;
          const maxRetries = 2;

          while (retryCount <= maxRetries) {
            try {
              await updateLastAttemptTimestamp(d.id);

              const response = await fetchWithTimeout(url, {
                method: "POST",
                ...reqOpts,
              }, REQUEST_TIMEOUT_MS);

              const responseData = await parseDhisResponse(response);
              const responseMsg = getDhisResponseMessage(response, responseData);

              if (isDhisImportFailure(response, responseData)) {
                const errorMsg = responseMsg || 'DHIS2 import failed';
                await updateDHISAggregateStatusWithSuccess(d.id, 'FAILED', errorMsg);
                logWarning(
                  `DHIS2 sync FAILED for element ${d.element} (Period: ${d.period}, Status: ${response.status}, OrgUnit: ${orgUnit}, DataSet: ${dataSet}, CategoryOptionCombo: ${d.category})`,
                  errorMsg
                );
                failCount++;
              } else {
                const successMsg = typeof responseData === 'object' && responseData?.status
                  ? responseData.status
                  : 'N/A';
                await updateDHISAggregateStatusWithSuccess(d.id, 'SUCCESS', successMsg);
                logSuccess(`DHIS2 sync SUCCESS for element ${d.element} (Period: ${d.period}, Value: ${d.value})`);
                successCount++;
              }
              break; // Exit retry loop on success or HTTP error
            } catch (err) {
              // Capture detailed error information
              const errorMsg = err?.message || String(err) || 'Unknown error occurred';
              const isRetryable = errorMsg.includes('socket hang up')
                || errorMsg.includes('ECONNRESET')
                || errorMsg.includes('ETIMEDOUT')
                || errorMsg.includes('aborted')
                || err?.name === 'AbortError';

              if (isRetryable && retryCount < maxRetries) {
                retryCount++;
                logWarning(`RETRY ATTEMPT for element ${d.element} (Attempt ${retryCount}/${maxRetries})`, errorMsg);
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
              } else {
                const detailedError = `${errorMsg}${err?.code ? ` (${err.code})` : ''}`;
                await updateDHISAggregateStatusWithSuccess(d.id, 'FAILED', detailedError);
                logError(`DHIS2 sync ERROR for element ${d.element} (Period: ${d.period})`, detailedError);
                failCount++;
                break; // Exit retry loop
              }
            }
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
    } finally {
      syncInProgress = false;
    }
  }

  module.exports = {
    aggregateAllData, syncToDhis
  }
  
