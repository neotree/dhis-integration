const mapper = require('./mapper')
const helper = require("./query_helper")
const getReportingPeriod = require("../helper/utils").getReportingPeriod

async function aggregateNewBornComplicationsMngtDischarge(entry) {

    const uid = helper.getUid(entry)

    if (uid) {
        const matchedAdmission = await helper.getMatchedAdmission(uid)
        if (matchedAdmission) {
            const InOrOut = helper.getValueFromKey(matchedAdmission, 'InOrOut', false, false)
            const DateTimeAdmission = helper.getValueFromKey(matchedAdmission, 'DateTimeAdmission', false, false) 

            if (InOrOut === "Yes" && DateTimeAdmission) {
                const period = getReportingPeriod(DateTimeAdmission)
                if(period!=null){
                const MedsGiven = Array.from(helper.getValueFromKey(entry, "MedsGiven", true, false))

                if (MedsGiven
                    && MedsGiven.length > 0
                    && MedsGiven.includes("BP")
                    || MedsGiven.includes("GENT")
                    || MedsGiven.includes("CEF")
                    || MedsGiven.includes("AMOX")
                    || MedsGiven.includes("IMI")
                    || MedsGiven.includes("MET")
                    || MedsGiven.includes("Mero")) {
                    helper.updateValues(mapper.RHD_MAT_NEWBORN_COMPLICATIONS_MNGT_ANTIBIOTICS, period,1)
                }
                const ThermCare = Array.from(helper.getValueFromKey(entry, 'ThermCare', true, false))
                if (ThermCare && ThermCare.length > 0) {
                    if (ThermCare.includes("KMC")) {
                        helper.updateValues(mapper.RHD_MAT_NEWBORN_COMPLICATIONS_MNGT_KMC, period, 1)
                    }
                }
                let otherCount = 0;
                const filteredThemCare = ThermCare ? ThermCare.filter(th => th !== "KMC") : [];
                if (filteredThemCare.length > 0) {
                    otherCount = filteredThemCare.length;
                }
                const RESPSUP = Array.from(helper.getValueFromKey(entry, 'RESPSUP', true, false))
                if (RESPSUP && RESPSUP.length > 0) {
                    otherCount = otherCount + RESPSUP.filter(f => String(f).toLowerCase === "none").length
                }
                const PHOTOTHERAPY = helper.getValueFromKey(entry, 'PHOTOTHERAPY', false, false)
                if (PHOTOTHERAPY === "Yes") {
                    otherCount = otherCount + 1
                }
                const filterMedsGiven = MedsGiven ? MedsGiven.filter(mg =>
                    mg != "BP" && mg != "GENT" && mg != "CEF" && mg != "AMOX" && mg != "IMI" && mg != "MET" && mg != "Mero"
                ) : []
                otherCount = otherCount + filterMedsGiven.length

                const FeedsAdm = Array.from(helper.getValueFromKey(entry, 'FeedsAdm', true, false))

                if (FeedsAdm && FeedsAdm.length > 0) {
                    otherCount = otherCount + FeedsAdm.filter(f=>String(f).toLowerCase()!= "none" && f != "BF").length
                }
                helper.updateValues(mapper.RHD_MAT_NEWBORN_COMPLICATIONS_MNGT_OTHER, period, otherCount)

                const Resus = Array.from(helper.getValueFromKey(entry, 'Resus', true, false))
                if(Resus && Resus.length>0) {
                
                    helper.updateValues(mapper.RHD_MAT_NEWBORN_COMPLICATIONS_MNGT_RESC, period, Resus.filter(r=>String(r).toLowerCase()!="none" && String(r).toLowerCase()!="unk").length)
                }
            }
            }

        }

    }
}
module.exports = {
    aggregateNewBornComplicationsMngtDischarge
  }



