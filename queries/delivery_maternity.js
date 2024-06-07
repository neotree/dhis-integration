const mapper = require('./mapper')
const helper = require("./query_helper")

async function aggregateDeliveryInMaternity(entry,period){

    const ModeDelivery = await helper.getValueFromKey(entry,'ModeDelivery',false,false)

    const NeoTreeOutcome = await helper.getValueFromKey(entry,'NeoTreeOutcome',false,false)

    if(ModeDelivery==="6"){
        await helper.updateValues(mapper.RHD_MAT_DELIVERY_MODE_BREECH,period,1)
    }
    if(ModeDelivery==="4" || ModeDelivery==='5'){
        await helper.updateValues(mapper.RHD_MAT_DELIVERY_MODE_CEASARIAN_SECTION,period,1)
    }
    if(ModeDelivery==="1"){
        await helper.updateValues(mapper.RHD_MAT_DELIVERY_MODE_SPONTANIOUS_VAGINAL,period,1)
    }
    if(ModeDelivery==="2"){
        await helper.updateValues(mapper.RHD_MAT_DELIVERY_MODE_VACUUM_EXTRACTION,period,1)
    }
    if(NeoTreeOutcome!=="BID"){
        await helper.updateValues(mapper.RHD_MAT_DELIVERY_PLACE_THIS_FACILITY,period,1)
    }
      
}

module.exports = {
    aggregateDeliveryInMaternity
  }