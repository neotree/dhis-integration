const mapper = require('./mapper')
const helper = require("./query_helper")

async function aggregateRoutineCareMaternity(entry, period) {

    const Chlor  = helper.getValueFromKey(entry, "Chlor ", false, false);
    const BabyNursery = helper.getValueFromKey(entry, "BabyNursery", false, false);
    const VitK  = helper.getValueFromKey(entry, "VitK ", false, false);
    const ITN  = helper.getValueFromKey(entry, "ITN ", false, false);
    
    if(BabyNursery==="N") {
        if(Chlor==="Y"){
        helper.updateValues(mapper.RHD_MAT_ROUTINE_CARE_CHLOROHEXIDINE_GIVEN, period, 1)
        }
        if(ITN==="Y"){
            helper.updateValues(mapper.RHD_MAT_ROUTINE_CARE_ITN_GIVEN, period, 1)
    
        }

        if(VitK==="Y"){
            helper.updateValues(mapper.RHD_MAT_ROUTINE_CARE_VITK_GIVEN, period, 1)
    
        }
        
    }
    
}

module.exports = {
    aggregateRoutineCareMaternity
  }



