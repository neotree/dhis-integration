const mapper = require('./mapper')
const helper = require("./query_helper")

async function aggregateNewBornComplicationsInAdmission(entry, period) {

    const Diagnoses = Array.from(helper.getValueFromKey(entry, 'diagnoses', false, true))
    const InOrOut = helper.getValueFromKey(entry, 'InOrOut', false, false)
    const BirthWeight = helper.getValueFromKey(entry, 'BirthWeight', false, false)

    if (Diagnoses && Diagnoses.length > 0) {
        if (Diagnoses.find(d => d["Birth Asphyxia"]) && InOrOut ==="Yes" ) {
            helper.updateValues(mapper.RHD_MAT_NEWBORN_COMPLICATIONS_ASPHYXIA, period, 1)
        }
    
        if (Diagnoses) {
            if (InOrOut ==="Yes" ) {

                //PREMATURITY
                if (Diagnoses.find(d => d['Premature (32-36 weeks)'])
                    || Diagnoses.find(d => d['Very Premature (28-31 weeks)'])
                    || Diagnoses.find(d => d['Extremely Premature (<28 weeks)'])
                    || Diagnoses.find(d => d['Prematurity with RD'])
                ) {
                    helper.updateValues(mapper.RHD_MAT_NEWBORN_COMPLICATIONS_PREMATURITY, period, 1)
                }
                //OTHER COMPLICATIONS
                const otherComplications = Diagnoses.filter(d => (!d['Birth Asphyxia']
                    && !d['Premature (32-36 weeks)']
                    && !d['Very Premature (28-31 weeks)']
                    && !d['Extremely Premature (<28 weeks)']
                    && !d['Prematurity with RD'])
                    && !d['Suspected Neonatal Sepsis']
                    && !d['Neonatal Sepsis (Early onset - Asymptomatic)']
                    && !d['Neonatal Sepsis (Early onset - Symptomatic)']
                    && !d['Neonatal Sepsis (Late onset - Asymptomatic)']
                    && !d['Low Birth Weight (1500-2499g)']
                    && !d['Very Low Birth Weight (1000-1499g)']
                    && !d['Extremely Low Birth Weight (<1000g)'])
                
                if (otherComplications.length > 0) {
                    helper.updateValues(mapper.RHD_MAT_NEWBORN_COMPLICATIONS_OTHER, period, otherComplications.length)
                }
               //SEPSIS
                if( Diagnoses.find(d=>d['Suspected Neonatal Sepsis'])
                || Diagnoses.find(d=>d['Neonatal Sepsis (Early onset - Asymptomatic)'])
                || Diagnoses.find(d=>d['Neonatal Sepsis (Early onset - Symptomatic)'])
                || Diagnoses.find(d=>d['Neonatal Sepsis (Late onset - Asymptomatic)'])){

                    helper.updateValues(mapper. RHD_MAT_NEWBORN_COMPLICATIONS_SEPSIS, period, 1)
                }

            }
            if(BirthWeight<2500){
                helper.updateValues(mapper.RHD_MAT_NEWBORN_COMPLICATIONS_LBW, period, 1)
            }

        }

    }


}

module.exports = {
    aggregateNewBornComplicationsInAdmission
  }