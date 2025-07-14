/**
 * @class JN - JN stands for JSON Navigator, a utility class for navigating and manipulating JSON objects.
 */
export class JN {

  /**
   * 
   * @param json The JSON object to navigate.
   * @param trace An array of strings representing the current path in the JSON object. It is for internal use, do not use it!
   * @warning Do not use the second parameter, it is for internal use only.
   * @returns A new object where each key is the path to the corresponding value in the original JSON object.
   * @example
   * // The path is represented as a string, with keys and indices separated by slashes.
   * // For example, if the original JSON object has a structure like:
   * const myJSON = {
   *   "a": {
   *     "b": [
   *      "c",
   *      "d"
   *    ]
   * }
   * 
   * // The returned object will be:
   * const result = {
   *  "a": {
   *    "b": [
   *      "a/b/0",
   *      "a/b/1"
   *    ]
  *    }
   * }
   */
  public static path(json: Record<string, any>, trace: Array<string> = []): Record<string, any> {

    /**
     * This is the object that will be returned.
     */
    const obj: Record<string, any> = {};

    /**
     * Let's iterate over the keys of the JSON object.
     */
    for (const key of Object.keys(json)) {

      const value = json[key];
      if (Array.isArray(value))
        obj[key] = value.map((item, index) => {

          if (typeof item === 'object' && item !== null)
            return JN.path(item, [...trace, key, index.toString()]);

          else
            return [...trace, key, index.toString()].join('/');

        });
      else if (typeof value === 'object' && value !== null)

        obj[key] = JN.path(value, [...trace, key]);

      else
        obj[key] = [...trace, key].join('/');
    }

    return obj;
  }

  /**
   * 
   * @param json The JSON object to navigate.
   * @param trace An array of strings representing the current path in the JSON object. It is for internal use, do not use it!
   * @warning Do not use the second parameter, it is for internal use only.
   * @returns A new object where each key is the path to the corresponding value in the original JSON object, along with the value itself.
   * @example
   * // The path is represented as a string, with keys and indices separated by slashes.
   * // For example, if the original JSON object has a structure like:
   * const myJSON = {
   *    "a": {
   *      "b": [
   *        "c",
   *        "d"
   *      ]
   *    }
   * }
   * // The returned object will be:
   * const result = {
   *    "a": {
   *      "b": [
   *        { value: "c", path: "a/b/0" },
   *        { value: "d", path: "a/b/1" }
   *      ]
   *    }
   * }
   */
  public static pathWithValues(json: Record<string, any>, trace: Array<string> = []): Record<string, any> {

    // This is the object that will be returned.
    const obj: Record<string, any> = {};

    // Let's iterate over the keys of the JSON object.
    for (const key of Object.keys(json)) {
      const value = json[key];

      if (Array.isArray(value))
        obj[key] = value.map((item, index) => {

          const path = [...trace, key, index.toString()].join('/');

          if (typeof item === 'object' && item !== null)
            return JN.pathWithValues(item, [...trace, key, index.toString()]);

          else
            return { value: item, path };

        });

      else if (typeof value === 'object' && value !== null)
        obj[key] = JN.pathWithValues(value, [...trace, key]);

      else {

        const path = [...trace, key].join('/');
        obj[key] = { value, path };

      }

    }

    return obj;
  }
  public static materialize(template: any, source: Record<string, any>, errorOnNonExistentValues: boolean = false): any {
    const resolvePath = (path: string, obj: any): any => {

      /**
       * Splitting the path by '/' to navigate through the object.
       * Each part of the path can be a key or an index (if it's a number).
       * * For example, if the path is 'a/b/0', it will navigate to obj['a']['b'][0].
       * * If the path is 'a/b/c', it will navigate to obj['a']['b']['c'].
       */
      const parts = path.split('/');

      let value = obj;
      for (let i = 0; i < parts.length; i++) {
        const raw = parts[i];
        const key = /^\d+$/.test(raw) ? Number(raw) : raw;

        if (value == null || !(key in value)) {
          if (errorOnNonExistentValues)
            throw new Error(`Path "${parts.slice(0, i + 1).join('/')}" does not exist in source object.`);

          return undefined;
        }

        value = value[key];
      }

      return value;
    };

    if (typeof template === 'string') {
      return resolvePath(template, source);
    }

    if (Array.isArray(template)) {
      return template.map(item =>
        JN.materialize(item, source, errorOnNonExistentValues)
      );
    }

    if (typeof template === 'object' && template !== null) {
      const result: Record<string, any> = {};
      for (const key of Object.keys(template)) {
        result[key] = JN.materialize(template[key], source, errorOnNonExistentValues);
      }
      return result;
    }

    return template;
  }


  public static get(source: Record<string, any>, path: string, errorOnNonExistentValues: boolean = false): any {
    const parts = path.split('/');
    let value = source;

    for (const part of parts) {
      if (value == null || !(part in value)) {
        if (errorOnNonExistentValues)
          throw new Error(`Path "${path}" does not exist in source object.`);
        return undefined;
      }
      value = value[part];
    }

    return value;
  }
}