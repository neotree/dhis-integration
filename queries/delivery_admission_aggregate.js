const mapper = require('./mapper')
const helper = require("./helper")

async function aggregateDeliveryInAdmission(entry,period){

    const PlaceBirth = helper.getValueFromKey(entry,'PlaceBirth',false)
    const InOrOut = helper.getValueFromKey(entry,'InOrOut',false)
    const ReferredFrom2 =  helper.getValueFromKey(entry,'ReferredFrom2',false)

    if(PlaceBirth==="BBA"){
        helper.updateValues(mapper.RHD_MAT_DELIVERY_IN_TRANSIT,period)
    }
    if(InOrOut==="BBA"){
        helper.updateValues(mapper.RHD_MAT_DELIVERY_IN_TRANSIT,period)
    }
    
}