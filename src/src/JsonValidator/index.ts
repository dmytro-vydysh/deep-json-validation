import { JVKeyError } from "../Error";
import { IJVKey, IJVKeyGlobal, IJVKeyJSON, JVKey } from "../Key";
import { JVAny } from "../Key/src/Any";
import { JVArray } from "../Key/src/Array";
import { JVBigInt } from "../Key/src/BigInt";
import { JVBoolean } from "../Key/src/Boolean";
import { JVClass } from "../Key/src/Class";
import { JVCustom } from "../Key/src/Custom";
import { JVDate } from "../Key/src/Date";
import { JVFile } from "../Key/src/File";
import { JVNode } from "../Key/src/Node";
import { JVNumber } from "../Key/src/Number";
import { JVString } from "../Key/src/String";

/**
 * The interface for the JSON representation of a JSON Validator.
 * You can use this interface to store the JSON Validator in a string and restore it when needed.
 * It is useful for storing the JSON Validator in a database or a file.
 * @warning You cannot use this interface to store a class key.
 */
export interface IJVJSON {

  /** The "type" of the object */
  type: 'object';

  /** All keys of the object */
  keys: Array<IJVKeyJSON>;
}

/**
 * This is the interface for the global JSON Validator.
 * It is used to validate objects against a set of keys.
 */
export interface IJV {

  /** The keys of the JSON */
  keys: Array<IJVKeyGlobal>;

  /** This method validate */
  validate: (values: any, throwE: boolean, trace: Array<string>) => boolean;

  /** You can add a key to your JSON Validator */
  addKey: (key: JVKey) => JV;

  /** You can remove a key from your JSON Validator*/
  removeKey: (key: string) => JV;

  /** Returns the structure of JSON with random data */
  example: () => Record<string, any>;

  template: () => Record<string, any>;

  /** Returns an object that can be usefull for storeing the JSON Validator in a database or a file */
  json: () => { type: 'object'; keys: Array<IJVKeyJSON> };

  /** Returns an object, .example() like buth with paths of the keys */
  path: (trace: Array<string>) => Record<string, any>;
}


/**
 * @class JV
 * This class is the global JSON Validator.
 * It allows you to add keys to your JSON Validator and validate objects against those keys.
 * It is also used as a key configuration for a nested JSON Validator.
 * @implements {IJV}
 */
export class JV implements IJV {

  /** Global list of classes registered for serialization of JVClass instances */
  private static classes: Map<string, Function> = new Map<string, Function>();

  /**
   * A global list of custom validation functions registered for JVCustom instances. (needed for serialization)
   */
  private static customs: Map<string, (value: any, trace: string[], throwError: boolean) => boolean> = new Map<string, (value: any, trace: string[], throwError: boolean) => boolean>();

  /**
   * 
   * @param name the name of the class you want to register
   * @param classRef the class reference
   * @throws {JVKeyError} if the name is not a string or is an empty string
   * @throws {JVKeyError} if the classRef is not a function
   * @throws {JVKeyError} if the class name is already registered
   * @description You can use this method to register a class for serialization of JVClass instances.
   */
  public static registerClass(name: string, classRef: Function) {
    if (typeof name !== 'string' || name.trim() === '')
      throw new JVKeyError(`The class name must be a non-empty string.`);

    if (typeof classRef !== 'function')
      throw new JVKeyError(`The class reference must be a function.`);

    if (this.classes.has(name)) {
      // check if the classRef is the same as the existing one
      if (this.classes.get(name) === classRef)
        return;
      else
        throw new JVKeyError(`The class name "${name}" is already registered.`);
    }

    this.classes.set(name, classRef);
  }

  /**
   * 
   * @param name the name of the class you want to unregister
   * @throws {JVKeyError} if the name is not a string or is an empty string
   * @description You can use this method to unregister a class for serialization of JVClass instances.
   */
  public static removeClass(name: string) {
    if (typeof name !== 'string' || name.trim() === '')
      throw new JVKeyError(`The class name must be a non-empty string.`);
    this.classes.delete(name);
  }

  /**
   * 
   * @param name the name of the class you want to get
   * @returns the class reference or undefined if not found
   */
  public static getClass(name: string): Function | undefined {
    if (typeof name !== 'string' || name.trim() === '')
      throw new JVKeyError(`The class name must be a non-empty string.`);
    return this.classes.get(name);
  }

