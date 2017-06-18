/* @flow */

/**
 *
 * @param {String} message
 */
export default function warning(message: string): void {
  if (console && console.warn) {
    console.warn(message)
  }
}
