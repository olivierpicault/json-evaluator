'use strict'

const allowedTypes = ['string', 'number', 'boolean', 'expression', 'field']
const allowedMultipleOperators = ['and', 'or', '||', '&&']

module.exports = {

  /*
  **
  */

  checkOperationType: function (node) {
    let type = undefined

    if (Object.prototype.hasOwnProperty.call(node, 'operator') && Object.prototype.hasOwnProperty.call(node, 'conditions')) {
      type = 'multiple'
    }
    else if (Object.prototype.hasOwnProperty.call(node, 'operator') && !Object.prototype.hasOwnProperty.call(node, 'conditions')) {
      type = 'single'
    }
   return type
  },

  /*
  **  Check object has all the needed properties
  */
  validateProperties: function (node) {
    const errors = []
    let valid = true

    if (!Object.prototype.hasOwnProperty.call(node, 'compare')) {
      errors.push('"compare" property is missing')
      valid = false
    } else if ((typeof node.compare) !== 'object') {
      errors.push('"compare" must be an object')
    }

    if (!Object.prototype.hasOwnProperty.call(node, 'compareTo')) {
      errors.push('"compareTo" property is missing')
      valid = false
    } else if ((typeof node.compareTo) !== 'object') {
      valid = false
      errors.push('"compareTo" must be an object')
    }

    if (!Object.prototype.hasOwnProperty.call(node, 'operator')) {
      errors.push('"operator" property is missing')
      valid = false
    } else if ((typeof node.operator) !== 'string') {
      errors.push('"operator" must be a string')
      valid = false
    }

    return { valid, errors }
  },

  validateMultipleProperties: function (node) {
    const errors = []
    let valid = true

    if (!Object.prototype.hasOwnProperty.call(node, 'conditions')) {
      valid = false
      errors.push('"conditions" property is missing')
    } else if (!Array.isArray(node.conditions)) {
      valid = false
      errors.push('"conditions" must be an array')
    }

    if (!Object.prototype.hasOwnProperty.call(node, 'operator')) {
      valid = false
      errors.push('"operator" property is missing')
    } else if (!allowedMultipleOperators.includes(node.operator.toLowerCase())) {
      valid = false
      errors.push(`"operator" must be one of ${allowedMultipleOperators.join(', ')}`)
    }

    return { valid, errors }
  },

  /*
  **  Validate "compare" and "compareTo" objects have all the needed properties
  */
  validatePropertiesProperties: function (node) {
    const errors = []
    let valid = true;

    ['compare', 'compareTo'].forEach((prop) => {
      ['type', 'value'].forEach((propProp) => {
        if (!Object.prototype.hasOwnProperty.call(node[prop], propProp)) {
          valid = false
          errors.push(`"${propProp}" property is missing from "${prop}"`)
        }
      })
    })

    return { valid, errors }
  },

  /*
  **  Check types given are allowed
  */
  validateTypes: function (node) {
    const errors = []
    let valid = true

    if (!(allowedTypes.includes(node.compare.type) && allowedTypes.includes(node.compareTo.type))) {
      valid = false
      errors.push(`"type" must be one of ${allowedTypes.join(', ')}`)
    }

    return { valid, errors }
  },

  /*
  **  Check we are comparing two comparable types
  */
  validateComparison: function (node) {
    const errors = []
    let valid = true

    // Wildcard for 'field'
    // 'field' can be any type and we don't know it in advance
    if (node.compare.type === 'field' || node.compareTo.type === 'field') {
      return { valid: true, errors: [] }
    }

    // 'Expression' can only be compare to a boolean or another 'expression'
    if (node.compare.type === 'expression' || node.compareTo.type === 'expression') {
      if (node.compare.type === 'expression' && !['expression', 'boolean'].includes(node.compareTo.type)) {
        errors.push('"expression" type can only be compared to "boolean" or "expression" types')
        valid = false
      }
      if (node.compareTo.type === 'expression' && !['expression', 'boolean'].includes(node.compare.type)) {
        errors.push('"expression" type can only be compared to "boolean" or "expression" types')
        valid = false
      }
    }
    // Besides 'expression' case all other types should be compare to the same type
    else if (node.compare.type !== node.compareTo.type) {
      errors.push('You are not comparing the same types for "compare" and "compareTo"')
      valid = false
    }

    return { valid, errors }
  },

  /*
  **  Check value is the right type
  */
 validateValue: function (node, fields) {
    const errors = []
    let valid = true

    const compareType = node.compare.type
    const compareToType = node.compareTo.type

    const specialTypes = ['expression', 'field']

    // Basic cases
    if ((!specialTypes.includes(compareType))
      && allowedTypes.includes(compareType)
      && (typeof node.compare.value) !== compareType) {
      valid = false
      errors.push(`"${node.compare.value}" is not "${compareType}"`)
    }
    if ((!specialTypes.includes(compareToType))
      && allowedTypes.includes(compareToType)
      && (typeof node.compareTo.value) !== compareToType) {
      valid = false
      errors.push(`"${node.compareTo.value}" is not "${compareToType}"`)
    }

    // Special case: expression
    if (compareType === 'expression' && (typeof node.compare.value) !== 'object') {
      valid = false
      errors.push(`"${node.compare.value}" is not "${compareType}"`)
    }
    if (compareToType === 'expression' && (typeof node.compareTo.value) !== 'object') {
      valid = false
      errors.push(`"${node.compareTo.value}" is not "${compareToType}"`)
    }

    // Special case: field
    if (compareType === 'field' && (Object.prototype.hasOwnProperty.call(fields, node.compare.value) === false)) {
      valid = false
      errors.push(`"${node.compare.value}" is not a valid field value`)
    }
    if (compareToType === 'field' && (Object.prototype.hasOwnProperty.call(fields, node.compareTo.value) === false)) {
      valid = false
      errors.push(`"${node.compareTo.value}" is not a valid field value`)
    }

    return { valid, errors }
  },

  /*
  **  Check operator is allowed for the given type
  */
  validateOperator: function (node) {
    const errors = []
    let valid = true

    const type = node.compare.type
    const toType = node.compareTo.type

    const allowedOperatorsByType = {
      string: ['==', '!='],
      number: ['==', '!=', '>', '>=', '<', '<='],
      boolean: ['==', '!=', '&&', '||', 'and', 'or'],
      expression: ['==', '!=', '&&', '||', 'and', 'or'],
      field: []
    }

    // "flatten" all the arrays within 'allowedOperatorsByType' ...
    let operators = [].concat(...Object.values(allowedOperatorsByType))
    // ... and remove duplicates
    operators = operators.filter((element, index, self) => index === self.indexOf(element))

    // Wildcard
    if (type === 'field' && toType === 'field' && operators.includes(node.operator)) {
      return { valid: true, errors: [] }
    }

    // Validation based on the type that is not 'field'
    // (You can not imagine how the following lines are actually pure art)
    if (type === 'field' && toType !== 'field' && Object.keys(allowedOperatorsByType).includes(toType)) {
      allowedOperatorsByType.field = allowedOperatorsByType[toType]
    } else if (type !== 'field' && toType === 'field' && Object.keys(allowedOperatorsByType).includes(type)) {
      allowedOperatorsByType.field = allowedOperatorsByType[type]
    }

    if (type === undefined || type === null || type === '' || !(type in allowedOperatorsByType)) {
      return { valid: false, errors: [`Type "${type}" is not defined in the validator`] }
    }

    if (!allowedOperatorsByType[type].includes(node.operator)) {
      errors.push(`operator "${node.operator}" can not be applied here`)
      valid = false
    }

    return { valid, errors }
  },

  validateNode: function (node, fields) {
    const props = this.validateProperties(node)

    if (!props.valid) {
      return props
    }

    const propsPros = this.validatePropertiesProperties(node)
    const types = this.validateTypes(node)
    const compare = this.validateComparison(node)
    const operator = this.validateOperator(node)
    const value = this.validateValue(node, fields)

    return {
      valid: props.valid &&
        propsPros.valid &&
        types.valid &&
        compare.valid &&
        operator.valid &&
        value.valid,
      errors: [
        ...props.errors,
        ...propsPros.errors,
        ...types.errors,
        ...compare.errors,
        ...operator.errors,
        ...value.errors
      ]
    }
  },

  validate: function (instance, fields) {

    if (instance === null || instance === undefined) {
      return {valid: false, errors: ['missing "instance" parameter']};
    }

    if (fields === null || fields === undefined || typeof fields !== 'object') {
      return {valid: false, errors: ['missing "fields" parameter']};
    }

    let valid = true
    let errors = []

    const operationType = this.checkOperationType(instance)

    if (operationType === undefined) {
      valid = false
      errors.push('"operation type can not be determined')
    }

    if (operationType === 'single') {
      const currentNode = this.validateNode(instance, fields)

      if (currentNode.valid === false) {
        return {
          valid: currentNode.valid && valid,
          errors: [...currentNode.errors, ...errors]
        }
      }

      if (instance.compare.type === 'expression') {
        const nodeValidation = this.validate(instance.compare.value, fields)
        valid = valid && nodeValidation.valid
        errors = [...errors, ...nodeValidation.errors]
      }

      if (instance.compareTo.type === 'expression') {
        const nodeValidation = this.validate(instance.compareTo.value, fields)
        valid = valid && nodeValidation.valid
        errors = [...errors, ...nodeValidation.errors]
      }

      return {
        valid: currentNode.valid && valid,
        errors: [...currentNode.errors, ...errors]
      }
    }

    if (operationType === 'multiple') {

      const multiplePropertiesCheck = this.validateMultipleProperties(instance);

      if (multiplePropertiesCheck.valid === false) {
        return {
          valid: multiplePropertiesCheck.valid && valid,
          errors: [...multiplePropertiesCheck.errors, ...errors]
        }
      }

      instance.conditions.forEach((condition) => {
        const result = this.validate(condition, fields)
        valid = valid && result.valid,
        errors = [...errors, ...result.errors]
      })
    }

    return { valid, errors }
  }
}
