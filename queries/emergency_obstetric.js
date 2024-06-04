const mapper = require('./mapper')
const helper = require("./query_helper")

//AGGREGATE EMERGENCY OBSTETRICS SECTION
async function aggregateEmergencyObstetric(entry,period){

    const MATCARE = helper.getValueFromKey(entry,'MATCARE',true,false)

    if(MATCARE) {
    if(MATCARE.includes("AntCort")){
        helper.updateValues(mapper.RHD_MAT_EMERGENCE_OBSTETRIC_CARE_ANTENATAL,period,1)
    }
    if(MATCARE.includes("AB")){
        helper.updateValues(mapper.RHD_MAT_EMERGENCE_OBSTETRIC_CARE_ANTIBIOTICS,period,1)
    }
    if(MATCARE.includes("EvRP")){
        helper.updateValues(mapper.RHD_MAT_EMERGENCE_OBSTETRIC_CARE_ANTIBIOTICS_ERP,period,1)
    }
    if(MATCARE.includes("AntCon")){
        helper.updateValues(mapper.RHD_MAT_EMERGENCE_OBSTETRIC_CARE_ANTIBIOTICS_ANTI_CONVULSIVE,period,1)
    }
    if(MATCARE.includes("BT")){
        helper.updateValues(mapper.RHD_MAT_EMERGENCE_OBSTETRIC_CARE_BLOOD_TRANSFUSION,period,1)
    }
    if(MATCARE.includes("ManPla")){
        helper.updateValues(mapper.RHD_MAT_EMERGENCE_OBSTETRIC_CARE_MRP,period,1)
    }
    if(MATCARE.includes("NPASG")){
        helper.updateValues(mapper.RHD_MAT_EMERGENCE_OBSTETRIC_CARE_NASG,period,1)
    }
    if(MATCARE.includes("OxTx")){
        helper.updateValues(mapper.RHD_MAT_EMERGENCE_OBSTETRIC_CARE_OXYTOCIN,period,1)
    }
}
    
}
module.exports = {
    aggregateEmergencyObstetric
  }