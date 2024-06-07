const mapper = require('./mapper')
const helper = require("./query_helper")
const getReportingPeriod = require("../helper/utils").getReportingPeriod

async function aggregateRoutineCareDischarge(entry) {

    const uid = await helper.getUid(entry)

    if (uid) {
        const matchedAdmission = await helper.getMatchedAdmission(uid)
      
        if (matchedAdmission) {
            const InOrOut = await helper.getValueFromKey(matchedAdmission, 'InOrOut', false, false)
            const DateTimeAdmission = await helper.getValueFromKey(matchedAdmission, 'DateTimeAdmission', false, false)

            if (InOrOut === "Yes" && DateTimeAdmission) {
                const period = getReportingPeriod(DateTimeAdmission)
                if (period != null) {
                    const ITN = await helper.getValueFromKey(entry, "ITN ", false, false);
                    if (ITN === "Y") {
                        await helper.updateValues(mapper.RHD_MAT_ROUTINE_CARE_ITN_GIVEN, period, 1)

                    }
                }
            }
        }
    }
}


module.exports = {
    aggregateRoutineCareDischarge
}
