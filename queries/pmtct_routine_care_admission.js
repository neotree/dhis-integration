const mapper = require('./mapper')
const helper = require("./query_helper")

async function aggregateRoutineCareAdmission(entry, period) {

    const Chlor = await helper.getValueFromKey(entry, "Chlor", false, false);
    const InOrOut = await helper.getValueFromKey(entry, 'InOrOut', false, false)
    const VitK = await helper.getValueFromKey(entry, "VitK", false, false);
    const ITN = await helper.getValueFromKey(entry, "ITN", false, false);

    if (InOrOut === "Yes") {
        if (Chlor === "Y") {
            await helper.updateValues(mapper.RHD_MAT_ROUTINE_CARE_CHLOROHEXIDINE_GIVEN, period, 1)
        }
        if (ITN === "Y") {
            await helper.updateValues(mapper.RHD_MAT_ROUTINE_CARE_ITN_GIVEN, period, 1)

        }

        if (VitK === "Y") {
            await helper.updateValues(mapper.RHD_MAT_ROUTINE_CARE_VITK_GIVEN, period, 1)

        }

    }

}


module.exports = {
    aggregateRoutineCareAdmission
  }
