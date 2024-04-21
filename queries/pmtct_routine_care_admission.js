const mapper = require('./mapper')
const helper = require("./helper")

async function aggregateRoutineCareAdmission(entry, period) {

    const Chlor = helper.getValueFromKey(entry, "Chlor ", false, false);
    const InOrOut = helper.getValueFromKey(entry, 'InOrOut', false, false)
    const VitK = helper.getValueFromKey(entry, "VitK ", false, false);
    const ITN = helper.getValueFromKey(entry, "ITN ", false, false);

    if (InOrOut === true) {
        if (Chlor === "Y") {
            helper.updateValues(mapper.RHD_MAT_ROUTINE_CARE_CHLOROHEXIDINE_GIVEN, period, 1)
        }
        if (ITN === "Y") {
            helper.updateValues(mapper.RHD_MAT_ROUTINE_CARE_ITN_GIVEN, period, 1)

        }

        if (VitK === "Y") {
            helper.updateValues(mapper.RHD_MAT_ROUTINE_CARE_VITK_GIVEN, period, 1)

        }

    }

}


module.exports = {
    aggregateRoutineCareAdmission
  }
