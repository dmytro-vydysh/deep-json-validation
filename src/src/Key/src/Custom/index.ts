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

export interface IJVCustom { }
export type OverrideProps<T, U extends Partial<Record<keyof T, any>>> = Omit<T, keyof U> & U;

export interface IJVKeyCustomJSON { type: 'custom'; null: boolean; }

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
  private _f_validation: (value: any, trace: Array<string>) => boolean;

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
  constructor(f_validation: (value: any, trace: Array<string>) => boolean) {
    if (typeof f_validation !== 'function')
      throwError(JVKeyError, `The validation function is not provided or is not a function.`, '');
    this._f_validation = f_validation;
    this.null = false;
  }
  template() { return ''; }
  public validate(value: any, trace: Array<string>): boolean {
    try {
      const res = this._f_validation(value, trace);
      if (!res)
        throwError(JVKeyError, `The value "${value}" is not valid for the custom key.`, trace.join('/'));
      return false;
    } catch (e) {
      return false;
    }
  };
  public json(): IJVKeyAnyJSON {
    throw new Error('You cannot serialize a custom key in JSON Validator. It is not supported.');
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