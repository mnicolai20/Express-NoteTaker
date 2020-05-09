// Requirements needed to run application
const express = require("express");
const path = require("path");
const util = require("util");
const fs = require("fs");

// Sets up the Express App
// =============================================================
const app = express();
const PORT = process.env.PORT || 3000;

let parsedNotes;

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// sets up the variables for read and write which will be used in the GET, POST and DELETE
const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

// routes
app.get("/notes", function(req, res) {
    res.sendFile(path.join(__dirname, "./public/notes.html"))
});

// Returns saved notes as json
app.get("/api/notes", function(req, res) {
    readFileAsync("./db/db.json", "utf8")
    .then(notes => {
        try{
            parsedNotes = [].concat(JSON.parse(notes));
        } catch(err){
            parsedNotes = [];
        }
        return res.json(parsedNotes);
    })
    .catch(err => res.status(500).json(err));
});

// Create new notes from req.body
app.post("/api/notes", function(req, res) {
    const {title, text} = req.body;
    const dId = new Date()
    const newNote = {title, text, id: dId.toString()}
    parsedNotes.push(newNote);
    writeFileAsync("./db/db.json", JSON.stringify(parsedNotes))
    .then(() => res.json(newNote))
    .catch(err => res.status(500).json(err));
});

// Deleting a specific note by ID
app.delete("/api/notes/:id", function(req, res){
    parsedNotes = parsedNotes.filter(note => note.id != req.params.id);
    writeFileAsync("./db/db.json", JSON.stringify(parsedNotes))
    .then(() => res.json({ok: true}))
    .catch(err => res.status(500).json(err));
});

app.get("*", function(req, res) {
    res.sendFile(path.join(__dirname, "./public/index.html"))
});

// Provides the PORT the application runs on
app.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
  });  