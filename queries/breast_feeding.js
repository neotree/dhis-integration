const mapper = require('./mapper')
const helper = require("./helper")

async function aggregateBreastFeeding(entry,period){

    const BFeed = helper.getValueFromKey(entry,'BFeed',false,false)

    if(BFeed==="NBF" || BFeed==="LBF"){
        helper.updateValues(mapper.BREAST_FEEDING_NEVER_INITIATED_OR_LESS_THAN_60_MINS,period,1)
    }

}