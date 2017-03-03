const express = require('express');
const PORT = 7888;
const hostName = 'localhost';
const movieInfo = require("./firstApi");
const translate = require("./secondApi");
const morgan = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');

let app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));
app.use('/node_modules', express.static(__dirname + '/node_modules'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));


app.use(morgan('dev'));
app.use(bodyParser.json());


app.use(function (req, res, next) {
    var err = null;
    try {
        decodeURIComponent(req.path);
    } catch (e) {
        err = e;
    }
    if (err) {
        console.log(err, req.url);
        return res.redirect(['https://', req.get('Host'), '/404'].join(''));
    }
    next();
});


app.post("/plot", function (req, res) {

    const movieName = req.body.movie;
    if (movieName === undefined) {
        console.log("User didn't complete all the fields");
        res.json({
            success: false,
            message: "Complete all fields"
        });
        return;
    }

    movieInfo.getInfoAboutMovie(movieName, function (err, info) {
        if (err) {
            console.log(err);
            res.json({
                success: false,
                message: "Some error occured"
            });
            return;
        }

        res.json({
            success: true,
            message: info.plot
        });
    });
});


app.post('/translate', function (req, res) {

    const text = req.body.text;
    const language = req.body.language;

    if (text === undefined || language === undefined) {
        console.log("User didn't complete all fields");
        res.json({
            success: false,
            message: 'Complete all fields'
        });
        return;
    }

    console.log(text, language);

    translate.translate(text, language, function (err, response) {
        if (err) {
            console.log(err);
            res.json({
                success: false,
                message: 'Some error occured'
            });
            return;
        }

        res.json({
            success: true,
            message: response
        });

    });

});


app.get('/movie', function (req, res) {

    movie = req.query.name;
    language = req.query.lang;
    if (movie === undefined || language === undefined) {
        res.end(`Complete all fields`);
        return;
    }

    movieInfo.getInfoAboutMovie(movie, function (err, result) {
        if (err) {
            console.log(err);
            res.end(`Movie ${movie} wasn't found`);
            return;
        }
        plot = result.plot;

        console.log(plot);

        translate.translate(plot, language, function (err, result) {
            if (err) {
                console.log(err);
                res.end(`Language ${language} is not supported`);
                return;
            }
            res.end(JSON.stringify({
                plot: result
            }));
        });

    });
});

app.get('/test', function (res, req) {
    req.sendFile(path.join(__dirname + "/public/test.html"));
});


app.listen(PORT, hostName, function () {
    console.log(`Server waiting at: ${hostName}:${PORT}`);
});