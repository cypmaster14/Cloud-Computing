const url = require('url');
const Movies = require("./models/movies");

function handleRequest(res, req) {

    const urlRequest = url.parse(req.url).path;
    switch (req.method) {
        case "GET":
            console.log('Get Request');
            console.log(req.url);

            if (urlRequest === "/movies") {
                console.log("Retrieve all movies");
                Movies.find({}, function (err, document) {
                    if (err) {
                        console.log("Some error occured");
                        console.log(err);
                        res.writeHead(500, {
                            'Content-Type': 'text/plain'
                        });
                        res.end("Some error occured");
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
                    res.end("Enter the id of a movie");
                    return;
                }
                Movies.findById(movieId, function (err, document) {
                    if (err) {
                        console.log("Some error occured");
                        console.log(err);

                        res.writeHead(500, {
                            'Content-Type': 'text/plain'
                        });
                        res.end("Some error occured");
                        return;
                    }

                    console.log(document);
                    if (document) {
                        res.writeHead(200, {
                            "Content-Type": "application/json"
                        });
                        res.end(JSON.stringify(document));
                    } else {
                        res.writeHead(404, {
                            "Content-Type": "text/plain"
                        });
                        res.end("Movie not found");
                    }

                });
            } else {
                res.writeHead(404, {
                    "Content-Type": "text/plain"
                });
                res.end("Page not found");
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
                    const data = JSON.parse(bodyPost);
                    console.log("Vreau sa adaug filmul");
                    console.log(data);
                    if (data.id === undefined || data.name === undefined) {
                        res.writeHead(400, {
                            'Content-Type': 'text/plain'
                        });
                        res.end("You didn't complete all fields");
                        return;
                    }

                    Movies.findById(data.id, function (err, document) {
                        if (err) {
                            console.log("Some error occured");
                            console.log(err);

                            res.writeHead(500, {
                                'Content-Type': 'text/plain'
                            });
                            res.end("Some error occured");
                            return;
                        }

                        if (document === null) {
                            const newMovie = new Movies({
                                _id: data.id,
                                name: data.name,
                                description: data.description
                            });

                            newMovie.save(function (err, document) {
                                if (err) {
                                    console.log("Some error occured");
                                    console.log(err);

                                    res.writeHead(500, {
                                        'Content-Type': 'text/plain'
                                    });
                                    res.end("Some error occured");
                                    return;
                                }

                                console.log("Movie was inserted");
                                console.log(document);
                                res.writeHead(200, {
                                    'Content-Type': 'text/plain'
                                });
                                res.end("Movie was created");
                                return;
                            });
                        } else {

                            console.log("Document already exists");
                            res.writeHead(400, {
                                'Content-Type': 'text/plain'
                            });
                            res.end("Movie already exists");
                        }
                    });
                });
            } else {
                res.writeHead(404, {
                    'Content-Type': 'text/plain'
                });
                res.end("Page not found");
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
                    res.writeHead(200);
                    const data = JSON.parse(bodyPut);
                    movieId = urlRequest.substring(urlRequest.lastIndexOf("/") + 1);
                    if (movieId.length === 0) {
                        res.writeHead(400, {
                            "Content-Type": "text/plain"
                        });
                        res.end("Enter the id of a movie");
                        return;
                    }
                    console.log("Vreau sa actualizez informatii despre filmul" + movieId);
                    const newMovie = {
                        _id: movieId
                    };

                    for (let key in data) {
                        if (data.hasOwnProperty(key) && key !== undefined) {
                            newMovie[key] = data[key];
                        }
                    }

                    if (newMovie._id === undefined || newMovie.name === undefined) {
                        res.writeHead(400, {
                            "Content-Type": "text/plain"
                        });
                        res.end("Complete all fields of the movie");
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
                            res.writeHead(500, {
                                "Content-Type": "text/plain"
                            });
                            res.end("Some error occured");
                            return;
                        }
                        res.writeHead(200, {
                            "Content-Type": "text/plain"
                        });
                        res.end("Movie was updated");
                    });

                });
            } else {
                res.writeHead(404, {
                    'Content-Type': 'text/plain'
                });
                res.end("Page not found");
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
                        res.writeHead(500, {
                            "Content-Type": "text/plain"
                        });
                        res.end("Some error occured");
                        return;
                    }

                    res.writeHead(200, {
                        "Content-Type": "text/plain"
                    });
                    res.end("Removed all movies");
                });
            } else if (urlRequest.startsWith("/movies/")) {
                movieId = urlRequest.substring(urlRequest.lastIndexOf("/") + 1);
                if (movieId.length === 0) {
                    res.writeHead(400, {
                        "Content-Type": "text/plain"
                    });
                    res.end("Enter the name of a movie");
                    return;
                }
                Movies.findByIdAndRemove({
                    _id: movieId
                }, function (err, document) {
                    if (err) {
                        console.log("Some error occured");
                        console.log(err);
                        res.writeHead(500, {
                            "Content-Type": "text/plain"
                        });
                        res.end("Some error occured");
                        return;
                    }

                    res.writeHead(200, {
                        "Content-Type": "text/plain"
                    });
                    if (document) {
                        console.log(`Movie with the id:${movieId} was removed`);
                        res.end(`Movie with the id:${movieId} was removed`);
                    } else {
                        console.log(`Movie with the id:${movieId} didn't exists`);
                        res.end(`Movie with the id:${movieId} didn't exists`);
                    }
                });
            } else {
                res.writeHead(404, {
                    'Content-Type': 'text/plain'
                });
                res.end("Page not found");
            }
            break;
        default:
    }
}

module.exports = handleRequest;