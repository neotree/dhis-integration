const mapper = require('./mapper')
const helper = require("./query_helper")

async function aggregateMaternalOutcome(entry, period) {

    const MatOutcome = await helper.getValueFromKey(entry, 'MatOutcome', false, false)

    if (MatOutcome === "D") {
        await helper.updateValues(mapper.RHD_MAT_MATERNAL_DEATHS, period, 1)
    }

    // if (MatOutcome === "S") {
    //     await helper.updateValues(mapper.RHD_MAT_MOTHER_ALIVE, period, 1)
    // }

}
module.exports = {
    aggregateMaternalOutcome
}