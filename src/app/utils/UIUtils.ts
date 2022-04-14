import { ElementRef } from '@angular/core';
import { AnnotatedValue, IRI, Literal, RDFResourceRolesEnum, ResAttribute, Resource, Value } from '../models/Resources';
import { OWL, RDF, XmlSchema } from '../models/Vocabulary';

export class UIUtils {

    private static availableFlagLang = ["ar", "be", "bg", "bn", "cs", "da", "de", "el", "en", "en-GB", "en-US", "es", "et", "fa", "fr", "fi", "ga", 
        "hi", "hr", "hu", "hy", "id", "it", "ja", "ka", "km", "ko", "lv", "nl", "no", "pl", "pt", "ro", "ru", "sk", "sl", "sq", "sr", "sv",
        "th", "tr", "uk", "vi", "zh"];

    private static classImgSrc = "./assets/images/icons/res/class.png";
    private static classImportedImgSrc = "./assets/images/icons/res/class_imported.png";
    private static classDeprecatedImgSrc = "./assets/images/icons/res/class_deprecated.png";
    private static classImportedDeprecatedImgSrc = "./assets/images/icons/res/class_imported_deprecated.png";
    private static classDefVocImgSrc = "./assets/images/icons/res/class_defvoc.png";//how to use?
    private static classDefVocDeprecatedImgSrc = "./assets/images/icons/res/class_defvoc_deprecated.png";//how to use?
    
    private static conceptImgSrc = "./assets/images/icons/res/concept.png";
    private static conceptImportedImgSrc = "./assets/images/icons/res/concept_imported.png";
    private static conceptDeprecatedImgSrc = "./assets/images/icons/res/concept_deprecated.png";
    private static conceptImportedDeprecatedImgSrc = "./assets/images/icons/res/concept_imported_deprecated.png";
    
    private static conceptSchemeImgSrc = "./assets/images/icons/res/conceptScheme.png";
    private static conceptSchemeImportedImgSrc = "./assets/images/icons/res/conceptScheme_imported.png";
    private static conceptSchemeDeprecatedImgSrc = "./assets/images/icons/res/conceptScheme_deprecated.png";
    private static conceptSchemeImportedDeprecatedImgSrc = "./assets/images/icons/res/conceptScheme_imported_deprecated.png";
    
    private static collectionImgSrc = "./assets/images/icons/res/collection.png";
    private static collectionImportedImgSrc = "./assets/images/icons/res/collection_imported.png";
    private static collectionDeprecatedImgSrc = "./assets/images/icons/res/collection_deprecated.png";
    private static collectionImportedDeprecatedImgSrc = "./assets/images/icons/res/collection_imported_deprecated.png";

    private static datatypeImgSrc = "./assets/images/icons/res/datatype.png";
    private static datatypeImportedImgSrc = "./assets/images/icons/res/datatype_imported.png";
    private static datatypeDeprecatedImgSrc = "./assets/images/icons/res/datatype_deprecated.png";
    private static datatypeImportedDeprecatedImgSrc = "./assets/images/icons/res/datatype_imported_deprecated.png";

    private static individualImgSrc = "./assets/images/icons/res/individual.png";
    private static individualImportedImgSrc = "./assets/images/icons/res/individual_imported.png";
    private static individualDeprecatedImgSrc = "./assets/images/icons/res/individual_deprecated.png";
    private static individualImportedDeprecatedImgSrc = "./assets/images/icons/res/individual_imported_deprecated.png";

    private static lexiconImgSrc = "./assets/images/icons/res/lexicon.png";
    private static lexiconImportedImgSrc = "./assets/images/icons/res/lexicon_imported.png";
    private static lexiconDeprecatedImgSrc = "./assets/images/icons/res/lexicon_deprecated.png";
    private static lexiconImportedDeprecatedImgSrc = "./assets/images/icons/res/lexicon_imported_deprecated.png";

    private static lexicEntryImgSrc = "./assets/images/icons/res/lexEntry.png";
    private static lexicEntryImportedImgSrc = "./assets/images/icons/res/lexEntry_imported.png";
    private static lexicEntryDeprecatedImgSrc = "./assets/images/icons/res/lexEntry_deprecated.png";
    private static lexicEntryImportedDeprecatedImgSrc = "./assets/images/icons/res/lexEntry_imported_deprecated.png";

    private static lexicSenseImgSrc = "./assets/images/icons/res/ontolexLexicalSense.png";
    private static lexicSenseImportedImgSrc = "./assets/images/icons/res/ontolexLexicalSense_imported.png";
    private static lexicSenseDeprecatedImgSrc = "./assets/images/icons/res/ontolexLexicalSense_deprecated.png";
    private static lexicSenseImportedDeprecatedImgSrc = "./assets/images/icons/res/ontolexLexicalSense_imported_deprecated.png";

