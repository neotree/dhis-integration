const aggregate = require("./queries")


  

const syncDhisAggregate = async () => {
  try{ 
 await aggregate.aggregateAllData();
 await aggregate.syncToDhis();

}catch(e){
  console.log(e)
}

  
}

const syncTest = async () =>{
  try{
    await aggregate.syncTest();
  }catch(e){
    console.log(e)
  }
}

module.exports = {
  syncDhisAggregate, syncTest
}

