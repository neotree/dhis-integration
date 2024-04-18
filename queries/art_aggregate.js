const mapper = require('./mapper')
const helper = require("./helper")

//AGGREGATE ART SECTION
async function aggregateArt(entry,period){

    const HAART = helper.getValueFromKey(entry,'HAART',false)

    if(HAART==="N"){
        helper.updateValues(mapper.RHD_MAT_ART_MOTHER_NOT_ON_ART,period)
    }
    if(HAART==="DL"){
        helper.updateValues(mapper.RHD_MAT_ART_MOTHER_STARTING_DURING_LABOUR,period)
    }
    if(HAART==="1stTrim" ||HAART==="2ndTrim" ){
        helper.updateValues(mapper.RHD_MAT_ART_MOTHER_START_IN_1ST_OR_2ND_TRIMESTER,period)
    }
    if(HAART==="3rdTrim"){
        helper.updateValues(mapper.RHD_MAT_ART_MOTHER_START_IN_3RD_TRIMESTER,period)
    }
    if(HAART==="BP"){
        helper.updateValues(mapper.RHD_MAT_ART_MOTHER_START_BEFORE_PREGNANCY,period)
    }
   
}