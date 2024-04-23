const mapper = require('./mapper')
const helper = require("./query_helper")

//AGGREGATE REfERRALS SECTION
async function aggregateReferrals(entry,period){

    const MatReferral = helper.getValueFromKey(entry,'MatReferral',false,false)

    if(MatReferral==="N"){
        helper.updateValues(mapper.RHD_MAT_REFERRED_OUT_NO,period,1)
    }
    
}


module.exports = {
    aggregateReferrals
  }