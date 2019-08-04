const db = require('./create_album').db;
const QueryFile = require('pg-promise').QueryFile;
const path = require('path')

require('dotenv').config()

function sql(file) {
    const fullPath = path.join('./utils', file); // generating full path; String;
    return new QueryFile(fullPath, { minify: true });
}
const read = function (argument) {
    // Query method has no expectations and returns all of the results
    const query = sql(argument)
    db.query(query)
        .then((result) => result.forEach((row) => console.log(row)))
        .catch(e => console.error(e))
}

read("albums.sql")


module.exports = {
    'read': read,

}