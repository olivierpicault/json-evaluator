# json-evaluator

The aim of the json is to produce a boolean

## Installation

### Yarn
```
yarn add json-evaluator
```

### NPM
```
npm i json-evaluator
```

## Usage

## How does the json work ?

The json needs 3 properties:
- a value to compare
- a value to compare to
- an operator

```
{
    "compare": {},
    "compareTo": {},
    "operator": ""
}
```

A value is defined by two properties:
- The type of the value
- The value itself

```
{
    "type": "",
    "value: "",
}
```

Obviously:
- the type and the value have to match
- the operator has to be one of the allowed as well 

Allowed types are:
- string
- number
- boolean 
- expression
- field

An `expression` is simply another node to compare, the value is thus the object you want to evaluate.

A `field` can be used to give an external value. External values can be given through a dictionnary. The value will then be the dictionnary key that holds the value.

Allowed operators are:
- `>`
- `<=`
- `>`
- `>=`
- `==`
- `!=`
- `||`
- `&&`
- `or`
- `and`

They obviously can't be applied to all types.

## Examples

### Not all operators match

#### Bad
```
{
  "compare": {
    "type": "string",
    "value": "olivier"
},
{
  "compareTo": {
    "type": "string",
    "value": "arnaud"
},
"operator": ">="
```
This will produce an error

#### Good
```
{
  "compare": {
    "type": "string",
    "value": "olivier"
},
{
  "compareTo": {
    "type": "string",
    "value": "arnaud"
},
"operator": "=="
```
This will produce (bool) false

### Type and value have to match

#### Bad
```
{
  "compare": {
    "type": "string",
    "value": 14
}
```

#### Good
```
{
  "compare": {
    "type": "number",
    "value": 14
  }
}
```


### "Expression" type
```
{
  "compare": {
    "type": "expression",
    "value": {
      "compare": {
        "type": "string",
        "value": "olivier"
      },
      "compareTo": {
        "type": "string",
        "value": "arnaud"
      },
      "operator": "=="
    }
  },
  "compareTo": {
    "type": "boolean",
    "value": true
  },
  "operator": "&&"
}
````
This will produce (bool) false because:
- "olivier" == "arnaud" is false
- true && false is false
