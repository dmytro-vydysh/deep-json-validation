import { JVKeyError, throwError } from "../../../../src/Error";
import { IJVKey, TJVItemOfType } from "../..";

export interface IJVNumber {
  null: boolean;
  min?: number;
  max?: number;
  _enum?: TJVItemOfType<number> | null;
}
export interface IJVKeyNumberJSON {
  type: 'number';
  null: boolean;
  min?: number;
  max?: number;
  enum?: null | TJVItemOfType<number>;
}
export class JVNumber implements IJVKey, IJVNumber {
  public null: boolean = false;
  public min?: number;
  public max?: number;
  public type: string = 'number';
  public _enum: TJVItemOfType<number> | null = null;
  constructor(_null?: boolean, min?: number, max?: number, _enum?: null | TJVItemOfType<number>) {
    _null && this.setNull(_null);
    min && this.setMin(min);
    max && this.setMax(max);
    _enum && this.setEnum(_enum);
    _null && this.setNull(_null);
  }
  public setMin(value: number): JVNumber {
    if (typeof value !== 'number')
      throwError(JVKeyError, `The min value must be a number. Received "${typeof value}".`, '');
    if (this.max && this.max > 0 && value > this.max)
      throwError(JVKeyError, `The min value "${value}" is greater than the max value "${this.max}".`, '');
    this.min = value;
    return this;
  }
  public setMax(value: number): JVNumber {
    if (typeof value !== 'number')
      throwError(JVKeyError, `The max value must be a number. Received "${typeof value}".`, '');
    if (this.min && this.min > 0 && value < this.min)
      throwError(JVKeyError, `The max value "${value}" is less than the min value "${this.min}".`, '');
    this.max = value;
    return this;
  }
  public setEnum(value: TJVItemOfType<number> | null): JVNumber {
    if (typeof value !== 'undefined' && value !== null && !Array.isArray(value))
      throwError(JVKeyError, `The enum value must be an array or null. Received "${typeof value}".`, '');
    if (value && value.length === 0)
      throwError(JVKeyError, `The enum value cannot be an empty array.`, '');
    this._enum = value;
    return this;
  }
  public setNull(value: boolean = true): JVNumber {
    if (typeof value !== 'boolean')
      throwError(JVKeyError, `The null value must be a boolean. Received "${typeof value}".`, '');
    this.null = value;
    return this;
  }
  private testingMessage(value: any, trace: Array<string>): void {
    try {
      if (process.env.JSON_VALIDATOR_TESTING_MODE_KEY === 'yes i am testing') {
        console.log(`[TESTING][NUMBER][VALIDATE][TRACE: ${trace}]`, value)
      }
    } catch (e) { }
  }
  public validate(value: any, trace: Array<string>): boolean {
    this.testingMessage(value, trace);
    if (this.null && value === null)
      return true;
    if (typeof value !== this.type)
      throwError(JVKeyError, `The type of the value is "${typeof value}". Expected type is "number".`, trace.join('.'));

    if (typeof this.min === 'number' && (value <= this.min))
      throwError(JVKeyError, `The value ${value} is less than the minimum value ${this.min}`, trace.join('.'));
    if (typeof this.max === 'number' && (value >= this.max))
      throwError(JVKeyError, `The value ${value} is greater than the maximum value ${this.max}`, trace.join('.'));
    if (typeof this._enum !== 'boolean' && Array.isArray(this._enum) && !this._enum.includes(value))
      throwError(JVKeyError, `The value ${value} is not one of the allowed values: ${this._enum.join(',')}`, trace.join('.'));
    return true;
  }
  public json(): IJVKeyNumberJSON {
    return {
      type: 'number',
      null: this.null,
      min: this.min,
      max: this.max,
      enum: typeof this._enum !== 'boolean' && Array.isArray(this._enum) ? this._enum : null
    };
  }
  public static fromJSON(json: IJVKeyNumberJSON): JVNumber {
    const _enum = typeof json.enum !== 'undefined' && json.enum !== null ? json.enum : undefined;
    return new JVNumber(json.null, json.min, json.max, _enum);
  }
  public example() {
    return 2025;
  }
  template() { return ''; }
  public path(trace: Array<string>) { return trace.join('/'); }
  public exampleWithRules() {
    let hasMin = typeof this.min === 'number' ? `Must be greater than ${this.min}` : '';
    let hasMax = typeof this.max === 'number' ? `Must be less than ${this.max}` : '';
    let isNull = this.null ? 'Can be null' : 'Cannot be null';
    let enumValues = this._enum ? `Allowed values: ${this._enum.join(', ')}` : '';
    return `A number, ${[hasMin, hasMax, isNull, enumValues].filter(Boolean).join(', ')}.`;
  }
}