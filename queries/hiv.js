const mapper = require('./mapper')
const helper = require("./query_helper")

//AGGREGATE HIV SECTION
async function aggregateHiv(entry,period){

    const TestThisPreg = await helper.getValueFromKey(entry,'TestThisPreg',false,false)
    const HIVTestResults =  await helper.getValueFromKey(entry,'HIVTestResults',false,false)
    const MatHIVtest =   await helper.getValueFromKey(entry,'MatHIVtest',false,false)

    if(TestThisPreg==="AD" && HIVTestResults==="NR"){
        await helper.updateValues(mapper.RHD_MAT_HIV_TEST_RESULTS_NEW_NAGATIVE,period,1)
    }
    if(TestThisPreg==="AD" && HIVTestResults==="R") {
        await helper.updateValues(mapper.RHD_MAT_HIV_TEST_RESULTS_NEW_POSITIVE,period,1) 
    }
    if(MatHIVtest==='N'){
        await helper.updateValues(mapper.RHD_MAT_HIV_TEST_RESULTS_NOT_DONE,period,1) 
    }

    if((TestThisPreg==='DP' || TestThisPreg==='BP') &&HIVTestResults==='NR'){
        await helper.updateValues(mapper.RHD_MAT_HIV_TEST_RESULTS_PREVIOUS_NAGATIVE,period,1) 
    }

    if((TestThisPreg==='DP' || TestThisPreg==='BP') &&HIVTestResults==='R'){
        await helper.updateValues(mapper.RHD_MAT_HIV_TEST_RESULTS_PREVIOUS_POSITIVE,period,1) 
    }
    
}

module.exports = {
    aggregateHiv
  }