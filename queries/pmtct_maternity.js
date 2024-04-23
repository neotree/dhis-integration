const mapper = require('./mapper')
const helper = require("./query_helper")

async function aggregatePMTCTMaternity(entry, period) {

    const HIVTestResults = helper.getValueFromKey(entry, "HIVTestResults", false, false);
    const NVPgiven = helper.getValueFromKey(entry, "NVPgiven", false, false);
    const NeoTreeOutcome = helper.getValueFromKey(entry, "NeoTreeOutcome", false, false);
    const BabyNursery = helper.getValueFromKey(entry, "BabyNursery", false, false);
    

    if (HIVTestResults === "R" 
       && (NeoTreeOutcome != "NND" || NeoTreeOutcome != "BID")
       && BabyNursery==="Y") {
        if(NVPgiven === "Y" ){
        helper.updateValues(mapper.RHD_MAT_NEWBORN_SURVIVAL_PMTCT_ALIVE_EXP_NVP_STARTED, period, 1)
        } else {
            helper.updateValues(mapper.RHD_MAT_NEWBORN_SURVIVAL_PMTCT_ALIVE_EXP_NO_NVP, period, 1)
        }
    }

    if(NeoTreeOutcome ==="DDD"){
        helper.updateValues(mapper.RHD_MAT_NEWBORN_SURVIVAL_PMTCT_ALIVE_NEONATAL_DEATH, period, 1)
    }

    if(BabyNursery==="N") {
        if(HIVTestResults==="NR"){
        helper.updateValues(mapper.RHD_MAT_NEWBORN_SURVIVAL_PMTCT_ALIVE_NOT_HIV_EXP, period, 1)
        }
        if(HIVTestResults==="U") {
            helper.updateValues(mapper.RHD_MAT_NEWBORN_SURVIVAL_PMTCT_ALIVE_UNKOWN_EXP, period, 1)
       
        }
    }
    if(NeoTreeOutcome==="SBM"){
        helper.updateValues(mapper.RHD_MAT_NEWBORN_SURVIVAL_PMTCT_ALIVE_STILLBIRTH_MASCERATED, period, 1)
    }

    if(NeoTreeOutcome==="SBF"){
        helper.updateValues(mapper.RHD_MAT_NEWBORN_SURVIVAL_PMTCT_ALIVE_STILL_FRESH, period, 1)
    }

}

module.exports = {
    aggregatePMTCTMaternity
  }



