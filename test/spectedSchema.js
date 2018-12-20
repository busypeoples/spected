import { expect } from 'chai';
import { clean } from '../src/spectedSchema';

const simpleSchema = require('./simpleSchema.json');
const allOfSchema = require('./allOfSchema.json');

describe('spected-schema', () => {
  describe('simpleSchemas', () => {
    it('should return the data without changes if no rules are specified', () => {

      const data = {
        id: 'testId',
        name: 'testName',
      };
      const result = clean(simpleSchema, data);

      expect(result).to.deep.equal(data);
    });
    it('should insert the default property if the value is missing', () => {
      const data = {
        name: 'testName',
      };
      const result = clean(simpleSchema, data);
      expect(result)
        .to
        .deep
        .equal({
          id: 'defaultId',
          name: 'testName',
        });
    });
  });
  describe('allOf schema', () => {
    it('should return the data unchanged if no rules are specified', () => {
      const data = {
        id: 'testId',
        name: 'testName',
        email: 'test@email.com',
      };
      const result = clean(allOfSchema, data);
      expect(result).to.deep.equal(data);
    });
  });
});
