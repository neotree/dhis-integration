const mapper = require('./mapper')
const helper = require("./helper")

//AGGREGATE EMERGENCY OBSTETRICS SECTION
async function aggregateEmergencyObstetric(entry,period){

    const MATCARE = helper.getValueFromKey(entry,'MATCARE',false,false)

    if(MATCARE==="AntCort"){
        helper.updateValues(mapper.RHD_MAT_EMERGENCE_OBSTETRIC_CARE_ANTENATAL,period)
    }
    if(MATCARE==="AB"){
        helper.updateValues(mapper.RHD_MAT_EMERGENCE_OBSTETRIC_CARE_ANTIBIOTICS,period)
    }
    if(MATCARE==="EvRP"){
        helper.updateValues(mapper.RHD_MAT_EMERGENCE_OBSTETRIC_CARE_ANTIBIOTICS_ERP,period)
    }
    if(MATCARE==="AntCon"){
        helper.updateValues(mapper.RHD_MAT_EMERGENCE_OBSTETRIC_CARE_ANTIBIOTICS_ANTI_CONVULSIVE,period)
    }
    if(MATCARE==="BT"){
        helper.updateValues(mapper.RHD_MAT_EMERGENCE_OBSTETRIC_CARE_BLOOD_TRANSFUSION,period)
    }
    if(MATCARE==="ManPla"){
        helper.updateValues(mapper.RHD_MAT_EMERGENCE_OBSTETRIC_CARE_MRP,period)
    }
    if(MATCARE==="NPASG"){
        helper.updateValues(mapper.RHD_MAT_EMERGENCE_OBSTETRIC_CARE_NASG,period)
    }
    if(MATCARE==="OxTx"){
        helper.updateValues(mapper.RHD_MAT_EMERGENCE_OBSTETRIC_CARE_OXYTOCIN,period)
    }
    
}