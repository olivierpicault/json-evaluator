'use strict'

module.exports = function evaluate (instance, fields) {
  let compare = instance.compare.value
  let compareTo = instance.compareTo.value

  if (instance.compare.type === 'expression') {
    compare = evaluate(compare)
  }
  if (instance.compareTo.type === 'expression') {
    compareTo = evaluate(compareTo)
  }

  if (instance.compare.type === 'field') {
    compare = fields[instance.compare.value]
  }
  if (instance.compareTo.type === 'field') {
    compareTo = fields[instance.compareTo.value]
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
}
