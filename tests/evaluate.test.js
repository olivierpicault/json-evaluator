import evaluate from '../lib/evaluate'

[{
  instance: {
    compare: { value: 'hello' },
    compareTo: { value: 'hello' },
    operator: '==',
  },
  expected: true,
}, {
  instance: {
    compare: { value: 'hello' },
    compareTo: { value: 'hi' },
    operator: '==',
  },
  expected: false,
}, {
  instance: {
    compare: { value: 'hello' },
    compareTo: { value: 'hello' },
    operator: '!=',
  },
  expected: false,
}, {
  instance: {
    compare: { value: 'hi' },
    compareTo: { value: 'hello' },
    operator: '!=',
  },
  expected: true,
}, {
  instance: {
    compare: { value: 0 },
    compareTo: { value: 1 },
    operator: '==',
  },
  expected: false,
}, {
  instance: {
    compare: { value: 0 },
    compareTo: { value: 1 },
    operator: '!=',
  },
  expected: true,
}, {
  instance: {
    compare: { value: 0 },
    compareTo: { value: 1 },
    operator: '>=',
  },
  expected: false,
}, {
  instance: {
    compare: { value: 0 },
    compareTo: { value: 1 },
    operator: '<=',
  },
  expected: true,
}, {
  instance: {
    compare: { value: 0 },
    compareTo: { value: 1 },
    operator: '>',
  },
  expected: false,
}, {
  instance: {
    compare: { value: 0 },
    compareTo: { value: 1 },
    operator: '<',
  },
  expected: true,
}, {
  instance: {
    compare: { value: true },
    compareTo: { value: true },
    operator: '==',
  },
  expected: true,
}, {
  instance: {
    compare: { value: true },
    compareTo: { value: false },
    operator: '==',
  },
  expected: false,
}, {
  instance: {
    compare: { value: true },
    compareTo: { value: true },
    operator: '&&',
  },
  expected: true,
}, {
  instance: {
    compare: { value: true },
    compareTo: { value: false },
    operator: 'and',
  },
  expected: false,
}, {
  instance: {
    compare: { value: false },
    compareTo: { value: true },
    operator: '||',
  },
  expected: true,
}, {
  instance: {
    compare: { value: true },
    compareTo: { value: false },
    operator: 'or',
  },
  expected: true,
}].forEach((testCase) => {
  test('Evaluate single basic', () => {
    expect(evaluate.evaluateSingle(testCase.instance)).toEqual(testCase.expected);
  });
});

test('Evaluate single with expression', () => {
  const instance = {
    compare: {
      type: 'expression',
      value: {
        compare: {
          type: 'number',
          value: 0,
        },
        compareTo: {
          type: 'number',
          value: 1,
        },
        operator: '>',
      },
    },
    compareTo: {
      type: 'boolean',
      value: true,
    },
    operator: '&&',
  };
  expect(evaluate.evaluateSingle(instance)).toEqual(false);
});

test('Evaluate single with expression 2', () => {
  const instance = {
    compare: {
      type: 'expression',
      value: {
        compare: {
          type: 'number',
          value: 23,
        },
        compareTo: {
          type: 'number',
          value: 77,
        },
        operator: '<=',
      },
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
        operator: '!=',
      },
    },
    operator: '==',
  };
  expect(evaluate.evaluateSingle(instance)).toEqual(true);
});

test('Evaluate single with fields', () => {

});

test('Evaluate multiple 1', () => {
  const instance = {
    operator: 'and',
    conditions: [
      {
        compare: {
          type: 'string',
          value: 'olivier',
        },
        compareTo: {
          type: 'string',
          value: 'oliver'
        },
        operator: '=='
      },
      {
        compare: {
          type: 'number',
          value: 12,
        },
        compareTo: {
          type: 'number',
          value: 14,
        },
        operator: '!='
      },
      {
        compare: {
          type: 'string',
          value: 'cup',
        },
        compareTo: {
          type: 'string',
          value: 'mug',
        },
        operator: '=='
      },
    ],
  }
  expect(evaluate.evaluateMultiple(instance)).toEqual(false);
});

test('Evaluate multiple 2', () => {
  const instance = {
    operator: 'or',
    conditions: [
      {
        compare: {
          type: 'string',
          value: 'olivier',
        },
        compareTo: {
          type: 'string',
          value: 'oliver'
        },
        operator: '=='
      },
      {
        compare: {
          type: 'number',
          value: 12,
        },
        compareTo: {
          type: 'number',
          value: 14,
        },
        operator: '!='
      },
      {
        compare: {
          type: 'string',
          value: 'cup',
        },
        compareTo: {
          type: 'string',
          value: 'mug',
        },
        operator: '=='
      },
    ],
  }
  expect(evaluate.evaluateMultiple(instance)).toEqual(true);
});

test('Evaluate multiple 2', () => {
  const instance = {
    operator: 'or',
    conditions: [
      {
        compare: {
          type: 'string',
          value: 'olivier',
        },
        compareTo: {
          type: 'string',
          value: 'oliver'
        },
        operator: '=='
      },
      {
        compare: {
          type: 'number',
          value: 12,
        },
        compareTo: {
          type: 'number',
          value: 14,
        },
        operator: '!='
      },
      {
        compare: {
          type: 'string',
          value: 'cup',
        },
        compareTo: {
          type: 'string',
          value: 'mug',
        },
        operator: '=='
      },
    ],
  }
  expect(evaluate.evaluateMultiple(instance)).toEqual(true);
});

test('Evaluate 1', () => {
  const instance = {
    compare: {
      type: 'string',
      value: 'olivier'
    },
    compareTo: {
      type: 'string',
      value: 'oliver'
    },
    operator: '=='
  }

  expect(evaluate.evaluate(instance)).toEqual(false);
});

test('Evaluate 2', () => {
  const instance = {
    conditions: [
      {
        compare: {
          type: 'string',
          value: 'olivier'
        },
        compareTo: {
          type: 'string',
          value: 'oliver'
        },
        operator: '!='
      },
      {
        compare: {
          type: 'string',
          value: 'olivier'
        },
        compareTo: {
          type: 'string',
          value: 'oliver'
        },
        operator: '!='
      }
    ],
    operator: 'and'
  }

  expect(evaluate.evaluate(instance)).toEqual(true);
});

test('Evaluate 3', () => {
  const instance = {
    conditions: [
      {
        compare: {
          type: 'string',
          value: 'olivier'
        },
        compareTo: {
          type: 'string',
          value: 'arnaud'
        },
        operator: '!='
      },
      {
        compare: {
          type: 'string',
          value: 'olivier'
        },
        compareTo: {
          type: 'string',
          value: 'olivier'
        },
        operator: '!='
      }
    ],
    operator: 'or'
  }

  expect(evaluate.evaluate(instance)).toEqual(true);
});