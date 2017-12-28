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
  inputs:Object, field:string) => predicate(value, inputs) // eslint-disable-line no-nested-ternary
  ? true
  : typeof errorMsg === 'function'
    ? errorMsg(value, field)
    : errorMsg

/**
 *
 * @param {Function} successFn callback function in case of valid input
 * @param {Function} failFn callback function in case of invalid input
 * @param {Object} spec the rule object
 * @param {Object|Function} input the validation input data
 * @returns {{}}
 */
export const validate = curry((successFn: Function, failFn: Function, spec: Object, input: Object): Object => {
  const inputFn = typeof input === 'function' ? input : (key?: string) => key ? input : input
  const keys = Object.keys(inputFn())
  return reduce((result, key) => {
    const inputObj = inputFn(key)
    const value = inputObj[key]
    const predicates = spec[key]
    if (Array.isArray(predicates)) {
      return { ...result, [key]: transform(() => successFn(value), failFn, map(f => runPredicate(f, value, inputObj, key), predicates)) }
    } else if (typeof predicates === 'object') {
      return { ...result, [key]: validate(successFn, failFn, predicates, value) }
    } else if (typeof predicates === 'function') {
      const rules = predicates(value)
      return { ...result, [key]: validate(successFn, failFn, rules, value) }
    } else {
      return { ...result, [key]: successFn([]) }
    }
  }, {}, keys)
})

/**
 *
 * @param {Object} spec the rule object
 * @param {Object} input the validation input data
 * @returns {{}}
 */
const spected = validate(() => true, identity)

export default spected
