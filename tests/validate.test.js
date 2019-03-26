import validator from '../lib/validate'

/*
**  Properties - Single
*/

[{
  node: {
    compare: { type: 'string', value: 'hello' },
    compareTo: { ype: 'string', alue: 'hello' },
    operator: '==',
  },
  result: true,
}, {
  node: {
    compareTo: { ype: 'string', value: 'hello' },
    operator: '==',
  },
  result: false,
}, {
  node: {
    compare: { type: 'string', value: 'hello' },
    operator: '==',
  },
  result: false,
}, {
  node: {
    compare: { type: 'string', value: 'hello' },
    compareTo: { type: 'string', alue: 'hello' },
  },
  result: false,
}].forEach((testCase) => {
  test('validate single properties', () => {
    expect(validator.validateProperties(testCase.node).valid).toEqual(testCase.result);
  });
});

/*
**  Properties - Multiple
*/

[
  { node: { conditions: [], operator: 'and' }, expected: true },
  { node: { conditions: {}, operator: 'and' }, expected: false },
  { node: { conditions: '', operator: 'and' }, expected: false },
  { node: { conditions: [], operator: 'or' }, expected: true },
  { node: { conditions: [], operator: 'OR' }, expected: true },
  { node: { conditions: [], operator: 'AND' }, expected: true },
  { node: { conditions: [], operator: '&&' }, expected: true },
  { node: { conditions: [], operator: '||' }, expected: true },
  { node: { conditions: 'hello', operator: 'hola' }, expected: false },
].forEach((testCase) => {
  test('validate multiple properties', () => {
    expect(validator.validateMultipleProperties(testCase.node).valid).toEqual(testCase.expected);
  })
});

/*
**  PROPERTIES PROPERTIES
*/
[{
  node: {
    compare: { type: '', value: '' },
    compareTo: { type: '', value: '' },
    operator: '',
  },
  result: true,
}, {
  node: {
    compare: { type: '' },
    compareTo: { type: '', value: '' },
    operator: '',
  },
  result: false,
}, {
  node: {
    compare: { value: '' },
    compareTo: { type: '', value: '' },
    operator: '',
  },
  result: false,
}, {
  node: {
    compare: { type: '', value: '' },
    compareTo: { value: '' },
    operator: '',
  },
  result: false,
}, {
  node: {
    compare: { type: '', value: '' },
    compareTo: { type: '' },
    operator: '',
  },
  result: false,
}].forEach((testCase) => {
  test('validatePropertiesProperties', () => {
    expect(validator.validatePropertiesProperties(testCase.node).valid).toEqual(testCase.result);
  });
});

/*
** TYPES
*/

test('validateTypes OK', () => {
  const node = {
    compare: {
      type: 'string',
      value: 'hello',
    },
    compareTo: {
      type: 'number',
      value: 'hello',
    },
    operator: '==',
  };
  expect(validator.validateTypes(node).valid).toEqual(true);
});

test('validateTypes KO', () => {
  const node = {
    compare: {
      type: 'string',
      value: 'hello',
    },
    compareTo: {
      type: 'strong',
      value: 'hello',
    },
    operator: '==',
  };
  expect(validator.validateTypes(node).valid).toEqual(false);
});

/*
**  COMPARISON
*/

[
  { type1: 'string', type2: 'string', result: true },
  { type1: 'string', type2: 'number', result: false },
  { type1: 'string', type2: 'boolean', result: false },
  { type1: 'string', type2: 'expression', result: false },
  { type1: 'number', type2: 'string', result: false },
  { type1: 'number', type2: 'number', result: true },
  { type1: 'number', type2: 'boolean', result: false },
  { type1: 'number', type2: 'boolean', result: false },
  { type1: 'boolean', type2: 'string', result: false },
  { type1: 'boolean', type2: 'number', result: false },
  { type1: 'boolean', type2: 'boolean', result: true },
  { type1: 'boolean', type2: 'expression', result: true },
  { type1: 'expression', type2: 'string', result: false },
  { type1: 'expression', type2: 'number', result: false },
  { type1: 'expression', type2: 'boolean', result: true },
  { type1: 'expression', type2: 'expression', result: true },
  { type1: 'field', type2: 'field', result: true },
].forEach((testCase) => {
  test('validateComparison OK', () => {
    const node = {
      compare: {
        type: testCase.type1,
        value: 'hello',
      },
      compareTo: {
        type: testCase.type2,
        value: 'hello',
      },
      operator: '==',
    };
    expect(validator.validateComparison(node).valid).toEqual(testCase.result);
  });
});