    private static lexicalFormImgSrc = "./assets/images/icons/res/lexForm.png";
    private static lexicalFormImportedImgSrc = "./assets/images/icons/res/lexForm_imported.png";
    private static lexicalFormDeprecatedImgSrc = "./assets/images/icons/res/lexForm_deprecated.png";
    private static lexicalFormImportedDeprecatedImgSrc = "./assets/images/icons/res/lexForm_imported_deprecated.png";

    private static orderedCollectionImgSrc = "./assets/images/icons/res/orderedCollection.png";
    private static orderedCollectionImportedImgSrc = "./assets/images/icons/res/orderedCollection_imported.png";
    private static orderedCollectionDeprecatedImgSrc = "./assets/images/icons/res/orderedCollection_deprecated.png";
    private static orderedCollectionImportedDeprecatedImgSrc = "./assets/images/icons/res/orderedCollection_imported_deprecated.png";

    private static xLabelImgSrc = "./assets/images/icons/res/xLabel.png";
    private static xLabelImportedImgSrc = "./assets/images/icons/res/xLabel_imported.png";
    private static xLabelDeprecatedImgSrc = "./assets/images/icons/res/xLabel_deprecated.png";
    private static xLabelImportedDeprecatedImgSrc = "./assets/images/icons/res/xLabel_imported_deprecated.png";
    
    private static ontologyImgSrc = "./assets/images/icons/res/ontology.png";
    
    private static propImgSrc = "./assets/images/icons/res/prop.png";
    private static propImportedImgSrc = "./assets/images/icons/res/prop_imported.png";
    private static propDeprecatedImgSrc = "./assets/images/icons/res/prop_deprecated.png";
    private static propImportedDeprecatedImgSrc = "./assets/images/icons/res/prop_imported_deprecated.png";
    
    private static propObjectImgSrc = "./assets/images/icons/res/propObject.png";
    private static propObjectImportedImgSrc = "./assets/images/icons/res/propObject_imported.png";
    private static propObjectDeprecatedImgSrc = "./assets/images/icons/res/propObject_deprecated.png";
    private static propObjectImportedDeprecatedImgSrc = "./assets/images/icons/res/propObject_imported_deprecated.png";
    
    private static propDatatypeImgSrc = "./assets/images/icons/res/propDatatype.png";
    private static propDatatypeImportedImgSrc = "./assets/images/icons/res/propDatatype_imported.png";
    private static propDatatypeDeprecatedImgSrc = "./assets/images/icons/res/propDatatype_deprecated.png";
    private static propDatatypeImportedDeprecatedImgSrc = "./assets/images/icons/res/propDatatype_imported_deprecated.png";
    
    private static propAnnotationImgSrc = "./assets/images/icons/res/propAnnotation.png";
    private static propAnnotationImportedImgSrc = "./assets/images/icons/res/propAnnotation_imported.png";
    private static propAnnotationDeprecatedImgSrc = "./assets/images/icons/res/propAnnotation_deprecated.png";
    private static propAnnotationImportedDeprecatedImgSrc = "./assets/images/icons/res/propAnnotation_imported_deprecated.png";
    
    private static propOntologyImgSrc = "./assets/images/icons/res/propOntology.png";
    private static propOntologyImportedImgSrc = "./assets/images/icons/res/propOntology_imported.png";
    private static propOntologyDeprecatedImgSrc = "./assets/images/icons/res/propOntology_deprecated.png";
    private static propOntologyImportedDeprecatedImgSrc = "./assets/images/icons/res/propOntology_imported_deprecated.png";

    private static mentionImgSrc = "./assets/images/icons/res/mention.png"; 


