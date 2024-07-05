const mapper = require('./mapper')
const helper = require("./query_helper")

//AGGREGATE REfERRALS SECTION
async function aggregateReferrals(entry,period){

    const MatReferral = await helper.getValueFromKey(entry,'MatReferral',false,false)

    if(MatReferral==="Y"){
        await helper.updateValues(mapper.RHD_MAT_REFERRED_OUT_YES,period,1)
    }
    
}


module.exports = {
    aggregateReferrals
  }