(function() {
    var ZXCVBN_SRC = 'bower_components/zxcvbn/dist/zxcvbn.js';

    var async_load = function() {
        var first, s;
        s = document.createElement('script');
        s.src = ZXCVBN_SRC;
        s.type = 'text/javascript';
        s.async = true;
        first = document.getElementsByTagName('script')[0];
        return first.parentNode.insertBefore(s, first);
    };

    if (window.attachEvent != null) {
        window.attachEvent('onload', async_load);
    } else {
        window.addEventListener('load', async_load, false);
    }
}).call(this);

(function() {

    angular.module('PasswordStrength', [])
    
        .controller('FormController', function($scope) {})

        .filter('passwordCount', [function() {
            return function(value, peak) {
                value = angular.isString(value) ? value : '';
                peak = isFinite(peak) ? peak : 7;

                return value && (value.length > peak ? peak + '+' : value.length);
            };
        }])

        .factory('zxcvbn', [function() {
            return {
                score: function() {
                    var compute = zxcvbn.apply(null, arguments);
                    return compute && compute.score;
                }
            };
        }])

        .directive('okPassword', ['zxcvbn', function(zxcvbn) {
            return {
                // restrict to only attribute and class
                restrict: 'AC',

                // use the NgModelController
                require: 'ngModel',

                // add the NgModelController as a dependency to your link function
                link: function($scope, $element, $attrs, ngModelCtrl) {
                    $element.on('blur change keydown', function(evt) {
                        $scope.$evalAsync(function($scope) {
                            // update the $scope.password with the element's value
                            var pwd = $scope.password = $element.val();

                            // resolve password strength score using zxcvbn service
                            $scope.passwordStrength = pwd ? (pwd.length > 7 && zxcvbn.score(pwd) || 0) : null;
                            
                            // define the validity criterion for okPassword constraint
                            ngModelCtrl.$setValidity('okPassword', $scope.passwordStrength >= 2);
                        });
                    });
                }
            };
        }]);

})();
