/* @flow */
import {
  all,
  curry,
  equals,
  filter,
  identity,
  map,
  reduce,
} from 'ramda';

const applyRules = (rules, data) => {
  return data;
};

const simpleTypes = [
  'string',
  'number',
  'integer',
];

export const clean = (schema: Object, data, required) => {
  if (simpleTypes.indexOf(schema.type) > -1) {
    if (!required && typeof data === 'undefined' && schema.default) {
      return schema.default;
    }
    if (schema.rules) {
      return applyRules(schema.rules, data);
    }
    return data;
  }
  if (schema.properties) {
    // Clean properties
    const cleaned = {};
    const requiredProps = schema.required || [];

    Object.keys(schema.properties).forEach(propKey => {
      const propsSchema = schema.properties[propKey];
      const nextData = data[propKey];
      const isRequired = requiredProps.indexOf(propKey) > -1;
      const cleanedPart = clean(propsSchema, nextData, isRequired);
      cleaned[propKey] = cleanedPart;
    });
    return cleaned;
  }
  else if (schema.allOf) {
    // Collect all properties
    let cleanedParts = {};
    schema.allOf.forEach(subSchema => {
      const cleanedPart = clean(subSchema, data);
      cleanedParts = { ...cleanedParts, ...cleanedPart };
    });
    return cleanedParts;
  }
  else if (schema.anyOf) {
    // Collect all properties
  }
};
