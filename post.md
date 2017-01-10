# Password Strength Meter in AngularJS
In this tutorial, we would be creating a simple registration form with just fields for fullname, email and password. We would use **[zxcvbn][zxcvbn]** to estimate the strength of the password in the form and also provide a visual feedback. We would also use [AngularJS][angularjs] for effortless two-way data bindings.

At the end of the tutorial, the final page will behave as shown in the following live demo:

<iframe width="100%" height="600" src="//jsfiddle.net/vxjef11j/26/embedded/result/dark/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

## Why measure Password Strength?
Passwords are commonly used for user authentication in most web applications and as such, it is required that passwords be stored in a safe way. Over the years, techniques such as one-way [password hashing][hashing] - which involves [salting](https://en.wikipedia.org/wiki/Salt_(cryptography)) most of the times, have been employed to hide the real representation of passwords being stored in a database.

Although password hashing is a great step in securing password, the user still poses a major challenge to password security. A user who uses a very common word as password makes the effort of hashing fruitless, since a [bruteforce][bruteforce] attack can crack such password in a very short time. Infact, if highly sophisticated infrastructure is used for the attack, it may even take split milliseconds, depending on the password complexity or length.

Many web applications today such as Google, Twitter, Dropbox, etc insist on users having considerably strong passwords either by ensuring a minimum password length or some combination of alphanumeric characters and maybe symbols in the password.

**How then is password strength measured?** Dropbox developed an algorithm for a [realistic password strength estimator][zxcvbn-blog] inspired by password crackers. This algorithm is packaged in a Javascript library called **[zxcvbn][zxcvbn]**. In addition, the package contains a dictionary of commonly used English words, names and passwords.

## Getting Started
Before we begin the tutorial, we would download all the dependencies we need using the [Bower][bower] package manager. If you don't already have Bower in your system, you can follow the [Bower Installation Guide][bower-install]. Run the following command to install all the dependencies for the tutorial.

```shell
bower install zxcvbn angularjs#1.5.9 bootstrap
```

The folder structure for our project should look like this:

![Project Screenshot][project-screenshot]

## Starting-off with the HTML
Let's create an HTML file with the name `index.html`, that will contain the basic markup for our page.

```html
<!-- index.html -->

<!DOCTYPE html>
<html class="no-js">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Password Strength</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="bower_components/bootstrap/dist/css/bootstrap.min.css">
        <link rel="stylesheet" href="bower_components/bootstrap/dist/css/bootstrap-theme.min.css">
        <link rel="stylesheet" href="assets/css/main.css">
    </head>
    <body>
        <div class="main-container">
        <div class="form-container">
        
            <form action="" method="POST" role="form">
                <legend class="form-label">Join the Team</legend>
            
                <div class="form-group">
                    <label for="fullname">Fullname</label>
                    <input type="text" class="form-control" id="fullname" 
                    placeholder="Enter Fullname">
                </div>

                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" class="form-control" id="email" 
                    placeholder="Enter Email Address">
                </div>
            
                <div class="form-group">
                    <label for="password">Password</label>

                    <div class="form-hint">To conform with our Strong Password policy, you are 
                        required to use a sufficiently strong password. Password must be more than 
                        7 characters.</div>

                    <input type="password" class="form-control" id="password" 
                    placeholder="Enter Password">
                </div>

                <button type="submit" class="btn btn-primary">Submit</button>
            </form>

        </div>
        </div>
       
        <script src="bower_components/angular/angular.min.js"></script>
        <script src="assets/js/app.js"></script>
    </body>
</html>

```

## Spicing-up the page with CSS
Now we would add some style definitions to the `assets/css/main.css` file to spice up the HTML page.

```css
/* main.css */

 body {
    margin: 0;
    padding: 0;
}

.main-container {
    display: table;
    width: 400px;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
}

.form-container {
    position: relative;
    bottom: 100px;
    display: table-cell;
    vertical-align: middle;
}

.form-container form > div {
    padding: 0 15px;
}

.form-container form > button {
    margin-left: 15px;
}

legend.form-label {
    font-size: 24pt;
    padding: 0 15px;
}

.form-hint {
    font-size: 7pt;
    line-height: 9pt;
    margin: -5px auto 5px;
    color: #999;
}
```

## Loading `zxcvbn` asynchronously
Now we would asynchronously load the `zxcvbn` package into our page. We would add the script in the `assets/js/app.js` file. The following script programmatically creates a new `<script>` element that is inserted before the first script element defined in the page, when the page is finished loading. The `src` of this script element points to the `zxcvbn.js` file. The `async` attribute is also set to `true` to enable asynchronous loading.

```js
/* app.js */

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

```

Now we can try using the `zxcvbn()` function with any password string from our browser's console. The `zxcvbn()` function returns a result object with several properties. In this tutorial, we would be concerned only with the `score` property, which is an integer from `0 - 4` (useful for implementing a strength bar).

- `0` - too guessable
- `1` - very guessable
- `2` - somewhat guessable
- `3` - safely unguessable
- `4` - very unguessable

```js
console.log(zxcvbn('password'));
```

## Mixing-in some AngularJS
We have already linked to the `angular.js` script in our page. Now we would make some little improvements to our code to engage AngularJS. First let's create a module for our app called `PasswordStrength`, and a simple controller for our form called `FormController`. We would add the following script to the `assets/js/app.js` file.

```js

var PasswordStrength = angular.module('PasswordStrength', [])
    .controller('FormController', function($scope) {});

```

Next, we would edit our HTML page to add an `ng-app` directive for the module on the root `<html>` element, and an `ng-controller` directive for the controller on the `<form>` element.

```html

<!-- adding the ng-app directive -->
<html class="no-js" ng-app="PasswordStrength">

<!-- adding the ng-controller directive -->
<form action="" method="POST" role="form" ng-controller="FormController">

```

## Validating the Form
Now we can add validation constraints to the form.

- First, we would give names to the form and the input fields, and also add `ng-model` directives to the input fields to be able to harness the built-in `NgModelController`.
- Next, we would add the `ng-required` constraint to the input fields, since we desire they should be filled.
- Next, we would disable the submit button using the `ng-disabled` directive and only enable it when the form is fully validated.
- Finally, we would harness the `ng-class` and `ng-show` directives to provide error feedback and messages for the input elements.

The modified form should look like this:

```html

<form action="" method="POST" name="joinTeamForm" role="form" ng-controller="FormController">
    <legend class="form-label">Join the Team</legend>

    <div class="form-group">
        <label for="fullname">Fullname</label>

        <div class="error form-hint" ng-show="joinTeamForm.fullname.$dirty 
        && joinTeamForm.fullname.$error.required" ng-cloak>{{"This field is required."}}</div>

        <input type="text" class="form-control" ng-class="(joinTeamForm.fullname.$dirty && 
        joinTeamForm.fullname.$invalid) ? 'error' : ''" id="fullname" name="fullname" 
        placeholder="Enter Fullname" ng-required="true" ng-model="fullname">
    </div>

    <div class="form-group">
        <label for="email">Email</label>

        <div class="error form-hint" ng-show="joinTeamForm.email.$dirty && 
        joinTeamForm.email.$error.required" ng-cloak>{{"This field is required."}}</div>

        <div class="error form-hint" ng-show="joinTeamForm.email.$dirty && 
        joinTeamForm.email.$error.email" ng-cloak>{{"Email is invalid."}}</div>

        <input type="email" class="form-control" ng-class="(joinTeamForm.email.$dirty && 
        joinTeamForm.email.$invalid) ? 'error' : ''" id="email" name="email" 
        placeholder="Enter Email Address" ng-required="true" ng-model="email">
    </div>

    <div class="form-group">
        <label for="password">Password</label>

        <div class="form-hint">To conform with our Strong Password policy, you are required to use 
            a sufficiently strong password. Password must be more than 7 characters.</div>

        <input type="password" class="form-control" ng-class="(joinTeamForm.password.$dirty && 
        joinTeamForm.password.$invalid) ? 'error' : ''" id="password" name="password" 
        placeholder="Enter Password" ng-required="true" ng-model="password">
    </div>

    <button type="submit" class="btn btn-primary" ng-disabled="joinTeamForm.$invalid">Submit</button>
</form>

```

In the preceeding code, we have named our form as `joinTeamForm` and have given names to the input elements making it possible for us to harness Angular's built-in `NgModelController`. We have also created data-bindings for the input elements using the `ng-model` directive.

We used some of the validation state properties - `$dirty`, `$invalid`, `$error`, provided by the `NgModelController` API to determine if our form is fully validated. The `ng-class` directive was also used to dynamically add an `error` class to the input elements based on the validation criteria.

Also, we used `ng-cloak` to prevent the browser from showing our error messages while rendering. Since, we included `angular.js` at the end of our page, this would not be effective. To correct this, we would add the following css rule to the `main.css` file.

```css

[ng\:cloak], [ng-cloak], [data-ng-cloak], [x-ng-cloak], .ng-cloak, .x-ng-cloak {
    display: none !important;
}

```

Now, we would add some style definitions to the `main.css` file for our error feedback.

```css

.form-control.error {
    border-color: red;
}

.form-hint.error {
    color: #C00;
    font-weight: bold;
    font-size: 8pt;
}

```

## Adding the Password Strength Meter
Now we would go ahead to create the password strength meter. We would also create a new directive in our module called `okPassword`, that will define a custom validation constraint for the password element, which will ensure that a valid password must be more than `7` characters and must have a minimum `zxcvbn` score of `2`. We will also add a visual feedback to keep track of the password length.

First, let's add the following immediately after the password field element, for our password strength meter.

```html

<div class="label password-count" ng-class="password.length > 7 ? 'label-success' : 'label-danger'" 
    ng-cloak>{{ password | passwordCount:7 }}</div>

<div class="strength-meter">
    <div class="strength-meter-fill" data-strength="{{passwordStrength}}"></div>
</div>

```

Here, we are using the `ng-class` directive and Bootstrap's `label` classes to provide feedback based on the password length. We are also using a custom `passwordCount` filter to slightly format the display of the password length.

Also, we are binding the value for the `data-strength` attribute to the `passwordStrength` property of the controller's scope, which will contain the password strength score.

Now, let's add the following css rules to the `main.css` file to style the password strength meter which we just created.

```css

.password-count {
    float: right;
    position: relative;
    bottom: 24px;
    right: 10px;
}

.strength-meter {
    position: relative;
    height: 3px;
    background: #DDD;
    margin: 10px auto 20px;
    border-radius: 3px;
}

.strength-meter:before, .strength-meter:after {
    content: '';
    height: inherit;
    background: transparent;
    display: block;
    border-color: #FFF;
    border-style: solid;
    border-width: 0 5px 0 5px;
    position: absolute;
    width: 80px;
    z-index: 10;
}

.strength-meter:before {
    left: 70px;
}

.strength-meter:after {
    right: 70px;
}

.strength-meter-fill {
    background: transparent;
    height: inherit;
    position: absolute;
    width: 0;
    border-radius: inherit;
    transition: width 0.5s ease-in-out, background 0.25s;
}

.strength-meter-fill[data-strength='0'] {
    background: darkred;
    width: 20%;
}

.strength-meter-fill[data-strength='1'] {
    background: orangered;
    width: 40%;
}

.strength-meter-fill[data-strength='2'] {
    background: orange;
    width: 60%;
}

.strength-meter-fill[data-strength='3'] {
    background: yellowgreen;
    width: 80%;
}

.strength-meter-fill[data-strength='4'] {
    background: green;
    width: 100%;
}

```

Here, we have made our password strength meter to indicate five levels for the different password strength scores ranging from `0` to `4`. We have also specified different colors and fill width for each score level.

Before we proceed, we would define the `passwordCount` filter which slightly formats the display of the password length in the view. Let's add the following to the `app.js` file to create the filter.

```js

// creating the passwordCount filter
PasswordStrength.filter('passwordCount', [function() {
    return function(value, peak) {
        var value = angular.isString(value) ? value : '',
        peak = isFinite(peak) ? peak : 7;

        return value && (value.length > peak ? peak + '+' : value.length);
    };
}]);

```

In the preceeding code, the `passwordCount` filter takes a string value and an optional `peak` parameter which defaults to `7` if omitted or not a valid integer. If the length of the input string is less than the `peak`, it returns the length of the string; otherwise, it returns `{peak}+`.

Now, we would go on to create the `okPassword` directive for the password field. We would also create a service that will encapsulate the implementation of the `zxcvbn()` function. Let's add the following to the `app.js` file to create the service.

```js

// creating a service to provide zxcvbn() functionality
PasswordStrength.factory('zxcvbn', [function() {
    return {
        score: function() {
            var compute = zxcvbn.apply(null, arguments);
            return compute && compute.score;
        }
    };
}]);

```

Here, we have created a service called `zxcvbn` that provides just one API method `score()`. The `score()` method takes the same parameters as the `zxcvbn()` function and calls it internally. It returns the estimated password strength score.

Now, we can apply this service to create our directive. Add the following to the `app.js` file to create the directive.

```js

// creating the okPassword directive with zxcvbn as dependency
PasswordStrength.directive('okPassword', ['zxcvbn', function(zxcvbn) {
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
                    $scope.passwordStrength = pwd ? (pwd.length > 7 && zxcvbn.score(pwd) || 0) 
                    : null;
                    
                    // define the validity criterion for okPassword constraint
                    ngModelCtrl.$setValidity('okPassword', $scope.passwordStrength >= 2);
                });
            });
        }
    };
}]);

```

In the preceeding code, we defined the `okPassword` directive with `zxcvbn` service as a dependency. We specified that the directive can be used either as a class or an attribute. We also specified that we need the `NgModelController`.

In the `link` function, we added an event listener on the element which is triggered on `blur`, `change` and `keyup` events. The event listener uses the `$scope.$evalAsync()` method to delay the update of the scope's properties. Also, the `$setValidity()` method of the `NgModelController` was used to define the validity criterion for the `okPassword` validation constraint.

Finally, we go ahead to add the `ok-password` attribute or class to our password element to ensure that the validation constraint defined in our directive is applied.

```html

<input type="password" class="form-control ok-password" ng-class="(joinTeamForm.password.$dirty && 
joinTeamForm.password.$invalid) ? 'error' : ''" id="password" name="password" 
placeholder="Enter Password" ng-required="true" ng-model="password">

```

## Conclusion
In this tutorial, we have been able to implement a password strength meter based on the `zxcvbn` Javascript library in our AngularJS application. For a detailed usage guide and documentation of the zxcvbn library, see the [zxcvbn][zxcvbn] repository on Github. For a complete code sample of this tutorial, checkout the [password-strength-demo][strength-demo] repository on Github. You can also get a [live demo of this tutorial on jsFiddle][jsfiddle-demo].


[angularjs]: https://angularjs.org/
[bower]: https://bower.io/
[bower-install]: https://bower.io/#install-bower
[bruteforce]: https://en.wikipedia.org/wiki/Brute-force_attack
[hashing]: https://en.wikipedia.org/wiki/Cryptographic_hash_function
[jsfiddle-demo]: https://jsfiddle.net/vxjef11j/22/
[strength-demo]: https://github.com/Gladx/password-strength-demo
[zxcvbn]: https://github.com/dropbox/zxcvbn
[zxcvbn-blog]: https://blogs.dropbox.com/tech/2012/04/zxcvbn-realistic-password-strength-estimation/

[project-screenshot]: http://image.prntscr.com/image/19078ecdbf994ad9873e18ac0ac12ae9.jpg
