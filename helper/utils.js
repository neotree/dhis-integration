 function getNumberOfDaysInMonth(month,year) {

    return new Date(year, month, 0).getDate(); 
   }
 function getLastDayOfMonth(date) {

  if(date instanceof Date){
      return new Date(date.getFullYear(), 
      date.getMonth(), getNumberOfDaysInMonth(date.getMonth()+1, 
      date.getFullYear())); 

  }
}
function getFirstDayOfMonth(date){
    if(date instanceof Date){  
    return new Date(date.getFullYear(), 
    date.getMonth(), 1); 
    }
}

   
   module.exports = {getNumberOfDaysInMonth,getLastDayOfMonth,getFirstDayOfMonth};