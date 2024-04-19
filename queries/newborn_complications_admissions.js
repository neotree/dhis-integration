const mapper = require('./mapper')
const helper = require("./helper")

async function aggregateNewBornComplicationsInAdmission(entry,period){

    const Diagnoses =Array.from(helper.getValueFromKey(entry,'diagnoses',false,true))
    const InOrOut = helper.getValueFromKey(entry,'InOrOut',false,false)
    
    if(Diagnoses && Diagnoses.length>0){
    if(Diagnoses.find(d=>d["Birth Asphyxia"]) && InOrOut!==false){
        helper.updateValues(mapper.RHD_MAT_NEWBORN_COMPLICATIONS_ASPHYXIA,period)
    }
    if(Diagnoses){
     if(InOrOut!==false){   
     if(Diagnoses.find(d=>d['Premature (32-36 weeks)'])
     || Diagnoses.find(d=>d['Very Premature (28-31 weeks)'])
     || Diagnoses.find(d=>d['Extremely Premature (<28 weeks)'])
     || Diagnoses.find(d=>d['Prematurity with RD'])
     ){
        helper.updateValues(mapper.RHD_MAT_NEWBORN_COMPLICATIONS_PREMATURITY,period) 
     }   
    const filtered = Diagnoses.filter(d => (!d['Birth Asphyxia'])
    && !d['Premature (32-36 weeks)'] 
    && !d['Very Premature (28-31 weeks)']
    && !d['Extremely Premature (<28 weeks)']
    && !d['Prematurity with RD'])

    if(filtered.length>0){
        helper.updateValues(mapper.RHD_MAT_NEWBORN_COMPLICATIONS_OTHER,period) 
    }

     }

    }

}


}