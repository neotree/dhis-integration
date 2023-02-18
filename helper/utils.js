function getReportingPeriod(date){

  const period = new Date(date);
  if(period instanceof Date && !isNaN(period)){
      const fommattedPeriod = period
        .toISOString()
        .substr(0, 10)
        .replace(/-/g, "")
        .substr(0, 6);
   return fommattedPeriod;   
  }  else{
    return null
  }
}

   
   module.exports = {getReportingPeriod};