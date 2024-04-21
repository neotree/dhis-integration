const mapper = require('./mapper')
const helper = require("./helper")

async function aggregateDeliveryInAdmission(entry,period){

    const PlaceBirth = helper.getValueFromKey(entry,'PlaceBirth',false,false)
    const InOrOut = helper.getValueFromKey(entry,'InOrOut',false,false)
    const ReferredFrom2 =  helper.getValueFromKey(entry,'ReferredFrom2',false,false)

    if(PlaceBirth==="BBA"){
        helper.updateValues(mapper.RHD_MAT_DELIVERY_IN_TRANSIT,period,1)
    }
    if(InOrOut===false && ReferredFrom2==="H"){
        helper.updateValues(mapper.RHD_MAT_DELIVERY_PLACE_HOME_OR_TBA,period,1)
    }
    if(InOrOut===false && ReferredFrom2==="F"){
        helper.updateValues(mapper.RHD_MAT_DELIVERY_PLACE_OTHER_FACILITY,period,1)
    }

}
module.exports = {
    aggregateDeliveryInAdmission
  }