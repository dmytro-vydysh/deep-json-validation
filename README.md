# JSON Validator (JV) 🚀

A lightweight and powerful TypeScript library for JSON and single data validation, designed to be simple, fast, and highly functional.

## 🎯 Key Features

- **Complete validation**: Supports all common JavaScript data types
- **Nested structures**: Validation of complex objects and multidimensional arrays
- **Serialization**: Export and import validation schemas in JSON format
- **Template generation**: Automatically generate templates and examples from your schemas
- **Lightweight**: Minimal code with maximum functionality
- **TypeScript ready**: Fully typed for better developer experience

## 📦 Installation

```bash
npm install your-jv-package-name
```

## 🔧 Supported Validation Types

| Type | Class | Description |
|------|--------|-------------|
| `any` | `JVAny` | Any data type (includes null) |
| `array` | `JVArray` | Array of monotype data with quantity limits |
| `bigint` | `JVBigInt` | Large integers |
| `boolean` | `JVBoolean` | Boolean values |
| `class` | `JVClass` | Instances of specific classes |
| `date` | `JVDate` | Dates in ISO 8601 format, timestamp or Date instances |
| `file` | `JVFile` | File objects with mimetype validation |
| `node` | `JVNode` | Complex and nested JSON objects |
| `number` | `JVNumber` | Numbers with range and enum validation |
| `string` | `JVString` | Strings with regex, enum and validations |
| `custom` | `JVCustom` | Custom validations |

## 🚀 Quick Start

```typescript
import { JV, JVString, JVNumber, JVBoolean, JVArray, JVNode } from 'jv-library';

// Create a new validator
const jv = new JV();

// Define the schema
jv
  .require('name', new JVString())
  .require('age', new JVNumber().setMin(0).setMax(120))
  .optional('email', new JVString().setRegex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
  .require('isActive', new JVBoolean());

// Validate data
const userData = {
  name: 'John Doe',
  age: 30,
  email: 'john@example.com',
  isActive: true
};

try {
  const isValid = jv.validate(userData);
  console.log('Validation successful:', isValid);
} catch (error) {
  console.error('Validation error:', error.message);
}
```

## 📚 Detailed Guide

### Required and Optional Keys

```typescript
const jv = new JV();

// Required key
jv.require('name', new JVString());
jv.req('age', new JVNumber()); // Short alias

// Optional key
jv.optional('nickname', new JVString());
jv.opt('bio', new JVString()); // Short alias
```

### String Validation

```typescript
// Simple string
new JVString()

// With regex
new JVString().setRegex(/^[a-zA-Z\s]{2,50}$/)

// With enum
new JVString().setEnum(['admin', 'user', 'guest'])

// Can be null
new JVString().setNull()

// Complete configuration in constructor
new JVString(/^[a-zA-Z\s]{2,50}$/, true, ['admin', 'user', 'guest'])
```

### Number Validation

```typescript
// Simple number
new JVNumber()

// With range
new JVNumber().setMin(0).setMax(100)

// With enum
new JVNumber().setEnum([1, 5, 10, 25, 50])

// BigInt
new JVBigInt().setMin(0n).setMax(1000000000000000n)
```

### Array Validation

```typescript
// Array of numbers
new JVArray(new JVNumber())

// Array of strings with limits
new JVArray(new JVString()).setMin(1).setMax(10)

// Array of objects
new JVArray(new JVNode(new JV()
  .require('id', new JVNumber())
  .require('name', new JVString())
))

// Multidimensional array
new JVArray(new JVArray(new JVNumber()))
```

### Complex Object Validation

```typescript
const userSchema = new JV()
  .require('personalInfo', new JVNode(new JV()
    .require('firstName', new JVString())
    .require('lastName', new JVString())
    .optional('middleName', new JVString())
  ))
  .require('contacts', new JVNode(new JV()
    .require('email', new JVString().setRegex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
    .optional('phone', new JVString())
  ))
  .require('skills', new JVArray(new JVNode(new JV()
    .require('name', new JVString())
    .require('level', new JVNumber().setMin(1).setMax(10))
    .optional('certified', new JVBoolean())
  )));
```

### Date Validation

```typescript
// Simple date
new JVDate()

// With range
new JVDate()
  .setMin(new Date('2020-01-01'))
  .setMax(new Date('2030-12-31'))

// Accepts formats: ISO 8601, timestamp, Date instances
const validDates = [
  '2023-12-25T10:30:00Z',
  '2023-12-25',
  1703505000000,
  new Date()
];
```

