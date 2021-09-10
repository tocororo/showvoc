export class ShowVocConstants {
    static visitorEmail: string = "public@showvoc.eu";
    static visitorPassword: string = "showvoc";
    static rolePristine: string = "showvoc_pristine";
    static roleStaging: string = "showvoc_staging";
    static rolePublic: string = "showvoc_public";

    static appCtx: string = "SHOWVOC"; //passed to services that requires to distinguish between VB and SV email service
}

export enum ShowVocConversionFormat {
    EXCEL = "EXCEL",
    RDF = "RDF",
    TBX = "TBX",
    ZTHES = "ZTHES"
}

export enum ShowVocUrlParams {
    hideNav = "hideNav",
    resId = "resId"
}