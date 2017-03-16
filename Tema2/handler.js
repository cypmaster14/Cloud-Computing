const url = require('url');
const Movies = require("./models/movies");
const sanitize = require('mongo-sanitize');

function send404(req, res, message) {
    res.writeHead(404, {
        'Content-Type': 'text/plain'
    });
    res.end(message);
}

function send500(req, res, message) {
    res.writeHead(500, {
        "Content-Type": "text/plain"
    });
    res.end("Some error occured");
}

function send400(req, res, message) {
    res.writeHead(400, {
        "Content-Type": "text/plain"
    });
    res.end(message);
}

function send415(req, res, message) {
    res.writeHead(415, {
        "Content-Type": "text/plain"
    });
    res.end(message);
}

function handleRequest(res, req) {

    const urlRequest = url.parse(req.url).path;
    switch (req.method) {
        case "GET":
            console.log('Get Request');
            console.log(req.url);

            if (urlRequest === "/movies") {
                console.log("Retrieve all movies");
                Movies.find({}, '_id name', function (err, document) {
                    if (err) {
                        console.log("Some error occured");
                        console.log(err);
                        send500(req, res, "Some error occured");
                        return;
                    }

                    res.writeHead(200, {
                        'Content-Type': 'application/json'
                    });
                    res.end(JSON.stringify(document));
                    return;

                });
            } else if (urlRequest.startsWith("/movies/")) {
                movieId = urlRequest.substring(urlRequest.lastIndexOf("/") + 1);
                if (movieId.length === 0) {
                    res.writeHead(400, {
                        "Content-Type": "text/plain"
                    });
                    send400(req, res, "Enter the id of a movie");
                    return;
                }
                Movies.findById(movieId, function (err, document) {
                    if (err) {
                        console.log("Some error occured");
                        console.log(err);
                        send500(req, res, "Some error occured");
                        return;
                    }

                    console.log(document);
                    if (document) {
                        res.writeHead(200, {
                            "Content-Type": "application/json"
                        });
                        res.end(JSON.stringify(document));
                    } else {
                        send404(req, res, "Movie not found");
                    }

                });
            } else {
                send404(req, res, "Page not found");
            }
            break;
        case "POST":
            let bodyPost = "";
            console.log("Post request");
            console.log(urlRequest);
            if (urlRequest === "/movies") {
                req.on('data', function (chunck) {
                    bodyPost += chunck;
                });
                req.on('end', function () {
                    console.log('Am primit toate datele de la client');
                    let data;
                    try {
                        data = JSON.parse(bodyPost);
                    } catch (err) {
                        console.log("Body message is malformed");
                        send415(req, res, "Body message is malformed");
                        return;
                    }
                    console.log("Vreau sa adaug filmul");
                    console.log(data);
                    if (data._id === undefined || data.name === undefined) {
                        console.log("Clientul nu a oferit datele necesare salvarii filmului");
                        send400(req, res, "You didn't complete all fields");
                        return;
                    }
                    const movieId = sanitize(data._id);
                    Movies.findById(movieId, function (err, document) {
                        if (err) {
                            console.log("Some error occured");
                            console.log(err);
                            send500(req, res, "Some error occured");
                            return;
                        }

                        if (document === null) {
                            const newMovie = new Movies({
                                _id: movieId,
                                name: sanitize(data.name),
                                description: sanitize(data.description)
                            });
                            newMovie.save(function (err, document) {
                                if (err) {
                                    console.log("Some error occured");
                                    console.log(err);
                                    send500(req, res, "Some error occured");
                                    return;
                                }

                                console.log("Movie was inserted");
                                console.log(document);
                                res.writeHead(201, {
                                    'Content-Type': 'text/plain'
                                });
                                res.end("Movie was created");
                                return;
                            });
                        } else {
                            console.log("Document already exists");
                            res.writeHead(409, {
                                'Content-Type': 'text/plain'
                            });
                            res.end("Movie already exists");
                        }
                    });
                });
            } else {
                send404(req, res, "Page not found");
            }

            break;
        case "PUT":
            let bodyPut = "";
            console.log("Put request");
            console.log(urlRequest);
            if (urlRequest.startsWith("/movies/")) {
                req.on('data', function (chunck) {
                    bodyPut += chunck;
                });
                req.on('end', function () {
                    console.log('Am primit toate datele de la client');
                    let data;
                    try {
                        data = JSON.parse(bodyPut);
                    } catch (er) {
                        send415(req, res, "Body message is malformed");
                        return;
                    }
                    const movieId = sanitize(urlRequest.substring(urlRequest.lastIndexOf("/") + 1));
                    if (movieId.length === 0) {
                        send400(req, res, "Enter the id of a movie");
                        return;
                    }
                    console.log("Vreau sa actualizez informatii despre filmul" + movieId);
                    const newMovie = {
                        _id: movieId
                    };

                    for (let key in data) {
                        if (data.hasOwnProperty(key) && key !== undefined) {
                            newMovie[key] = sanitize(data[key]);
                        }
                    }

                    if (newMovie._id === undefined || newMovie.name === undefined) {
                        console.log("Clientul nu a completat toate campurile");
                        send400(req, res, "Complete all fields of the movie ");
                        return;
                    }

                    Movies.update({
                        _id: movieId
                    }, newMovie, {
                        upsert: true
                    }, function (err, document) {
                        if (err) {
                            console.log("Some error occured");
                            console.log(err);
                            send500(req, res, "Some error occured");
                            return;
                        }
                        res.writeHead(200, {
                            "Content-Type": "text/plain"
                        });
                        res.end("Movie was updated");
                    });

                });
            } else {
                send404(res, req, "Page not found");
            }

            break;

        case "DELETE":
            console.log("Delete request");
            if (urlRequest === "/movies") {
                console.log("Vrei sa sterg toate filmele");
                Movies.remove({}, function (err) {
                    if (err) {
                        console.log("Some error occured");
                        console.log(err);
                        send500(req, res, "Some error occured");
                        return;
                    }

                    res.writeHead(200, {
                        "Content-Type": "text/plain"
                    });
                    res.end("Removed all movies");
                });
            } else if (urlRequest.startsWith("/movies/")) {
                const movieId = sanitize(urlRequest.substring(urlRequest.lastIndexOf("/") + 1));
                if (movieId.length === 0) {
                    send400(req, res, "Enter the name of a movie");
                    return;
                }
                Movies.findByIdAndRemove({
                    _id: movieId
                }, function (err, document) {
                    if (err) {
                        console.log("Some error occured");
                        console.log(err);
                        send500(req, res, "Some error occured");
                        return;
                    }

                    if (document) {
                        res.writeHead(200, {
                            "Content-Type": "text/plain"
                        });
                        console.log(`Movie with the id:${movieId} was removed`);
                        res.end(`Movie with the id:${movieId} was removed`);
                    } else {
                        console.log(`Movie with the id:${movieId} don't exists`);
                        send404(req, res, `Movie with the id:${movieId} don't exist`);
                    }
                });
            } else {
                send404(req, res, "Page not found");
            }
            break;
        default:
            res.writeHead(501, {
                'Content-Type': 'text/plain'
            });
            res.end(message);
    }
}

module.exports = handleRequest;