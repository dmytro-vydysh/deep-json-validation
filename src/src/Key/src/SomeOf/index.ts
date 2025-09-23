import { JVKeyError, throwError } from "../../../../src/Error";
import { IJVKey, JVKey } from "../..";
import { TJVKeyType } from "../..";

export interface IJVKeySomeOf { }
export interface IJVKeySomeOfJSON {
  type: 'some';
  null: boolean;
  config: Array<ReturnType<IJVKey['json']>>;
}
export class JVSomeOf implements IJVKey {
  public type: TJVKeyType = 'some';
  public null: boolean = false;
  private conf: Array<IJVKey>;
  constructor(conf: Array<IJVKey>) {
    this.conf = conf;
  }
  public setConf(conf: Array<IJVKey>): JVSomeOf {
    if (!Array.isArray(conf))
      throwError(JVKeyError, `The config must be an array of JVKey. Received "${typeof conf}".`, '');
    this.conf = conf;
    return this;
  }
  private testingMessage(value: any, trace: Array<string>): void {
    try {
      if (process.env.JSON_VALIDATOR_TESTING_MODE_KEY === 'yes i am testing') {
        console.log(`[TESTING][ARRAY][TYPE: ${this.conf.map(c => c.type).join(',').toString().toUpperCase()}][VALIDATE][TRACE: ${trace}]`, value)
      }
    } catch (e) { }
  }
  public validate(value: any, trace: Array<string>, _throwError: boolean = true): boolean {
    this.testingMessage(value, trace);
    let valid = false;
    try {
      valid = this.conf.map(c => c.validate(value, trace, false)).some(Boolean);
    } catch (e) {
      valid = false;
    }
    if (!valid && _throwError)
      throwError(JVKeyError, `The value is not valid for any of the provided configurations.`, trace.join('/'));
    return valid;
  }

  template() {
    return [
      this.conf.map(c => c.template())
    ];
  }
  public path(trace: Array<string>) {
    return this.conf.map(c => c.path(trace));
  }
  public json(): IJVKeySomeOfJSON {
    return {
      type: 'some',
      null: this.null,
      config: this.conf.map(c => c.json())
    };
  }
  public example() {
    return [this.conf.map(c => c.example())];
  }
  public exampleWithRules() {
    return [this.conf.map(c => c.exampleWithRules())];
  }
  public static fromJSON(json: IJVKeySomeOfJSON): JVSomeOf {
    const conf = json.config.map(k => JVKey.keyFromJSON(k));
    return new JVSomeOf(conf);
  }
}