const allowedTypes = ['string', 'number', 'boolean', 'expression', 'field'];

/*
**  Check object has all the needed properties
*/
export function validateProperties(node) {
  const errors = [];
  let valid = true;

  if (!Object.prototype.hasOwnProperty.call(node, 'compare')) {
    errors.push('"compare" property is missing');
    valid = false;
  } else if ((typeof node.compare) !== 'object') {
    errors.push('"compare" must be an object');
  }

  if (!Object.prototype.hasOwnProperty.call(node, 'compareTo')) {
    errors.push('"compareTo" property is missing');
    valid = false;
  } else if ((typeof node.compareTo) !== 'object') {
    valid = false;
    errors.push('"compareTo" must be an object');
  }

  if (!Object.prototype.hasOwnProperty.call(node, 'operator')) {
    errors.push('"operator" property is missing');
    valid = false;
  } else if ((typeof node.operator) !== 'string') {
    errors.push('"operator" must be a string');
    valid = false;
  }

  return { valid, errors };
}

/*
**  Validate "compare" and "compareTo" objects have all the needed properties
*/
export function validatePropertiesProperties(node) {
  const errors = [];
  let valid = true;

  ['compare', 'compareTo'].forEach((prop) => {
    ['type', 'value'].forEach((propProp) => {
      if (!Object.prototype.hasOwnProperty.call(node[prop], propProp)) {
        valid = false;
        errors.push(`"${propProp}" property is missing from "${prop}"`);
      }
    });
  });

  return { valid, errors };
}

/*
**  Check types given are allowed
*/
export function validateTypes(node) {
  const errors = [];
  let valid = true;

  if (!(allowedTypes.includes(node.compare.type) && allowedTypes.includes(node.compareTo.type))) {
    valid = false;
    errors.push(`"type" must be one of ${allowedTypes.join(', ')}`);
  }

  return { valid, errors };
}

/*
**  Check we are comparing two comparable types
*/
export function validateComparison(node) {
  const errors = [];
  let valid = true;

  // Wildcard for 'field'
  // 'field' can be any type and we don't know it in advance
  if (node.compare.type === 'field' || node.compareTo.type === 'field') {
    return { valid: true, errors: [] };
  }

  // 'Expression' can only be compare to a boolean or another 'expression'
  if (node.compare.type === 'expression' || node.compareTo.type === 'expression') {
    if (node.compare.type === 'expression' && !['expression', 'boolean'].includes(node.compareTo.type)) {
      errors.push('"expression" type can only be compared to "boolean" or "expression" types');
      valid = false;
    }
    if (node.compareTo.type === 'expression' && !['expression', 'boolean'].includes(node.compare.type)) {
      errors.push('"expression" type can only be compared to "boolean" or "expression" types');
      valid = false;
    }
  }
  // Besides 'expression' case all other types should be compare to the same type
  else if (node.compare.type !== node.compareTo.type) {
    errors.push('You are not comparing the same types for "compare" and "compareTo"');
    valid = false;
  }

  return { valid, errors };
}

/*
**  Check value is the right type
*/
export function validateValue(node, fields) {
  const errors = [];
  let valid = true;

  const compareType = node.compare.type;
  const compareToType = node.compareTo.type;

  const specialTypes = ['expression', 'field'];

  // Basic cases
  if ((!specialTypes.includes(compareType))
    && allowedTypes.includes(compareType)
    && (typeof node.compare.value) !== compareType) {
    valid = false;
    errors.push(`"${node.compare.value}" is not "${compareType}"`);
  }
  if ((!specialTypes.includes(compareToType))
    && allowedTypes.includes(compareToType)
    && (typeof node.compareTo.value) !== compareToType) {
    valid = false;
    errors.push(`"${node.compareTo.value}" is not "${compareToType}"`);
  }

  // Special cases: expression
  if (compareType === 'expression' && (typeof node.compare.value) !== 'object') {
    valid = false;
    errors.push(`"${node.compare.value}" is not "${compareType}"`);
  }
  if (compareToType === 'expression' && (typeof node.compareTo.value) !== 'object') {
    valid = false;
    errors.push(`"${node.compareTo.value}" is not "${compareToType}"`);
  }

  // // Special cases: field
  if (compareType === 'field' && (!(Object.prototype.hasOwnProperty.call(fields, node.compare.value)))) {
    valid = false;
    errors.push(`"${node.compare.value}" is not a valid field value`);
  }
  if (compareToType === 'field' && (!(Object.prototype.hasOwnProperty.call(fields, node.compareTo.value)))) {
    valid = false;
    errors.push(`"${node.compareTo.value}" is not a valid field value`);
  }

  return { valid, errors };
}

