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
const inputData = { name: 'abcdef', random: 'z'}
```

We would like to have a result that displays any possible errors.

Calling validate `spected(validationRules, inputData)`
should return

```javascript
{name: true, 
 random: [
    'Minimum Random length of 8 is required.', 
    'Random should contain at least one uppercase letter.' 
]}
```

You can also pass in an array of items as an input and validate that all are valid. 
You need to write the appropriate function to handle any specific case.

```javascript
const userSpec = [
  [ 
    items => all(isLengthGreaterThan(5), items), 
    'Every item must have have at least 6 characters!'
  ]
]

const validationRules = {
  id: [[ notEmpty, notEmptyMsg('id') ]],
  users: userSpec,
}

const input = {
  id: 4,
  users: ['foobar', 'foobarbaz']
}

spected(validationRules, input)

```

##### Validating Dynamic Data
There are cases where a validation has to run against an unkown number of items. f.e. submitting a form with dynamic fields.
These dynamic fields can be an array or as object keys.

```js

const input = {
  id: 4,
  users: [
    {firstName: 'foobar', lastName: 'action'},
    {firstName: 'foo', lastName: 'bar'},
    {firstName: 'foobar', lastName: 'Action'},
  ]
}

```

All `users` need to run against the same spec.

```js

const capitalLetterMsg = 'Capital Letter needed.'

const userSpec = {
  firstName: [[isLengthGreaterThan(5), minimumMsg('firstName', 6)]],
  lastName: [[hasCapitalLetter, capitalLetterMsg]],
}

```

As we're only dealing with functions, map over `userSpec` and run the predicates against every collection item.

```js

const validationRules = {
  id: [[ notEmpty, notEmptyMsg('id') ]],
  users: map(always(userSpec)),
}

spected(validationRules, input)

```

In case of an object containing an unknown number of properties, the approach is the following.

```js

const input = {
  id: 4,
  users: {
    one: {firstName: 'foobar', lastName: 'action'},
    two: {firstName: 'foo', lastName: 'bar'},
    three: {firstName: 'foobar', lastName: 'Action'},
  }
}

```

Spected can also work with functions instead of an `[predFn, errorMsg]` tuple array, which means one can specify a function 
that expects the input and then maps every rule to the object. Note: This example uses Ramda `map`, which expects the 
function as the first argument and then always returns the UserSpec for every property. 

```js

const validationRules = {
  id: [[ notEmpty, notEmptyMsg('id') ]],
  users: map(() => userSpec)),
}

```

How `UserSpec` is applied to every Object key is not spected specific, but can be freely implemented as needed.

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

import spected from 'spected'

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

spected(validationRules, {name: 'foo', random: 'Abcd'})
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

import spected from 'spected'

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

spected(spec, input)

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

### Custom Transformations
In case you want to change the way errors are displayed, you can use the low level `validate` function, which expects a success and a failure
callback in addition to the rules and input.

```js
import {validate} from 'spected'
const verify = validate(
    () => true, // always return true
    head // return first error message head = x => x[0]   
)
const spec = {
  name: [
    [isNotEmpty, 'Name should not be  empty.']
  ],
  random: [
    [isLengthGreaterThan(7), 'Minimum Random length of 8 is required.'],
    [hasCapitalLetter, 'Random should contain at least one uppercase letter.'],
  ]
}

const input = {name: 'foobar', random: 'r'}

verify(spec, input)
 
//  {
//      name: true, 
//      random: 'Minimum Random length of 8 is required.',
//  }
   

```

Check the [API documentation](docs/API.md) for further information.


### Further Information

For a deeper understanding of the underlying ideas and concepts:

[Form Validation As A Higher Order Component Pt.1](https://medium.com/javascript-inside/form-validation-as-a-higher-order-component-pt-1-83ac8fd6c1f0)

### Credits
Written by [A.Sharif](https://twitter.com/sharifsbeat)

Original idea and support by [Stefan Oestreicher](https://twitter.com/thinkfunctional)

#### Documentation
[API](docs/API.md)

### License

MIT

