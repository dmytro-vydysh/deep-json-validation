import { JVError, JVKeyError, JVKeyRegexError, JVKeyRequiredError, throwError } from "../../../../src/Error";
import { IJVKey, TJVItemOfType } from "../..";
import { TJVKeyType } from "../..";


export interface IJVBigInt {
  min?: bigint;
  max?: bigint;
  _enum?: TJVItemOfType<bigint> | null
}
export interface IJVKeyBigIntJSON {
  type: 'bigint';
  null: boolean;
  min?: bigint;
  max?: bigint;
  enum?: TJVItemOfType<bigint> | null;
}

export class JVBigInt implements IJVKey, IJVBigInt {
  public null: boolean = false;
  public min?: bigint;
  public max?: bigint;
  public type: string = 'bigint';
  public _enum?: TJVItemOfType<bigint> | null = null;
  constructor(_null?: boolean, min?: bigint, max?: bigint, _enum?: TJVItemOfType<bigint>) {
    this.null = _null ? _null : false;
    min && this.setMin(min);
    max && this.setMax(max);
    _enum && this.setEnum(_enum);
    _null && this.setNull(_null);
    this.min = min;
    this.max = max;
    this._enum = _enum === null ? null : (typeof _enum === 'undefined' ? null : _enum);

    if (typeof this._enum !== 'boolean' && Array.isArray(this._enum)) {
      if (this._enum.length === 0)
        throwError(JVKeyError, `[CONSTRUCTOR] Key has _enum with no items. Expected at least one item.`, '');
      if (this._enum.some((item: bigint) => typeof item !== 'bigint'))
        throwError(JVKeyError, `[CONSTRUCTOR] Key has _enum with some invalid item. Expected all items to be of type "bigint".`, '');
    }
  }
  public setMin(value: bigint): JVBigInt {
    if (typeof value !== 'number')
      throwError(JVKeyError, `The min value must be a number. Received "${typeof value}".`, '');
    if (this.max && this.max > 0 && value > this.max)
      throwError(JVKeyError, `The min value "${value}" is greater than the max value "${this.max}".`, '');
    this.min = value;
    return this;
  }
  public setMax(value: bigint): JVBigInt {
    if (typeof value !== 'number')
      throwError(JVKeyError, `The max value must be a number. Received "${typeof value}".`, '');
    if (this.min && this.min > 0 && value < this.min)
      throwError(JVKeyError, `The max value "${value}" is less than the min value "${this.min}".`, '');
    this.max = value;
    return this;
  }
  public setEnum(value: TJVItemOfType<bigint> | null): JVBigInt {
    if (typeof value !== 'undefined' && value !== null && !Array.isArray(value))
      throwError(JVKeyError, `The enum value must be an array or null. Received "${typeof value}".`, '');
    if (value && value.length === 0)
      throwError(JVKeyError, `The enum value cannot be an empty array.`, '');
    if (value && value.some((item: bigint) => typeof item !== 'bigint'))
      throwError(JVKeyError, `The enum value has some invalid items. Expected all items to be of type "bigint".`, '');
    this._enum = value;
    return this;
  }
  public setNull(value: boolean = true): JVBigInt {
    if (typeof value !== 'boolean')
      throwError(JVKeyError, `The null value must be a boolean. Received "${typeof value}".`, '');
    this.null = value;
    return this;
  }
  private testingMessage(value: any, trace: Array<string>): void {
    try {
      if (process.env.JSON_VALIDATOR_TESTING_MODE_KEY === 'yes i am testing') {
        console.log(`[TESTING][BIGINT][VALIDATE][TRACE: ${trace}]`, value)
      }
    } catch (e) { }
  }
  public validate(value: any, trace: Array<string>): boolean {
    this.testingMessage(value, trace);
    if (this.null && value === null)
      return true;
    try {
      BigInt(value);
    } catch (e) {
      throwError(JVKeyError, `The Bigint has value "${value}". Expected value to be of type "bigint".`, trace.join('.'));
    }
    if (typeof this.min !== 'undefined' && value < BigInt(this.min))
      throwError(JVKeyError, `The value "${value}" is less than the minimum value "${this.min}".`, trace.join('.'));
    if (typeof this.max !== 'undefined' && value > BigInt(this.max))
      throwError(JVKeyError, `The value "${value}" is greater than the maximum value "${this.max}".`, trace.join('.'));
    if (typeof this._enum !== 'boolean' && Array.isArray(this._enum) && !this._enum.includes(BigInt(value.toString())))
      throwError(JVKeyError, `The value "${value}" is not one of the allowed values: "${this._enum.join(',')}".`, trace.join('.'));
    return true;
  }
  public json(): IJVKeyBigIntJSON {
    return {
      type: 'bigint',
      null: this.null,
      min: this.min,
      max: this.max,
      enum: typeof this._enum !== 'boolean' && Array.isArray(this._enum) ? this._enum : null
    };
  }
  public example() {
    return BigInt(123456789123456789n).toString();
  }

  template() { return ''; }
  public path(trace: Array<string>) { return trace.join('/'); }
  public exampleWithRules() {
    let hasMin = typeof this.min === 'number' ? `Must be greater than ${this.min}` : '';
    let hasMax = typeof this.max === 'number' ? `Must be less than ${this.max}` : '';
    let isNull = this.null ? 'Can be null' : 'Cannot be null';
    let enumValues = this._enum ? `Allowed values: ${this._enum.join(', ')}` : '';
    return `A bigint, Must be passed as a string, ${[hasMin, hasMax, isNull, enumValues].filter(Boolean).join(', ')}.`;
  }
  public static fromJSON(json: IJVKeyBigIntJSON): JVBigInt {
    const _enum = typeof json.enum !== 'undefined' && json.enum !== null ? json.enum : undefined;
    return new JVBigInt(json.null, json.min, json.max, _enum);
  }
}