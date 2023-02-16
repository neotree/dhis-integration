let config = {
  
    DHIS_USER :process.env.DHIS_USER,
    DHIS_PW : process.env.DHIS_PW,
    DHIS_HOST : process.env.DHIS_HOST,
    DHIS_PORT : process.env.DHIS_PORT,
    DB : process.env.DB,
    DB_PW: process.env.DB_PW,
    DB_USER : process.env.DB_USER,
    DB_HOST : process.env.DB_HOST,
    DB_PORT : process.env.DB_PORT,
    ADMISSIONS : process.env.ADMISSIONS,
    DISCHARGE : process.env.DISCHARGE,
    MATERNALS: process.env.MATERNALS,
    START_DATE : process.env.START_DATE,
};

module.exports = config;
