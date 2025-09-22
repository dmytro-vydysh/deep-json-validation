import { JVError, JVKeyError, JVKeyRegexError, JVKeyRequiredError } from "../Error";
import { IJV } from "../JsonValidator";
import { IJVKeyAnyJSON, JVAny } from "./src/Any";
import { IJVKeyArrayJSON, JVArray } from "./src/Array";
import { IJVKeyBigIntJSON, JVBigInt } from "./src/BigInt";
import { IJVKeyBooleanJSON, JVBoolean } from "./src/Boolean";
import { IJVKeyClassJSON, JVClass } from "./src/Class";
import { IJVKeyCustomJSON, JVCustom } from "./src/Custom";
import { IJVKeyDateJSON, JVDate } from "./src/Date";
import { IJVKeyFileJSON, JVFile } from "./src/File";
import { IJVKeyNodeJSON, JVNode } from "./src/Node";
import { IJVKeyNumberJSON, JVNumber } from "./src/Number";
import { IJVKeySomeOfJSON, JVSomeOf } from "./src/SomeOf";
import { IJVKeyStringJSON, JVString } from "./src/String";


/**
 * This type is used to define an "enum" of all possible key types (for JVString, JVNumber and JVBigInt).
 */
export type TJVItemOfType<T> = Array<T>;

/**
 * This is the type you can pass to the key configuration.
 */
export type TJVKeyType = string | IJV | File | { class: Function } | [string | IJV | { class: Function } | File];


/**
 * This interface defines the structure of a key configuration.
 * It can be a string, number, bigint, boolean, file, any, node, date, class or array.
 */
export interface IJVKey {
  type: TJVKeyType;
  null: boolean;
  validate: (value: any, trace: Array<string>, throwError: boolean) => boolean;
  json: () => IJVKeyStringJSON | IJVKeyNumberJSON | IJVKeyNodeJSON | IJVKeyFileJSON | IJVKeyDateJSON | IJVKeyClassJSON | IJVKeyBooleanJSON | IJVKeyBigIntJSON | IJVKeyArrayJSON | IJVKeyAnyJSON | IJVKeySomeOfJSON | IJVKeyCustomJSON;
  example: () => any;
  template: () => any;
  exampleWithRules: () => any;
  path: (trace: Array<string>) => Record<string, any> | string;
}

export interface IJVKeyGlobal {
  name: string;
  config: IJVKey;
  validate: (value: any, trace: Array<string>, throwError: boolean) => boolean;
  json: () => {
    name: string;
    required: boolean;
    config: IJVKeyStringJSON | IJVKeyNumberJSON | IJVKeyNodeJSON | IJVKeyFileJSON | IJVKeyDateJSON | IJVKeyClassJSON | IJVKeyBooleanJSON | IJVKeyBigIntJSON | IJVKeyArrayJSON | IJVKeyAnyJSON | IJVKeySomeOfJSON | IJVKeyCustomJSON;
  };

  path: (trace: Array<string>) => Record<string, any> | string;
  pathName: () => string;
}


export interface IJVKeyJSON {
  name: string;
  required: boolean;
  config: ReturnType<IJVKey['json']>;
}

/**
 * @class JVKey
 * @description This class represents a key in a JSON Validator configuration.
 * It is used to define the key name and its configuration.
 */
export class JVKey implements IJVKeyGlobal {

  /**
   * The name of the key. 
   */
  public name: string;

  /**
   * The configuration of the key.
   */
  public config: IJVKey;

  /**
   * Whether the key is required or not.
   * If true, the key must be present in the JSON object.
   */
  public required: boolean;


  /**
   * 
   * @param name the name of the key
   * @param required whether the key is required or not
   * @param config the configuration of the key
   */
  constructor(name: string, required: boolean, config: IJVKey) {
    this.name = name;
    this.required = required;
    this.config = config;
  }

  /**
   * 
   * @param value the value to validate
   * @param trace the trace of the validation (used internally for error messages)
   * @returns {boolean} true if the value is valid, false otherwise
   * @throws {JVKeyRequiredError} if the key is required and the value is undefined or another error if the value is invalid
   */
  public validate(value: any, trace: Array<string> = [], _throwError: boolean = true): boolean {

    /** If there is no value */
    if (typeof value === 'undefined')

      /** If the key is required we throw an error */
      if (this.required)
        throw new JVKeyRequiredError(`Key ${this.name} is required`);

      /** Otherwise, if the key is not required, we return true */
      else
        return true;

    /** If there is a valid type of value, we will validate it using the key configuration */
    return this.config.validate(value, [...trace, this.name], _throwError);
  }

  /**
   * 
   * @returns {IJVKeyJSON} the JSON representation of the key
   * @description This method returns the JSON representation of the key, which includes the name, required status, and configuration.
   * It is used to serialize the key to JSON format so it can be stored or transmitted.
   * @throws {JVKeyError} if the key type is a class
   */
  public json(): IJVKeyJSON {
    return {
      name: this.name,
      required: this.required,
      config: this.config.json(),
    }
  }


  public path(trace: Array<string> = []): Record<string, any> | string {
    return this.config.path([...trace, this.name]);
  }

  public pathName() {
    return this.name.concat(this.config instanceof JVArray ? '[]' : '');
  }


  /**
   * 
   * @param json the JSON representation of the key configuration
   * @description This method takes a JSON object and returns an instance of the appropriate key type based on the "type" property in the JSON.
   * @returns {IJVKey} an instance of the key type defined in the JSON
   * @throws {JVKeyError} if the key type is unknown or not a string
   */
  public static keyFromJSON(json: IJVKeyJSON['config']): IJVKey {
    /** Check for the type of the configuration */
    if (typeof json.type === 'string') {
      switch (json.type) {
        case 'string': return JVString.fromJSON(json as IJVKeyStringJSON);
        case 'number': return JVNumber.fromJSON(json as IJVKeyNumberJSON);
        case 'bigint': return JVBigInt.fromJSON(json as IJVKeyBigIntJSON);
        case 'boolean': return JVBoolean.fromJSON(json as IJVKeyBooleanJSON);
        case 'file': return JVFile.fromJSON(json as IJVKeyFileJSON);
        case 'any': return JVAny.fromJSON(json as IJVKeyAnyJSON);
        case 'node': return JVNode.fromJSON(json as IJVKeyNodeJSON);
        case 'date': return JVDate.fromJSON(json as IJVKeyDateJSON);
        case 'array': return JVArray.fromJSON(json as IJVKeyArrayJSON);
        case 'some': return JVSomeOf.fromJSON(json as IJVKeySomeOfJSON);
        case 'class': return JVClass.fromJSON(json as IJVKeyClassJSON);
        case 'custom': return JVCustom.fromJSON(json as IJVKeyCustomJSON);

        /** The key has an invalid */
        default: throw new JVKeyError(`Unknown key type "${(json as any).type}" in JSON config.`);
      }
    } else {

      let _typeof = 'undefined';
      if (json && typeof json === 'object' && 'type' in json)
        _typeof = typeof (json as any).type;
      throw new JVKeyError(`The key type is not a string. Received type "${_typeof}". Expected type is "string" (in any case, you cannot serialize and deserialize a class key using real class instances AND JVCustom validation instances).`);
    }
  }
  public static fromJSON(json: IJVKeyJSON): JVKey {
    return new JVKey(json.name, json.required, JVKey.keyFromJSON(json.config))
  }

}


