function getReportingPeriod(date){

  const period = new Date(date);
  if(period instanceof Date && !isNaN(period)){
      const fommattedPeriod = period
        .toISOString()
        .substring(0, 10)
        .replace(/-/g, "")
        .substring(0, 6);
   return fommattedPeriod;   
  }  else{
    return null
  }
}

   
   module.exports = {getReportingPeriod};