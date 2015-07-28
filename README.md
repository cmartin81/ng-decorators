# ng-decorators
Set of angular decorator for creating Services, controllers, factories that also inject objects at the same time 

## Inspiration
The business logic for transforming the ES6 classes to support angular 1.x syntaks is from [Michael Bromley project angular-es6](https://github.com/michaelbromley/angular-es6).

Please read his article [Exploring ES6 Classes In AngularJS 1.x](http://www.michaelbromley.co.uk/blog/350/exploring-es6-classes-in-angularjs-1-x)
## Install
    $ npm install --save ng-decorators
 
## Usage
    import {Factory, Directive, Provider, Service, Controller} from 'ng-decorators'
    
    @Factory(['$window'])  //or Directive or Provider or Service or Controller
    class FooBar{
      constructor(win){ //if you need to access the injected object it will be passed into the constructor
        console.log(win.location.host)
      }
      
      logOrigin(){
        console.log(this.$window.origin); //all the injected values will be auto injected to the class under this.<injected object>
      }
    }
    
    app.factory('FooBarService', FooBar);
    // or app.directive('FooBarService', FooBar);
    // or app.service('FooBarService', FooBar);
    // you see my point....
    

## Note
You need to run babel with the option 'es7.decorators' enabled.

## Test
Are comming soon