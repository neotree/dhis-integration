const mapper = require('./mapper')
const helper = require("./helper")

//AGGREGATE OBSTETRIC COMPLICATIONS SECTION
async function aggregateObstetricComplications(entry,period){

    const PregConditions = helper.getValueFromKey(entry,'PregConditions',false)

    if(PregConditions==="APH"){
        helper.updateValues(mapper.RHD_MAT_OBSTETRIC_COMPLICATIONS_ANTI_PARTUM_HEAM,period)
    }
    if(PregConditions==="PRELAB"){
        helper.updateValues(mapper.RHD_MAT_OBSTETRIC_COMPLICATIONS_PREMATURE_LABOUR,period)
    }
    if(PregConditions==="OBSLAB"){
        helper.updateValues(mapper.RHD_MAT_OBSTETRIC_COMPLICATIONS_OBS_PRO_LABOUR,period)
    }
    if(PregConditions==="PRECLAM"){
        helper.updateValues(mapper.RHD_MAT_OBSTETRIC_COMPLICATIONS_PRE_CLAMPSIA,period)
    }
    if(PregConditions==="SEPS"){
        helper.updateValues(mapper.RHD_MAT_OBSTETRIC_COMPLICATIONS_SEPSIS,period)
    }
    if(PregConditions==="FD"){
        helper.updateValues(mapper.RHD_MAT_OBSTETRIC_COMPLICATIONS_FEOTAL_DISTRESS,period)
    }
    if(PregConditions==="RETPLA"){
        helper.updateValues(mapper.RHD_MAT_OBSTETRIC_COMPLICATIONS_RETAINED_PLACENTA,period)
    }
    if(PregConditions==="OTH"){
        helper.updateValues(mapper.RHD_MAT_OBSTETRIC_COMPLICATIONS_OTHERS,period)
    }
    if(PregConditions==="RUT"){
        helper.updateValues(mapper.RHD_MAT_OBSTETRIC_COMPLICATIONS_RAPTURED_UTERUS,period)
    }
    if(PregConditions==="NONE"){
        helper.updateValues(mapper.RHD_MAT_OBSTETRIC_COMPLICATIONS_NONE,period)
    }
    if(PregConditions==="PPH"){
        helper.updateValues(mapper.RHD_MAT_OBSTETRIC_COMPLICATIONS_POST_PARTUM_HEAM,period)
    }
   
}