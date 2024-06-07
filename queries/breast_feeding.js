const mapper = require('./mapper')
const helper = require("./query_helper")

async function aggregateBreastFeeding(entry,period){

    const BFeed = await helper.getValueFromKey(entry,'BFeed',false,false)

    if(BFeed==="NBF" || BFeed==="LBF"){
        await helper.updateValues(mapper.BREAST_FEEDING_INITIATED_NEVER_OR_LATER_THAN_60,period,1)
    }

}

module.exports = {
    aggregateBreastFeeding
  }