import { JVKeyError, throwError } from "../../../../src/Error";
import { IJVKey, JVKey } from "../..";
import { TJVKeyType } from "../..";

export interface IJVArray { }
export interface IJVKeyArrayJSON {
  type: 'array';
  null: boolean;
  min?: number;
  max?: number;
  config: ReturnType<IJVKey['json']>;
}
export class JVArray implements IJVKey {
  public type: TJVKeyType = 'array';
  public null: boolean = false;
  private conf: IJVKey;
  private min?: number;
  private max?: number;
  constructor(conf: IJVKey, min?: number, max?: number) {
    this.conf = conf;
    this.type = conf.type;
    this.null = conf.null;
    min && this.setMin(min);
    max && this.setMax(max);
  }
  public setMin(value: number): JVArray {
    if (typeof value !== 'number')
      throwError(JVKeyError, `The min value must be a number. Received "${typeof value}".`, '');
    if (this.max && this.max > 0 && value > this.max)
      throwError(JVKeyError, `The min value "${value}" is greater than the max value "${this.max}".`, '');
    this.min = value;
    return this;
  }
  public setMax(value: number): JVArray {
    if (typeof value !== 'number')
      throwError(JVKeyError, `The max value must be a number. Received "${typeof value}".`, '');
    if (this.min && this.min > 0 && value < this.min)
      throwError(JVKeyError, `The max value "${value}" is less than the min value "${this.min}".`, '');
    this.max = value;
    return this;
  }
  public setConf(conf: IJVKey): JVArray {
    if (!(conf instanceof JVKey))
      throwError(JVKeyError, `The config must be an instance of JVKey. Received "${typeof conf}".`, '');
    this.conf = conf;
    this.type = conf.type;
    this.null = conf.null;
    return this;
  }
  private testingMessage(value: any, trace: Array<string>): void {
    try {
      if (process.env.JSON_VALIDATOR_TESTING_MODE_KEY === 'yes i am testing') {
        console.log(`[TESTING][ARRAY][TYPE: ${this.conf.type.toString().toUpperCase()}][VALIDATE][TRACE: ${trace}]`, value)
      }
    } catch (e) { }
  }
  public validate(value: any, trace: Array<string>): boolean {
    this.testingMessage(value, trace);
    if (!Array.isArray(value))
      throwError(JVKeyError, `The value is not an array. Expected value is Array.`, trace.join('.'));
    if (typeof this.min === 'number' && value.length <= this.min)
      throwError(JVKeyError, `The array has length "${value.length}". Expected length is at least "${this.min}".`, trace.join('.'));
    if (typeof this.max === 'number' && value.length >= this.max)
      throwError(JVKeyError, `The array has length "${value.length}". Expected length is at most "${this.max}".`, trace.join('.'));
    for (let i = 0; i < value.length; i++)
      if (!(this.conf.validate(value[i], [...trace, i.toString()])))
        throwError(JVKeyError, `The item at index ${i} is invalid.`, [...trace, i.toString()].join('.'));
    return true;
  }

  template() { return [
    this.conf.template()
  ]; }
  public path(trace: Array<string>) {
    return this.conf.path(trace);//trace.join('/').concat('[aaa]'); 
  }
  public json(): IJVKeyArrayJSON {
    return {
      type: 'array',
      null: this.null,
      config: this.conf.json()
    };
  }
  public example() {
    return [this.conf.example()];
  }
  public exampleWithRules() {
    return [this.conf.exampleWithRules()];
  }
  public static fromJSON(json: IJVKeyArrayJSON): JVArray {
    const conf = JVKey.keyFromJSON(json.config);
    return new JVArray(conf, json.min, json.max);
  }
}