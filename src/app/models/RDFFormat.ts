export class RDFFormat {

    public name: string;
    public charset: string;
    public fileExtensions: string[];
    public standardURI: {namespace: string, localName: string};
    public mimetypes: string[];
    public defaultMIMEType: string;
    public defaultFileExtension: string;

    constructor(name: string, charset: string, fileExt: string[], standardURI: {namespace: string, localName: string},
        mimetypes: string[], defaultMIMEType: string, defaultFileExt: string) {
        this.name = name;
        this.charset = charset;
        this.fileExtensions = fileExt;
        this.standardURI = standardURI;
        this.mimetypes = mimetypes;
        this.defaultMIMEType = defaultMIMEType;
        this.defaultFileExtension = defaultFileExt;
    }

    static parse(formatJson: any): RDFFormat {
        let name = formatJson.name;
        let charset = formatJson.charset;
        let fileExtensions = formatJson.fileExtensions;
        let standardURI = formatJson.standardURI;
        let mimetypes = formatJson.mimetypes;
        let defaultMIMEType = formatJson.defaultMIMEType;
        let defaultFileExtension = formatJson.defaultFileExtension;
        return new RDFFormat(name, charset, fileExtensions, standardURI, mimetypes, defaultMIMEType, defaultFileExtension);
    }

}

export class DataFormat {
    public name: string;
    public defaultMimeType: string;
    public mimeTypes: string[];
    public defaultFileExtension: string;
    public fileExtensions: string[];

    constructor(name: string, defaultMimeType: string, mimeTypes: string[], defaultFileExtension: string, fileExtensions: string[]) {
        this.name = name;
        this.defaultMimeType = defaultMimeType;
        this.mimeTypes = mimeTypes;
        this.defaultFileExtension = defaultFileExtension;
        this.fileExtensions = fileExtensions;
    }

    static parse(formatJson: any): DataFormat {
        return new DataFormat(formatJson.name, formatJson.defaultMimeType, formatJson.mimeTypes, formatJson.defaultFileExtension, formatJson.fileExtensions);
    }
}