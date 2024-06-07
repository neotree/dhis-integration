const mapper = require('./mapper')
const helper = require("./query_helper")

//AGGREGATE ART SECTION
async function aggregateArt(entry,period){

    const HAART = await helper.getValueFromKey(entry,'HAART',false,false)

    if(HAART==="N"){
       await helper.updateValues(mapper.RHD_MAT_ART_MOTHER_NOT_ON_ART,period,1)
    }
    if(HAART==="DL"){
       await helper.updateValues(mapper.RHD_MAT_ART_MOTHER_STARTING_DURING_LABOUR,period,1)
    }
    if(HAART==="1stTrim" ||HAART==="2ndTrim" ){
        await helper.updateValues(mapper.RHD_MAT_ART_MOTHER_START_IN_1ST_OR_2ND_TRIMESTER,period,1)
    }
    if(HAART==="3rdTrim"){
        await helper.updateValues(mapper.RHD_MAT_ART_MOTHER_START_IN_3RD_TRIMESTER,period,1)
    }
    if(HAART==="BP"){
        await helper.updateValues(mapper.RHD_MAT_ART_MOTHER_START_BEFORE_PREGNANCY,period,1)
    }
   
}

module.exports = {
    aggregateArt
  }