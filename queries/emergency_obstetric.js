const mapper = require('./mapper')
const helper = require("./query_helper")

//AGGREGATE EMERGENCY OBSTETRICS SECTION
async function aggregateEmergencyObstetric(entry,period){

    const MATCARE = helper.getValueFromKey(entry,'MATCARE',false,false)

    if(MATCARE==="AntCort"){
        helper.updateValues(mapper.RHD_MAT_EMERGENCE_OBSTETRIC_CARE_ANTENATAL,period,1)
    }
    if(MATCARE==="AB"){
        helper.updateValues(mapper.RHD_MAT_EMERGENCE_OBSTETRIC_CARE_ANTIBIOTICS,period,1)
    }
    if(MATCARE==="EvRP"){
        helper.updateValues(mapper.RHD_MAT_EMERGENCE_OBSTETRIC_CARE_ANTIBIOTICS_ERP,period,1)
    }
    if(MATCARE==="AntCon"){
        helper.updateValues(mapper.RHD_MAT_EMERGENCE_OBSTETRIC_CARE_ANTIBIOTICS_ANTI_CONVULSIVE,period,1)
    }
    if(MATCARE==="BT"){
        helper.updateValues(mapper.RHD_MAT_EMERGENCE_OBSTETRIC_CARE_BLOOD_TRANSFUSION,period,1)
    }
    if(MATCARE==="ManPla"){
        helper.updateValues(mapper.RHD_MAT_EMERGENCE_OBSTETRIC_CARE_MRP,period,1)
    }
    if(MATCARE==="NPASG"){
        helper.updateValues(mapper.RHD_MAT_EMERGENCE_OBSTETRIC_CARE_NASG,period,1)
    }
    if(MATCARE==="OxTx"){
        helper.updateValues(mapper.RHD_MAT_EMERGENCE_OBSTETRIC_CARE_OXYTOCIN,period,1)
    }
    
}
module.exports = {
    aggregateEmergencyObstetric
  }