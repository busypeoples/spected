# Spected

### Validation Library

__Spected__ is a low level validation library for validating objects against defined validation rules.
Framework specific validation libraries can be built upon __spected__, leveraging the __spected__ appraoch of separating the speciific input from any validation.
Furthermore it can be used to verify the validity deeply nested objects, f.e. server side validation of data or client side validation of JSON objects.
__Spected__ can also be used to validate Form inputs etc. 


### Getting started

Install Spected via npm or yarn.


```
npm install --save spected
```

### Use Case
__Spected__ takes care of running your predicate functions against provided inputs, by separating the validation from the input.
For example we would like to define a number of validation rules for two inputs, _name_ and _random_.

```javascript
const validationRules = {
  name: [
    [ isGreaterThan(5),
      `Minimum Name length of 6 is required.`
    ],
  ],
  random: [
    [ isGreaterThan(7), 'Minimum Random length of 8 is required.' ],
    [ hasCapitalLetter, 'Random should contain at least one uppercase letter.' ],
  ]
}
```
And imagine this is our input data.

```javascript
const inputData = { name 'abcdef', random: 'z'}
```

We would like to have a result that displays any possible errors.

Calling validate `validate(successFn, failFn, inputData, validationRules)`
should return
```javascript
{name: true, 
 random: [
    'Minimum Random length of 8 is required.', 
    'Random should contain at least one uppercase letter.' 
]}
```

### Basic Example

```js

import {
  compose,
  curry,
  head,
  isEmpty,
  length,
  not,
  prop,
} from 'ramda'

import spected from '../src/'

const validate = spected(() => true, head) // return the first error message

// predicates

const notEmpty = compose(not, isEmpty)
const hasCapitalLetter = a => /[A-Z]/.test(a)
const isGreaterThan = curry((len, a) => (a > len))
const isLengthGreaterThan = len => compose(isGreaterThan(len), prop('length'))


// error messages

const notEmptyMsg = field => `${field} should not be empty.`
const minimumMsg = (field, len) => `Minimum ${field} length of ${len} is required.`
const capitalLetterMag = field => `${field} should contain at least one uppercase letter.`

// rules

const nameValidationRule = [[notEmpty, notEmptyMsg('Name')]]

const randomValidationRule = [
  [isLengthGreaterThan(2), minimumMsg('Random', 3)],
  [hasCapitalLetter, capitalLetterMag('Random')],
]

const validationRules = {
  name: nameValidationRule,
  random: randomValidationRule,
}

validate(validationRules, {name: 'foo', random: 'Abcd'})
// {name: true, random: true}

```

### Advanced
A spec can be composed of other specs, enabling to define deeply nested structures to validate against nested input.
Let's see this in form of an example.


```js
const locationSpec = {
    street: [...], 
    city: [...],
    zip: [...],
    country: [...],
}

const userSpec = {
    userName: [...],
    lastName: [...],
    firstName: [...],
    location: locationSpec,
    settings: {
        profile: {
            design: {
                color: [...]
                background: [...],
            }
        }
    }
}   
```

Now we can validate against a deeply nested data structure.

### Advanced Example

```js

import {
  compose,
  indexOf,
  head,
  isEmpty,
  length,
  not,
} from 'ramda'

import spected from '../src/'

const validate = spected(() => true, head) // return the first error message

const colors = ['green', 'blue', 'red']
const notEmpty = compose(not, isEmpty)
const minLength = a => b => length(b) > a
const hasPresetColors = x => indexOf(x, colors) !== -1

// Messages

const notEmptyMsg = field => `${field} should not be empty.`
const minimumMsg = (field, len) => `Minimum ${field} length of ${len} is required.`

const spec = {
  id: [[notEmpty, notEmptyMsg('id')]],
  userName: [[notEmpty, notEmptyMsg('userName')], [minLength(5), minimumMsg('UserName', 6)]],
  address: {
    street: [[notEmpty, notEmptyMsg('street')]],
  },
  settings: {
    profile: {
      design: {
        color: [[notEmpty, notEmptyMsg('color')], [hasPresetColors, 'Use defined colors']],
        background: [[notEmpty, notEmptyMsg('background')], [hasPresetColors, 'Use defined colors']],
      },
    },
  },
}

const input = {
  id: 1,
  userName: 'Random',
  address: {
    street: 'Foobar',
  },
  settings: {
    profile: {
      design: {
        color: 'green',
        background: 'blue',
      },
    },
  },
}

validate(spec, input)

/* {
      id: true,
      userName: true,
      address: {
        street: true,
      },
      settings: {
        profile: {
          design: {
            color: true,
            background: true,
          },
        },
      },
    }
*/
```

### Further Information

For a deeper understanding of the underlying ideas and concepts:

[Form Validation As A Higher Order Component Pt.1](https://medium.com/javascript-inside/form-validation-as-a-higher-order-component-pt-1-83ac8fd6c1f0)

### Credits
Written by [A.Sharif](https://twitter.com/sharifsbeat)

Original idea and support by [Stefan Oestreicher](https://twitter.com/thinkfunctional)

### License

MIT

