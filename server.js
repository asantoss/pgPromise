const makeAlbums = require('./create_album')
//PG config
const config = {
    host: 'localhost',
    port: 5432,
    database: 'restaurant',
    user: 'postgres',
    password: '090696'
};
//Import our postgreSQL module
const pgp = require('pg-promise')();
const db = pgp(config);

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

makeAlbums()