const mapper = require('./mapper')
const helper = require("./helper")

async function aggregateDeliveryInMaternity(entry,period){

    const ModeDelivery = helper.getValueFromKey(entry,'ModeDelivery',false,false)

    const NeoTreeOutcome = helper.getValueFromKey(entry,'NeoTreeOutcome',false,false)

    if(ModeDelivery==="6"){
        helper.updateValues(mapper.RHD_MAT_DELIVERY_MODE_BREECH,period)
    }
    if(ModeDelivery==="4" && ModeDelivery!=='5'){
        helper.updateValues(mapper.RHD_MAT_DELIVERY_MODE_CEASARIAN_SECTION,period)
    }
    if(ModeDelivery==="1"){
        helper.updateValues(mapper.RHD_MAT_DELIVERY_MODE_SPONTANIOUS_VAGINAL,period)
    }
    if(ModeDelivery==="2"){
        helper.updateValues(mapper.RHD_MAT_DELIVERY_MODE_VACUUM_EXTRACTION,period)
    }
    if(NeoTreeOutcome!=="BID"){
        helper.updateValues(mapper.RHD_MAT_DELIVERY_PLACE_THIS_FACILITY,period)
    }
      
}