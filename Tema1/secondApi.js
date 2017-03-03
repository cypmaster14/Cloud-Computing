const googleTranslate = require('google-translate-api');


module.exports.translate = function (text, language, callback) {
    googleTranslate(text, {
        to: language
    }).then(res => {
        callback(null, res.text);
    }).catch(err => {
        console.log('An error occured');
        callback(err, null);
    });
};