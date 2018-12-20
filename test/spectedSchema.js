import { expect } from 'chai';
import sinon from 'sinon';
import { Jss } from '../src/spectedSchema';

const simpleSchema = require('./simpleSchema.json');
const simpleSchemaWithRules = require('./simleWithRules.json');

const allOfSchema = require('./allOfSchema.json');
const arraySchema = require('./arraySchema');
const complexArraySchema = require('./complexArraySchema.json');

describe('spected-schema', () => {
  describe('Jss', () => {
    it('should have empty rules if called with no arguments', () => {
      const jss = new Jss();
      expect(jss.rules).to.deep.equal({});
    });
    it('should load rules with the addRule method', () => {
      const jss = new Jss();
      const handler = sinon.spy();
      jss.addRule('name', handler);
      expect(jss).to.have.property('rules').to.deep.equal({
        name: handler,
      });
    });
    it('should load rules by using the rules option', () => {
      const handler = sinon.spy();
      const rules = {
        name: handler,
      };
      const jss = new Jss({ rules });
      expect(jss).to.have.property('rules').to.deep.equal({
        name: handler,
      });
    });
  });
  describe('simpleSchemas', () => {
    it('should return the data without changes if no rules are specified', () => {
      const data = {
        id: 'testId',
        name: 'testName',
      };
      const jss = new Jss();
      const result = jss.clean(simpleSchema, data);
      expect(result).to.deep.equal(data);
    });
    it('should insert the default property if the value is missing', () => {
      const data = {
        name: 'testName',
      };
      const jss = new Jss();
      const result = jss.clean(simpleSchema, data);
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
      const jss = new Jss();
      const result = jss.clean(allOfSchema, data);
      expect(result).to.deep.equal(data);
    });
  });
  describe('type === array', () => {
    it('should clean simple array elements', () => {
      const data = [
        'a',
        'b',
      ];
      const jss = new Jss();
      const result = jss.clean(arraySchema, data);
      expect(result).to.deep.equal(data);
    });
    it('should complex array elements', () => {
      const data = {
        names: [
          {
            firstName: 'fn1',
            lastName: 'ln1',
          },
          {
            firstName: 'fn2',
            lastName: 'ln2',
          },
        ],
        ids: [
          'a',
          'b',
        ],
      };
      const jss = new Jss();
      const result = jss.clean(complexArraySchema, data);
      expect(result).to.deep.equal(data);
    });
  });
  it.skip('should throw on unsupported schemas', () => {
  });
  it.skip('should throw on invalid data', () => {
  });
  describe('should apply single config (TODO fix) rules', () => {
    it('should apply rules on a leaf node', () => {
      const data = {
        id: 'testId',
        name: 'testName',
      };
      const jss = new Jss();
      const handler = sinon.stub().callsFake(x => x);
      jss.addRule('trim', handler);

      jss.clean(simpleSchemaWithRules, data);
      sinon.assert.calledOnce(handler);
      sinon.assert.calledWith(handler, 'testName');
    });
  });
});
