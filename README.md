# neotree-dhis2-api

This is a basic guide for exporting data from the neo tree postgres database to the DHIS2 System.
# NB
This guide is a basic guide tailor made for specific neo tree scripts and a specific DHIS2 dataset.
Efforts to create a generic component are underway.


# Setting Up
1. git clone https://github.com/neotree/dhis-integration.git
2. Add a .env file and add all configurations that are referenced in /config/dev
3. cd neotree-dhis2-integration
4. npm install
5. npm run start

# NB 
You can change the scheduled intervals in the file /helper/cronJob.js by adding a function that syncs at the expected interval
or adjust the time of an existing function: The Cron Format is Minutes Hour Day Month Year , where ALL is represented by *
FOR EXAMPLE: 30 06 * * * means that the syncing will happen at 6:30am every day, every month, every year.

# Prerequisites
1. Running DHIS2 System
2. Running Neotree Mobile App through which you can Export to JsonAPI
3. Have the relevant Scripts with referenced ScriptIds on the Neotree Mobile App
4. Connection to the postgres Dbase to which your Data is being exported





