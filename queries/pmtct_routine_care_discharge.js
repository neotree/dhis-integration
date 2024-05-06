const mapper = require('./mapper')
const helper = require("./query_helper")
const getReportingPeriod = require("../helper/utils").getReportingPeriod

async function aggregateRoutineCareDischarge(entry) {

    const uid = helper.getUid(entry)

    if (uid) {
        const matchedAdmission = await helper.getMatchedAdmission(uid)
      
        if (matchedAdmission) {
            const InOrOut = helper.getValueFromKey(matchedAdmission, 'InOrOut', false, false)
            const DateTimeAdmission = helper.getValueFromKey(matchedAdmission, 'DateTimeAdmission', false, false)

            if (InOrOut === "Yes" && DateTimeAdmission) {
                const period = getReportingPeriod(DateTimeAdmission)
                if (period != null) {
                    const ITN = helper.getValueFromKey(entry, "ITN ", false, false);
                    if (ITN === "Y") {
                        helper.updateValues(mapper.RHD_MAT_ROUTINE_CARE_ITN_GIVEN, period, 1)

                    }
                }
            }
        }
    }
}


module.exports = {
    aggregateRoutineCareDischarge
}
