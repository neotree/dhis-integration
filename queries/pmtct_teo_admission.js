const mapper = require('./mapper')
const helper = require("./query_helper")

async function aggregateTEOAdmission(entry, period) {

    const InOrOut = helper.getValueFromKey(entry, 'InOrOut', false, false)
    const TetraEye = helper.getValueFromKey(entry, "TetraEye ", false, false);

    if (InOrOut === true) {
        if (TetraEye === "Y") {
            helper.updateValues(mapper.RHD_MAT_CARE_TETRACYCLINE_GIVEN, period, 1)
        } else {
            helper.updateValues(mapper.RHD_MAT_CARE_TETRACYCLINE_NOT_GIVEN, period, 1)
        }


    }

}

module.exports = {
    aggregateTEOAdmission
  }




