const aggregate = require("./queries")


  

const syncDhisAggregate = async () => {
  try{ 
 await aggregate.aggregateAllData();

}catch(e){
  console.log(e)
}

  
}


module.exports = {
  syncDhisAggregate
}

