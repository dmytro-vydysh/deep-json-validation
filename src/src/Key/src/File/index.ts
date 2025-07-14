import { JVKeyError, throwError } from "../../../../src/Error";
import { IJVKey } from "../..";
import { TJVKeyType } from "../..";
import { JV } from "../../../JsonValidator";


export interface IJVFile {
  extensions?: Array<string>;
  mimeTypes?: Array<string>;
  minSize?: number;
  maxSize?: number;
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
  public minSize?: number;
  public maxSize?: number;
  constructor(_null?: boolean, extensions?: Array<string>, mimeTypes?: Array<string>, minSize?: number, maxSize?: number) {
    _null && this.setNull(_null);
    extensions && this.setExtensions(extensions);
    mimeTypes && this.setMimeTypes(mimeTypes);
    minSize && this.setMinSize(minSize);
    maxSize && this.setMaxSize(maxSize);
  }
  public setExtensions(value: Array<string>): JVFile {
    if (!Array.isArray(value))
      throwError(JVKeyError, `The extensions value must be an array. Received "${typeof value}".`, '');
    if (value.some(ext => typeof ext !== 'string'))
      throwError(JVKeyError, `The extensions value must be an array of strings. Received "${typeof value}".`, '');
    this.extensions = value;
    return this;
  }
  public setMimeTypes(value: Array<string>): JVFile {
    if (!Array.isArray(value))
      throwError(JVKeyError, `The mimeTypes value must be an array. Received "${typeof value}".`, '');
    if (value.some(ext => typeof ext !== 'string'))
      throwError(JVKeyError, `The mimeTypes value must be an array of strings. Received "${typeof value}".`, '');
    this.mimeTypes = value;
    return this;
  }
  public setMinSize(value: number): JVFile {
    if (typeof value !== 'number' || value < 0)
      throwError(JVKeyError, `The minSize value must be a positive number. Received "${typeof value}".`, '');
    if (this.maxSize && this.maxSize > 0 && value > this.maxSize)
      throwError(JVKeyError, `The minSize value "${value}" is greater than the maxSize value "${this.maxSize}".`, '');
    this.minSize = value;
    return this;
  }
  public setMaxSize(value: number): JVFile {
    if (typeof value !== 'number' || value < 0)
      throwError(JVKeyError, `The maxSize value must be a positive number. Received "${typeof value}".`, '');
    if (this.minSize && this.minSize > 0 && value < this.minSize)
      throwError(JVKeyError, `The maxSize value "${value}" is less than the minSize value "${this.minSize}".`, '');
    this.maxSize = value;
    return this;
  }
  public setNull(value: boolean = true): JVFile {
    if (typeof value !== 'boolean')
      throwError(JVKeyError, `The null value must be a boolean. Received "${typeof value}".`, '');
    this.null = value;
    return this;
  }
  private testingMessage(value: any, trace: Array<string>): void {
    try {
      if (process.env.JSON_VALIDATOR_TESTING_MODE_KEY === 'yes i am testing') {
        console.log(`[TESTING][FILE][VALIDATE][TRACE: ${trace}]`, value)
      }
    } catch (e) { }
  }
  public validate(value: any, trace: Array<string>): boolean {
    this.testingMessage(value, trace);
    if (this.null && value === null)
      return true;
    if (!(value instanceof JV.FILE_CLASS))
      throwError(JVKeyError, `The file value is not an instance of File.`, trace.join('.'));
    const mimeType: string = value.type;
    const name: string = value.name;
    const ext = name.split('.').pop();
    const extension: string = typeof ext === 'string' ? ext : '';
    if (!(['undefined', 'boolean'].includes(typeof this.mimeTypes)) && Array.isArray(this.mimeTypes) && !this.mimeTypes.includes(mimeType))
      throwError(JVKeyError, `The file has mime type "${mimeType}". Expected mime type to be one of "${this.mimeTypes.join(',')}".`, trace.join('.'));
    if (!(['undefined', 'boolean'].includes(typeof this.extensions)) && Array.isArray(this.extensions) && !this.extensions.includes(extension))
      throwError(JVKeyError, `The file has extension "${extension}". Expected extension to be one of "${this.extensions.join(',')}".`, trace.join('.'));
    if (typeof this.minSize === 'number' && value.size < this.minSize)
      throwError(JVKeyError, `The file has size "${value.size}". Expected size is at least "${this.minSize}".`, trace.join('.'));
    if (typeof this.maxSize === 'number' && value.size > this.maxSize)
      throwError(JVKeyError, `The file has size "${value.size}". Expected size is at most "${this.maxSize}".`, trace.join('.'));
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
      minSize: this.minSize,
      maxSize: this.maxSize
    };
  }
  public example() {
    return this.exampleWithRules();
  }
  public exampleWithRules() {

    let hasExtensions = this.extensions && this.extensions.length > 0 ? `Allowed extensions: ${this.extensions.join(', ')}` : '';
    let hasMimeTypes = this.mimeTypes && this.mimeTypes.length > 0 ? `Allowed mime types: ${this.mimeTypes.join(', ')}` : '';
    let hasMinSize = typeof this.minSize === 'number' ? `Minimum size: ${this.minSize} bytes` : '';
    let hasMaxSize = typeof this.maxSize === 'number' ? `Maximum size: ${this.maxSize} bytes` : '';
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
