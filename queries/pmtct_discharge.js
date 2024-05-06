const mapper = require('./mapper')
const helper = require("./query_helper")
const getReportingPeriod = require("../helper/utils").getReportingPeriod

async function aggregatePMTCTDischarge(entry) {

    const uid = helper.getUid(entry)

    console.log("--TESTING UID--",uid)

    if (uid) {
        const matchedAdmission = await helper.getMatchedAdmission(uid)


        if (matchedAdmission) {
            const InOrOut = helper.getValueFromKey(matchedAdmission, 'InOrOut', false, false)
            const DateTimeAdmission = helper.getValueFromKey(matchedAdmission, 'DateTimeAdmission', false, false)
            if (InOrOut === "Yes" && DateTimeAdmission) {
                const period = getReportingPeriod(DateTimeAdmission)
                if (period != null) {
                    const HIVtestResultDC = helper.getValueFromKey(entry, "HIVtestResultDC", false, false);
                    const NVPgiven = helper.getValueFromKey(entry, "NVPgiven", false, false);
                    const NeoTreeOutcome = helper.getValueFromKey(entry, "NeoTreeOutcome", false, false);

                    if (HIVtestResultDC === "R" && (NeoTreeOutcome != "NND" || NeoTreeOutcome != "BID")) {
                        if (NVPgiven === "Y") {
                            helper.updateValues(mapper.RHD_MAT_NEWBORN_SURVIVAL_PMTCT_ALIVE_EXP_NVP_STARTED, period, 1)
                        } else {
                            helper.updateValues(mapper.RHD_MAT_NEWBORN_SURVIVAL_PMTCT_ALIVE_EXP_NO_NVP, period, 1)
                        }

                    }

                    if (String(NeoTreeOutcome).includes("NND")) {
                        helper.updateValues(mapper.RHD_MAT_NEWBORN_SURVIVAL_PMTCT_ALIVE_NEONATAL_DEATH, period, 1)
                    }

                    if (HIVtestResultDC === "NR") {
                        helper.updateValues(mapper.RHD_MAT_NEWBORN_SURVIVAL_PMTCT_ALIVE_NOT_HIV_EXP, period, 1)

                    }

                    if (HIVtestResultDC === "U") {
                        helper.updateValues(mapper.RHD_MAT_NEWBORN_SURVIVAL_PMTCT_ALIVE_UNKOWN_EXP, period, 1)

                    }
                }

            }

        }

    }
}
module.exports = {
    aggregatePMTCTDischarge
  }