/*
**  VALUES
*/

[
  { type: 'string', value: 'coucou', expected: true },
  { type: 'string', value: 77, expected: false },
  { type: 'string', value: 'true', expected: true },
  { type: 'string', value: false, expected: false },
  { type: 'string', value: {}, expected: false },
  { type: 'number', value: 123, expected: true },
  { type: 'number', value: '123', expected: false },
  { type: 'boolean', value: true, expected: true },
  { type: 'boolean', value: false, expected: true },
  { type: 'boolean', value: 1, expected: false },
  { type: 'boolean', value: 0, expected: false },
  { type: 'boolean', value: 7, expected: false },
  { type: 'boolean', value: 'true', expected: false },
  { type: 'boolean', value: false, expected: true },
  { type: 'boolean', value: false, expected: true },
  { type: 'expression', value: {}, expected: true },
  { type: 'expression', value: '{}', expected: false },
  { type: 'expression', value: 'coucou', expected: false },
].forEach((testCase) => {
  test('validateValue', () => {
    const node = {
      compare: {
        type: testCase.type,
        value: testCase.value,
      },
      compareTo: {
        type: testCase.type,
        value: testCase.value,
      },
      operator: '>=',
    };
    expect(validator.validateValue(node, {}).valid).toBe(testCase.expected);
  });
});

test('ValidateValueWithFields KO', () => {
  const node = {
    compare: {
      type: 'field',
      value: 'username',
    },
    compareTo: {
      type: 'string',
      value: 'olivier',
    },
    operator: '==',
  };
  const fields = {
    user: 'oliver',
  };
  expect(validator.validateValue(node, fields).valid).toEqual(false);
});

test('ValidateValueWithFields KO', () => {
  const node = {
    compare: {
      type: 'string',
      value: 'hello',
    },
    compareTo: {
      type: 'field',
      value: 'olivier',
    },
    operator: '==',
  };
  const fields = {
    user: 'oliver',
  };
  expect(validator.validateValue(node, fields).valid).toEqual(false);
});

test('ValidateValueWithFields KO', () => {
  const node = {
    compare: {
      type: 'string',
      value: 'hello',
    },
    compareTo: {
      type: 'field',
      value: '',
    },
    operator: '==',
  };
  const fields = {
    user: 'oliver',
  };
  expect(validator.validateValue(node, fields).valid).toEqual(false);
});

test('ValidateValueWithFields OK', () => {
  const node = {
    compare: {
      type: 'field',
      value: 'username',
    },
    compareTo: {
      type: 'string',
      value: 'olivier',
    },
    operator: '==',
  };
  const fields = {
    username: 'oliver',
  };
  expect(validator.validateValue(node, fields).valid).toEqual(true);
});

/*
**  OPERATORS
*/

// Test allowed operators for 'number' type
['==', '!=', '<', '<=', '>', '>='].forEach((operator) => {
  test('validateOperator Number OK', () => {
    const node = {
      compare: {
        type: 'number',
        value: 12,
      },
      compareTo: {
        type: 'number',
        value: 1,
      },
      operator,
    };
    expect(validator.validateOperator(node).valid).toEqual(true);
  });
});

// Test not allowed operator for 'number' type
['&&', '||', 'and', 'or', 'chaise'].forEach((operator) => {
  test('validateOperator Number KO', () => {
    const node = {
      compare: {
        type: 'number',
        value: 12,
      },
      compareTo: {
        type: 'number',
        value: 1,
      },
      operator,
    };
    expect(validator.validateOperator(node).valid).toEqual(false);
  });
});

// Test allowed operators for 'string' type
['==', '!='].forEach((operator) => {
  test('validateOperator String OK', () => {
    const node = {
      compare: {
        type: 'string',
        value: 'hello',
      },
      compareTo: {
        type: 'string',
        value: 'hello',
      },
      operator,
    };
    expect(validator.validateOperator(node).valid).toEqual(true);
  });
});

