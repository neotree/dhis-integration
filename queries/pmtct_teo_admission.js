const mapper = require('./mapper')
const helper = require("./query_helper")

async function aggregateTEOAdmission(entry, period) {

    const InOrOut = await helper.getValueFromKey(entry, 'InOrOut', false, false)
    const TetraEye = await helper.getValueFromKey(entry, "TetraEye", false, false);

    if (InOrOut === "Yes") {
        if (TetraEye === "Y") {
            await helper.updateValues(mapper.RHD_MAT_CARE_TETRACYCLINE_GIVEN, period, 1)
        } else {
            await helper.updateValues(mapper.RHD_MAT_CARE_TETRACYCLINE_NOT_GIVEN, period, 1)
        }


    }

}

module.exports = {
    aggregateTEOAdmission
  }




