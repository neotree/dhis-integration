const mapper = require('./mapper')
const helper = require("./helper")

async function aggregateNewBornComplicationsMngtDischarge(entry,period){

    //FOR THIS ONE CONSIDER CREATING PERIOD HERE
    const uid =  helper.getUid(entry)

    if(uid){
        const matchedAdmission =await helper.getMatchedAdmission(uid)

    
        if(matchedAdmission){
            const InOrOut = helper.getValueFromKey(entry,'InOrOut',false,false)
            if(InOrOut===true){
           const MedsGiven = Array.from(helper.getValueFromKey(entry,"MedsGiven",true,false))

           if(MedsGiven 
            && MedsGiven.length>0 
            && MedsGiven.includes("BP")
            || MedsGiven.includes("GENT")
            || MedsGiven.includes("CEF")
            || MedsGiven.includes("AMOX")
            || MedsGiven.includes("IMI")
            || MedsGiven.includes("MET")
            || MedsGiven.includes("Mero")){
                helper.updateValues(mapper.RHD_MAT_NEWBORN_COMPLICATIONS_MNGT_ANTIBIOTICS,period)  
            }
            const ThermCare = helper.getValueFromKey(entry,'ThermCare',false,false)
            if(ThermCare==="KMC") {
                helper.updateValues(mapper.RHD_MAT_NEWBORN_COMPLICATIONS_MNGT_KMC,period)   
            } else {
             
            }
            


        }

          

    
           
         
         }
    }
  


}