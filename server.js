const express = require('express'),
    logger = require('morgan'),
    session = require('express-session');
const Grant = require('grant-express'),
    config = require('./config.json'),
    grant = new Grant(config);
const app = express();
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'grant',
    cookieName: 'session'
}));
app.use(grant);

const PORT = 3000;

const multer = require('multer')
const path = require('path');
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/upload/')
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)) //Appending extension
    }
})
const fileFilter = function(req, file, cb) {
	console.log(req.session.name)
	if(req.session.name === undefined) {
		return cb("Error, you must be logged in to upload a file")
	}
    var filetypes = /jpeg|jpg|gif|png/;
    var mimetype = filetypes.test(file.mimetype);
    var extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    }

    cb("Error");
}
const upload = multer({
    storage: storage,
    fileFilter: fileFilter
})

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

const routes = require('./routes/pages.js');
const login = require('./routes/login.js');

MongoClient.connect("mongodb://admin:TEafshaumtontO8@ds157521.mlab.com:57521/imageboard", (err, database) => {
    if (err) return console.log(err);
    db = database;
    app.listen(PORT, () => {
        console.log("Listening on port " + PORT + "...");
    });
})



app.get("/", routes.gallery);
app.get("/upload", routes.upload);
app.get("/gallery", routes.gallery);
app.get("/profile", routes.profile);
app.get("/useruploaded", routes.useruploaded);
app.get("/userpinned", routes.userpinned);


app.get('/login', login.login);
app.get('/logout', login.logout);
app.get("/handle_twitter_callback", login.handle_twitter_callback);

app.post("/uploadFile", upload.single('file'), routes.uploadFile);
app.put("/pinImage", routes.pinImage);
app.delete("/deleteUpload", routes.deleteUpload);
app.put("/removePin", routes.removePin);
