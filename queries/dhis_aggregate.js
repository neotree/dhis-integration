const dhisSync = require("./dhis_sync")


  

const syncDhisAggregate = async (failed) => {
  try{ 
    if(failed){
      await dhisSync.syncToDhis(true);
    }else{
 await dhisSync.aggregateAllData();
 await dhisSync.syncToDhis(false);
    }

}catch(e){
  console.log(e)
}

  
}


module.exports = {
  syncDhisAggregate
}

