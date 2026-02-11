const dhisSync = require("./dhis_sync")


  

const syncDhisAggregate = async (failed) => {
  try{
    if(failed){
      await dhisSync.syncToDhis(true);
    }else{
      await dhisSync.aggregateAllData();
      await dhisSync.syncToDhis(false);
    }
  } catch(e){
    console.error("Error in syncDhisAggregate:", e);
    throw e;
  }
}


module.exports = {
  syncDhisAggregate
}

