const mapper = require('./mapper')
const helper = require("./query_helper")

async function aggregateDeliveryInMaternity(entry,period){

    const ModeDelivery = helper.getValueFromKey(entry,'ModeDelivery',false,false)

    const NeoTreeOutcome = helper.getValueFromKey(entry,'NeoTreeOutcome',false,false)

    if(ModeDelivery==="6"){
        helper.updateValues(mapper.RHD_MAT_DELIVERY_MODE_BREECH,period,1)
    }
    if(ModeDelivery==="4" && ModeDelivery!=='5'){
        helper.updateValues(mapper.RHD_MAT_DELIVERY_MODE_CEASARIAN_SECTION,period,1)
    }
    if(ModeDelivery==="1"){
        helper.updateValues(mapper.RHD_MAT_DELIVERY_MODE_SPONTANIOUS_VAGINAL,period,1)
    }
    if(ModeDelivery==="2"){
        helper.updateValues(mapper.RHD_MAT_DELIVERY_MODE_VACUUM_EXTRACTION,period,1)
    }
    if(NeoTreeOutcome!=="BID"){
        helper.updateValues(mapper.RHD_MAT_DELIVERY_PLACE_THIS_FACILITY,period,1)
    }
      
}

module.exports = {
    aggregateDeliveryInMaternity
  }