  public static registerCustom(name: string, callback: (value: any, trace: string[], throwError: boolean) => boolean) {
    if (typeof name !== 'string' || name.trim() === '')
      throw new JVKeyError(`The custom name must be a non-empty string.`);
    if (typeof callback !== 'function')
      throw new JVKeyError(`The custom callback must be a function.`);
    if (this.customs.has(name)) {
      // check if the callback is the same as the existing one
      if (this.customs.get(name) === callback)
        return;
      else
        throw new JVKeyError(`The custom name "${name}" is already registered.`);
    }

    this.customs.set(name, callback);
  }

  public static removeCustom(name: string) {
    if (typeof name !== 'string' || name.trim() === '')
      throw new JVKeyError(`The custom name must be a non-empty string.`);
    this.customs.delete(name);
  }

  public static getCustom(name: string): ((value: any, trace: string[], throwError: boolean) => boolean) | undefined {
    if (typeof name !== 'string' || name.trim() === '')
      throw new JVKeyError(`The custom name must be a non-empty string.`);
    return this.customs.get(name);
  }

  /**
   * The keys of the JSON Validator.
   */
  public keys: Array<IJVKeyGlobal> = [];

  /**
   * You can use this property to set a custom File class, based on your needs (e.g. for Node.js or Browser)
   */
  private static _FILE_CLASS: Function | null = null;

  /**
   * This property returns the File class used by the JSON Validator.
   * @returns {Function} The File class used by the JSON Validator.
   */
  public static get FILE_CLASS(): Function {
    return this._FILE_CLASS === null ? File : this._FILE_CLASS;
  }

  /**
   * This property allows you to set a custom File class for the JSON Validator.
   * @param {Function} value The custom File class to set.
   */
  public static set FILE_CLASS(value: Function) {
    this._FILE_CLASS = value;
  }

  public static error(error: Error | string): { message: string; address: string } {
    try {
      const input: string = error instanceof Error ? error.message : error;

      const messageMatch = input.match(/<JVError>(.*?)<\/JVError>/s);
      const addressMatch = input.match(/Key address:\s*(.+)/);

      return {
        message: messageMatch ? messageMatch[1].trim() : input,
        address: addressMatch ? addressMatch[1].trim() : 'no address found'
      };
    } catch (e) {
      return error instanceof Error ? { message: error.message, address: error.stack || '' } : { message: error, address: '' };
    }
  }


  /**
   * Constructor for the JSON Validator.
   * @description This constructor initializes the JSON Validator with an empty array of keys.
   */
  constructor() { }

  /**
   * 
   * @param value The key to add to the JSON Validator.
   * @throws {JVKeyError} If the key already exists in the JSON Validator.
   * @returns {JV} The JSON Validator instance with the new key added.
   * @description This method allows you to add a key to your JSON Validator.
   */
  public addKey(value: JVKey): JV {
    /**
     * Search for an existing key with the same name and throw an error if it exists.
     */
    const exists = this.keys.find(k => k.name === value.name);
    if (exists)
      throw new JVKeyError(`Key ${value.name} already exists`);
    this.keys.push(value);
    return this;
  }
  public require(name: string, config: IJVKey): JV {
    const _jvkey = new JVKey(name, true, config);
    this.addKey(_jvkey);
    return this;
  }
  public req = this.require.bind(this);
  public optional(name: string, config: IJVKey): JV {
    const _jvkey = new JVKey(name, false, config);
    this.addKey(_jvkey);
    return this;
  }
  public opt = this.optional.bind(this);

  /**
   * 
   * @param key The name of the key to remove from the JSON Validator.
   * @throws {JVKeyError} If the key does not exist in the JSON Validator.
   * @returns {JV} The JSON Validator instance with the key removed.
   * @description This method allows you to remove a key from your JSON Validator.
   */
  public removeKey(key: string): JV {
    this.keys = this.keys.filter(k => k.name !== key);
    return this;
  }

  /**
   * 
   * @param json The JSON object to validate against the keys of the JSON Validator. 
   * @param trace The trace of the validation, used for error reporting. DO NOT USE IT, it is used internally.
   * @throws {JVKeyError} If the JSON object does not match the keys of the JSON Validator.
   * @returns {boolean} Returns true if the JSON object matches the keys of the JSON Validator, false otherwise.
   * @warning This method wont validate any keys that are not present in the JSON object.
   * @example 
   * 
   * // Create a new JSON Validator
   * const jv = new JV();
   * 
   * // Add a key "name" of type string to the JSON Validator
   * jv.addKey(new JVKey('name', new JVString()));
   * 
   * // The key "age" is not present in the JSON, so if the key "name" is valid, the validation will pass.
   * const isValid = jv.validate({ name: 'John', age: 30 }); // true
   * 
   * 
   * -
   */
  public validate(json: Record<string, any>, _throwError: boolean = true, trace: Array<string> = []): boolean {
    return this.keys.every(key => key.validate(json[key.name], trace, _throwError));
  }