/*
**  Check operator is allowed for the given type
*/
export function validateOperator(node) {
  const errors = [];
  let valid = true;

  const type = node.compare.type;
  const toType = node.compareTo.type;

  const allowedOperatorsByType = {
    string: ['==', '!='],
    number: ['==', '!=', '>', '>=', '<', '<='],
    boolean: ['==', '!=', '&&', '||', 'and', 'or'],
    expression: ['==', '!=', '&&', '||', 'and', 'or'],
    field: [],
  };

  // "flatten" all the arrays within 'allowedOperatorsByType' ...
  let operators = [].concat(...Object.values(allowedOperatorsByType));
  // ... and remove duplicates
  operators = operators.filter((element, index, self) => index === self.indexOf(element));

  // Wildcard
  if (type === 'field' && toType === 'field' && operators.includes(node.operator)) {
    return { valid: true, errors: [] };
  }

  // Validation based on the type that is not 'field'
  // (You can not imagine how the following lines are actually pure art)
  if (type === 'field' && toType !== 'field' && Object.keys(allowedOperatorsByType).includes(toType)) {
    allowedOperatorsByType.field = allowedOperatorsByType[toType];
  } else if (type !== 'field' && toType === 'field' && Object.keys(allowedOperatorsByType).includes(type)) {
    allowedOperatorsByType.field = allowedOperatorsByType[type];
  }

  if (type === undefined || type === null || type === '' || !(type in allowedOperatorsByType)) {
    return { valid: false, errors: [`Type "${type}" is not defined in the validator`] };
  }

  if (!allowedOperatorsByType[type].includes(node.operator)) {
    errors.push(`operator "${node.operator}" can not be applied here`);
    valid = false;
  }

  return { valid, errors };
}

export function validateNode(node, fields) {
  const props = validateProperties(node);

  if (!props.valid) {
    return props;
  }

  const propsPros = validatePropertiesProperties(node);
  const types = validateTypes(node);
  const compare = validateComparison(node);
  const operator = validateOperator(node);
  const value = validateValue(node, fields);

  return {
    valid: props.valid
      && propsPros.valid
      && types.valid
      && compare.valid
      && operator.valid
      && value.valid,
    errors: [
      ...props.errors,
      ...propsPros.errors,
      ...types.errors,
      ...compare.errors,
      ...operator.errors,
      ...value.errors,
    ],
  };
}

export function validate(instance, fields) {
  let valid = true;
  let errors = [];

  const currentNode = validateNode(instance, fields);

  if (!currentNode.valid) {
    return { valid: currentNode.valid && valid, errors: [...currentNode.errors, ...errors] };
  }

  if (instance.compare.type === 'expression') {
    const nodeValidation = validate(instance.compare.value, fields);
    valid = valid && nodeValidation.valid;
    errors = [...errors, ...nodeValidation.errors];
  }

  if (instance.compareTo.type === 'expression') {
    const nodeValidation = validate(instance.compareTo.value, fields);
    valid = valid && nodeValidation.valid;
    errors = [...errors, ...nodeValidation.errors];
  }

  return { valid: currentNode.valid && valid, errors: [...currentNode.errors, ...errors] };
}
