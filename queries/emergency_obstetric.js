const mapper = require('./mapper')
const helper = require("./query_helper")

//AGGREGATE EMERGENCY OBSTETRICS SECTION
async function aggregateEmergencyObstetric(entry,period){

    const MATCARE = await helper.getValueFromKey(entry,'MATCARE',true,false)

    if(MATCARE) {
    if(MATCARE.includes("AntCort")){
        await helper.updateValues(mapper.RHD_MAT_EMERGENCE_OBSTETRIC_CARE_ANTENATAL,period,1)
    }
    if(MATCARE.includes("AB")){
        await helper.updateValues(mapper.RHD_MAT_EMERGENCE_OBSTETRIC_CARE_ANTIBIOTICS,period,1)
    }
    if(MATCARE.includes("EvRP")){
        await helper.updateValues(mapper.RHD_MAT_EMERGENCE_OBSTETRIC_CARE_ANTIBIOTICS_ERP,period,1)
    }
    if(MATCARE.includes("AntCon")){
        await helper.updateValues(mapper.RHD_MAT_EMERGENCE_OBSTETRIC_CARE_ANTIBIOTICS_ANTI_CONVULSIVE,period,1)
    }
    if(MATCARE.includes("BT")){
        await helper.updateValues(mapper.RHD_MAT_EMERGENCE_OBSTETRIC_CARE_BLOOD_TRANSFUSION,period,1)
    }
    if(MATCARE.includes("ManPla")){
        await helper.updateValues(mapper.RHD_MAT_EMERGENCE_OBSTETRIC_CARE_MRP,period,1)
    }
    if(MATCARE.includes("NPASG")){
        await helper.updateValues(mapper.RHD_MAT_EMERGENCE_OBSTETRIC_CARE_NASG,period,1)
    }
    if(MATCARE.includes("OxTx")){
        await helper.updateValues(mapper.RHD_MAT_EMERGENCE_OBSTETRIC_CARE_OXYTOCIN,period,1)
    }
}
    
}
module.exports = {
    aggregateEmergencyObstetric
  }