  /**
   * 
   * @returns {IJVJSON} The JSON representation of the JSON Validator.
   * @description This method returns the JSON representation of the JSON Validator.
   * It is useful for storing the JSON Validator somewhere, like in a database or a file.
   * @warning You cannot use this method to store a JV that contains a class key in whathever nested level.
   * @throws {JVKeyError} If the JSON Validator contains a class key that uses a class and not a reference OR a JVCustom instance.
   */
  public json(): IJVJSON {

    return {
      type: 'object',

      /**
       * For each key in the JSON Validator, we convert it to its JSON representation.
       * @warning If the key is a class key, it will throw an error.
       */
      keys: this.keys.map(key => key.json() as IJVKeyJSON)
    };
  }

  /**
   * 
   * @param json The JSON object to convert to a JSON Validator.
   * @throws {JVKeyError} If the JSON has an invalid type or structure 
   * @returns {JV} The JSON Validator instance created from the JSON object.
   * @description This method allows you to create a JSON Validator from a JSON object.
   */
  public static fromJSON(json: { type: 'object'; keys: Array<IJVKeyJSON> }): JV {
    if (typeof json.type !== 'string' || json.type !== 'object' || !('keys' in json) || !(Array.isArray(json.keys)))
      throw new JVKeyError(`Invalid JSON received for restoring a JSON Validator: ${JSON.stringify(json)}`);

    /**
     * Create a new JSON Validator instance and add each key from the JSON.
     */
    const jv = new JV();

    /**
     * Iterate over each key in the JSON and convert it to a JVKey instance.
     */
    json.keys.forEach(key => jv.addKey(JVKey.fromJSON(key)));

    return jv;
  }

  /**
   * 
   * @returns {Record<string, any>} An example object that matches the keys of the JSON Validator, also with the correct type of data.
   * @description This method returns an example object that matches the keys of the JSON Validator.
   * It is useful for testing and debugging purposes.
   */
  public example(): Record<string, any> {

    /**
     * Just create an object with the keys of the JSON Validator and the example value of each key.
     */
    let obj: Record<string, any> = {};

    this.keys.forEach(key => obj[key.name] = key.config.example());

    /**
     * Return the object with the example values.
     */
    return obj;
  }

  public template(): Record<string, any> {
    let obj: Record<string, any> = {};
    this.keys.forEach(key => obj[key.name] = key.config.template());
    return obj;
  }

  /**
   * 
   * @returns {Record<string, any>} It is the same as the .example() method, but the data is all in string format with the rules applied to the keys.
   * @description This method returns an example object that matches the keys of the JSON Validator, but with the rules applied to the keys.
   */
  public exampleWithRules(): Record<string, any> {

    /**
     * Create an object with the keys of the JSON Validator and the example value of each key with rules.
     */
    let obj: Record<string, any> = {};
    this.keys.forEach(key => obj[key.name] = key.config.exampleWithRules());

    /**
     * Return the object with the example values with rules.
     */
    return obj;
  }


  public path(trace: Array<string> = []): Record<string, any> {

    /**
     * Create an object with the keys of the JSON Validator and the path of each key.
     */
    let obj: Record<string, any> = {};
    this.keys.forEach(key => obj[key.pathName()] = key.path(trace));
    /**
     * Return the object with the paths of the keys.
     */
    return obj;
  }

