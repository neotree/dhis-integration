const mapper = require('./mapper')
const helper = require("./query_helper")

//AGGREGATE VITAMIN A OBSTETRICS SECTION
async function aggregateVitA(entry, period) {

    const MATCARE = helper.getValueFromKey(entry, 'MATCARE', false, false)

    if (MATCARE === "VitA") {
        helper.updateValues(mapper.RHD_MAT_VITAMIN_A_ADMINISTRATION_GIVEN, period, 1)
    }

}

module.exports = {
    aggregateVitA
  }