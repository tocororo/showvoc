import { IRI, Literal } from './Resources';
import { OWL, RDF, XmlSchema } from "./Vocabulary";

export interface DatatypeRestrictionsMap extends Map<string, DatatypeRestrictionDescription> { } //map of datatype -> restrictions

export class DatatypeUtils {

    public static xsdBuiltInTypes: IRI[] = [
        XmlSchema.anyURI,
        XmlSchema.base64Binary,
        XmlSchema.boolean,
        XmlSchema.byte,
        XmlSchema.date,
        XmlSchema.dateTime,
        XmlSchema.decimal,
        XmlSchema.double,
        XmlSchema.duration,
        XmlSchema.ENTITIES,
        XmlSchema.ENTITY,
        XmlSchema.float,
        XmlSchema.gDay,
        XmlSchema.gMonth,
        XmlSchema.gMonthDay,
        XmlSchema.gYear,
        XmlSchema.gYearMonth,
        XmlSchema.hexBinary,
        XmlSchema.ID,
        XmlSchema.IDREF,
        XmlSchema.IDREFS,
        XmlSchema.int,
        XmlSchema.integer,
        XmlSchema.language,
        XmlSchema.long,
        XmlSchema.Name,
        XmlSchema.NCName,
        XmlSchema.negativeInteger,
        XmlSchema.NMTOKEN,
        XmlSchema.NMTOKENS,
        XmlSchema.nonNegativeInteger,
        XmlSchema.nonPositiveInteger,
        XmlSchema.normalizedString,
        XmlSchema.NOTATION,
        XmlSchema.positiveInteger,
        XmlSchema.QName,
        XmlSchema.short,
        XmlSchema.string,
        XmlSchema.time,
        XmlSchema.token,
        XmlSchema.unsignedByte,
        XmlSchema.unsignedInt,
        XmlSchema.unsignedLong,
        XmlSchema.unsignedShort,
    ];

    /**
     * Datatypes defined as "numeric" in the XSD definition
     */
    public static xsdNumericDatatypes: IRI[] = [
        XmlSchema.byte,
        XmlSchema.decimal,
        XmlSchema.double,
        XmlSchema.float,
        XmlSchema.int,
        XmlSchema.integer,
        XmlSchema.long,
        XmlSchema.negativeInteger,
        XmlSchema.nonNegativeInteger,
        XmlSchema.nonPositiveInteger,
        XmlSchema.positiveInteger,
        XmlSchema.short,
        XmlSchema.unsignedByte,
        XmlSchema.unsignedInt,
        XmlSchema.unsignedLong,
        XmlSchema.unsignedShort,
    ];

    /**
     * Datatypes for which exists a UI widget or a programmatic check that validate implicitly the value
     * e.g. xsd:boolean, xsd:date, xsd:string or rdf:langString (which are valid simply if not empty)
     */
    public static programmaticallyValidableType: IRI[] = [
        RDF.langString,
        XmlSchema.boolean,
        XmlSchema.date,
        XmlSchema.dateTime,
        XmlSchema.time,
        XmlSchema.string,
    ];

