const mapper = require('./mapper')
const helper = require("./query_helper")

async function aggregateSingleTwinsTriplets(entry,period){

    const TypeBirth = await helper.getValueFromKey(entry,'TypeBirth',false)

    if(TypeBirth==="S"){
        await helper.updateValues(mapper.RHD_MAT_NUMBER_OF_BABIES_SINGLETONS,period,1)
    }

    if(TypeBirth!=="S" && TypeBirth!=="Abt"){
        await helper.updateValues(mapper.RHD_MAT_NUMBER_OF_BABIES_TWINS_OR_TRIPLETS,period,1)
    }

}


module.exports = {
    aggregateSingleTwinsTriplets
  }