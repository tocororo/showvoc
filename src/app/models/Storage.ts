export interface DirectoryEntryInfo {
    type: EntryType;
    name: string;
    creationTimestamp: number;
}

export enum EntryType {
    FILE = "FILE",
    DIRECTORY = "DIRECTORY"
}


export interface DownloadsMap {
    [fileName: string]: SingleDownload;
}

export interface SingleDownload {
    fileName: string;
    langToLocalizedMap: { [lang: string]: string }; //lang->localized
    timestamp: number;
    format: string;
}