const mapper = require('./mapper')
const helper = require("./query_helper")

async function aggregateRoutineCareMaternity(entry, period) {

    const Chlor  = await helper.getValueFromKey(entry, "Chlor", false, false);
    const BabyNursery = await helper.getValueFromKey(entry, "BabyNursery", false, false);
    const VitK  = await helper.getValueFromKey(entry, "VitK", false, false);
    const ITN  = await helper.getValueFromKey(entry, "ITN", false, false);
    
    if(BabyNursery==="N") {
        if(Chlor==="Y"){
        await helper.updateValues(mapper.RHD_MAT_ROUTINE_CARE_CHLOROHEXIDINE_GIVEN, period, 1)
        }
        if(ITN==="Y"){
            await helper.updateValues(mapper.RHD_MAT_ROUTINE_CARE_ITN_GIVEN, period, 1)
    
        }

        if(VitK==="Y"){
            await helper.updateValues(mapper.RHD_MAT_ROUTINE_CARE_VITK_GIVEN, period, 1)
    
        }
        
    }
    
}

module.exports = {
    aggregateRoutineCareMaternity
  }



