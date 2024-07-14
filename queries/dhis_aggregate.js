const dhisSync = require("./dhis_sync")


  

const syncDhisAggregate = async () => {
  try{ 
 await dhisSync.aggregateAllData();
 //await dhisSync.syncToDhis();

}catch(e){
  console.log(e)
}

  
}


module.exports = {
  syncDhisAggregate
}

