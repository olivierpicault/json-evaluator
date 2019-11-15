'use strict'

import validate from './validate'

export default {

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
  
  evaluateSingle: function (instance, fields) {
    let compare = instance.compare.value
    let compareTo = instance.compareTo.value

    if (instance.compare.type === 'expression') {
      compare = this.evaluateSingle(compare)
    }
    if (instance.compareTo.type === 'expression') {
      compareTo = this.evaluateSingle(compareTo)
    }

    if (instance.compare.type === 'field') {
      compare = fields[compare]
    }
    if (instance.compareTo.type === 'field') {
      compareTo = fields[compareTo]
    }

    const operator = instance.operator.toLowerCase()
    switch (operator) {
      case '==':
        return compare === compareTo
      case '!=':
        return compare !== compareTo
      case '>':
        return compare > compareTo
      case '<':
        return compare < compareTo
      case '>=':
        return compare >= compareTo
      case '<=':
        return compare <= compareTo
      case '&&':
      case 'and':
        return compare && compareTo
      case '||':
      case 'or':
        return compare || compareTo
      default:
        // Should never happen
        return undefined
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

  evaluateMultiple: function (instance, fields) {
    let result = undefined
    const operator = instance.operator.toLowerCase()
    
    instance.conditions.forEach(condition => {
      // If the condition is a multiple as well
      if (Object.prototype.hasOwnProperty.call(condition, 'conditions') && (operator === ('and' || '&&'))) {
        if (result === undefined) {
          /*
          We need to check if the value is undefined because:
          - undefined && true === undefined
          - undefined && false === undefined
          */
          result = this.evaluateMultiple(condition, fields)
        } else {
          /*
          No need to check if the value is undefined here because:
          - undefined || true === true
          - undefined || false === false
          */
          result = result && this.evaluateMultiple(condition, fields)
        }
      }
      else if (Object.prototype.hasOwnProperty.call(condition, 'conditions') && (operator === ('or' || '||'))) {
        result = result || this.evaluateMultiple(condition, fields)
      }
      // The condition is a simple one
      if (!Object.prototype.hasOwnProperty.call(condition, 'conditions') && (operator === ('and' || '&&'))) {
        if (result === undefined) {
          result = this.evaluateSingle(condition, fields)
        } else {
          result = result && this.evaluateSingle(condition, fields)
        }
      }
      else if (!Object.prototype.hasOwnProperty.call(condition, 'conditions') && (operator === ('or' || '||'))) {
        result = result || this.evaluateSingle(condition, fields)
      }
    });

    return result
  },

  /*
  **  Evaluate main function
  */

  evaluate: function (instance, fields) {

    const type = validate.checkOperationType(instance)

    if (type === 'single') {
      return this.evaluateSingle(instance, fields)
    } else if (type === 'multiple') {
      return this.evaluateMultiple(instance, fields)
    }
    return undefined
  }
}