### File Validation

```typescript
// Generic file
new JVFile()

// With restrictions
new JVFile()
  .setMimeTypes(['image/jpeg', 'image/png'])
  .setMaxSize(5 * 1024 * 1024) // 5MB
  .setMinSize(1024) // 1KB
```

### Custom Validation

```typescript
// Custom validation function
new JVCustom((value: any) => {
  if (typeof value !== 'string') {
    throw new Error('Must be a string');
  }
  if (value.length < 5) {
    throw new Error('Must be at least 5 characters long');
  }
  return true;
})
```

## 🔄 Serialization and Deserialization

### Export Schema

```typescript
const jv = new JV()
  .require('name', new JVString())
  .require('age', new JVNumber().setMin(0));

// Export schema to JSON
const schemaJSON = jv.json();
console.log(schemaJSON);
```

### Import Schema

```typescript
// Recreate validator from JSON
const restoredJV = JV.fromJSON(schemaJSON);

// Works exactly like the original
const isValid = restoredJV.validate(userData);
```

## 🛠️ Advanced Utilities

### Generate Templates

```typescript
// Empty template
const template = jv.template();
console.log(template);
// Output: { name: '', age: '', email: '' }

// Example with values
const example = jv.example();
console.log(example);
// Output: { name: 'a string value', age: 2025, email: 'a string value' }

// Example with validation rules
const exampleWithRules = jv.exampleWithRules();
console.log(exampleWithRules);
// Output: { name: 'A string, Has no regex, Cannot be null.', ... }
```

### Generate Schema from Object

```typescript
const existingData = {
  name: 'John',
  age: 30,
  active: true
};

// Create schema automatically
const autoSchema = JV.schema(existingData);
const schemaJSON = autoSchema.json();
```

### Path and Materialization

```typescript
// Get paths of all fields
const paths = JV.path(userData);
console.log(paths);
// Output: { name: 'name', age: 'age', email: 'email' }

// Materialize only specific fields
const materialized = JV.materialize({
  userName: 'name',
  userAge: 'age'
}, userData);
console.log(materialized);
// Output: { userName: 'John', userAge: 30 }

// Path with values
const pathWithValues = JV.pathWithValues(userData);
console.log(pathWithValues);
// Output: { name: { value: 'John', path: 'name' }, ... }
```

## 🚨 Error Handling

```typescript
try {
  jv.validate(invalidData);
} catch (error) {
  if (error instanceof JVKeyRequiredError) {
    console.log('Missing key:', error.message);
  } else if (error instanceof JVKeyRegexError) {
    console.log('Invalid regex:', error.message);
  } else if (error instanceof JVKeyTypeError) {
    console.log('Invalid type:', error.message);
  } else {
    console.log('Generic error:', error.message);
  }
}
```

## 🎯 Practical Examples

### API Endpoint Validation

```typescript
const userRegistrationSchema = new JV()
  .require('username', new JVString().setRegex(/^[a-zA-Z0-9_]{3,20}$/))
  .require('email', new JVString().setRegex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
  .require('password', new JVString().setRegex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/))
  .require('age', new JVNumber().setMin(13).setMax(120))
  .optional('newsletter', new JVBoolean().setNull())
  .optional('preferences', new JVNode(new JV()
    .optional('theme', new JVString().setEnum(['light', 'dark']))
    .optional('language', new JVString().setEnum(['en', 'es', 'fr', 'de']))
  ));

// Express middleware
app.post('/register', (req, res) => {
  try {
    userRegistrationSchema.validate(req.body);
    // Proceed with registration...
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

### Complex Configuration

```typescript
const appConfigSchema = new JV()
  .require('database', new JVNode(new JV()
    .require('host', new JVString())
    .require('port', new JVNumber().setMin(1).setMax(65535))
    .require('name', new JVString())
    .optional('ssl', new JVBoolean())
  ))
  .require('redis', new JVNode(new JV()
    .require('url', new JVString())
    .optional('password', new JVString())
  ))
  .require('features', new JVArray(new JVString().setEnum([
    'authentication',
    'analytics',
    'notifications',
    'file-upload'
  ])).setMin(1))
  .optional('logging', new JVNode(new JV()
    .require('level', new JVString().setEnum(['debug', 'info', 'warn', 'error']))
    .optional('file', new JVString())
  ));