// Test not allowed operators for 'string' type
['&&', 'and', '||', 'or', '<', '<=', '>', '>=', 'bachibouzouk'].forEach((operator) => {
  test('validateOperator String KO', () => {
    const node = {
      compare: {
        type: 'string',
        value: 'hello',
      },
      compareTo: {
        type: 'string',
        value: 'hello',
      },
      operator,
    };
    expect(validator.validateOperator(node).valid).toEqual(false);
  });
});

// Test allowed operator for both 'boolean' and 'expression' types
['==', '!=', 'and', '&&', 'or', '||'].forEach((operator) => {
  ['boolean', 'expression'].forEach((type) => {
    test('validateOperator Boolean/Expression OK', () => {
      const node = {
        compare: {
          type,
          value: '',
        },
        compareTo: {
          type,
          value: '',
        },
        operator,
      };
      expect(validator.validateOperator(node).valid).toEqual(true);
    });
  });
});

// Test not allowed operator for both 'boolean' and 'expression' types
['>', '>=', '<', '<=', 'fusée'].forEach((operator) => {
  ['boolean', 'expression'].forEach((type) => {
    test('validateOperator Boolean/Expression OK', () => {
      const node = {
        compare: {
          type,
          value: '',
        },
        compareTo: {
          type,
          value: '',
        },
        operator,
      };
      expect(validator.validateOperator(node).valid).toEqual(false);
    });
  });
});

[
  { type1: 'field', type2: 'string', operator: '==', expected: true },
  { type1: 'field', type2: 'string', operator: '&&', expected: false },
  { type1: 'number', type2: 'field', operator: '>=', expected: true },
  { type1: 'number', type2: 'field', operator: '||', expected: false },
  { type1: 'field', type2: 'field', operator: '&&', expected: true },
  { type1: 'field', type2: 'field', operator: '&&', expected: true },
  { type1: 'field', type2: 'field', operator: 'bachiouzouk', expected: false },
].forEach((testCase) => {
  test('validateOperator field', () => {
    const node = {
      compare: {
        type: testCase.type1,
        value: undefined,
      },
      compareTo: {
        type: testCase.type2,
        value: undefined,
      },
      operator: testCase.operator,
    };
    expect(validator.validateOperator(node).valid).toEqual(testCase.expected);
  });
});


/*
**  FULL HOUSE
*/

test('ValidateNode', () => {
  const node = {
    compare: {
      type: 'string',
      value: 'hello',
    },
    compareTo: {
      type: 'string',
      value: 'hello',
    },
    operator: '==',
  };
  expect(validator.validateNode(node)).toEqual({ valid: true, errors: [] });
});

test('ValidateNode 2', () => {
  const node = {
    compare: {
      type: 'string',
      value: 0,
    },
    compareTo: {
      type: 'string',
      value: 'hello',
    },
    operator: '==',
  };
  const result = validator.validateNode(node);
  expect(result.valid).toEqual(false);
  expect(result.errors.length).toBeGreaterThan(0);
});

test('Validate', () => {
  const node = {
    compare: {
      type: 'boolean',
      value: true,
    },
    compareTo: {
      type: 'expression',
      value: {
        compare: {
          type: 'string',
          value: 'hello',
        },
        compareTo: {
          type: 'string',
          value: 'hi',
        },
        operator: '==',
      },
    },
    operator: '==',
  };
  const result = validator.validate(node);
  expect(result.valid).toEqual(true);
  expect(result.errors.length).toStrictEqual(0);
});

test('Validate', () => {
  const node = {
    compare: {
      type: 'expression',
      value: {},
    },
    compareTo: {
      type: 'expression',
      value: {
        compare: {
          type: 'string',
          value: 'hello',
        },
        compareTo: {
          type: 'string',
          value: 'hi',
        },
        operator: '==',
      },
    },
    operator: '==',
  };
  const result = validator.validate(node);
  expect(result.valid).toEqual(false);
  expect(result.errors.length).toBeGreaterThan(0);
});