import { JVError, JVKeyError, JVKeyRegexError, JVKeyRequiredError, throwError } from "../../../../src/Error";
import { IJVKey, TJVItemOfType, TJVKeyType } from "../..";
import { IJVKeyAnyJSON } from "../Any";
import { IJVKeyArrayJSON } from "../Array";
import { IJVKeyBigIntJSON } from "../BigInt";
import { IJVKeyBooleanJSON } from "../Boolean";
import { IJVKeyClassJSON } from "../Class";
import { IJVKeyDateJSON } from "../Date";
import { IJVKeyFileJSON } from "../File";
import { IJVKeyNodeJSON } from "../Node";
import { IJVKeyNumberJSON } from "../Number";
import { IJVKeyStringJSON } from "../String";
import { JV } from "../../../../src/JsonValidator";

export interface IJVCustom { }
export type OverrideProps<T, U extends Partial<Record<keyof T, any>>> = Omit<T, keyof U> & U;

export interface IJVKeyCustomJSON {
  type: 'custom';
  callback: string;
  null: boolean;
}

/**
 * @class JVCustom
 * @description This class represents a custom key in a JSON Validator configuration.
 * It allows you to define your own validation logic for the key.
 * You can use this class to create a key that validates the value based on your own rules.
 */
export class JVCustom implements IJVKey {

  /**
   * @description This is the type of the key.
   */
  public type: TJVKeyType = 'custom';

  /**
   * @description This is the function that validates the value.
   */
  private _f_validation: string | ((value: any, trace: Array<string>) => boolean);

  /**
   * @description This is a flag that indicates whether the key can be null.
   */
  public null: boolean = false;

  /**
   * 
   * @param f_validation the function that validates the value.
   * @throws {JVKeyError} if the validation function is not provided.
   * @param _null 
   */
  constructor(f_validation: string | ((value: any, trace: Array<string>) => boolean)) {
    this._f_validation = f_validation;
    this.null = false;
  }

  template() { return ''; }
  public validate(value: any, trace: Array<string>, _throwError: boolean = true): boolean {
    try {
      const f_validation = (typeof this._f_validation === 'string') ? JV.getCustom(this._f_validation) : this._f_validation;
      if (typeof f_validation !== 'function')
        throwError(JVKeyError, `The custom validation function is not a function.`, trace.join('/'));
      if (!f_validation || typeof f_validation === 'undefined')
        throwError(JVKeyError, `The custom validation function is not defined.`, trace.join('/'));
      else {

        const res = f_validation(value, trace, _throwError);
        if (!res)
          if (_throwError)
            throwError(JVKeyError, `The value "${value}" is not valid for the custom key.`, trace.join('/'));
          else return false;
        return true;
      }
      return true;
    } catch (e) {
      return false;
    }
  };
  public json(): IJVKeyCustomJSON {
    if (typeof this._f_validation === 'function')
      throw new JVKeyError('You cannot serialize a direct custom validator in JSON.');
    return {
      type: 'custom',
      callback: (this._f_validation as unknown as string),
      null: this.null
    };
  }
  public static fromJSON(json: IJVKeyCustomJSON): JVCustom {
    if (json.type !== 'custom')
      throwError(JVKeyError, `The type of the key must be "custom". Received "${json.type}".`, '');
    const func = JV.getCustom(json.callback);
    if (!func)
      throwError(JVKeyError, `The custom validation function "${json.callback}" is not registered. Please register it using "JV.registerCustom(name, func)".`, '');
    return new JVCustom(func as (value: any, trace: Array<string>) => boolean);
  }

  public path(trace: Array<string>) { return trace.join('/'); }
  public example() {
    return 'Custom validation logic. You can define your own validation rules.';
  };
  public exampleWithRules() {
    let isNull = this.null ? 'Can be null' : 'Cannot be null';
    return `Custom validation logic.You can define your own validation rules.`;
  }

}