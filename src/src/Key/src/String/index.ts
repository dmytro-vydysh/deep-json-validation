import { JVError, JVKeyError, JVKeyRegexError, JVKeyRequiredError, throwError } from "../../../../src/Error";
import { IJVKey, TJVItemOfType } from "../..";

export interface IJVString {
  regex?: RegExp;
  _enum?: TJVItemOfType<string> | null;
}

export interface IJVKeyStringJSON {
  type: 'string';
  null: boolean;
  regex?: string;
  enum?: TJVItemOfType<string> | null;
}
export class JVString implements IJVKey, IJVString {
  public null: boolean = false;
  public regex?: RegExp;
  public type: string = 'string';
  public _enum?: TJVItemOfType<string> | null;
  constructor(regex?: RegExp | string, _null?: boolean, _enum?: TJVItemOfType<string> | null) {
    regex && this.setRegex(regex);
    _enum && this.setEnum(_enum);
    _null && this.setNull(_null);

  }
  public setRegex(value?: RegExp | string): JVString {
    if (typeof value === 'undefined') {
      this.regex = undefined;
      return this;
    }
    if (typeof value !== 'string' && !(value instanceof RegExp))
      throwError(JVKeyError, `The regex value must be a string or a RegExp. Received "${typeof value}".`, '');
    this.regex = typeof value === 'string' ? new RegExp(value) : value;
    return this;
  }
  public regExp = this.setRegex;
  public setEnum(value?: TJVItemOfType<string> | null): JVString {
    if (typeof value === 'undefined') {
      this._enum = null;
      return this;
    }
    if (typeof value !== 'undefined' && value !== null && !Array.isArray(value))
      throwError(JVKeyError, `The enum value must be an array or null. Received "${typeof value}".`, '');
    if (value && value.length === 0)
      throwError(JVKeyError, `The enum value cannot be an empty array.`, '');
    this._enum = value;
    return this;
  }
  public enum = this.setEnum;
  public setNull(value: boolean = true): JVString {
    if (typeof value !== 'boolean')
      throwError(JVKeyError, `The null value must be a boolean. Received "${typeof value}".`, '');
    this.null = value;
    return this;
  }
  public nullable(nullable: boolean = true) {
    return this.setNull(nullable);
  }
  private testingMessage(value: any, trace: Array<string>): void {
    try {
      if (process.env.JSON_VALIDATOR_TESTING_MODE_KEY === 'yes i am testing') {
        console.log(`[TESTING][STRING][VALIDATE][TRACE: ${trace}]`, value)
      }
    } catch (e) { }
  }
  public validate(value: any, trace: Array<string>, _throwError: boolean = true): boolean {
    this.testingMessage(value, trace);
    if (this.null && value === null)
      return true;

    if (typeof value !== this.type) {
      if (_throwError)
        throwError(JVKeyError, `The type of the value is "${typeof value}". Expected type is "string".`, trace.join('/'));
      else return false;
    }

    if (typeof this.regex !== 'undefined' && !this.regex.test(value)) {
      if (_throwError)
        throwError(JVKeyRegexError, `The value "${value}" does not match the regex "${this.regex.source}".`, trace.join('/'));
      else return false;
    }

    if (typeof this._enum !== 'boolean' && Array.isArray(this._enum))
      if (!(this._enum.includes(value))) {
        if (_throwError)
          throwError(JVKeyError, `The value "${value}" is not one of the allowed values: "${this._enum.join(',')}".`, trace.join('/'));
        else return false;
      }

    return true;
  }
  public json(): IJVKeyStringJSON {
    return {
      type: 'string',
      null: this.null,
      regex: this.regex?.source || 'undefined',
      enum: typeof this._enum !== 'boolean' && Array.isArray(this._enum) ? this._enum : null
    };
  }
  template() { return ''; }
  public static fromJSON(json: IJVKeyStringJSON): JVString {
    const regex = typeof json.regex === 'string' && json.regex !== 'undefined' ? new RegExp(json.regex) : undefined;
    const _enum = typeof json.enum !== 'undefined' && json.enum !== null ? json.enum : undefined;
    return new JVString(regex, json.null, _enum);
  }
  public example() {
    return 'a string value';
  }
  public path(trace: Array<string>) { return trace.join('/'); }
  public exampleWithRules() {
    let regExp = this.regex ? `Must match ${this.regex.source}` : 'Has no specific regex';
    let isNull = this.null ? 'Can be null' : 'Cannot be null';
    let enumValues = this._enum ? `Allowed values: ${this._enum.join(', ')}` : '';
    return `A string, ${[regExp, isNull, enumValues].filter(Boolean).join(', ')}.`;
  }
}
