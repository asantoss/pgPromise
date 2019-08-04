const musicRecords = require('./create_album');
const readDB = require('./readDB')
const prompt = require('prompt-promise');
require('dotenv').config()
//PG config
const config = {
    host: 'localhost',
    port: 5432,
    database: 'restaurant',
    user: process.env.DBUSER,
    password: process.env.DBPASS
};
//Import our postgreSQL module
const pgp = require('pg-promise')();
const db = pgp(config);

const app = async () => {
    const action = await prompt(`What would you like to do? 
    Read or Insert \n`)
    switch (action.toLowerCase()) {
        case 'read':
            const content = await prompt('Would would you like to read from the database? \n 1. Albums \n  2.Artists \n  3.Tracks \n')
            switch (content) {
                case '1': readDB.read(`albums.sql`); break
                case '2': readDB.read(`artists.sql`); break
                case '3': readDB.read(`tracks.sql`); break
            }

            break
        case 'insert':
            await musicRecords.music();
            break
    }
    const form = await prompt('Would you like to continue? \n')
    if (form === 'y' || form === 'yes' || form === ' ') {
        return app()
    } else {
        return
    }
}




app()

//Query method has no expectations and returns all of the results
// db.query('SELECT * FROM restaurant')
//     .then((result) => {
//         result.forEach((row) => {
//             console.log(row);
//             console.log(row.id, row.name)
//         });
//     }).catch(e => {
//         console.error(e);
//     });
// db.any('SELECT name FROM restaurant WHERE stars > 5')
//     .then(results => {
//         results.forEach(row => {

//         })
//     })
