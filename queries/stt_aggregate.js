const mapper = require('./mapper')
const helper = require("./helper")

async function aggregateSingleTwinsTriplets(entry,period){

    const TypeBirth = helper.getValueFromKey(entry,'TypeBirth',false)
    const NeoTreeOutcome = helper.getValueFromKey(entry,'NeoTreeOutcome',false)

    if(TypeBirth==="S"){
        helper.updateValues(mapper.RHD_MAT_NUMBER_OF_BABIES_SINGLETONS,period)
    }

    if(TypeBirth!=="S"){
        helper.updateValues(mapper.RHD_MAT_NUMBER_OF_BABIES_TWINS_OR_TRIPLETS,period)
    }
    if(NeoTreeOutcome==="LB" ||NeoTreeOutcome==="SBF" || NeoTreeOutcome==="SMB"){
        helper.updateValues(mapper.RHD_TOTAL_NUMBER_OF_BABIES,period)
    }
    
}