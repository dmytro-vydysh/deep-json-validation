# deep-json-validation

A **lightweight**, **powerful**, and **flexible** library for validating deeply structured JSON data.
Supports a wide variety of types, nested objects, arrays, and custom rules — all with a simple and expressive API.

> 🔎 Ideal for frontend-driven validation, automation, and backend schema enforcement.

---

## ✨ Features

* ✅ Schema-based validation (with required/optional keys)
* ⟲ Deep JSON validation with infinite nesting
* 🌟 Type validation with support for enum, regex, min/max, nullable
* 📂 Schema serialization/deserialization
* 🧪 Auto-generated example/template JSON
* ⚖️ Custom validator support
* 🔍 Utilities for path extraction and data mapping

---

## 📦 Installation

```bash
npm install deep-json-validation
```

---

## 🚀 Quick Start

```ts
import { JV, JVString, JVNumber, JVBoolean, JVArray, JVNode } from 'deep-json-validation';

const jv = new JV();

jv
  .req('name', new JVString())
  .req('age', new JVNumber().setMin(0).setMax(120))
  .req('is_active', new JVBoolean().setNull())
  .req('skills', new JVArray(
    new JVNode(
      new JV()
        .req('name', new JVString())
        .req('level', new JVNumber().setMin(0))
        .opt('notes', new JVString())
    )
  ).setMin(1).setMax(5));

const data = {
  name: 'Dmytro',
  age: 26,
  is_active: true,
  skills: [
    { name: 'MongoDB', level: 10 },
    { name: 'NodeJS', level: 10, notes: 'Fullstack developer' }
  ]
};

try {
  console.log('Validation result:', jv.validate(data));
} catch (e) {
  console.error('Validation error:', (e as Error).message);
}
```

---

## ✅ Supported Types

| Type        | Description                                                   |
| ----------- | ------------------------------------------------------------- |
| `JVAny`     | Accepts any value, including `null`.                          |
| `JVString`  | Validates strings. Supports `regex`, `enum`, `nullable`.      |
| `JVNumber`  | Validates numbers. Supports `min`, `max`, `enum`, `nullable`. |
| `JVBigInt`  | Same as `JVNumber`, but for big integers.                     |
| `JVBoolean` | Validates boolean values. Can be `nullable`.                  |
| `JVDate`    | Accepts ISO strings, `Date` instances, or timestamps.         |
| `JVClass`   | Validates class instances.                                    |
| `JVFile`    | Validates files by mimetype, extension, size.                 |
| `JVArray`   | Validates arrays with homogeneous content.                    |
| `JVNode`    | Nested JSON object validation using another `JV` instance.    |
| `JVCustom`  | Pass a synchronous custom validation function.                |

---

## 🧱 Nested Validation Examples

### Enum + Regex + Nullable

```ts
new JVString().setRegex(/^[a-zA-Z]{3,15}$/).setEnum(['John', 'Jane']).setNull();
```

### Array of objects

```ts
new JVArray(
  new JVNode(
    new JV()
      .req('title', new JVString())
      .req('completed', new JVBoolean())
  )
);
```

---

## 🔄 Schema Handling

### Export schema to JSON:

```ts
const schemaJSON = jv.json();
```

### Restore schema from JSON:

```ts
const restored = JV.fromJSON(schemaJSON);
restored.validate(data);
```

### Generate empty template:

```ts
const template = jv.template();
```

### Generate example JSON:

```ts
const example = jv.example();
```

### Generate example + rule descriptions:

```ts
const docs = jv.exampleWithRules();
```

---

## 🔍 Utilities

### `JV.path(obj)`

Returns a map of all nested properties with their full paths.

```ts
// { name: 'name', skills: [{ name: 'skills/0/name' }] }
```

### `JV.pathWithValues(obj)`

Same as above, but includes value:

```ts
// { name: { value: 'Dmytro', path: 'name' }, ... }
```

### `JV.materialize(map, obj)`

Extract only specific paths from an object:

```ts
const result = JV.materialize({
  name: 'name',
  level: 'skills/0/level'
}, data);

// { name: 'Dmytro', level: 10 }
```

---

## ⚠️ Validation Errors

| Error                | When it occurs           |
| -------------------- | ------------------------ |
| `JVKeyError`         | Generic validation error |
| `JVKeyRequiredError` | Required key is missing  |
| `JVKeyRegexError`    | Regex test failed        |
| `JVKeyTypeError`     | Type mismatch            |

---

## 🔎 Auto-generate schema from JSON

```ts
const generatedSchema = JV.schema(data);
console.dir(generatedSchema.json(), { depth: null });
```

---

## 🎯 Philosophy

> **Simple, readable, powerful.**
> This library was born out of real use cases: create JSON schemas easily, validate them quickly, and automate everything around them.

---

## 🤝 Contributing

Want to improve or suggest features?
Open an issue or pull request on [GitHub](https://github.com/your-username/deep-json-validation)

---

## 📄 License

**CC0 1.0 Universal (Public Domain)** – Use it freely, no attribution required.

---

## 👤 Author

**Dmytro Vydysh**
Fullstack Developer & Automation Enthusiast
📧 `info@dmytrovydysh.com`
