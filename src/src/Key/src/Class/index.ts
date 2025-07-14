import { JVKeyError, throwError } from "../../../../src/Error";
import { IJVKey } from "../..";
export interface IJVClass { }
export interface IJVKeyClassJSON {
  type: { class: Function };
  null: boolean;
}
export class JVClass implements IJVClass, IJVKey {
  public type: { class: Function };
  public null: boolean;
  constructor(type: { class: Function }, _null: boolean = false) {
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
  public validate(value: any, trace: Array<string>): boolean {
    this.testingMessage(value, trace);
    if (this.null && value === null)
      return true;
    if (typeof value !== 'object')
      throwError(JVKeyError, `[CONSTRUCTOR] The instance has type "${typeof value}". Expected type is "object".`, trace.join('.'));

    if ((value instanceof this.type.class) === false)
      throwError(JVKeyError, `[CONSTRUCTOR] The instance is not an instance of "${this.type.class.name}".`, trace.join('.'));
    return true;
  }
  public json(): IJVKeyClassJSON {
    throw new JVKeyError(`You cannot serialyze a class key.`);
    return {
      type: this.type,
      null: this.null
    };
  }
  public static fromJSON(json: IJVKeyClassJSON): JVClass {
    throw new JVKeyError(`You cannot deserialyze a class key.`);
  }
  template() { return ''; }
  
  public path(trace:Array<string>) { return trace.join('/'); }
  public example() {
    throw new JVKeyError(`You cannot create an example for a class key.`);
  }
  public exampleWithRules() {
    throw new JVKeyError(`You cannot create an example with rules for a class key.`);
  }
}
