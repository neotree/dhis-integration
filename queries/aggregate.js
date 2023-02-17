const aggregate = require("./queries")


  

const syncDhisAggregate = async () => {
  try{
  await aggregate.updateDhisSyncDB();
  const data = await aggregate.getUnsyncedData();
  if(Array.isArray(data) && data.length>0){
    aggregate.aggregateAllData(data);
  }
}catch(e){
  console.log(e)
}

  
}


module.exports = {
  syncDhisAggregate
}

