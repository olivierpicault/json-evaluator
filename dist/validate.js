'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var allowedTypes = ['string', 'number', 'boolean', 'expression', 'field'];
var allowedMultipleOperators = ['and', 'or', '||', '&&'];
var _default = {
  /*
  **
  */
  checkOperationType: function checkOperationType(node) {
    var type = undefined;

    if (Object.prototype.hasOwnProperty.call(node, 'operator') && Object.prototype.hasOwnProperty.call(node, 'conditions')) {
      type = 'multiple';
    } else if (Object.prototype.hasOwnProperty.call(node, 'operator') && !Object.prototype.hasOwnProperty.call(node, 'conditions')) {
      type = 'single';
    }

    return type;
  },

  /*
  **  Check object has all the needed properties
  */
  validateProperties: function validateProperties(node) {
    var errors = [];
    var valid = true;

    if (!Object.prototype.hasOwnProperty.call(node, 'compare')) {
      errors.push('"compare" property is missing');
      valid = false;
    } else if (_typeof(node.compare) !== 'object') {
      errors.push('"compare" must be an object');
    }

    if (!Object.prototype.hasOwnProperty.call(node, 'compareTo')) {
      errors.push('"compareTo" property is missing');
      valid = false;
    } else if (_typeof(node.compareTo) !== 'object') {
      valid = false;
      errors.push('"compareTo" must be an object');
    }

    if (!Object.prototype.hasOwnProperty.call(node, 'operator')) {
      errors.push('"operator" property is missing');
      valid = false;
    } else if (typeof node.operator !== 'string') {
      errors.push('"operator" must be a string');
      valid = false;
    }

    return {
      valid: valid,
      errors: errors
    };
  },
  validateMultipleProperties: function validateMultipleProperties(node) {
    var errors = [];
    var valid = true;

    if (!Object.prototype.hasOwnProperty.call(node, 'conditions')) {
      valid = false;
      errors.push('"conditions" property is missing');
    } else if (!Array.isArray(node.conditions)) {
      valid = false;
      errors.push('"conditions" must be an array');
    }

    if (!Object.prototype.hasOwnProperty.call(node, 'operator')) {
      valid = false;
      errors.push('"operator" property is missing');
    } else if (!allowedMultipleOperators.includes(node.operator.toLowerCase())) {
      valid = false;
      errors.push("\"operator\" must be one of ".concat(allowedMultipleOperators.join(', ')));
    }

    return {
      valid: valid,
      errors: errors
    };
  },

  /*
  **  Validate "compare" and "compareTo" objects have all the needed properties
  */
  validatePropertiesProperties: function validatePropertiesProperties(node) {
    var errors = [];
    var valid = true;
    ['compare', 'compareTo'].forEach(function (prop) {
      ['type', 'value'].forEach(function (propProp) {
        if (!Object.prototype.hasOwnProperty.call(node[prop], propProp)) {
          valid = false;
          errors.push("\"".concat(propProp, "\" property is missing from \"").concat(prop, "\""));
        }
      });
    });
    return {
      valid: valid,
      errors: errors
    };
  },

  /*
  **  Check types given are allowed
  */
  validateTypes: function validateTypes(node) {
    var errors = [];
    var valid = true;

    if (!(allowedTypes.includes(node.compare.type) && allowedTypes.includes(node.compareTo.type))) {
      valid = false;
      errors.push("\"type\" must be one of ".concat(allowedTypes.join(', ')));
    }

    return {
      valid: valid,
      errors: errors
    };
  },

  /*
  **  Check we are comparing two comparable types
  */
  validateComparison: function validateComparison(node) {
    var errors = [];
    var valid = true; // Wildcard for 'field'
    // 'field' can be any type and we don't know it in advance

    if (node.compare.type === 'field' || node.compareTo.type === 'field') {
      return {
        valid: true,
        errors: []
      };
    } // 'Expression' can only be compare to a boolean or another 'expression'


    if (node.compare.type === 'expression' || node.compareTo.type === 'expression') {
      if (node.compare.type === 'expression' && !['expression', 'boolean'].includes(node.compareTo.type)) {
        errors.push('"expression" type can only be compared to "boolean" or "expression" types');
        valid = false;
      }

      if (node.compareTo.type === 'expression' && !['expression', 'boolean'].includes(node.compare.type)) {
        errors.push('"expression" type can only be compared to "boolean" or "expression" types');
        valid = false;
      }
    } // Besides 'expression' case all other types should be compare to the same type
    else if (node.compare.type !== node.compareTo.type) {
        errors.push('You are not comparing the same types for "compare" and "compareTo"');
        valid = false;
      }

    return {
      valid: valid,
      errors: errors
    };
  },

  /*
  **  Check value is the right type
  */
  validateValue: function validateValue(node, fields) {
    var errors = [];
    var valid = true;
    var compareType = node.compare.type;
    var compareToType = node.compareTo.type;
    var specialTypes = ['expression', 'field']; // Basic cases

    if (!specialTypes.includes(compareType) && allowedTypes.includes(compareType) && _typeof(node.compare.value) !== compareType) {
      valid = false;
      errors.push("\"".concat(node.compare.value, "\" is not \"").concat(compareType, "\""));
    }

    if (!specialTypes.includes(compareToType) && allowedTypes.includes(compareToType) && _typeof(node.compareTo.value) !== compareToType) {
      valid = false;
      errors.push("\"".concat(node.compareTo.value, "\" is not \"").concat(compareToType, "\""));
    } // Special case: expression


    if (compareType === 'expression' && _typeof(node.compare.value) !== 'object') {
      valid = false;
      errors.push("\"".concat(node.compare.value, "\" is not \"").concat(compareType, "\""));
    }

    if (compareToType === 'expression' && _typeof(node.compareTo.value) !== 'object') {
      valid = false;
      errors.push("\"".concat(node.compareTo.value, "\" is not \"").concat(compareToType, "\""));
    } // Special case: field


    if (compareType === 'field' && Object.prototype.hasOwnProperty.call(fields, node.compare.value) === false) {
      valid = false;
      errors.push("\"".concat(node.compare.value, "\" is not a valid field value"));
    }

    if (compareToType === 'field' && Object.prototype.hasOwnProperty.call(fields, node.compareTo.value) === false) {
      valid = false;
      errors.push("\"".concat(node.compareTo.value, "\" is not a valid field value"));
    }

    return {
      valid: valid,
      errors: errors
    };
  },

  /*
  **  Check operator is allowed for the given type
  */
  validateOperator: function validateOperator(node) {
    var _ref;

    var errors = [];
    var valid = true;
    var type = node.compare.type;
    var toType = node.compareTo.type;
    var allowedOperatorsByType = {
      string: ['==', '!='],
      number: ['==', '!=', '>', '>=', '<', '<='],
      "boolean": ['==', '!=', '&&', '||', 'and', 'or'],
      expression: ['==', '!=', '&&', '||', 'and', 'or'],
      field: []
    }; // "flatten" all the arrays within 'allowedOperatorsByType' ...

    var operators = (_ref = []).concat.apply(_ref, _toConsumableArray(Object.values(allowedOperatorsByType))); // ... and remove duplicates


    operators = operators.filter(function (element, index, self) {
      return index === self.indexOf(element);
    }); // Wildcard

    if (type === 'field' && toType === 'field' && operators.includes(node.operator)) {
      return {
        valid: true,
        errors: []
      };
    } // Validation based on the type that is not 'field'
    // (You can not imagine how the following lines are actually pure art)


    if (type === 'field' && toType !== 'field' && Object.keys(allowedOperatorsByType).includes(toType)) {
      allowedOperatorsByType.field = allowedOperatorsByType[toType];
    } else if (type !== 'field' && toType === 'field' && Object.keys(allowedOperatorsByType).includes(type)) {
      allowedOperatorsByType.field = allowedOperatorsByType[type];
    }

    if (type === undefined || type === null || type === '' || !(type in allowedOperatorsByType)) {
      return {
        valid: false,
        errors: ["Type \"".concat(type, "\" is not defined in the validator")]
      };
    }

    if (!allowedOperatorsByType[type].includes(node.operator)) {
      errors.push("operator \"".concat(node.operator, "\" can not be applied here"));
      valid = false;
    }

    return {
      valid: valid,
      errors: errors
    };
  },
  validateNode: function validateNode(node, fields) {
    var props = this.validateProperties(node);

    if (!props.valid) {
      return props;
    }

    var propsPros = this.validatePropertiesProperties(node);
    var types = this.validateTypes(node);
    var compare = this.validateComparison(node);
    var operator = this.validateOperator(node);
    var value = this.validateValue(node, fields);
    return {
      valid: props.valid && propsPros.valid && types.valid && compare.valid && operator.valid && value.valid,
      errors: [].concat(_toConsumableArray(props.errors), _toConsumableArray(propsPros.errors), _toConsumableArray(types.errors), _toConsumableArray(compare.errors), _toConsumableArray(operator.errors), _toConsumableArray(value.errors))
    };
  },
  validate: function validate(instance, fields) {
    var _this = this;

    if (instance === null || instance === undefined) {
      return {
        valid: false,
        errors: ['missing "instance" parameter']
      };
    }

    if (fields === null || fields === undefined || _typeof(fields) !== 'object') {
      return {
        valid: false,
        errors: ['missing "fields" parameter']
      };
    }

    var valid = true;
    var errors = [];
    var operationType = this.checkOperationType(instance);

    if (operationType === undefined) {
      valid = false;
      errors.push('"operation type can not be determined');
    }

    if (operationType === 'single') {
      var currentNode = this.validateNode(instance, fields);

      if (currentNode.valid === false) {
        return {
          valid: currentNode.valid && valid,
          errors: [].concat(_toConsumableArray(currentNode.errors), _toConsumableArray(errors))
        };
      }

      if (instance.compare.type === 'expression') {
        var nodeValidation = this.validate(instance.compare.value, fields);
        valid = valid && nodeValidation.valid;
        errors = [].concat(_toConsumableArray(errors), _toConsumableArray(nodeValidation.errors));
      }

      if (instance.compareTo.type === 'expression') {
        var _nodeValidation = this.validate(instance.compareTo.value, fields);

        valid = valid && _nodeValidation.valid;
        errors = [].concat(_toConsumableArray(errors), _toConsumableArray(_nodeValidation.errors));
      }

      return {
        valid: currentNode.valid && valid,
        errors: [].concat(_toConsumableArray(currentNode.errors), _toConsumableArray(errors))
      };
    }

    if (operationType === 'multiple') {
      var multiplePropertiesCheck = this.validateMultipleProperties(instance);

      if (multiplePropertiesCheck.valid === false) {
        return {
          valid: multiplePropertiesCheck.valid && valid,
          errors: [].concat(_toConsumableArray(multiplePropertiesCheck.errors), _toConsumableArray(errors))
        };
      }

      instance.conditions.forEach(function (condition) {
        var result = _this.validate(condition, fields);

        valid = valid && result.valid, errors = [].concat(_toConsumableArray(errors), _toConsumableArray(result.errors));
      });
    }

    return {
      valid: valid,
      errors: errors
    };
  }
};
exports["default"] = _default;