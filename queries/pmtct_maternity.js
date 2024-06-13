const mapper = require('./mapper')
const helper = require("./query_helper")

async function aggregatePMTCTMaternity(entry, period) {

    const HIVTestResults = await helper.getValueFromKey(entry, "HIVTestResults", false, false);
    const NVPgiven = await helper.getValueFromKey(entry, "NVPgiven", false, false);
    const NeoTreeOutcome = await helper.getValueFromKey(entry, "NeoTreeOutcome", false, false);
    const BabyNursery = await helper.getValueFromKey(entry, "BabyNursery", false, false);
    

    if (HIVTestResults === "R" 
       && (NeoTreeOutcome != "NND" || NeoTreeOutcome != "BID")
       && BabyNursery!="Y") {
        if(NVPgiven === "Y" ){
        await helper.updateValues(mapper.RHD_MAT_NEWBORN_SURVIVAL_PMTCT_ALIVE_EXP_NVP_STARTED, period, 1)
        } else if(NVPgiven==="N") {
            await helper.updateValues(mapper.RHD_MAT_NEWBORN_SURVIVAL_PMTCT_ALIVE_EXP_NO_NVP, period, 1)
        }
    }

    if(NeoTreeOutcome ==="DDD"){
        await helper.updateValues(mapper.RHD_MAT_NEWBORN_SURVIVAL_PMTCT_ALIVE_NEONATAL_DEATH, period, 1)
    }

    if(BabyNursery==="N") {
        if(HIVTestResults==="NR"){
        await helper.updateValues(mapper.RHD_MAT_NEWBORN_SURVIVAL_PMTCT_ALIVE_NOT_HIV_EXP, period, 1)
        }
        if(HIVTestResults==="U") {
            await helper.updateValues(mapper.RHD_MAT_NEWBORN_SURVIVAL_PMTCT_ALIVE_UNKOWN_EXP, period, 1)
       
        }
    }
    if(NeoTreeOutcome==="SBM"){
        await helper.updateValues(mapper.RHD_MAT_NEWBORN_SURVIVAL_PMTCT_ALIVE_STILLBIRTH_MASCERATED, period, 1)
    }

    if(NeoTreeOutcome==="SBF"){
        await helper.updateValues(mapper.RHD_MAT_NEWBORN_SURVIVAL_PMTCT_ALIVE_STILL_FRESH, period, 1)
    }

}

module.exports = {
    aggregatePMTCTMaternity
  }



