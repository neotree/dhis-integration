const dhisSync = require("./dhis_sync")


  

const syncDhisAggregate = async () => {
  try{ 
    console.log('#####I AM RUNNIG RUNNING RUNNING########')
 await dhisSync.aggregateAllData();
 await dhisSync.syncToDhis();
 console.log('#####I AM  SSO DIÒNE########')

}catch(e){
  console.log(e)
}

  
}


module.exports = {
  syncDhisAggregate
}

