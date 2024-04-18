const mapper = require('./mapper')
const helper = require("./helper")

//AGGREGATE REfERRALS SECTION
async function aggregateReferrals(entry,period){

    const MatReferral = helper.getValueFromKey(entry,'MatReferral',false)

    if(MatReferral==="N"){
        helper.updateValues(mapper.RHD_MAT_REFERRED_OUT_NO,period)
    }
    
}