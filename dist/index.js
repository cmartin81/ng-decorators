'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var _bind = Function.prototype.bind;

var _get = function get(_x7, _x8, _x9) { var _again = true; _function: while (_again) { var object = _x7, property = _x8, receiver = _x9; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x7 = parent; _x8 = property; _x9 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

exports.Factory = Factory;
exports.Directive = Directive;
exports.Component = Component;
exports.Provider = Provider;
exports.Service = Service;
exports.Controller = Controller;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function Factory() {
  var modules = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

  return createDecorator(modules, makeFactory);
}

function Directive() {
  var modules = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

  return createDecorator(modules, makeDirective);
}

function Component() {
  var modules = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

  return createDecorator(modules, makeComponent);
}

function Provider() {
  var modules = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

  return createDecorator(modules, makeProvider);
}

function Service() {
  var modules = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

  return createDecorator(modules, makeService);
}

function Controller() {
  var modules = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

  return createDecorator(modules, makeController);
}

function createDecorator(modules, makeFunction) {
  return function (target) {
    var Clazz = (function (_target) {
      _inherits(Clazz, _target);

      function Clazz() {
        var _this = this;

        for (var _len = arguments.length, injectedValues = Array(_len), _key = 0; _key < _len; _key++) {
          injectedValues[_key] = arguments[_key];
        }

        _classCallCheck(this, Clazz);

        _get(Object.getPrototypeOf(Clazz.prototype), 'constructor', this).apply(this, injectedValues);
        modules.forEach(function (module, i) {
          _this[module] = injectedValues[i];
        });
        if (typeof this.init === 'function') {
          this.init();
        }
      }

      return Clazz;
    })(target);

    Clazz.$inject = modules;

    return makeFunction(Clazz);
  };
}

function makeDirective(constructorFn) {

  constructorFn = _normalizeConstructor(constructorFn);

  if (!constructorFn.prototype.compile) {
    // create an empty compile function if none was defined.
    constructorFn.prototype.compile = function () {};
  }

  var originalCompileFn = _cloneFunction(constructorFn.prototype.compile);

  // Decorate the compile method to automatically return the link method (if it exists)
  // and bind it to the context of the constructor (so `this` works correctly).
  // This gets around the problem of a non-lexical "this" which occurs when the directive class itself
  // returns `this.link` from within the compile function.
  _override(constructorFn.prototype, 'compile', function () {
    return function () {
      originalCompileFn.apply(this, arguments);

      if (constructorFn.prototype.link) {
        return constructorFn.prototype.link.bind(this);
      }
    };
  });

  var factoryArray = _createFactoryArray(constructorFn);
  return factoryArray;
}

function makeComponent(contructorFn) {
  return contructorFn;
}

function makeController(contructorFn) {
  return contructorFn;
}

function makeService(contructorFn) {
  return contructorFn;
}

function makeProvider(constructorFn) {
  return contructorFn;
}

function makeFactory(constructorFn) {
  constructorFn = _normalizeConstructor(constructorFn);
  return _createFactoryArray(constructorFn);
}

/**
 * If the constructorFn is an array of type ['dep1', 'dep2', ..., constructor() {}]
 * we need to pull out the array of dependencies and add it as an $inject property of the
 * actual constructor function.
 * @param input
 * @returns {*}
 * @private
 */
function _normalizeConstructor(input) {
  var constructorFn;

  if (input.constructor === Array) {
    //
    var injected = input.slice(0, input.length - 1);
    constructorFn = input[input.length - 1];
    constructorFn.$inject = injected;
  } else {
    constructorFn = input;
  }

  return constructorFn;
}

/**
 * Convert a constructor function into a factory function which returns a new instance of that
 * constructor, with the correct dependencies automatically injected as arguments.
 *
 * In order to inject the dependencies, they must be attached to the constructor function with the
 * `$inject` property annotation.
 *
 * @param constructorFn
 * @returns {Array.<T>}
 * @private
 */
function _createFactoryArray(constructorFn) {
  // get the array of dependencies that are needed by this component (as contained in the `$inject` array)
  var args = constructorFn.$inject || [];
  var factoryArray = args.slice(); // create a copy of the array
  // The factoryArray uses Angular's array notation whereby each element of the array is the name of a
  // dependency, and the final item is the factory function itself.
  factoryArray.push(function () {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    //return new constructorFn(...args);
    var instance = new (_bind.apply(constructorFn, [null].concat(args)))();
    for (var key in instance) {
      instance[key] = instance[key];
    }
    return instance;
  });

  return factoryArray;
}

/**
 * Clone a function
 * @param original
 * @returns {Function}
 */
function _cloneFunction(original) {
  return function () {
    return original.apply(this, arguments);
  };
}

/**
 * Override an object's method with a new one specified by `callback`.
 * @param object
 * @param methodName
 * @param callback
 */
function _override(object, methodName, callback) {
  object[methodName] = callback(object[methodName]);
}