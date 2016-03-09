# ng-decorators
Set of angular decorator for creating Services, controllers, factories that also inject objects at the same time

## Inspiration
The business logic for transforming the ES6 classes to support angular 1.x syntaks is from [Michael Bromley project angular-es6](https://github.com/michaelbromley/angular-es6).

Please read his article [Exploring ES6 Classes In AngularJS 1.x](http://www.michaelbromley.co.uk/blog/350/exploring-es6-classes-in-angularjs-1-x)
## Install
    $ npm install --save ng-decorators

## Usage
```javascript
import {Factory, Directive, Provider, Service, Controller} from 'ng-decorators'

@Factory(['$window'])  //or Directive or Component or Provider or Service or Controller
class FooBar{
  constructor(win){ //if you need to access the injected object it will be passed into the constructor
    console.log(win.location.host)
    this.logOrigin(); //careful! dependencies not yet injected so logOrigin will log 'logOrigin, undefined'
  }

  //use init instead of constructor as a general rule as dependencies are injected post construction
  init() {
    console.log('init', this.$window.origin); //init method automatically invoked
    this.logOrigin(); //dependencies will be injected so logOrigin will log 'logOrigin, [$window]'
  }

  logOrigin(){
    console.log('logOrigin', this.$window.origin); //all the injected values will be auto injected to the class under this.<injected object>
  }
}

app.factory('FooBarService', FooBar);
// or app.directive('FooBarService', FooBar);
// or app.service('FooBarService', FooBar);
// you see my point....
```

## Note
You need to run babel with the option 'es7.decorators' enabled.

## Test

Let's start with a simple Factory

```javascript
import {Factory} from 'ng-decorators';

@Factory()
class ThingFactory {
  constructor () {
    this.cache = new Map();
  }

  get (id) {
    return this.cache.get(id);
  }

  set (thing) {
    this.cache.set(thing.id, thing);
  }
}

export default ThingFactory;
```

Then make an Angular module

```javascript
import angular from 'angular';
import ThingFactory from './thing.factory';

let thingModule = angular.module('thing', [])
  .factory('thingFactory', ThingFactory);

export default thingModule;
```

And top it off with a wee test

```javascript
import ThingModule from './thing'
import _ from 'lodash';

describe('Thing', () => {
  let factory;

  beforeEach(window.module(ThingModule.name));
  beforeEach(inject(($injector) => {
    factory = $injector.get('thingFactory');
  }));

  describe('Factory', () => {
    ['set', 'get', 'setAll', 'getAll', 'has'].forEach((method) => {
      it('defines method ' + method, () => {
        expect(factory[method]).to.be.a('function');
      });
    })
    it('sets value', () => {
      let expected = {id: 0, foo: 'bar'};
      expect(factory.cache.size).to.equal(0);
      // spies would be good here...sinon
      factory.set(expected);
      expect(factory.cache.size).to.equal(1);
      expect(factory.cache.get(expected.id)).to.equal(expected);
    });
    it('gets value', () => {
      let expected = {id: 0, foo: 'bar'};
      factory.set(expected);
      expect(factory.get(expected.id)).to.equal(expected);
    });
  });
});
```
