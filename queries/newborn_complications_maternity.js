const mapper = require('./mapper')
const helper = require("./helper")

async function aggregateNewBornComplicationsInMaternity(entry,period){

    const BabyNursery = helper.getValueFromKey(entry,'BabyNursery',false,false)

    if(BabyNursery==="N") {
        helper.updateValues(mapper.RHD_MAT_NEWBORN_COMPLICATIONS_NONE,period)  
    }
    
  



}