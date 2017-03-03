/**
 * Created by Ciprian on 01/03/2017.
 */

var app = angular.module('MyApp', ['ngMaterial', 'ngMessages','oitozero.ngSweetAlert']);

app.service('plotService', function ($http, $mdDialog,SweetAlert) {

    this.showAlertDialog = function (title, message) {
        $mdDialog.show(
            $mdDialog.alert()
            .clickOutsideToClose(false)
            .title(title)
            .textContent(message)
            .ok('Ok')
            // Or you can specify the rect to do the transition from
            .openFrom({
                top: -50,
                width: 30,
                height: 80
            })
            .closeTo({
                left: 1500
            })
        );
    };


    this.showSweetAlertDialog=function(title,message,type){
        SweetAlert.swal(title,message,type);
    };

    this.getPlot = function (movie, language, callback) {
        const url = "http://localhost:7888/movie?name=" + movie + "&lang=" + language;
        $http({
            method: 'GET',
            url: url
        }).then(function (response) {
            callback(null, response.data);
        }, function (response) {
            callback(response, null);
        });

    };
});

app.controller('AppCtrl', ['plotService',  function (plotService) {

    var self = this;

    self.activated = 'none';

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
            // plotService.showAlertDialog("Fields", "Complete all fields");
            plotService.showSweetAlertDialog('Error','Complete all fields','error');
            return;
        }


        self.activated = '-webkit-box';
        plotService.getPlot(movieName, language, function (err, response) {
            if (err) {
                // plotService.showAlertDialog('Error', 'Some error occured');
                plotService.showSweetAlertDialog("Oops..",'Something went wrong','error');
                self.activated = 'none';
                return;
            }
            setTimeout(function () {

            }, 3000);
            self.moviePlot = response.plot;
            self.activated = 'none';
        });
    };


}]);