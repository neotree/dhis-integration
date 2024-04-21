const mapper = require('./mapper')
const helper = require("./helper")

async function aggregateMaternalOutcome(entry, period) {

    const MatOutcome = helper.getValueFromKey(entry, 'MatOutcome', false, false)

    if (MatOutcome === "D") {
        helper.updateValues(mapper.RHD_MAT_MOTHER_DIED_BEFORE_DISCHARGE, period, 1)
    }

    if (MatOutcome === "S") {
        helper.updateValues(mapper.RHD_MAT_MOTHER_ALIVE, period, 1)
    }

}
module.exports = {
    aggregateMaternalOutcome
}