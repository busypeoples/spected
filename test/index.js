import { equal, deepEqual } from 'assert'
import {
  compose,
  curry,
  head,
  indexOf,
  isEmpty,
  length,
  partial,
  not,
  path,
  prop,
} from 'ramda'

import spected from '../src/'

const validate = spected(() => true, head)

// Predicates

const colors = ['green', 'blue', 'red']
const notEmpty = compose(not, isEmpty)
const minLength = a => b => length(b) > a
const hasPresetColors = x => indexOf(x, colors) !== -1
const hasCapitalLetter = a => /[A-Z]/.test(a)
const isGreaterThan = curry((len, a) => (a > len))
const isLengthGreaterThan = len => compose(isGreaterThan(len), prop('length'))
const isEqual = compareKey => (a, all) => a === all[compareKey]

// Messages

const notEmptyMsg = field => `${field} should not be empty.`
const minimumMsg = (field, len) => `Minimum ${field} length of ${len} is required.`
const capitalLetterMag = field => `${field} should contain at least one uppercase letter.`
const equalMsg = (field1, field2) => `${field2} should be equal with ${field1}`

// Rules

const nameValidationRule = [[notEmpty, notEmptyMsg('Name')]]

const randomValidationRule = [
  [isLengthGreaterThan(2), minimumMsg('Random', 3)],
  [hasCapitalLetter, capitalLetterMag('Random')],
]

const passwordValidationRule = [
  [isLengthGreaterThan(5), minimumMsg('Password', 6)],
  [hasCapitalLetter, capitalLetterMag('Password')],
]

const repeatPasswordValidationRule = [
  [isLengthGreaterThan(5), minimumMsg('RepeatedPassword', 6)],
  [hasCapitalLetter, capitalLetterMag('RepeatedPassword')],
  [isEqual('password'), equalMsg('Password', 'RepeatPassword')],
]

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

describe('spected', () => {

  it('should return an error when invalid', () => {
    const validationRules = {
      name: nameValidationRule,
    }
    const result = validate(validationRules, {name: ''})
    deepEqual({name: notEmptyMsg('Name')}, result)
  })

  it('should return true for field when valid', () => {
    const validationRules = {
      name: nameValidationRule,
    }
    const result = validate(validationRules, {name: 'foo'})
    deepEqual({name: true}, result)
  })

  it('should handle multiple validations and return the correct errors', () => {
    const validationRules = {
      name: nameValidationRule,
      random: randomValidationRule,
    }
    const result = validate(validationRules, {name: 'foo', random: 'A'})
    deepEqual({name: true, random: minimumMsg('Random', 3)}, result)
  })

  it('should handle multiple validations and return true for all fields when valid', () => {
    const validationRules = {
      name: nameValidationRule,
      random: randomValidationRule,
    }
    const result = validate(validationRules, {name: 'foo', random: 'Abcd'})
    deepEqual({name: true, random: true}, result)
  })

  it('should enable to validate to true if two form field values are equal', () => {
    const validationRules = {
      password: passwordValidationRule,
      repeatPassword: repeatPasswordValidationRule,
    }
    const result = validate(validationRules, {password: 'fooBar', repeatPassword: 'fooBar'})
    deepEqual({password: true, repeatPassword: true}, result)
  })

  it('should enable to validate to falsy if two form field values are not equal', () => {
    const validationRules = {
      password: passwordValidationRule,
      repeatPassword: repeatPasswordValidationRule,
    }
    const result = validate(validationRules, {password: 'fooBar', repeatPassword: 'fooBarBaz'})
    deepEqual({password: true, repeatPassword: equalMsg('Password', 'RepeatPassword')}, result)
  })

  it('should skip validation if no predicate function is provided.', () => {
    const validationRules = {
      password: [],
    }
    const result = validate(validationRules, {password: 'fooBar'})
    deepEqual({password: true}, result)
  })


  it('should skip validation if no predicate function is provided and other fields have rules', () => {
    const validationRules = {
      password: [],
      repeatPassword: repeatPasswordValidationRule,
    }
    const result = validate(validationRules, {password: 'fooBar', repeatPassword: 'fooBarBaz'})
    deepEqual({password: true, repeatPassword: equalMsg('Password', 'RepeatPassword')}, result)
  })

  it('should return true when no predicates are defined for an input', () => {
    const validationRules = {
      password: [],
      repeatPassword: [],
    }
    const result = validate(validationRules, {password: '', repeatPassword: ''})
    deepEqual({password: true, repeatPassword: true}, result)
  })

  it('should neglect key ordering', () => {
    const validationRules = {
      repeatPassword: repeatPasswordValidationRule,
      password: passwordValidationRule,
    }
    const result = validate(validationRules, {password: 'fooBar', repeatPassword: 'foobarbaZ'})
    deepEqual({password: true, repeatPassword: equalMsg('Password', 'RepeatPassword')}, result)
  })

  it('should return true when missing validations', () => {
    const validationRules = {
      password: passwordValidationRule,
    }
    const result = validate(validationRules, {password: 'fooBar', repeatPassword: 'foobarbaZ'})
    deepEqual({password: true, repeatPassword: true}, result)
  })

  it('should skip missing inputs', () => {
    const validationRules = {
      password: passwordValidationRule,
      repeatPassword: repeatPasswordValidationRule,
    }
    const result = validate(validationRules, {password: 'fooBar'})
    deepEqual({password: true}, result)
  })

  it('should handle deeply nested inputs', () => {
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

    const result = validate(spec, input)
    deepEqual({
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
    }, result)
  })

  it('should return true when no predicates are defined for a nested input', () => {
    const repeatDeepPasswordValidationRule = [
      [isLengthGreaterThan(5), minimumMsg('RepeatedPassword', 6)],
      [hasCapitalLetter, capitalLetterMag('RepeatedPassword')],
      [(a, all) => path(['user', 'password'], all) == a, equalMsg('Password', 'RepeatPassword')],
    ]

    const validationRules = {
      user: {
        password: passwordValidationRule,
        repeatPassword: repeatDeepPasswordValidationRule,
      },
    }
    const result = validate(validationRules, {user: {password: 'foobarR', repeatPassword: 'foobar', random: 'bar'}})
    deepEqual({
      user: {
        password: true,
        repeatPassword: capitalLetterMag('RepeatedPassword'),
        random: true,
      }
    }, result)
  })

  it('should skip missing nested inputs', () => {
    const repeatDeepPasswordValidationRule = [
      [isLengthGreaterThan(5), minimumMsg('RepeatedPassword', 6)],
      [hasCapitalLetter, capitalLetterMag('RepeatedPassword')],
      [(a, all) => path(['user', 'password'], all) == a, equalMsg('Password', 'RepeatPassword')],
    ]

    const validationRules = {
      user: {
        password: passwordValidationRule,
        repeatPassword: repeatDeepPasswordValidationRule,
      },
    }
    const result = validate(validationRules, {user: {password: 'foobarR'}})
    deepEqual({
      user: {
        password: true,
      }
    }, result)
  })

})
