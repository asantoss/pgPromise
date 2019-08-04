const prompt = require('prompt-promise');
//PG config
const config = {
    host: 'localhost',
    port: 5432,
    database: 'music_db',
    user: 'postgres',
    password: '090696'
};
//Import our postgreSQL module
const pgp = require('pg-promise')();
const db = pgp(config);
const createAlbum = async function () {
    const title = await prompt('Album Title: ');
    const release_date = await prompt('Release date (YYYY-MM-DD): ');
    const genre = await prompt('What is the genre?: ');
    const artist = await prompt('What is the name of the artist?: ');
    try {
        var artist_Id = await db.one(query, artist);
    } catch{
        console.error(`Artist doesn't exist, creating artist ${artist}`);
        artist_Id = await createArtist();
        // let newArtists = `INSERT INTO artists(name) VALUES ($1)`;
        // await db.result(newArtists, artist).then(result => console.log(`Inserted ${result.rowCount} into artists.`));
        // var artist_Id = await db.one(query, artist).catch(e => console.error(e));
    }
    const length = await prompt('What is the length of the album?: ')
    const query = "SELECT id FROM artists WHERE name ILIKE '%$1%'";
    if (typeof artist_Id === 'object') {
        artist_Id = parseInt(artist_Id.id)
    }
    const newAlbum = {
        'title': title,
        'release_date': release_date,
        'genre': genre,
        'artist_Id': artist_Id,
        'length': length
    }
    const insertAlbum = 'INSERT INTO albums(title,release_date,genre,artist_Id,length) VALUES(${title},${release_date},${genre},${artist_Id},${length})'
    await db.result(insertAlbum, newAlbum).then(result => {
        console.log(`Inserted ${result.rowCount} album`)
    }).catch(e => console.log('There was an error with the insert'))
    prompt.finish()
    return
};

const createArtist = async function () {
    const name = await prompt('What is the name of the artist?: ');
    const query = "SELECT * FROM artists WHERE name iLike '%$1%'";
    var artist;
    var exists;
    await db.one(query, name).then(result => { exists = true; artist = result }).catch(() => { exists = false; console.log(`Artist doesn't appear to be in our db lets create it`) })
    if (exists) {
        console.log(`The artist exists here is the info: \n ${artist.name} \n id: ${artist.id}`)
    } else {
        const insertArtist = "INSERT INTO artists(name) VALUES($1)"
        await db.result(insertArtist, name).then(result => {
            console.log(`Inserted ${result.rowCount} record into artists`)
        })
    }
    prompt.finish()
    return parseInt(artist.id)
}

const createTrack = async function () {
    const trackName = await prompt('What is the name of the track?: ');
    const albumName = await prompt('What album is it in?: ');
    const length = await prompt('What is the track duration?: ');
    const query = "SELECT id FROM albums WHERE title ILIKE '%$1%'";
    var albumId;
    var albumExists;
    await db.one(query, albumName).then(result => { albumExists = true; albumId = result.id; }).catch((e) => { albumExists = false; console.log(`Album does not exists lets create it`) })
    if (albumExists) {
        var inSongs;
        var songId;
        let querySongs = "SELECT id FROM songs WHERE title ILIKE '%$1%'"
        await db.one(querySongs, trackName).then(results => { inSongs = true; songId = results.id; }).catch(e => { inSongs = false; console.log(trackName + ' Is not in my songs table lets add it.') })
        if (!inSongs) {
            const insertSong = "INSERT INTO songs(title) VALUES($1) RETURNING id"
            await db.one(insertSong, trackName).then(results => { songId = results.id; console.log(`${results.id}`) })
        }
        const inserTrack = "INSERT INTO tracks(title,duration,album_id,song_id) VALUES(${title},${duration},${albumId},${songId})"
        const track = {
            'title': trackName,
            'duration': length,
            'albumId': albumId,
            'songId': songId
        };
        await db.result(inserTrack, track).then(results => { console.log(`Inserted ${trackName} into tracks`) }).catch(e => console.log(`${e}\n I was not able to insert this track`))
    } else {
        await prompt.finish()
        return createAlbum().then(() => createTrack())
    }
    prompt.finish()
    return
}

const makeAlbums = function (argument) {
    switch (argument) {
        case 'album' || 'albums':
            createAlbum().then(() => {
                prompt('Would you like to create another one?: ').then(val => {
                    if (val === 'yes' || val === 'y' || val === '') {
                        return makeAlbums('album')
                    } else {
                        prompt.finish()
                        return makeAlbums()
                    }
                })
            })
            break;
        case 'artist' || 'artists':
            createArtist().then(() => {
                prompt('Would you like to create another one?: ').then(val => {
                    if (val === 'yes' || val === 'y' || val === '') {
                        return makeAlbums('artist')
                    } else {
                        prompt.finish()
                        return makeAlbums()
                    }
                })
            })
            break;
        case 'track' || 'tracks':
            createTrack().then(() => {
                prompt('Would you like to create another one?: ').then(val => {
                    if (val === 'yes' || val === 'y' || val === '') {
                        return makeAlbums('track')
                    } else {
                        prompt.finish()
                        return makeAlbums()
                    }
                })
            })
            break;
        default: prompt('What will you like to do?').then(val => { makeAlbums(val) })
    }
    return
}

module.exports = makeAlbums;