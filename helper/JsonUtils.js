function getJSON(_sessions = [], opts = {}) {
  const { showConfidential } = opts;

  const sessions = _sessions.map(s => {
  
    const { script, entries } = s.data;
   
    return {
      id: s.id,
      uid: s.data.uid,
      scriptTitle: script.title,
      scriptId: script.id,
      value: Array.isArray(entries) && entries.length>0?entries.map(m=>{
        const {key,type}=m;
        const value = Array.isArray(m.values) && m.values.length>0 ?m.values[0].value:"";
    
       return {key:key,type:type,value:value}
      }):{}
    }
    })
    

  return sessions;
}

module.exports = {getJSON};