/* @flow */
import {
  all,
  curry,
  equals,
  filter,
  identity,
  map,
  reduce,
  compose,
} from 'ramda';

const simpleTypes = [
  'string',
  'number',
  'integer',
];

export class Jss {
  constructor(opts = {}) {
    const {
      rules = {},
    } = opts;
    this.rules = { ...rules };
    this.clean = this.clean.bind(this);
    this.compileRules = this.compileRules.bind(this);
    this.applyRules = this.applyRules.bind(this);
  }

  addRule = (name, handler) => {
    if (typeof this.rules[name] !== 'undefined') {
      throw new Error('A rule with the same name already exists');
    }
    this.rules[name] = handler;
  };

  compileRules = rulesConfig => {
    if (!Array.isArray(rulesConfig)) {
      throw new Error('Improperly configured. Rules should be an array of values');
    }
    const handlers = rulesConfig.map(config => {
      if (Array.isArray(config)) {
        if (config.length !== 2) {
          throw new Error('Improperly configured. If a rule is specified as an array it should have length 2.');
        }
        const ruleHandler = this.rules[config[0]];
        return curry(ruleHandler, config[0]);
      }
      else {
        const ruleHandler = this.rules[config];
        return ruleHandler;
      }
    });

    const combinedHandler = compose(...handlers);
    return combinedHandler;
  };

  applyRules = (rulesConfig, data) => {
    const handler = this.compileRules(rulesConfig);
    return handler(data);
  };


  clean = (schema: Object, data, required) => {
    if (simpleTypes.indexOf(schema.type) > -1) {
      if (!required && typeof data === 'undefined' && schema.default) {
        return schema.default;
      }
      if (required && typeof data === 'undefined') {
        throw new Error('Invalid data');
      }
      if (schema.rules) {
        return this.applyRules(schema.rules, data);
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
        const cleanedPart = this.clean(propsSchema, nextData, isRequired);
        cleaned[propKey] = cleanedPart;
      });
      return cleaned;
    }
    else if (schema.allOf) {
      // Collect all properties
      let cleanedParts = {};
      schema.allOf.forEach(subSchema => {
        const cleanedPart = this.clean(subSchema, data);
        cleanedParts = { ...cleanedParts, ...cleanedPart };
      });
      return cleanedParts;
    }
    else if (schema.anyOf) {
      console.log('Skipping validation because of anyOf keyword');
      return data;
    }
    else if (schema.oneOf) {
      console.log('Skipping validation because of oneOf keyword');
      return data;
    }

    if (schema.type === 'array') {
      return data.map(value => this.clean(schema.items, value));
    }

    throw new Error('Unsupported schema');
  };
  // clean = clean;
  // compileRules = compileRules;
  // applyRules = applyRules;
}