    static getImageSrc(rdfResource: AnnotatedValue<Value>): string {
        let imgSrc: string;
        let value = rdfResource.getValue();
        if (value instanceof Resource) {
            let role: RDFResourceRolesEnum = rdfResource.getAttribute(ResAttribute.ROLE);
            let deprecated: boolean = rdfResource.isDeprecated();
            let explicit: boolean = rdfResource.getAttribute(ResAttribute.EXPLICIT) || rdfResource.getAttribute(ResAttribute.EXPLICIT) == undefined;
            if (role == RDFResourceRolesEnum.annotationProperty) {
                imgSrc = this.propAnnotationImgSrc;
                if (!explicit) {
                    imgSrc = this.propAnnotationImportedImgSrc;
                    if (deprecated) {
                        imgSrc = this.propAnnotationImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = this.propAnnotationDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.cls) {
                imgSrc = this.classImgSrc;
                if (!explicit) {
                    imgSrc = this.classImportedImgSrc;
                    if (deprecated) {
                        imgSrc = this.classImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = this.classDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.concept) {
                imgSrc = this.conceptImgSrc;
                if (!explicit) {
                    imgSrc = this.conceptImportedImgSrc;
                    if (deprecated) {
                        imgSrc = this.conceptImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = this.conceptDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.conceptScheme) {
                imgSrc = this.conceptSchemeImgSrc;
                if (!explicit) {
                    imgSrc = this.conceptSchemeImportedImgSrc;
                    if (deprecated) {
                        imgSrc = this.conceptSchemeImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = this.conceptSchemeDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.dataRange) {
                imgSrc = this.datatypeImgSrc;
                if (!explicit) {
                    imgSrc = this.datatypeImportedImgSrc;
                    if (deprecated) {
                        imgSrc = this.datatypeImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = this.datatypeDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.datatypeProperty) {
                imgSrc = this.propDatatypeImgSrc;
                if (!explicit) {
                    imgSrc = this.propDatatypeImportedImgSrc;
                    if (deprecated) {
                        imgSrc = this.propDatatypeImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = this.propDatatypeDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.individual) {
                imgSrc = this.individualImgSrc;
                if (!explicit) {
                    imgSrc = this.individualImportedImgSrc;
                    if (deprecated) {
                        imgSrc = this.individualImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = this.individualDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.limeLexicon) {
                imgSrc = this.lexiconImgSrc;
                if (!explicit) {
                    imgSrc = this.lexiconImportedImgSrc;
                    if (deprecated) {
                        imgSrc = this.lexiconImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = this.lexiconDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.mention) {
                imgSrc = this.mentionImgSrc;
            } else if (role == RDFResourceRolesEnum.objectProperty) {
                imgSrc = this.propObjectImgSrc;
                if (!explicit) {
                    imgSrc = this.propObjectImportedImgSrc;
                    if (deprecated) {
                        imgSrc = this.propObjectImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = this.propObjectDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.ontolexForm) {
                imgSrc = this.lexicalFormImgSrc;
                if (!explicit) {
                    imgSrc = this.lexicalFormImportedImgSrc;
                    if (deprecated) {
                        imgSrc = this.lexicalFormImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = this.lexicalFormDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.ontolexLexicalEntry) {
                imgSrc = this.lexicEntryImgSrc;
                if (!explicit) {
                    imgSrc = this.lexicEntryImportedImgSrc;
                    if (deprecated) {
                        imgSrc = this.lexicEntryImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = this.lexicEntryDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.ontolexLexicalSense) {
                imgSrc = this.lexicSenseImgSrc;
                if (!explicit) {
                    imgSrc = this.lexicSenseImportedImgSrc;
                    if (deprecated) {
                        imgSrc = this.lexicSenseImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = this.lexicSenseDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.ontology) {
                imgSrc = this.ontologyImgSrc;
            } else if (role == RDFResourceRolesEnum.ontologyProperty) {
                imgSrc = this.propOntologyImgSrc;
                if (!explicit) {
                    imgSrc = this.propOntologyImportedImgSrc;
                    if (deprecated) {
                        imgSrc = this.propOntologyImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = this.propOntologyDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.property) {
                imgSrc = this.propImgSrc;
                if (!explicit) {
                    imgSrc = this.propImportedImgSrc;
                    if (deprecated) {
                        imgSrc = this.propImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = this.propDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.skosCollection) {
                imgSrc = this.collectionImgSrc;
                if (!explicit) {
                    imgSrc = this.collectionImportedImgSrc;
                    if (deprecated) {
                        imgSrc = this.collectionImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = this.collectionDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.skosOrderedCollection) {
                imgSrc = this.orderedCollectionImgSrc;
                if (!explicit) {
                    imgSrc = this.orderedCollectionImportedImgSrc;
                    if (deprecated) {
                        imgSrc = this.orderedCollectionImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = this.orderedCollectionDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.xLabel) {
                let lang: string = rdfResource.getAttribute(ResAttribute.LANG);
                if (lang != null) {
                    imgSrc = this.getFlagImgSrc(lang);
                } else {
                    imgSrc = this.xLabelImgSrc;
                    if (!explicit) {
                        imgSrc = this.xLabelImportedImgSrc;
                        if (deprecated) {
                            imgSrc = this.xLabelImportedDeprecatedImgSrc;
                        }
                    } else if (deprecated) {
                        imgSrc = this.xLabelDeprecatedImgSrc;
                    }
                }
            } else { //unknown role (none of the previous roles)
                imgSrc = this.individualImgSrc;
            }
        } else if (value instanceof Literal) {
            let lang: string = value.getLanguage();
            let datatype: IRI = value.getDatatype();
            if (lang != null) {
                imgSrc = this.getFlagImgSrc(lang);
            } else if (datatype != null) {
                if (datatype.equals(XmlSchema.language)) {
                    imgSrc = this.getFlagImgSrc(value.getLabel());
                } else {
                    imgSrc = this.getDatatypeImgSrc(datatype);
                }
            }
        }
        return imgSrc;
    }

    static getRoleImageSrc(role: RDFResourceRolesEnum) {
        if (role == RDFResourceRolesEnum.concept) {
            return this.conceptImgSrc;
        } else if (role == RDFResourceRolesEnum.conceptScheme) {
            return this.conceptSchemeImgSrc;
        } else if (role == RDFResourceRolesEnum.cls) {
            return this.classImgSrc;
        } else if (role == RDFResourceRolesEnum.individual) {
            return this.individualImgSrc;
        } else if (role == RDFResourceRolesEnum.skosCollection) {
            return this.collectionImgSrc;
        } else if (role == RDFResourceRolesEnum.skosOrderedCollection) {
            return this.orderedCollectionImgSrc;
        } else if (role == RDFResourceRolesEnum.property) {
            return this.propImgSrc;
        } else if (role == RDFResourceRolesEnum.annotationProperty) {
            return this.propAnnotationImgSrc;
        } else if (role == RDFResourceRolesEnum.datatypeProperty) {
            return this.propDatatypeImgSrc;
        } else if (role == RDFResourceRolesEnum.objectProperty) {
            return this.propObjectImgSrc;
        } else if (role == RDFResourceRolesEnum.ontologyProperty) {
            return this.propOntologyImgSrc;
        } else if (role == RDFResourceRolesEnum.xLabel) {
            return this.xLabelImgSrc;
        } else { //default
            return this.individualImgSrc;
        }
    }

    static getFlagImgSrc(langTag: string): string {
        let imgSrc: string;
        if (langTag != null && this.availableFlagLang.indexOf(langTag) != -1) {
            imgSrc = "./assets/images/flags/flag_" + langTag + ".png";
        } else {
            imgSrc = "./assets/images/flags/flag_unknown.png";
        }
        return imgSrc;
    }

    static getDatatypeImgSrc(datatype: IRI): string {
        let imgSrc: string;
        if (datatype.equals(XmlSchema.dateTime) || datatype.equals(XmlSchema.dateTimeStamp)) {
            imgSrc = "./assets/images/icons/res/datetime.png";
        } else if (datatype.equals(XmlSchema.date)) {
            imgSrc = "./assets/images/icons/res/date.png";
        } else if (datatype.equals(XmlSchema.time)) {
            imgSrc = "./assets/images/icons/res/time.png";
        } else if (datatype.equals(RDF.xmlLiteral) || datatype.equals(XmlSchema.string) || datatype.equals(XmlSchema.normalizedString)) {
            imgSrc = "./assets/images/icons/res/string.png";
        } else if (datatype.equals(XmlSchema.boolean)) {
            imgSrc = "./assets/images/icons/res/boolean.png";
        } else if (datatype.equals(OWL.rational) || datatype.equals(OWL.real) ||
            datatype.equals(XmlSchema.byte) || datatype.equals(XmlSchema.decimal) || datatype.equals(XmlSchema.double) || 
            datatype.equals(XmlSchema.float) || datatype.equals(XmlSchema.int) || datatype.equals(XmlSchema.integer) || 
            datatype.equals(XmlSchema.long) || datatype.equals(XmlSchema.negativeInteger) || 
            datatype.equals(XmlSchema.nonNegativeInteger) || datatype.equals(XmlSchema.nonPositiveInteger) || 
            datatype.equals(XmlSchema.positiveInteger) ||datatype.equals(XmlSchema.short) || 
            datatype.equals(XmlSchema.unsignedByte) || datatype.equals(XmlSchema.unsignedInt) || 
            datatype.equals(XmlSchema.unsignedLong) || datatype.equals(XmlSchema.unsignedShort)) {
            imgSrc = "./assets/images/icons/res/number.png";
        } else {
            imgSrc = "./assets/images/icons/res/unknown_datatype.png";
        }
        return imgSrc;
    }

    /**
     * This method is needed in order to face cross-browser compatibility with full size modals (modals that stretch to fill up to 95vh).
     * Note: This method must be called only after the view is initialized, so preferrable in ngAfterViewInit()
     * @param elementRef 
     */
    public static setFullSizeModal(elementRef: ElementRef) {
        let modalContentElement: HTMLElement = elementRef.nativeElement.parentElement;
        modalContentElement.style.setProperty("flex", "1");
    }

}

/**
 * Useful for trees and nodes to be aware of the context where they are
 */
export enum TreeListContext {
    clsIndTree = 'clsIndTree', //usefull to show instance number in some context
    dataPanel = 'dataPanel' //context for trees and list inside the "multi-panel" (Class, Concept, Scheme,...) in Data page
}