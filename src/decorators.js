export function Factory(modules) {
  return createDecorator(modules, makeFactory);
}

export function Directive(modules) {
  return createDecorator(modules, makeDirective);
}

export function Provider(modules) {
  return createDecorator(modules, makeProvider);
}

export function Service(modules) {
  return createDecorator(modules, makeService);
}

export function Controller(modules) {
  return createDecorator(modules, makeController);
}


function createDecorator(modules, makeFunction) {
  return function (target) {
    class tempClass extends target {
      constructor(...injectedValues) {
        super(...injectedValues);
        for (var i = 0; i < modules.length; i++) {
          this[modules[i]] = injectedValues[i];
        }
      }
    }
    tempClass.$inject = modules;

    return makeFunction(tempClass);
  }
}


function makeDirective(constructorFn) {

  constructorFn = _normalizeConstructor(constructorFn);

  if (!constructorFn.prototype.compile) {
    // create an empty compile function if none was defined.
    constructorFn.prototype.compile = () => {
    };
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
  return factoryArray
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
  factoryArray.push((...args) => {
    //return new constructorFn(...args);
    var instance = new constructorFn(...args);
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
  object[methodName] = callback(object[methodName])
}
