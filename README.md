Deep JSON Validation
Deep JSON Validation is a powerful library for validating and handling JSON data in JavaScript/TypeScript. It's designed for those who love object-oriented programming (OOP) and strict typing, providing a robust way to ensure data integrity from unknown sources.

With Deep JSON Validation, you can:

Validate complex JSON structures with unlimited depth.

Serialize your validation rules to a JSON file and deserialize them later.

Pinpoint the exact location where data validation fails.

Obtain a safely-typed JSON object after a successful validation.

Write validation rules in an easy, fast, and intuitive way.

Core Classes
JV (JSON Validator)
The JV class is the main entry point for creating and managing validation schemas.

Non-static Methods
req(keyName, validator) or require(keyName, validator): Makes a key mandatory in the JSON being validated. If the key is not present, validation fails.

opt(keyName, validator) or optional(keyName, validator): Makes a key optional. If the key is present, it must conform to the specified validator; otherwise, validation fails. If it's not present, validation passes.

example(): Generates an example JSON object that conforms to the defined validation rules. This is useful for testing or providing a sample valid JSON.

exampleWithRules(): Generates a JSON with descriptive strings of the defined validation rules, which is useful for quick documentation.

path(): Returns the structure of the JSON to be validated, showing the path for each key.

removeKey(keyName): Removes a key from the validation schema. This is useful for dynamically modifying the schema.

json(): Serializes the JV validation schema into a JSON string. Note: This will throw an error if you attempt to serialize a JVClass or JVCustom validator that uses a real class or function instead of a registered name.

validate(json, throwError = true): Validates a JSON object against the defined schema. It returns true on success. By default, it throws a JVError on failure, but you can set the second argument to false to return a boolean instead.

Static Methods
schema(obj): Creates a basic JV schema from a simple JSON object, supporting strings, arrays, numbers, booleans, and dates. It does not support complex data types like custom classes or custom validation functions.

fromJSON(json): Reconstructs a JV validation schema from a JSON object produced by the json() method.

error(error): Extracts the error message and the key address from a JVError object. This is useful for getting a simple, structured error detail.

registerClass(name, class): Registers a class globally so that it can be serialized when used with JVClass.

removeClass(name): Removes a registered class from the global map.

registerCustom(name, callback): Registers a custom validation function globally, allowing it to be serialized when used with JVCustom.

removeCustom(name): Removes a registered custom validation function from the global map.

JV Validators
These are the individual validators you use within a JV schema. Most validators offer aliases like req for require and opt for optional.

JVString: Validates strings. Methods include setRegex() or regExp() to set a regular expression, setEnum() or enum() to define a list of allowed values, and setNull() or nullable() to allow null values.

JVNumber: Validates numbers. Methods include setMin() or min(), setMax() or max(), setEnum() or enum(), and setNull() or nullable().

JVBoolean: Validates booleans. It has setNull() or nullable() to allow null.

JVBigInt: Validates BigInts. Methods include setMin() or min(), setMax() or max(), setEnum() or enum(), and setNull() or nullable().

JVDate: Validates dates. Methods include setMin() or min(), setMax() or max(), setEnum() or enum(), and setNull() or nullable().

JVAny: A generic validator that accepts any value.

JVArray: Validates arrays. It takes another validator as an argument to define the type of the array's elements. Methods include setMin() or min() for minimum length, setMax() or max() for maximum length, and setConf() or config() to change the element validator.

JVNode: Validates nested JSON objects. It takes a JV instance as an argument to define the structure of the nested object. It also has setNull() or nullable().

JVClass: Validates that a key's value is an instance of a specified class. It can be initialized with a class object or a globally registered class name. It has setNull() or nullable().

JVCustom: Validates a key using a custom function. It can be initialized with a function or a globally registered function name.

JVSomeOf: Accepts an array of validators. If the value passes validation for at least one of the specified types, the validation succeeds.

JN (JSON Navigator)
JN is a utility tool for navigating, extracting, and manipulating data within a JSON object using simple paths.

path(json): Gets the path of all terminal keys within a JSON object.

pathWithValues(json): Gets the path and value of all terminal keys within a JSON object.

get(json, path): Extracts a value from a JSON object given its path.

materialize(pathJson, sourceJson): Recreates a JSON from a "paths" JSON object. This is highly useful for extracting only specific keys from a large, deeply nested JSON.

Installation and Documentation
For installation instructions, detailed documentation, or to contribute, visit the GitHub repository.

GitHub Repository: https://github.com/dmytro-vydysh/deep-json-validation

For any questions, bug reports, or feature requests, feel free to open a new issue on GitHub. All contributions are welcome!