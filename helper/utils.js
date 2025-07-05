// function getReportingPeriod(date){

//   const period = new Date(date);
//   if(period instanceof Date && !isNaN(period)){
//       const fommattedPeriod = period
//         .toISOString()
//         .substring(0, 10)
//         .replace(/-/g, "")
//         .substring(0, 6);
//    return fommattedPeriod;   
//   }  else{
//     return null
//   }
// }

function getReportingPeriod(date) {
  // Try to parse the input into a Date object
  let period = new Date(date);

  // If the date is invalid, try a cleanup + parse fallback
  if (!(period instanceof Date) || isNaN(period)) {
    try {
      const cleaned = String(date).replace(/,\s*/g, ' ');
      period = new Date(Date.parse(cleaned));
    } catch (e) {
      return null;
    }
  }

  // Final check: is it a valid Date?
  if (period instanceof Date && !isNaN(period)) {
   
    const formattedPeriod = period
      .toISOString()
      .substring(0, 10)
      .replace(/-/g, '')
      .substring(0, 6); // YYYYMM
    return formattedPeriod;
  } else {
    return null;
  }
}


   
module.exports = {getReportingPeriod};