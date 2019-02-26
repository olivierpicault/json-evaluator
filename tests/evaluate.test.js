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
  test('Evaluate basic', () => {
    expect(evaluate(testCase.instance)).toEqual(testCase.expected);
  });
});

test('Evaluate with expression', () => {
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
  expect(evaluate(instance)).toEqual(false);
});

test('Evaluate with expression 2', () => {
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
  expect(evaluate(instance)).toEqual(true);
});