  /**
   * 
   * @param json the JSON object to convert to a JSON Validator schema.
   * @returns {JV} The JSON Validator instance created from the JSON object.
   * @warning This method will return a strongly typed JSON validator schema based on the provided JSON object. Any null, undefined, empty objects, array of not structured objects or different types will throw an error.
   * @description You can use this method to create a basic JSON validator schema, convert it in JSON, edit the JSON and then restore it using the fromJSON method if you want to speed up the process of creating a JSON Validator schema.
   * @throws {JVKeyError} If the JSON object is not a valid key-value
   */
  public static schema(json: Record<string, any>, trace: Array<string> = [], start = true): JV {
    if (start && (typeof json !== 'object' || json === null || Array.isArray(json) || Object.keys(json).length === 0))
      throw new JVKeyError(`[1]Json Validator needs an key-value object to create a schema, received ${Array.isArray(json) ? 'array' : (json === null ? 'null' : (Object.keys(json).length === 0 ? 'empty JSON' : typeof json))} instead.`);
    if (typeof json === 'object' && (json instanceof Date || json instanceof JV.FILE_CLASS))
      throw new JVKeyError(`[2]Json Validator needs an key-value object to create a schema, received Date object instead.`);
    const jv = new JV();

    const get_key_type = (value: any, trace: Array<string>): IJVKey | null => {
      let config: IJVKey | null = null;
      if (value === null || typeof value === 'undefined')
        return new JVAny();
      switch (typeof value) {
        case 'string':
          if (this.isValidDate(value)) {
            config = new JVDate();
            break;
          }
          if (['true', 'false'].includes(value)) {
            config = new JVBoolean();
            break;
          }
          config = new JVString();
          break;
        case 'number':
          // if (this.isValidDate(value)) {
          //   config = new JVDate();
          //   break;
          // }
          config = new JVNumber();
          break;
        case 'bigint':
          config = new JVBigInt();
          break;
        case 'boolean':
          config = new JVBoolean();
          break;
        case 'object':
          try {
            /** Is an instance of Date? */
            if (value instanceof Date) {
              config = new JVDate();
              break;
            }

            /** Is an instance of File? */
            if (value instanceof JV.FILE_CLASS) {
              config = new JVFile();
              break;
            }

            /** Is an array? In that case we need to recursively call this function on the first item of the array */
            if (Array.isArray(value)) {
              if (value.length === 0)
                throw new JVKeyError(`[3]Json Validator needs an key-value object to create a schema, received an empty array for the key "${trace}".`);
              let subconf = get_key_type(value[0], [...trace, '/']);
              if (subconf === null)
                throw new JVKeyError(`[4]Json Validator needs an key-value object to create a schema, received an unknown type for the key "${trace}".`);
              config = new JVArray(subconf);
              break;
            }

            const string_from_object = JSON.stringify(value);

            if (string_from_object === '{}')
              throw new JVKeyError(`[5]Json Validator needs an key-value object to create a schema, received an empty object for the key "${trace}".`);

            if (string_from_object === '[]')
              throw new JVKeyError(`[6]Json Validator needs an key-value object to create a schema, received an empty array for the key "${trace}".`
              )

            const object_from_string_from_object = JSON.parse(string_from_object);

            if (Object.keys(object_from_string_from_object).length === 0)
              throw new JVKeyError(`[7]Json Validator needs an key-value object to create a schema, received an empty object for the key "${trace}".`);


            /** Finally we will try to make a sub-schema based on the JSON values */
            config = new JVNode(JV.schema(object_from_string_from_object, [...trace], false));

          } catch (json_parse_error) {
            console.error(json_parse_error);
            throw new JVKeyError(`[8]Json Validator needs an key-value object to create a schema, seems like the value of the key "${trace}" is not a valid JSON object.`);
          }
          break;
        case 'function':
          throw new JVKeyError(`[9]Json Validator needs an key-value object to create a schema, received a function/class for the key "${trace}".`);
        case 'undefined':
          throw new JVKeyError(`[10]Json Validator needs an key-value object to create a schema, received undefined for the key "${trace}".`);
        default:
          config = new JVAny();
          break;




      }



      return config;
    }

    for (const key of Object.keys(json)) {
      let config: IJVKey | null = null;
      const value = json[key];
      const traceKey = [...trace, key];
      config = get_key_type(value, traceKey);
      if (config === null)
        throw new JVKeyError(`[11]Json Validator needs an key-value object to create a schema, received an unknown type for the key "${traceKey}".`);
      jv.addKey(new JVKey(key, true, config));


    }


    return jv;
  }

  private static isValidDate(value: string | number | Date): boolean {
    const isISOString = typeof value === 'string' && !isNaN(Date.parse(value));
    const isTimestamp = typeof value === 'number' && !isNaN(new Date(value).getTime()) && !isNaN(value) && value === new Date(value).getTime();
    const isDateObject = value instanceof Date && !isNaN(value.getTime());
    return isISOString || isTimestamp || isDateObject;
  }
}