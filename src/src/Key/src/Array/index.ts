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
  private _min?: number;
  private _max?: number;
  constructor(conf: IJVKey, min?: number, max?: number) {
    this.conf = conf;
    this.type = conf.type;
    this.null = conf.null;
    min && this.setMin(min);
    max && this.setMax(max);
  }
  public setMin(value?: number): JVArray {
    if (typeof value === 'undefined') {
      this._min = undefined;
      return this;
    }
    if (typeof value !== 'number')
      throwError(JVKeyError, `The min value must be a number. Received "${typeof value}".`, '');
    if (this._max && this._max > 0 && value > this._max)
      throwError(JVKeyError, `The min value "${value}" is greater than the max value "${this._max}".`, '');
    this._min = value;
    return this;
  }
  public min = this.setMin;
  public setMax(value?: number): JVArray {
    if (typeof value === 'undefined') {
      this._max = undefined;
      return this;
    }
    if (typeof value !== 'number')
      throwError(JVKeyError, `The max value must be a number. Received "${typeof value}".`, '');
    if (this._min && this._min > 0 && value < this._min)
      throwError(JVKeyError, `The max value "${value}" is less than the min value "${this._min}".`, '');
    this._max = value;
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
  public config = this.setConf;
  private testingMessage(value: any, trace: Array<string>): void {
    try {
      if (process.env.JSON_VALIDATOR_TESTING_MODE_KEY === 'yes i am testing') {
        console.log(`[TESTING][ARRAY][TYPE: ${this.conf.type.toString().toUpperCase()}][VALIDATE][TRACE: ${trace}]`, value)
      }
    } catch (e) { }
  }
  public validate(value: any, trace: Array<string>, _throwError: boolean = true): boolean {
    this.testingMessage(value, trace);
    if (!Array.isArray(value))
      if (_throwError)
        throwError(JVKeyError, `The value is not an array. Expected value is Array.`, trace.join('/'));
      else return false;
    if (typeof this._min === 'number' && value.length < this._min)
      if (_throwError)
        throwError(JVKeyError, `The array has length "${value.length}". Expected length is at least "${this._min}".`, trace.join('/'));
      else return false;
    if (typeof this._max === 'number' && value.length > this._max)
      if (_throwError)
        throwError(JVKeyError, `The array has length "${value.length}". Expected length is at most "${this._max}".`, trace.join('/'));
      else return false;
    for (let i = 0; i < value.length; i++)
      if (!(this.conf.validate(value[i], [...trace, i.toString()], _throwError)))
        if (_throwError)
          throwError(JVKeyError, `The item at index ${i} is invalid.`, [...trace, i.toString()].join('.'));
        else return false;
    return true;
  }

  template() {
    return [
      this.conf.template()
    ];
  }
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