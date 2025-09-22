import { JVKeyError, throwError } from "../../../../src/Error";
import { IJVKey } from "../..";
import { JV } from "../../../../src/JsonValidator";
export interface IJVClass { }
export interface IJVKeyClassJSON {
  type: 'class';
  class: string;
  null: boolean;
}
export class JVClass implements IJVClass, IJVKey {
  public type: { class: Function } | string;
  public null: boolean;
  constructor(type: { class: Function } | string, _null: boolean = false) {
    this.type = type;
    this.null = _null;
  }
  private testingMessage(value: any, trace: Array<string>): void {
    try {
      if (process.env.JSON_VALIDATOR_TESTING_MODE_KEY === 'yes i am testing') {
        console.log(`[TESTING][CLASS][VALIDATE][TRACE: ${trace}]`, value)
      }
    } catch (e) { }
  }
  public validate(value: any, trace: Array<string>, _throwError: boolean = true): boolean {
    this.testingMessage(value, trace);
    if (this.null && value === null)
      return true;
    if (typeof value !== 'object') {
      if (_throwError)
        throwError(JVKeyError, `[CONSTRUCTOR] The instance has type "${typeof value}". Expected type is "object".`, trace.join('/'));
      else return false;
    }
    if (this.type === 'string') {
      const _class = JV.getClass(this.type) as Function;
      if (!_class)
        if (_throwError)
          throwError(JVKeyError, `[CONSTRUCTOR] The class "${this.type}" is not registered in JV.`, trace.join('/'));
        else return false;
      if ((value instanceof _class) === false) {
        if (_throwError)
          throwError(JVKeyError, `[CONSTRUCTOR] The instance is not an instance of "${this.type}".`, trace.join('/'));
        else return false;
      }
    } else if (typeof this.type !== 'string' && (value instanceof this.type.class) === false) {
      if (_throwError)
        throwError(JVKeyError, `[CONSTRUCTOR] The instance is not an instance of "${this.type.class.name}".`, trace.join('/'));
      else return false;
    }
    return true;
  }
  public setNull(value: boolean = true): JVClass {
    if (typeof value !== 'boolean')
      throwError(JVKeyError, `The null value must be a boolean. Received "${typeof value}".`, '');
    this.null = value;
    return this;
  }
  public nullable(nullable: boolean = true) {
    return this.setNull(nullable);
  }
  public json(): IJVKeyClassJSON {
    if (typeof this.type !== 'string')
      throw new JVKeyError(`You cannot serialize a class key using real classes.`);
    return {
      type: 'class',
      class: this.type,
      null: this.null
    };
  }
  public static fromJSON(json: IJVKeyClassJSON): JVClass {
    if (json.type !== 'class')
      throwError(JVKeyError, `The type of the key must be "class". Received "${json.type}".`, '');
    return new JVClass(json.class, json.null);
  }
  template() { return ''; }

  public path(trace: Array<string>) { return trace.join('/'); }
  public example() {
    throw new JVKeyError(`You cannot create an example for a class key.`);
  }
  public exampleWithRules() {
    throw new JVKeyError(`You cannot create an example with rules for a class key.`);
  }
}
