const mapper = require('./mapper')
const helper = require("./query_helper")

async function aggregateDeliveryInAdmission(entry,period){

    const PlaceBirth = await helper.getValueFromKey(entry,'PlaceBirth',false,false)
    const InOrOut = await helper.getValueFromKey(entry,'InOrOut',false,false)
    const ReferredFrom2 =  await helper.getValueFromKey(entry,'ReferredFrom2',false,false)


    if(PlaceBirth==="BBA"){
        await helper.updateValues(mapper.RHD_MAT_DELIVERY_IN_TRANSIT,period,1)
    }
    if(InOrOut==="No" && ReferredFrom2==="H"){
        await helper.updateValues(mapper.RHD_MAT_DELIVERY_PLACE_HOME_OR_TBA,period,1)
    }
    if(InOrOut==="No" && ReferredFrom2==="F"){
        await helper.updateValues(mapper.RHD_MAT_DELIVERY_PLACE_OTHER_FACILITY,period,1)
    }

}
module.exports = {
    aggregateDeliveryInAdmission
  }