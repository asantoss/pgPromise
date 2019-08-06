const prompt = require('prompt-promise');
require('dotenv').config()
//PG config
const config = {
    host: 'localhost',
    port: 5432,
    database: 'music_db',
    user: process.env.DBUSER,
    password: process.env.DBPASS
};

//Import our postgreSQL module
const pgp = require('pg-promise')();
const db = pgp(config);
const createAlbum = async function () {
    const title = await prompt('Album Title: ');
    const artist = await prompt('What is the name of the artist?: ')
    const query = "SELECT id FROM artists WHERE name ilike $1";
    try {
        var artist_Id = await db.one(query, artist).catch(e => console.log(e));
    } catch {
        console.error(`Artist doesn't exist, creating artist ${artist}`);
        artist_Id = await createArtist();
    }
    const release_date = await prompt('Release date (YYYY-MM-DD): ');
    const genre = await prompt('What is the genre?: ');
    const length = await prompt('What is the length of the album?: ')
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
    var artist = {}
    var exists;
    await db.one(query, name).then(result => {
        exists = true;
        artist = result
    }).catch(() => {
        exists = false;
        console.log(`Artist doesn't appear to be in our db lets create it`)
    })
    if (exists) {
        console.log(`The artist exists here is the info: \n ${artist.name} \n id: ${artist.id}`)
    } else {
        const insertArtist = "INSERT INTO artists(name) VALUES($1) RETURNING id"
        await db.one(insertArtist, name).then(result => {
            artist.id = result.id;
            console.log(`Inserted ${name} into artists`)
        })
    }
    prompt.finish()
    return parseInt(artist.id)
}

const createTrack = async function () {
    const track = {}
    track.title = await prompt('What is the name of the track?: ');
    track.albumName = await prompt('What album is it in?: ');
    try {
        const query = "SELECT id FROM albums WHERE title ILIKE ${albumName}";
        const album = await db.one(query, track).catch(e => console.log(e))
        var albumExists = true;
        track.albumId = album.id;
    } catch {
        albumExists = false
    }
    if (albumExists) {
        track.duration = await prompt('What is the track duration?: ');
        var inSongs;
        var song;
        try {
            const querySongs = "SELECT id FROM songs WHERE title ilike '%$1%' RETURNING id"
            inSongs = true
            song = await db.one(querySongs, track.title)
        } catch {
            inSongs = false;
        }
        if (!inSongs) {
            const insertSong = "INSERT INTO songs(title) VALUES($1) RETURNING id"
            song = await db.one(insertSong, track.title)
        }
        track.songId = song.id
        const inserTrack = "INSERT INTO tracks(title,duration,album_id,song_id) VALUES(${title},${duration},${albumId},${songId})"
        await db.result(inserTrack, track).catch(e => console.log(`${e}\n I was not able to insert this track`))
    } else {
        await prompt.finish()
        return createAlbum().then(() => createTrack())
    }
    prompt.finish()
    return
}

const musicRecords = function (argument) {
    switch (argument) {
        case 'album' || 'albums':
            createAlbum().then(() => {
                prompt('Would you like to create another one?: ').then(val => {
                    if (val === 'yes' || val === 'y' || val === '') {
                        return musicRecords('album')
                    } else {
                        prompt.finish()
                        return musicRecords()
                    }
                })
            })
            break;
        case 'artist' || 'artists':
            createArtist().then(() => {
                prompt('Would you like to create another one?: ').then(val => {
                    if (val === 'yes' || val === 'y' || val === '') {
                        return musicRecords('artist')
                    } else {
                        prompt.finish()
                        return musicRecords()
                    }
                })
            })
            break;
        case 'track' || 'tracks':
            createTrack().then(() => {
                prompt('Would you like to create another one?: ').then(val => {
                    if (val === 'yes' || val === 'y' || val === '') {
                        return musicRecords('track')
                    } else {
                        prompt.finish()
                        return musicRecords()
                    }
                })
            })
            break;
        default:
            prompt('What will you like to do? \n').then(val => { musicRecords(val) })
    }
    return
}

createAlbum()
module.exports = { 'music': musicRecords, 'db': db }