const mapper = require('./mapper')
const helper = require("./helper")

async function aggregateNewBornComplicationsMngtDischarge(entry) {

    const uid = helper.getUid(entry)

    if (uid) {
        const matchedAdmission = await helper.getMatchedAdmission(uid)

      ADD PERIOD
        if (matchedAdmission) {
             //FOR THIS ONE CONSIDER CREATING PERIOD HERE
            const InOrOut = helper.getValueFromKey(matchedAdmission, 'InOrOut', false, false)
            if (InOrOut === true) {
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
                    helper.updateValues(mapper.RHD_MAT_NEWBORN_COMPLICATIONS_MNGT_ANTIBIOTICS, period)
                }
                const ThermCare = Array.from(helper.getValueFromKey(entry, 'ThermCare', true, false))
                if (ThermCare && ThermCare.length > 0) {
                    if (ThermCare.includes("KMC")) {
                        helper.updateValues(mapper.RHD_MAT_NEWBORN_COMPLICATIONS_MNGT_KMC, period, 1)
                    }
                }
                let otherCount = 0;
                const filteredThemCare = filteredThemCare ? ThermCare.filter(th => th !== "KMC") : [];
                if (filteredThemCare.length > 0) {
                    otherCount = filtered.length;
                }
                const RESPSUP = Array.from(helper.getValueFromKey(entry, 'RESPSUP', true, false))
                if (RESPSUP && RESPSUP.length > 0) {
                    otherCount = otherCount + RESPSUP.filter(f => f === "None").length
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
                    otherCount = otherCount + FeedsAdm.filter(f != "None" && f != "BF").length
                }
                helper.updateValues(mapper.RHD_MAT_NEWBORN_COMPLICATIONS_MNGT_OTHER, period, otherCount)

                const Resus = Array.from(helper.getValueFromKey(entry, 'Resus', true, false))
                if(Resus && Resus.length>0) {
                
                    helper.updateValues(mapper.RHD_MAT_NEWBORN_COMPLICATIONS_MNGT_RESC, period, Resus.filter(r=>r!="None" && r!="Unk").length)
                }
            }

        }

    }
}