    /**
     * Standard restrictions defined by the xsd scheme
     * Useful references:
     * https://www.w3.org/TR/xmlschema11-2
     * http://www.datypic.com/sc/xsd/s-datatypes.xsd.html
     * http://books.xmlschemata.org/relaxng/relax-CHP-19.html
     * 
     * the real pattern of xsd:Name is "\i\c*", see here https://github.com/TIBCOSoftware/genxdm/issues/69#issuecomment-125290603
     */
    public static typeRestrictionsMap: Map<string, ConstrainingFacets> = new Map([
        [XmlSchema.anyURI.getIRI(), {}],
        [XmlSchema.base64Binary.getIRI(), { pattern: "((([A-Za-z0-9+/] ?){4})*(([A-Za-z0-9+/] ?){3}[A-Za-z0-9+/]|([A-Za-z0-9+/] ?){2}[AEIMQUYcgkosw048] ?=|[A-Za-z0-9+/] ?[AQgw] ?= ?=))?" }],
        [XmlSchema.boolean.getIRI(), {}],
        [XmlSchema.byte.getIRI(), { minInclusive: -128, maxInclusive: 128, pattern: "[-+]?[0-9]+" }],
        [XmlSchema.date.getIRI(), {}],
        [XmlSchema.dateTime.getIRI(), {}],
        [XmlSchema.dateTimeStamp.getIRI(), { pattern: ".*(Z|(+|-)[0-9][0-9]:[0-9][0-9])" }],
        [XmlSchema.dayTimeDuration.getIRI(), {}], //unknown pattern [^YM]*(T.*)?
        [XmlSchema.decimal.getIRI(), {}],
        [XmlSchema.double.getIRI(), {}],
        [XmlSchema.duration.getIRI(), {}],
        [XmlSchema.ENTITIES.getIRI(), {}],
        [XmlSchema.ENTITY.getIRI(), {}], //unknown pattern \i\c* ∩ [\i-[:]][\c-[:]]*
        [XmlSchema.float.getIRI(), {}],
        [XmlSchema.gDay.getIRI(), {}],
        [XmlSchema.gMonth.getIRI(), {}],
        [XmlSchema.gMonthDay.getIRI(), {}],
        [XmlSchema.gYear.getIRI(), {}],
        [XmlSchema.gYearMonth.getIRI(), {}],
        [XmlSchema.hexBinary.getIRI(), {}],
        [XmlSchema.ID.getIRI(), {}], //unknown pattern \i\c* ∩ [\i-[:]][\c-[:]]*
        [XmlSchema.IDREF.getIRI(), {}], //unknown pattern \i\c* ∩ [\i-[:]][\c-[:]]*
        [XmlSchema.IDREFS.getIRI(), {}],
        [XmlSchema.int.getIRI(), { minInclusive: -2147483648, maxInclusive: 2147483647, pattern: "[-+]?[0-9]+" }],
        [XmlSchema.integer.getIRI(), { pattern: "[-+]?[0-9]+" }],
        [XmlSchema.language.getIRI(), { pattern: "[a-zA-Z]{1,8}(-[a-zA-Z0-9]{1,8})*" }],
        [XmlSchema.long.getIRI(), { minInclusive: -9223372036854775808, maxInclusive: 9223372036854775807, pattern: "[-+]?[0-9]+" }],
        [XmlSchema.Name.getIRI(), { pattern: "[_:A-Za-z][-._:A-Za-z0-9]*" }],
        [XmlSchema.NCName.getIRI(), {}], //unknown pattern \i\c* ∩ [\i-[:]][\c-[:]]*
        [XmlSchema.negativeInteger.getIRI(), { maxInclusive: -1, pattern: "[-+]?[0-9]+" }],
        [XmlSchema.NMTOKEN.getIRI(), {}],
        [XmlSchema.NMTOKENS.getIRI(), {}],
        [XmlSchema.nonNegativeInteger.getIRI(), { minInclusive: 0, pattern: "[-+]?[0-9]+" }],
        [XmlSchema.nonPositiveInteger.getIRI(), { maxInclusive: 0, pattern: "[-+]?[0-9]+" }],
        [XmlSchema.normalizedString.getIRI(), {}],
        [XmlSchema.NOTATION.getIRI(), {}],
        [XmlSchema.positiveInteger.getIRI(), { minInclusive: 1, pattern: "^[-+]?[0-9]+$" }],
        [XmlSchema.QName.getIRI(), {}],
        [XmlSchema.short.getIRI(), { minInclusive: -32768, maxInclusive: 32767, pattern: "[-+]?[0-9]+" }],
        [XmlSchema.string.getIRI(), {}],
        [XmlSchema.time.getIRI(), {}],
        [XmlSchema.token.getIRI(), {}],
        [XmlSchema.unsignedByte.getIRI(), { minInclusive: 0, maxInclusive: 255, pattern: "[-+]?[0-9]+" }],
        [XmlSchema.unsignedInt.getIRI(), { minInclusive: 0, maxInclusive: 4294967295, pattern: "[-+]?[0-9]+" }],
        [XmlSchema.unsignedLong.getIRI(), { minInclusive: 0, maxInclusive: 18446744073709551615, pattern: "[-+]?[0-9]+" }],
        [XmlSchema.unsignedShort.getIRI(), { minInclusive: 0, maxInclusive: 65535, pattern: "[-+]?[0-9]+" }],
        [XmlSchema.yearMonthDuration.getIRI(), { pattern: "-?P((([0-9]+Y)([0-9]+M)?)|([0-9]+M))" }],
    ]);

    /**
     * Restrictions not defined explicitly in the standards, but defined accordingly their description
     */
    public static notStandardRestrictionsMap: Map<string, ConstrainingFacets> = new Map([
        [OWL.rational.getIRI(), { pattern: "[-+]?[0-9]+(/[1-9][0-9]*)*" }], //https://www.w3.org/TR/owl2-syntax/#Real_Numbers.2C_Decimal_Numbers.2C_and_Integers
    ]);

}

export class ConstrainingFacets {
    minExclusive?: number;
    minInclusive?: number;
    maxExclusive?: number;
    maxInclusive?: number;
    pattern?: string;
}

export class DatatypeRestrictionDescription {
    enumerations?: Literal[];
    facets?: FacetsRestriction;
}

export class FacetsRestriction {
    base: IRI;
    facets: ConstrainingFacets = new ConstrainingFacets();
}