const imdb = require('imdb-api');

module.exports.getInfoAboutMovie = function (movie, callback) {

    imdb.getReq({
        name: movie
    }, (err, result) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, result);
        }
    });
};