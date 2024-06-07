const mapper = require('./mapper')
const helper = require("./query_helper")

async function aggregateTEOMaternity(entry, period) {

    const TetraEye = await helper.getValueFromKey(entry, "TetraEye", false, false);
    const BabyNursery = await helper.getValueFromKey(entry, "BabyNursery", false, false);

    if (BabyNursery === "N") {
        if (TetraEye === "Y") {
            await helper.updateValues(mapper.RHD_MAT_CARE_TETRACYCLINE_GIVEN, period, 1)
        } else {
            await helper.updateValues(mapper.RHD_MAT_CARE_TETRACYCLINE_NOT_GIVEN, period, 1)
        }

    }

}

module.exports = {
    aggregateTEOMaternity
  }


