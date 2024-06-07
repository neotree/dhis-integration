const mapper = require('./mapper')
const helper = require("./query_helper")
const getReportingPeriod = require("../helper/utils").getReportingPeriod

async function aggregatePMTCTDischarge(entry) {

    const uid = await helper.getUid(entry)

    if (uid) {
        const matchedAdmission = await helper.getMatchedAdmission(uid)


        if (matchedAdmission) {
            const InOrOut = await helper.getValueFromKey(matchedAdmission, 'InOrOut', false, false)
            const DateTimeAdmission = await helper.getValueFromKey(matchedAdmission, 'DateTimeAdmission', false, false)
            if (InOrOut === "Yes" && DateTimeAdmission) {
                const period = getReportingPeriod(DateTimeAdmission)
                if (period != null) {
                    const HIVtestResultDC = await helper.getValueFromKey(entry, "HIVtestResultDC", false, false);
                    const NVPgiven = await helper.getValueFromKey(entry, "NVPgiven", false, false);
                    const NeoTreeOutcome = await helper.getValueFromKey(entry, "NeoTreeOutcome", false, false);

                    if (HIVtestResultDC === "R" && (NeoTreeOutcome != "NND" || NeoTreeOutcome != "BID")) {
                        if (NVPgiven === "Y") {
                            await helper.updateValues(mapper.RHD_MAT_NEWBORN_SURVIVAL_PMTCT_ALIVE_EXP_NVP_STARTED, period, 1)
                        } else if(NVPgiven === "N"){
                            await helper.updateValues(mapper.RHD_MAT_NEWBORN_SURVIVAL_PMTCT_ALIVE_EXP_NO_NVP, period, 1)
                        }

                    }

                    if (String(NeoTreeOutcome).includes("NND")) {
                        await helper.updateValues(mapper.RHD_MAT_NEWBORN_SURVIVAL_PMTCT_ALIVE_NEONATAL_DEATH, period, 1)
                    }

                    if (HIVtestResultDC === "NR") {
                        await helper.updateValues(mapper.RHD_MAT_NEWBORN_SURVIVAL_PMTCT_ALIVE_NOT_HIV_EXP, period, 1)

                    }

                    if (HIVtestResultDC === "U") {
                        await helper.updateValues(mapper.RHD_MAT_NEWBORN_SURVIVAL_PMTCT_ALIVE_UNKOWN_EXP, period, 1)

                    }
                }

            }

        }

    }
}
module.exports = {
    aggregatePMTCTDischarge
  }





