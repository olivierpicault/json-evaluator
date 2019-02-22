'use strict';

module.exports = function evaluate(instance, fields) {
  var compare = instance.compare.value;
  var compareTo = instance.compareTo.value;

  if (instance.compare.type === 'expression') {
    compare = evaluate(compare);
  }
  if (instance.compareTo.type === 'expression') {
    compareTo = evaluate(compareTo);
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
};