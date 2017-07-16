/* @flow */
import {
  all,
  curry,
  equals,
  filter,
  identity,
  map,
  reduce,
} from 'ramda'

/**
 *
 * @param {Function} successFn callback function in case of valid input
 * @param {Function} failFn callback function in case of invalid input
 * @param {Array} input
 * @returns {*}
 */
const transform = (successFn: Function, failFn: Function, input: Array<any>): any => {
  const valid = all(equals(true), input)
  return valid ? successFn() : failFn(filter(a => a !== true, input))
}

/**
 *
 * @param {Function} predicate validation function to apply inputs on
 * @param {String|Function} errorMsg error message to return in case of fail
 * @param {*} value the actual value
 * @param {Object} inputs the input object - in case the predicate function needs access to dependent values
 * @returns {Boolean}
 */
const runPredicate = ([predicate, errorMsg]:[Function, string],
  value:any,
  inputs:Object) => predicate(value, inputs) // eslint-disable-line no-nested-ternary
  ? true
  : typeof errorMsg === 'function'
    ? errorMsg(value)
    : errorMsg

/**
 *
 * @param {Function} successFn callback function in case of valid input
 * @param {Function} failFn callback function in case of invalid input
 * @param {Object} spec the rule object
 * @param {Object} input the validation input data
 * @returns {{}}
 */
export const validate = curry((successFn: Function, failFn: Function, spec: Object, input: Object): Object =>
  reduce((result, key) => {
    const value = input[key]
    const predicates = spec[key]
    if (Array.isArray(predicates)) {
      return { ...result, [key]: transform(() => successFn(value), failFn, map(f => runPredicate(f, value, input), predicates)) }
    } else if (typeof predicates === 'object') {
      return { ...result, [key]: validate(successFn, failFn, predicates, value) }
    } else if (typeof predicates === 'function') {
      const rules = predicates(value)
      return { ...result, [key]: validate(successFn, failFn, rules, value) }
    } else {
      return { ...result, [key]: successFn([]) }
    }
  }, {}, Object.keys(input)))

/**
 *
 * @param {Object} spec the rule object
 * @param {Object} input the validation input data
 * @returns {{}}
 */
const spected = (spec: Object, input: Object): Object =>
  validate(() => true, identity, spec, input)

export default curry(spected)
