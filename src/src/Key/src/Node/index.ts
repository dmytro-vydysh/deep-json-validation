import { JV } from "../../../../src/JsonValidator";
import { JVError, JVKeyError, JVKeyRegexError, JVKeyRequiredError, JVKeyTypeError, throwError } from "../../../../src/Error";
import { IJVKey, IJVKeyJSON } from "../..";


export interface IJVNode { }


export interface IJVKeyNodeJSON {
  type: 'node';
  null: boolean;
  json: { type: 'object'; keys: Array<IJVKeyJSON> };
}

export class JVNode implements IJVNode, IJVKey {
  public type: JV;
  public null: boolean = false;
  constructor(type: JV, _null: boolean = false) {
    this.type = type;
    _null && this.setNull(_null);
  }
  public setNull(value: boolean = true): JVNode {
    if (typeof value !== 'boolean')
      throwError(JVKeyError, `The null value must be a boolean. Received "${typeof value}".`, '');
    this.null = value;
    return this;
  }
  private testingMessage(value: any, trace: Array<string>): void {
    try {
      if (process.env.JSON_VALIDATOR_TESTING_MODE_KEY === 'yes i am testing') {
        console.log(`[TESTING][NODE][VALIDATE][TRACE: ${trace}]`, value)
      }
    } catch (e) { }
  }
  public validate(value: any, trace: Array<string>): boolean {
    this.testingMessage(value, trace);
    if (value === null) {
      if (this.null)
        return true;
      throwError(JVKeyTypeError, `The value for the key must be type of "object". Received null.`, trace.join('.'));
    }
    if (typeof value !== 'object')
      throwError(JVKeyTypeError, `The value for the key must be type of "object". Received type "${typeof value}".`, trace.join('.'));
    if (!(this.type instanceof JV))
      if (typeof this.type !== 'function')
        throwError(JVKeyTypeError, `The instance of the key must be  of "JV". Received an unknown instance.`, trace.join('.'));
      else
        throwError(JVKeyTypeError, `The instance of the key must be  of "JV". Received instance of  "${(this.type as Function).name}".`, trace.join('.'));
    return this.type.validate(value, trace);
  }
  public json(): IJVKeyNodeJSON {
    return {
      type: 'node',
      null: this.null,
      json: this.type instanceof JV ? this.type.json() : { type: 'object', keys: [] }
    };
  }


  public path(trace: Array<string>): Record<string, any> | string {
    return this.type.path(trace);
  }
  public example() {
    return this.type.example()
  }
  template() { return this.type.template(); }
  public exampleWithRules() {
    return this.type.exampleWithRules()
  }
  public static fromJSON(json: IJVKeyNodeJSON): JVNode {
    if (json.type !== 'node')
      throwError(JVKeyError, `The type of the key must be "object". Received "${json.type}".`, '');
    const type = JV.fromJSON(json.json);
    return new JVNode(type, json.null);
  }
}