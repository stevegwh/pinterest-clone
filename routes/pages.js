const path = require('path');
const http = require('http');
const fs = require('fs');
const fetch = require('node-fetch');
let message = "";
let flashed = false;

var download = function(url, dest, cb) {
    var file = fs.createWriteStream(dest);
    var request = http.get(url, function(response) {
        response.pipe(file);
        file.on('finish', function() {
            file.close(cb);
        });
    });
}

exports.home = (req, res) => {
    message && !flashed ? flashed = true : (message = "", flashed = false);
    res.render("index.ejs", { page: "partials/index.ejs", message: message, session: req.session });
}


function sendToGallery(toInsert, res) {
    message = "File successfully uploaded!"
    db.collection('gallery').save(toInsert, (err, result) => {
        if (err) return console.log(err)
        res.redirect("/gallery");
    });
}

exports.uploadFile = (req, res, next) => {
    if (req.session.name === undefined)
        return res.send("Error, you must be logged in to upload a file");
    if (req.body.fileUrl) {
        let dir = "public/upload/";
        let fileName = req.body.fileUrl.split("/");
        let toInsert = {
            filename: fileName[fileName.length - 1],
            path: dir + fileName[fileName.length - 1],
            originalname: fileName[fileName.length - 1],
            submittedby: req.session.name,
            description: req.body.description
        }
        download(req.body.fileUrl, dir + fileName[fileName.length - 1], function() {
            sendToGallery(toInsert, res)
        })

    } else {
        let toInsert = {
            filename: req.file.filename,
            path: req.file.path,
            originalname: req.file.originalname,
            submittedby: req.session.name,
            description: req.body.description
        }
        sendToGallery(toInsert, res);
    }
}

exports.upload = (req, res) => {
    message && !flashed ? flashed = true : (message = "", flashed = false);
    res.render("index.ejs", { page: "partials/upload.ejs", message: message, session: req.session })
}

exports.gallery = (req, res) => {
    message && !flashed ? flashed = true : (message = "", flashed = false);
    db.collection('gallery').find().toArray(function(err, result) {
        if (err) return console.log(err);
        res.render("index.ejs", { result: result, page: "partials/gallery.ejs", message: message, pageLimit: 100, session: req.session });
    })
}

exports.profile = (req, res) => {
    message && !flashed ? flashed = true : (message = "", flashed = false);
    res.render("profile.ejs", { session: req.session, message: message });
}

exports.useruploaded = (req, res) => {
    message && !flashed ? flashed = true : (message = "", flashed = false);
    db.collection('gallery').find({ "submittedby": req.session.name }).toArray(function(err, result) {
        if (err) return console.log(err);
        res.render('index.ejs', { title: "Your Uploads", result: result, session: req.session, message: message, page: "partials/usergallery", pageLimit: 10 })
    })
}

exports.userpinned = (req, res) => {
    message && !flashed ? flashed = true : (message = "", flashed = false);
    db.collection('users').find({ "name": req.session.name }).toArray((err, result) => {
        if (err) return console.log(err);
        for (var i = 0; i < result[0]['likes'].length; i++) {
            let file = result[0]['likes'][i].filename;
            fs.exists('../public/upload/' + file, (exists) => {
                if (!exists) {
                    db.collection('users').update({ "name": req.session.name }, { $pull: { likes: { "filename": file } } }, (err, result) => {
                        if (err) return res.send(500, err)
                    })
                }
            });
        }
        res.render('index.ejs', { title: "Pinned Images", result: result[0]['likes'], session: req.session, message: message, page: "partials/usergallery", pageLimit: 10 })
    })
}

exports.pinImage = (req, res) => {
    const file = { "filename": req.body.file };
    console.log(file)
    const name = req.body.name;
    db.collection('users')
        .findOneAndUpdate({ "name": name }, { $addToSet: { likes: file } }, (err, result) => {
            if (err) return res.send(500, err)
            res.send(result);
        })

}

exports.removePin = (req, res) => {
    const file = { "filename": req.body.file };
    console.log(file)
    const name = req.body.name;

    db.collection('users').update({ "name": name }, { $pull: { likes: file } }, (err, result) => {
        if (err) return res.send(500, err)
        res.send(result)
    })
}

exports.deleteUpload = (req, res) => {
    const file = req.body.file;
    db.collection('gallery')
        .findOneAndDelete({ "filename": file }, (err, result) => {
            if (err) return res.send(500, err)
            fs.unlink("public/upload/" + file, function() {
                res.send(result);
            });
        })
}
