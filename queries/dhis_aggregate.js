const dhisSync = require("./dhis_sync")


  

const syncDhisAggregate = async () => {
  try{ 
    console.log("---I AM RUNNING RUNNING----")
 //await dhisSync.aggregateAllData();
 await dhisSync.syncToDhis();

}catch(e){
  console.log(e)
}

  
}


module.exports = {
  syncDhisAggregate
}

