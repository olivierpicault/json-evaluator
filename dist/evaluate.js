'use strict';

var _validate = _interopRequireDefault(require("./validate"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  /*
  ** This evaluates the json in its single form
  **
  **  {
  **    "compare": {
  **      "type": "",  
  **      "value": "",  
  **    },
  **    "compareTo": {
  **      "type": "",  
  **      "value": "",  
  **    },
  **    "operator": ""
  **  }
  */
  evaluateSingle: function evaluateSingle(instance, fields) {
    var compare = instance.compare.value;
    var compareTo = instance.compareTo.value;

    if (instance.compare.type === 'expression') {
      compare = this.evaluateSingle(compare);
    }

    if (instance.compareTo.type === 'expression') {
      compareTo = this.evaluateSingle(compareTo);
    }

    if (instance.compare.type === 'field') {
      compare = fields[instance.compare.value];
    }

    if (instance.compareTo.type === 'field') {
      compareTo = fields[instance.compareTo.value];
    }

    var operator = instance.operator.toLowerCase();

    switch (operator) {
      case '==':
        return compare === compareTo;

      case '!=':
        return compare !== compareTo;

      case '>':
        return compare > compareTo;

      case '<':
        return compare < compareTo;

      case '>=':
        return compare >= compareTo;

      case '<=':
        return compare <= compareTo;

      case '&&':
      case 'and':
        return compare && compareTo;

      case '||':
      case 'or':
        return compare || compareTo;

      default:
        // Should never happen
        return undefined;
    }
  },

  /*
  ** This evaluates the json in its multiple form
  **
  **  {
  **    "operator": "",
  **    "conditions": [
  **    {
  **      "compare": {
  **        "type": "",  
  **        "value": "",  
  **      },
  **      "compareTo": {
  **        "type": "",  
  **        "value": "",  
  **      },
  **      "operator": ""
  **      },
  **      {
  **      "compare": {
  **        "type": "",  
  **        "value": "",  
  **      },
  **      "compareTo": {
  **        "type": "",  
  **        "value": "",  
  **      },
  **      "operator": ""
  **      },
  **    ],
  **  }
  */
  evaluateMultiple: function evaluateMultiple(instance, fields) {
    var _this = this;

    var result = undefined;
    var operator = instance.operator.toLowerCase();
    instance.conditions.forEach(function (condition) {
      if (Object.prototype.hasOwnProperty.call(condition, 'conditions') && operator === ('and' || '&&')) {
        if (result === undefined) {
          result = _this.evaluateSingle(condition, fields);
        } else {
          result = result && _this.evaluateSingle(condition, fields);
        }
      } else if (Object.prototype.hasOwnProperty.call(condition, 'conditions') && operator === ('or' || '||')) {
        result = result || _this.evaluateMultiple(condition, fields);
      }

      if (!Object.prototype.hasOwnProperty.call(condition, 'conditions') && operator === ('and' || '&&')) {
        if (result === undefined) {
          result = _this.evaluateSingle(condition, fields);
        } else {
          result = result && _this.evaluateSingle(condition, fields);
        }
      } else if (!Object.prototype.hasOwnProperty.call(condition, 'conditions') && operator === ('or' || '||')) {
        result = result || _this.evaluateSingle(condition, fields);
      }
    });
    return result;
  },

  /*
  **  Evaluate main function
  */
  evaluate: function evaluate(instance, fields) {
    var type = _validate.default.checkOperationType(instance);

    if (type === 'single') {
      return this.evaluateSingle(instance, fields);
    } else if (type === 'multiple') {
      return this.evaluateMultiple(instance, fields);
    }

    return undefined;
  }
};