import { JVKeyError, throwError } from "../../../../src/Error";
import { IJVKey } from "../..";
import { TJVKeyType } from "../..";
import { JV } from "../../../JsonValidator";


export interface IJVFile {
  extensions?: Array<string>;
  mimeTypes?: Array<string>;
  _minSize?: number;
  _maxSize?: number;
}
export interface IJVKeyFileJSON {
  type: 'file';
  null: boolean;
  extensions?: Array<string>;
  mimeTypes?: Array<string>;
  minSize?: number;
  maxSize?: number;
}
export class JVFile implements IJVFile, IJVKey {
  public type: TJVKeyType = 'file';
  public null: boolean = false;
  public extensions?: Array<string>;
  public mimeTypes?: Array<string>;
  public _minSize?: number;
  public _maxSize?: number;
  constructor(_null?: boolean, extensions?: Array<string>, mimeTypes?: Array<string>, minSize?: number, maxSize?: number) {
    _null && this.setNull(_null);
    extensions && this.setExtensions(extensions);
    mimeTypes && this.setMimeTypes(mimeTypes);
    minSize && this.setMinSize(minSize);
    maxSize && this.setMaxSize(maxSize);
  }
  public setExtensions(value?: Array<string>): JVFile {
    if (typeof value === 'undefined') {
      this.extensions = undefined;
      return this;
    }
    if (!Array.isArray(value))
      throwError(JVKeyError, `The extensions value must be an array. Received "${typeof value}".`, '');
    if (value.some(ext => typeof ext !== 'string'))
      throwError(JVKeyError, `The extensions value must be an array of strings. Received "${typeof value}".`, '');
    this.extensions = value;
    return this;
  }
  public ext = this.setExtensions;
  public setMimeTypes(value?: Array<string>): JVFile {
    if (typeof value === 'undefined') {
      this.mimeTypes = undefined;
      return this;
    }
    if (!Array.isArray(value))
      throwError(JVKeyError, `The mimeTypes value must be an array. Received "${typeof value}".`, '');
    if (value.some(ext => typeof ext !== 'string'))
      throwError(JVKeyError, `The mimeTypes value must be an array of strings. Received "${typeof value}".`, '');
    this.mimeTypes = value;
    return this;
  }
  public mime = this.setMimeTypes;
  public setMinSize(value?: number): JVFile {
    if (typeof value === 'undefined') {
      this._minSize = undefined;
      return this;
    }
    if (typeof value !== 'number' || value < 0)
      throwError(JVKeyError, `The minSize value must be a positive number. Received "${typeof value}".`, '');
    if (this._maxSize && this._maxSize > 0 && value > this._maxSize)
      throwError(JVKeyError, `The minSize value "${value}" is greater than the maxSize value "${this._maxSize}".`, '');
    this._minSize = value;
    return this;
  }
  public minSize = this.setMinSize;
  public setMaxSize(value?: number): JVFile {
    if (typeof value === 'undefined') {
      this._maxSize = undefined;
      return this;
    }
    if (typeof value !== 'number' || value < 0)
      throwError(JVKeyError, `The maxSize value must be a positive number. Received "${typeof value}".`, '');
    if (this._minSize && this._minSize > 0 && value < this._minSize)
      throwError(JVKeyError, `The maxSize value "${value}" is less than the minSize value "${this._minSize}".`, '');
    this._maxSize = value;
    return this;
  }
  public setNull(value: boolean = true): JVFile {
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
        console.log(`[TESTING][FILE][VALIDATE][TRACE: ${trace}]`, value)
      }
    } catch (e) { }
  }
  public validate(value: any, trace: Array<string>, _throwError: boolean = true): boolean {
    this.testingMessage(value, trace);
    if (this.null && value === null)
      return true;
    if (!(value instanceof JV.FILE_CLASS))
      throwError(JVKeyError, `The file value is not an instance of File.`, trace.join('/'));
    const mimeType: string = value.type;
    const name: string = value.name;
    const ext = name.split('.').pop();
    const extension: string = typeof ext === 'string' ? ext : '';
    if (
      typeof this.mimeTypes !== 'undefined' &&
      typeof this.mimeTypes !== 'boolean' &&
      Array.isArray(this.mimeTypes) &&
      !this.mimeTypes.includes(mimeType) &&
      !this.mimeTypes.some((m: string) => m.endsWith('*') && mimeType[0] === m[0])
    ) {
      if (_throwError)
        throwError(JVKeyError, `The file has mime type "${mimeType}". Expected mime type to be one of "${this.mimeTypes.join(',')}".`, trace.join('/'));
      else return false;
    }
    if (!(['undefined', 'boolean'].includes(typeof this.extensions)) && Array.isArray(this.extensions) && !this.extensions.includes(extension)) {
      if (_throwError)
        throwError(JVKeyError, `The file has extension "${extension}". Expected extension to be one of "${this.extensions.join(',')}".`, trace.join('/'));
      else return false;
    }
    if (typeof this._minSize === 'number' && value.size < this._minSize) {
      if (_throwError)
        throwError(JVKeyError, `The file has size "${value.size}". Expected size is at least "${this._minSize}".`, trace.join('/'));
      else return false;
    }
    if (typeof this._maxSize === 'number' && value.size > this._maxSize) {
      if (_throwError)
        throwError(JVKeyError, `The file has size "${value.size}". Expected size is at most "${this._maxSize}".`, trace.join('/'));
      else return false;
    }
    return true;
  }

  template() { return ''; }
  public path(trace: Array<string>) { return trace.join('/'); }
  public json(): IJVKeyFileJSON {
    return {
      type: 'file',
      null: this.null,
      extensions: this.extensions,
      mimeTypes: this.mimeTypes,
      minSize: this._minSize,
      maxSize: this._maxSize
    };
  }
  public example() {
    return this.exampleWithRules();
  }
  public exampleWithRules() {

    let hasExtensions = this.extensions && this.extensions.length > 0 ? `Allowed extensions: ${this.extensions.join(', ')}` : '';
    let hasMimeTypes = this.mimeTypes && this.mimeTypes.length > 0 ? `Allowed mime types: ${this.mimeTypes.join(', ')}` : '';
    let hasMinSize = typeof this._minSize === 'number' ? `Minimum size: ${this._minSize} bytes` : '';
    let hasMaxSize = typeof this._maxSize === 'number' ? `Maximum size: ${this._maxSize} bytes` : '';
    return `A file, ${[hasExtensions, hasMimeTypes, hasMinSize, hasMaxSize].filter(Boolean).join(', ')}.`;
  }

  public static fromJSON(json: IJVKeyFileJSON): JVFile {
    return new JVFile(
      json.null,
      json.extensions,
      json.mimeTypes,
      json.minSize,
      json.maxSize
    );
  }
}
