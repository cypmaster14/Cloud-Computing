/**
 * Created by Ciprian on 01/03/2017.
 */

var app = angular.module('MyApp', ['ngMaterial', 'ngMessages','oitozero.ngSweetAlert']);

app.service('plotService', function ($http) {

    this.getPlot = function (movie, language, callback) {
        const url = "http://localhost:7888/movie?name=" + movie + "&lang=" + language;
        $http({
            method: 'GET',
            url: url
        }).then(function (response) {
            callback(null, response.data)
        }, function (response) {
            callback(response, null);
        });

    }
});

app.controller('AppCtrl', ['plotService','SweetAlert', function (plotService,SweetAlert) {

    var self = this;

    self.languages = [{
        value: "ro",
        label: "Romanian"
    }, {
        value: 'es',
        label: 'Spanish'
    }];

    self.moviePlot = "";


    self.getPlot = function () {
        language = this.languageSelected;
        movieName = this.movieName;


        if (language === undefined || movieName === undefined) {
             SweetAlert.swal("Oops..",'Something went wrong','error');
            return;
        }

        plotService.getPlot(movieName, language, function (err, response) {
            if (err) {
                alert('Some error occured');
                return;
            }
            self.moviePlot = response.plot;
        })
    };
}]);
