 function getValueFromKey(values = [],key = '') {

    const item =  values.filter( obj =>{
   
     return obj.key ===key           
     })[0];
     if(item){
       return item.value
     }
     
   }
   
   module.exports = {getValueFromKey};