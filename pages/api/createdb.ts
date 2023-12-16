import sqlite3 from "sqlite3";

export default async function createDB(_ :any, res: any) {
    var newdb = new sqlite3.Database('./db/pokemon.db', (err) => {
        if (err) {
            console.log("Getting error " + err);
            return
        }
        createTables(newdb);
    });

    res.status(200).send('berhasil')
}

function createTables(newdb: any) {
    newdb.exec(`
    create table pokemon (
        id int primary key not null,
        pokemon_id int not null,
        image text not null,
        image_hover text not null,
        name text not null,
        original_name text not null,
        last_rename text not null
    )`);
}
