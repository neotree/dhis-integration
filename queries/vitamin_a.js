const mapper = require('./mapper')
const helper = require("./query_helper")

//AGGREGATE VITAMIN A OBSTETRICS SECTION
async function aggregateVitA(entry, period) {

    const MATCARE = await helper.getValueFromKey(entry, 'MATCARE', true, false)

    if (MATCARE &&  MATCARE.includes("VitA")) {
        await helper.updateValues(mapper.RHD_MAT_VITAMIN_A_ADMINISTRATION_GIVEN, period, 1)
    }

}

module.exports = {
    aggregateVitA
  }
