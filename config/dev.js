let config = {
  
    DHIS_USER :process.env.DHIS_USER,
    DHIS_PW : process.env.DHIS_PW,
    DHIS_HOST : process.env.DHIS_HOST,
    DHIS_PORT : process.env.DHIS_PORT,
    DBASE : process.env.DBASE,
    DBASE_PW: process.env.DBASE_PW,
    DBASE_USER : process.env.DBASE_USER,
    DB_HOST : process.env.DB_HOST,
    DB_PORT = process.env.DB_PORT
};

export default config;
