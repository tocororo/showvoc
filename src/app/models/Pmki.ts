export class PmkiConstants {
    static visitorEmail: string = "public@pmki.eu";
    static visitorPassword: string = "pmki";
    static rolePristine: string = "pmki_pristine";
    static roleStaging: string = "pmki_staging";
    static rolePublic: string = "pmki_public";
}

export enum PmkiConversionFormat {
    EXCEL = "EXCEL",
    RDF = "RDF",
    TBX = "TBX",
    ZTHES = "ZTHES"
}