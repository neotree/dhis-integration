const mapper = require('./mapper')
const helper = require("./query_helper")

//AGGREGATE OBSTETRIC COMPLICATIONS SECTION
async function aggregateObstetricComplications(entry,period){

    const PregConditions = helper.getValueFromKey(entry,'PregConditions',true,false)

    if(PregConditions){

    if(PregConditions.includes("APH")){
        helper.updateValues(mapper.RHD_MAT_OBSTETRIC_COMPLICATIONS_ANTI_PARTUM_HEAM,period,1)
    }
    if(PregConditions.includes("PRELAB")){
        helper.updateValues(mapper.RHD_MAT_OBSTETRIC_COMPLICATIONS_PREMATURE_LABOUR,period,1)
    }
    if(PregConditions.includes("OBSLAB")){
        helper.updateValues(mapper.RHD_MAT_OBSTETRIC_COMPLICATIONS_OBS_PRO_LABOUR,period,1)
    }
    if(PregConditions.includes("PRECLAM")){
        helper.updateValues(mapper.RHD_MAT_OBSTETRIC_COMPLICATIONS_PRE_CLAMPSIA,period,1)
    }
    if(PregConditions.includes("SEPS")){
        helper.updateValues(mapper.RHD_MAT_OBSTETRIC_COMPLICATIONS_SEPSIS,period,1)
    }
    if(PregConditions.includes("FD")){
        helper.updateValues(mapper.RHD_MAT_OBSTETRIC_COMPLICATIONS_FEOTAL_DISTRESS,period,1)
    }
    if(PregConditions.includes("RETPLA")){
        helper.updateValues(mapper.RHD_MAT_OBSTETRIC_COMPLICATIONS_RETAINED_PLACENTA,period,1)
    }
    const otherConditions = PregConditions.filter(pc => pc === "MAL" || pc==="OTH" || pc==="TU" || pc==="DM")
    if(otherConditions && otherConditions.length>0){
        helper.updateValues(mapper.RHD_MAT_OBSTETRIC_COMPLICATIONS_OTHERS,period,otherConditions.length)
    }
    if(PregConditions.includes("RUT")){
        helper.updateValues(mapper.RHD_MAT_OBSTETRIC_COMPLICATIONS_RAPTURED_UTERUS,period,1)
    }
    if(PregConditions.includes("NONE")){
        helper.updateValues(mapper.RHD_MAT_OBSTETRIC_COMPLICATIONS_NONE,period,1)
    }
    if(PregConditions.includes("PPH")){
        helper.updateValues(mapper.RHD_MAT_OBSTETRIC_COMPLICATIONS_POST_PARTUM_HEAM,period,1)
    }
}
   
}

module.exports = {
    aggregateObstetricComplications
  }