```

### E-commerce Product Schema

```typescript
const productSchema = new JV()
  .require('id', new JVString().setRegex(/^[a-z0-9-]+$/))
  .require('name', new JVString().setRegex(/^.{1,100}$/))
  .require('price', new JVNumber().setMin(0))
  .require('category', new JVString().setEnum(['electronics', 'clothing', 'books', 'home']))
  .require('inventory', new JVNode(new JV()
    .require('stock', new JVNumber().setMin(0))
    .require('warehouse', new JVString())
    .optional('reserved', new JVNumber().setMin(0))
  ))
  .optional('specifications', new JVArray(new JVNode(new JV()
    .require('key', new JVString())
    .require('value', new JVString())
  ))))
  .optional('images', new JVArray(new JVString().setRegex(/^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i)))
  .require('active', new JVBoolean())
  .require('createdAt', new JVDate())
  .optional('updatedAt', new JVDate());
```

## 📊 Performance

- **Lightweight**: Minimal footprint
- **Fast**: Optimized validation performance
- **Memory efficient**: Efficient memory management
- **Scalable**: Suitable for applications of any size

## 🔧 Advanced Features

### Schema Composition

```typescript
// Reusable address schema
const addressSchema = new JV()
  .require('street', new JVString())
  .require('city', new JVString())
  .require('country', new JVString().setEnum(['US', 'CA', 'UK', 'DE', 'FR']))
  .optional('zipCode', new JVString());

// User schema with composed address
const userWithAddressSchema = new JV()
  .require('name', new JVString())
  .require('email', new JVString())
  .require('address', new JVNode(addressSchema))
  .optional('billingAddress', new JVNode(addressSchema));
```

### Conditional Validation

```typescript
const orderSchema = new JV()
  .require('items', new JVArray(new JVNode(new JV()
    .require('productId', new JVString())
    .require('quantity', new JVNumber().setMin(1))
  ))))
  .require('total', new JVNumber().setMin(0))
  .require('paymentMethod', new JVString().setEnum(['credit_card', 'paypal', 'bank_transfer']))
  .optional('shippingAddress', new JVNode(addressSchema))
  .optional('notes', new JVString().setRegex(/^.{0,500}$/));
```

## 🚨 Error Types

The library provides specific error types for better error handling:

- `JVKeyError`: Generic validation error
- `JVKeyRequiredError`: Missing required key
- `JVKeyRegexError`: Regex validation failed
- `JVKeyTypeError`: Type validation failed

## 🧪 Testing

```typescript
import { JV, JVString, JVNumber } from 'jv-library';

describe('User Validation', () => {
  let userSchema: JV;

  beforeEach(() => {
    userSchema = new JV()
      .require('name', new JVString())
      .require('age', new JVNumber().setMin(0).setMax(120));
  });

  test('should validate correct user data', () => {
    const userData = { name: 'John Doe', age: 30 };
    expect(() => userSchema.validate(userData)).not.toThrow();
  });

  test('should throw error for missing required field', () => {
    const userData = { name: 'John Doe' };
    expect(() => userSchema.validate(userData)).toThrow('JVKeyRequiredError');
  });

  test('should throw error for invalid age', () => {
    const userData = { name: 'John Doe', age: 150 };
    expect(() => userSchema.validate(userData)).toThrow();
  });
});
```

## 🤝 Contributing

This library is under continuous development! The main goal is to keep it as simple as possible. If you have ideas or suggestions, feel free to open an issue or pull request on the GitHub repository.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/your-username/jv-library.git

# Install dependencies
npm install

# Run tests
npm test

# Build the library
npm run build
```

## 📄 License

MIT License - see the LICENSE file for details.

## 🔗 Useful Links

- [GitHub Repository](https://github.com/your-username/jv-library)
- [NPM Package](https://www.npmjs.com/package/your-jv-package-name)
- [Documentation](https://your-docs-site.com)
- [Examples](https://github.com/your-username/jv-library/tree/main/examples)
- [Changelog](https://github.com/your-username/jv-library/blob/main/CHANGELOG.md)

## 🌟 Show Your Support

If this library helped you, please consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting new features
- 🔧 Contributing code

---

**Made with ❤️ to simplify JSON validation in TypeScript**