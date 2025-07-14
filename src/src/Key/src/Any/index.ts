import { JVError, JVKeyError, JVKeyRegexError, JVKeyRequiredError } from "../../../../src/Error";
import { IJVKey, TJVItemOfType } from "../..";
import { TJVKeyType } from "../..";

/**Interface for the JVAny key type
 * The JVAny key type allows any value to be validated.
 */
export interface IJVAny { }
export interface IJVKeyAnyJSON {
  type: 'any';
  null: boolean;
}
export class JVAny implements IJVKey, IJVAny {
  public type: string = 'any';
  public null: boolean = true;
  constructor() {}
  private testingMessage(value: any, trace: Array<string>): void {
    try {
      if (process.env.JSON_VALIDATOR_TESTING_MODE_KEY === 'yes i am testing') {
        console.log(`[TESTING][ANY][VALIDATE][TRACE: ${trace}]`, value)
      }
    } catch (e) { }
  }
  public validate(value: any, trace: Array<string>): boolean { 
    this.testingMessage(value, trace);
    return true; 
  }
  
  template() { return ''; }
  public path(trace:Array<string>) { return trace.join('/'); }
  public json(): IJVKeyAnyJSON {
    return {
      type: 'any',
      null: this.null
    };
  }
  public static fromJSON(json: IJVKeyAnyJSON): JVAny {
    return new JVAny();
  }
  public example() {
    return 'Any seriazable value, including null.';
  }
  public exampleWithRules() {
    let isNull = this.null ? 'Can be null' : 'Cannot be null';
    return `Any seriazable value, ${[isNull].filter(Boolean).join(', ')}.`;
  }
}
