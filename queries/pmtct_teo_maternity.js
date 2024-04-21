const mapper = require('./mapper')
const helper = require("./helper")

async function aggregateTEOMaternity(entry, period) {

    const TetraEye = helper.getValueFromKey(entry, "TetraEye ", false, false);
    const BabyNursery = helper.getValueFromKey(entry, "BabyNursery", false, false);

    if (BabyNursery === "N") {
        if (TetraEye === "Y") {
            helper.updateValues(mapper.RHD_MAT_CARE_TETRACYCLINE_GIVEN, period, 1)
        } else {
            helper.updateValues(mapper.RHD_MAT_CARE_TETRACYCLINE_NOT_GIVEN, period, 1)
        }

    }

}

module.exports = {
    aggregateTEOMaternity
  }


