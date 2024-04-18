const mapper = require('./mapper')
const helper = require("./helper")

//AGGREGATE HIV SECTION
async function aggregateHiv(entry,period){

    const TestThisPreg = helper.getValueFromKey(entry,'TestThisPreg',false)
    const HIVTestResults =  helper.getValueFromKey(entry,'HIVTestResults',false)
    const MatHIVtest =   helper.getValueFromKey(entry,'MatHIVtest',false)

    if(TestThisPreg==="AD" && HIVTestResults==="NR"){
        helper.updateValues(mapper.RHD_MAT_HIV_TEST_RESULTS_NEW_NAGATIVE,period)
    }
    if(TestThisPreg==="AD" && HIVTestResults==="R") {
        helper.updateValues(mapper.RHD_MAT_HIV_TEST_RESULTS_NEW_POSITIVE,period) 
    }
    if(MatHIVtest==='N'){
        helper.updateValues(mapper.RHD_MAT_HIV_TEST_RESULTS_NOT_DONE,period) 
    }

    if((TestThisPreg==='AD' || TestThisPreg==='BP') &&HIVTestResults==='NR'){
        helper.updateValues(mapper.RHD_MAT_HIV_TEST_RESULTS_PREVIOUS_NAGATIVE,period) 
    }

    if((TestThisPreg==='AD' || TestThisPreg==='BP') &&HIVTestResults==='R'){
        helper.updateValues(mapper.RHD_MAT_HIV_TEST_RESULTS_PREVIOUS_POSITIVE,period) 
    }
    
}