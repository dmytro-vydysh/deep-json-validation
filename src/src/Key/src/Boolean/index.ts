import { JVKeyError, throwError } from "../../../../src/Error";
import { IJVKey } from "../..";


/**
 * Interface for the JVBoolean key type
 * The JVBoolean key type validates boolean values.
 */
export interface IJVBoolean { }
export interface IJVKeyBooleanJSON {
  type: 'boolean';
  null: boolean;
}

export class JVBoolean implements IJVKey, IJVBoolean {
  public null: boolean = false;
  public type: string = 'boolean';
  constructor(_null?: boolean) {
    _null && this.setNull(_null);
  }
  public setNull(value: boolean = true): JVBoolean {
    if (typeof value !== 'boolean')
      throwError(JVKeyError, `The null value must be a boolean. Received "${typeof value}".`, '');
    this.null = value;
    return this;
  }

  private testingMessage(value: any, trace: Array<string>): void {
    try {
      if (process.env.JSON_VALIDATOR_TESTING_MODE_KEY === 'yes i am testing') {
        console.log(`[TESTING][BOOLEAN][VALIDATE][TRACE: ${trace}]`, value)
      }
    } catch (e) { }
  }
  public validate(value: any, trace: Array<string>): boolean {
    this.testingMessage(value, trace);
    if (this.null && value === null)
      return true;
    if (typeof value !== this.type)
      throwError(JVKeyError, `The boolean has type "${typeof value}". Expected type is "boolean".`, trace.join('.'));
    return true;
  }
  public json(): IJVKeyBooleanJSON {
    return {
      type: 'boolean',
      null: this.null
    };
  }
  public static fromJSON(json: IJVKeyBooleanJSON): JVBoolean {
    if (json.type !== 'boolean')
      throwError(JVKeyError, `The type of the key must be "boolean". Received "${json.type}".`, '');
    return new JVBoolean(json.null);
  }

  template() { return ''; }
  public path(trace: Array<string>) { return trace.join('/'); }
  public example() {
    return [false, true][Math.floor(Math.random() * 2)];
  }
  public exampleWithRules() {
    let isNull = this.null ? 'Can be null' : 'Cannot be null';
    return `A boolean, ${[isNull].filter(Boolean).join(', ')}.`;
  }
}