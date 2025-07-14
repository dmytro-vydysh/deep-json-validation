import { IJVKey } from "../Key";
import { JVAny } from "../Key/src/Any";
import { JVArray } from "../Key/src/Array";
import { JVBigInt } from "../Key/src/BigInt";
import { JVBoolean } from "../Key/src/Boolean";
import { JVDate } from "../Key/src/Date";
import { JVFile } from "../Key/src/File";
import { JVNumber } from "../Key/src/Number";
import { JVString } from "../Key/src/String";


/**
 * There are no any specific rules for theese keys, just the type of the key.
 * You can use then for boost the writing of your JSON Validator.
 * @class JVDefaultsKeys
 */
export class JVDefaultsKeys {

  /**
   * 
   * @returns {JVString} Returns a new instance of JVString.
   */
  public static string: () => IJVKey = (): JVString => new JVString();

  /**
   * 
   * @returns {JVNumber} Returns a new instance of JVNumber.
   * @description This method allows you to create a key of type number.
   */
  public static number: () => IJVKey = (): JVNumber => new JVNumber();

  /**
   * 
   * @returns {JVBoolean} Returns a new instance of JVBoolean.
   * @description This method allows you to create a key of type boolean.
   */
  public static boolean: () => IJVKey = (): JVBoolean => new JVBoolean();

  /**
   * 
   * @returns {JVBigInt} Returns a new instance of JVBigInt.
   * @description This method allows you to create a key of type bigint.
   */
  public static bigint: () => IJVKey = (): JVBigInt => new JVBigInt();

  /**
   * 
   * @returns {JVAny} Returns a new instance of JVAny.
   * @description This method allows you to create a key of type any.
   */
  public static any: () => IJVKey = (): JVAny => new JVAny();

  /**
   * 
   * @returns {JVDate} Returns a new instance of JVDate.
   * @description This method allows you to create a key of type date.
   */
  public static date: () => IJVKey = (): JVDate => new JVDate();

  /**
   * 
   * @returns {JVFile} Returns a new instance of JVFile.
   * @description This method allows you to create a key of type file.
   */
  public static file: () => IJVKey = (): JVFile => new JVFile();

  /**
   * This is a collection for the array of keys.
   * You can use it to create an array of keys with a specific type.
   */
  public static array = class {

    /**
     * 
     * @returns {JVArray} Returns a new instance of JVArray with type any.
     * @description This method allows you to create an array key of type any.
     */
    public static any: () => IJVKey = (): JVArray => new JVArray(new JVAny());

    /**
     * 
     * @returns {JVArray} Returns a new instance of JVArray with type string.
     * @description This method allows you to create an array key of type string.
     */
    public static string: () => IJVKey = (): JVArray => new JVArray(new JVString());

    /**
     * 
     * @returns {JVArray} Returns a new instance of JVArray with type number.
     * @description This method allows you to create an array key of type number.
     */
    public static number: () => IJVKey = (): JVArray => new JVArray(new JVNumber());

    /**
     * 
     * @returns {JVArray} Returns a new instance of JVArray with type boolean.
     * @description This method allows you to create an array key of type boolean.
     */
    public static boolean: () => IJVKey = (): JVArray => new JVArray(new JVBoolean());

    /**
     * 
     * @returns {JVArray} Returns a new instance of JVArray with type bigint.
     * @description This method allows you to create an array key of type bigint.
     */
    public static bigint: () => IJVKey = (): JVArray => new JVArray(new JVBigInt());

    /**
     * 
     * @returns {JVArray} Returns a new instance of JVArray with type date.
     * @description This method allows you to create an array key of type date.
     */
    public static date: () => IJVKey = (): JVArray => new JVArray(new JVDate());
  }
}