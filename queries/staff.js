const mapper = require('./mapper')
const helper = require("./query_helper")

async function aggregateStaffMaternity(entry, period) {

    const CadreDel = await helper.getValueFromKey(entry, "CadreDel", false, false);


    if (CadreDel === "MO" || CadreDel === "CO" || CadreDel === "MA" || CadreDel === "N" || CadreDel === "MW") {
        await helper.updateValues(mapper.RHD_MAT_STAFF_CONDUCTING_DELIVERY_MO_CO_MA_NURSE_MW, period, 1)
    }
    if (CadreDel === "OTH") {
        await helper.updateValues(mapper.RHD_MAT_STAFF_CONDUCTING_DELIVERY_OTHER, period, 1)
    }

    if (CadreDel === "PA" || CadreDel === "WA" || CadreDel === "HSA") {
        await helper.updateValues(mapper.RHD_MAT_STAFF_CONDUCTING_DELIVERY_PA_WA_HSA, period, 1)
    }



}

module.exports = {
    aggregateStaffMaternity
  }


