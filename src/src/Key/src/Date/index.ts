import { JVKeyError, throwError } from "../../../../src/Error";
import { IJVKey, TJVItemOfType } from "../..";
import { TJVKeyType } from "../..";


export interface IJVDate {

  /** The minimun date available */
  min?: string | number | Date;

  /** The maximum date available */
  max?: string | number | Date;

  /** List of dates the value can be */
  _enum?: TJVItemOfType<Date> | null
}
export interface IJVKeyDateJSON {
  type: 'date';
  null: boolean;
  enum?: TJVItemOfType<Date> | null;
  min?: string | number | Date;
  max?: string | number | Date;
}
export class JVDate implements IJVKey, IJVDate {
  public type: TJVKeyType;
  public null: boolean = false;
  public min?: Date;
  public max?: Date;
  public _enum?: null | TJVItemOfType<Date>;
  constructor(_null?: boolean, min?: number | string | Date, max?: number | string | Date, _enum?: null | TJVItemOfType<string | number | Date>) {
    this.type = 'date';
    _null && this.setNull(_null);
    min && this.setMin(min);
    max && this.setMax(max);
    _enum && this.setEnum(_enum);





  }
  public setMin(value: string | number | Date): JVDate {
    if (typeof value !== 'undefined' && (!(value instanceof Date) && typeof value !== 'number' && typeof value !== 'string'))
      throwError(JVKeyError, `[CONSTRUCTOR] Key has min set to "${value}". Expected min to be a valid date string, milliseconds or Date object.`, '');
    this.min = typeof value !== 'undefined'
      ? value instanceof Date
        ? value
        : (
          ['string', 'number'].includes(typeof value)
            ? new Date(value.toString())
            : undefined
        )
      : undefined;
    return this;
  }

  public setMax(value: string | number | Date): JVDate {

    if (typeof value !== 'undefined' && (!(value instanceof Date) && typeof value !== 'number' && typeof value !== 'string'))
      throwError(JVKeyError, `[CONSTRUCTOR] Key has max set to "${value}". Expected max to be a valid date string, milliseconds or Date object.`, '');
    this.max = typeof value !== 'undefined'
      ? value instanceof Date
        ? value
        : (
          ['string', 'number'].includes(typeof value)
            ? new Date(value.toString())
            : undefined
        )
      : undefined;
    return this;
  }

  public setEnum(value: null | TJVItemOfType<string | number | Date>): JVDate {
    this._enum = !(['boolean', 'undefined'].includes(typeof value)) && Array.isArray(value) ? value.map((item: string | number | Date) => item instanceof Date ? item : new Date(item.toString())) : null;
    if (typeof this._enum !== 'boolean' && Array.isArray(this._enum)) {
      if (this._enum.length === 0)
        throwError(JVKeyError, `[CONSTRUCTOR] Key has _enum with no items. Expected at least one item.`, '');
      if (this._enum.some((item: Date) => isNaN(item.getTime())))
        throwError(JVKeyError, `[CONSTRUCTOR] Key has _enum with some invalid item. Expected all items to be valid date strings, milliseconds or Date objects.`, '');
    }
    return this;
  }
  public setNull(value: boolean = true): JVDate {
    if (typeof value !== 'boolean')
      throwError(JVKeyError, `The null value must be a boolean. Received "${typeof value}".`, '');
    this.null = value;
    return this;
  }

  private testingMessage(value: any, trace: Array<string>): void {
    try {
      if (process.env.JSON_VALIDATOR_TESTING_MODE_KEY === 'yes i am testing') {
        console.log(`[TESTING][DATE][VALIDATE][TRACE: ${trace}]`, value)
      }
    } catch (e) { }
  }
  public validate(value: number | string | Date, trace: Array<string>): boolean {
    this.testingMessage(value, trace);
    if (this.null && value === null)
      return true;

    value = value instanceof Date ? value : new Date(value.toString());

    if (typeof value !== 'string' && typeof value !== 'number' && !(value instanceof Date))
      throwError(JVKeyError, `The date has type "${typeof value}". Expected type is "string", "number" or "Date".`, trace.join('.'));


    if (isNaN(new Date(value).getTime()))
      throwError(JVKeyError, `The date "${value.toString()}" is not a valid date string, milliseconds or Date object.`, trace.join('.'));
    if (this.min instanceof Date && value < this.min)
      throwError(JVKeyError, `The date "${value.toISOString()}" is earlier than the minimum date "${this.min.toISOString()}".`, trace.join('.'));
    if (this.max instanceof Date && value > this.max)
      throwError(JVKeyError, `The date "${value.toISOString()}" is later than the maximum date "${this.max.toISOString()}".`, trace.join('.'));
    if (typeof this._enum !== 'boolean' && Array.isArray(this._enum) && !(this._enum.map(d => d.getTime()).includes(new Date(value).getTime())))
      throwError(JVKeyError, `The date "${value.toISOString()}" is not one of the allowed dates: "${this._enum.map(d => d.toISOString()).join(',')}".`, trace.join('.'));
    return true;
  }
  public json(): IJVKeyDateJSON {
    return {
      type: 'date',
      null: this.null,
      enum: typeof this._enum !== 'boolean' && Array.isArray(this._enum) ? this._enum : null
    };
  }
  public example() {
    return new Date().toLocaleDateString();
  }
  public exampleWithRules() {
    let hasMin = (typeof this.min !== 'undefined') ? `Must be after ${new Date(this.min).toLocaleDateString()}` : '';
    let hasMax = typeof this.max !== 'undefined' ? `Must be before ${new Date(this.max).toLocaleDateString()}` : '';
    let isNull = this.null ? 'Can be null' : 'Cannot be null';
    let enumValues = this._enum ? `Allowed values: ${this._enum.join(', ')}` : '';
    return `A date, ${[hasMin, hasMax, isNull, enumValues].filter(Boolean).join(', ')}.`;
  }

  template() { return ''; }
  public path(trace: Array<string>) { return trace.join('/'); }
  public static fromJSON(json: IJVKeyDateJSON): JVDate {
    const _enum = typeof json.enum !== 'undefined' && json.enum !== null ? json.enum : undefined;
    return new JVDate(
      json.null,
      json.min,
      json.max,
      _enum
    );
  }
}