# API

## `spected(rules, input)`

Validates data input against a set of validation rules and returns a result object containing error information for every provided data field.
Also works with deep nested objects. `spected` is curried.

#### Arguments

1. `rules` *(Object)*: An object of rules, consisting of arrays containing predicate function / error message tuple, f.e. `{name: [[a => a.length > 2, 'Minimum length 3.']]}`.
The error message can also be a function with this signature: `(value, key) => message`

2. `input` *(Object|Function)*: The data to be validated.

Depending on the status of the input either a `true` or a list of error messages is returned.

#### Returns
(Object): An object containing the validation result.

```js
{
    name: true,
    random: [
        'Minimum Random length of 8 is required.',
        'Random should contain at least one uppercase letter.'
    ]
}
```

#### Example

```js
import spected from 'spected'

const capitalLetterMsg = (value, key) => `The field ${key} should contain at least one uppercase letter. '${value}' is missing an uppercase letter.`

const spec = {
  name: [
    [isNotEmpty, 'Name should not be  empty.']
  ],
  random: [
    [isLengthGreaterThan(7), 'Minimum Random length of 8 is required.'],
    [hasCapitalLetter, capitalLetterMsg],
  ]
}

const input = {name: 'foobar', random: 'r'}

spected(spec, input)

//  {
//      name: true,
//      random: [
//          'Minimum Random length of 8 is required.',
//          'The field random should contain at least one uppercase letter. 'r' is missing an uppercase letter.'
//      ]
//  }


```

## `validate(successFn, errorFn, rules, input)`

Validates data input against a set of validation rules and returns a result object containing error information for every provided data field.
Additionally requires success and failure callback to transform the results as needed.
Also works with deep nested objects. `validate` is curried and is internally used by `spected`
with a default success function `() => true` and a default failure function `errors => errors`.

#### Arguments

1. `successFn` *(Function)*: Transform the result as needed, transformer is called when an input is valid.
The result is passed to the callback enabling to return the original input value if needed.

```js
const successFn = () => true
{name: true, random: ['error...']}

const successFn = val => val
{name: 'original value', random: ['error...']}
```

2. `failFn` *(Function)*: Transform the result as needed, transformer is called when an input is invalid. Recieves an array of error messages.

```js
const failFn = (errorMsgs) => head(errorMsgs)
// {name: true, random: 'something is missing'}


const failFn = (errorMsgs) => errorMsgs
// {name: true, random: ['something is missing', 'some other error...']}

```

3. `rules` *(Object)*: An object of rules, consisting of arrays containing predicate function / error message tuple, f.e. `{name: [[a => a.length > 2, 'Minimum length 3.']]}`

4. `input` *(Object|Function)*: The data to be validated.


#### Returns
(Object): An object containing the validation result.

```js
{
    name: true,
    random: [
        'Minimum Random length of 8 is required.',
        'Random should contain at least one uppercase letter.'
    ]
}
```

#### Example

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

Spected also accepts a function as an input, to simulate if an input would contain errors if empty.

```
const verify = validate(a => a, a => a)
const validationRules = {
  name: nameValidationRule,
}
const input = {name: 'foobarbaz'}
const result = verify(validationRules, key => key ? ({...input, [key]: ''}) : input)
deepEqual({name: ['Name should not be empty.']}, result)

```
