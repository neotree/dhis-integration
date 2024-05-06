const mapper = require('./mapper')
const helper = require("./query_helper")

//AGGREGATE ART SECTION
async function aggregateArt(entry,period){

    const HAART = helper.getValueFromKey(entry,'HAART',false,false)

    console.log("---OIOI--",entry)
    console.log("---HART--",HAART)

    if(HAART==="N"){
        helper.updateValues(mapper.RHD_MAT_ART_MOTHER_NOT_ON_ART,period,1)
    }
    if(HAART==="DL"){
        helper.updateValues(mapper.RHD_MAT_ART_MOTHER_STARTING_DURING_LABOUR,period,1)
    }
    if(HAART==="1stTrim" ||HAART==="2ndTrim" ){
        helper.updateValues(mapper.RHD_MAT_ART_MOTHER_START_IN_1ST_OR_2ND_TRIMESTER,period,1)
    }
    if(HAART==="3rdTrim"){
        helper.updateValues(mapper.RHD_MAT_ART_MOTHER_START_IN_3RD_TRIMESTER,period,1)
    }
    if(HAART==="BP"){
        helper.updateValues(mapper.RHD_MAT_ART_MOTHER_START_BEFORE_PREGNANCY,period,1)
    }
   
}

module.exports = {
    aggregateArt
  }