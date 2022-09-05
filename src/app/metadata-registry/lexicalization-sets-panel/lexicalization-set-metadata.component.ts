import { ChangeDetectorRef, Component, Input, SimpleChanges } from "@angular/core";
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from 'src/app/modal-dialogs/Modals';
import { DatasetMetadata2, LexicalizationSetMetadata } from 'src/app/models/Metadata';
import { IRI } from 'src/app/models/Resources';
import { OntoLex, RDFS, SKOS, SKOSXL } from 'src/app/models/Vocabulary';
import { MetadataRegistryServices } from 'src/app/services/metadata-registry.service';

@Component({
    selector: "lexicalization-set-metadata",
    templateUrl: "./lexicalization-set-metadata.component.html",
    styles: [":host { display: block; }"]
})
export class LexicalizationSetMetadataComponent {

    @Input() dataset: DatasetMetadata2;
    @Input() lexicalizationSetMetadata: LexicalizationSetMetadata;
    @Input() readonly: boolean = false; //metadata are shown in a table as plain strings
    @Input() disabled: boolean = false; //metadata are shown in input fields which are disabled

    collapsed: boolean;

    // private lexicalizationSet: string;
    lexiconDataset: string;
    lexicalizationModel: string;
    language: string;
    references: number;
    lexicalEntries: number;
    lexicalizations: number;
    percentage: number;
    avgNumOfLexicalizations: number;

    private lexicalModelMap = [
        { iri: RDFS.uri, label: "RDFS" },
        { iri: SKOS.uri, label: "SKOS" },
        { iri: SKOSXL.uri, label: "SKOSXL" },
        { iri: OntoLex.uri, label: "OntoLex" }
    ];
    lexicalModelOpts = ["RDFS", "SKOS", "SKOSXL", "OntoLex"];


    constructor(private metadataRegistryService: MetadataRegistryServices, private basicModals: BasicModalsServices, private changeDetectorRef: ChangeDetectorRef) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['lexicalizationSetMetadata'] && changes['lexicalizationSetMetadata'].currentValue) {
            this.lexiconDataset = this.lexicalizationSetMetadata.lexiconDataset;

            this.lexicalModelMap.forEach(lexModel => {
                if (this.lexicalizationSetMetadata.lexicalizationModel == lexModel.iri) {
                    this.lexicalizationModel = lexModel.label;
                }
            });

            this.language = this.lexicalizationSetMetadata.language;
            this.references = this.lexicalizationSetMetadata.references;
            this.lexicalEntries = this.lexicalizationSetMetadata.lexicalEntries;
            this.lexicalizations = this.lexicalizationSetMetadata.lexicalizations;
            this.percentage = this.lexicalizationSetMetadata.percentage;
            this.avgNumOfLexicalizations = this.lexicalizationSetMetadata.avgNumOfLexicalizations;
        }
    }

    updateLexiconDataset(newValue: string) {
        if (newValue != this.lexiconDataset) {
            if (!IRI.regexp.test(newValue)) {
                this.basicModals.alert({ key: "STATUS.INVALID_VALUE" }, { key: "MESSAGES.INVALID_IRI", params: { iri: newValue } }, ModalType.warning);
                //restore old value
                this.lexiconDataset = newValue;
                this.changeDetectorRef.detectChanges();
                this.lexiconDataset = this.lexicalizationSetMetadata.lexiconDataset;
            } else {
                this.lexiconDataset = newValue;
                this.updateLexicalizationSetMetadata();
            }
        }
    }

    updateLexicalizationModel(newValue: string) {
        if (newValue != this.lexicalizationModel) {
            this.lexicalizationModel = newValue;
            this.updateLexicalizationSetMetadata();
        }
    }

    updateLanguage(newValue: string) {
        if (newValue != this.language) {
            let langRegexp = new RegExp("^[a-z]{2,3}(?:-[A-Z]{2,3}(?:-[a-zA-Z]{4})?)?$");
            if (!langRegexp.test(newValue)) {
                this.basicModals.alert({ key: "STATUS.INVALID_VALUE" }, { key: "MESSAGES.INVALID_LANG_TAG", params: { lang: this.language } }, ModalType.warning);
                //restore old value
                this.language = newValue;
                this.changeDetectorRef.detectChanges();
                this.language = this.lexicalizationSetMetadata.language;
            } else {
                this.language = newValue;
                this.updateLexicalizationSetMetadata();
            }
        }
    }

    updateReferences(newValue: number) {
        if (newValue != this.references) {
            this.references = newValue;
            this.updateLexicalizationSetMetadata();
        }
    }

    updateLexicalEntries(newValue: number) {
        if (newValue != this.references) {
            this.lexicalEntries = newValue;
            this.updateLexicalizationSetMetadata();
        }
    }

    updateLexicalizations(newValue: number) {
        if (newValue != this.references) {
            this.lexicalizations = newValue;
            this.updateLexicalizationSetMetadata();
        }
    }

    updatePercentage(newValue: number) {
        if (newValue != this.references) {
            this.percentage = newValue;
            this.updateLexicalizationSetMetadata();
        }
    }

    updateAvgNumOfLexicalizations(newValue: number) {
        if (newValue != this.references) {
            this.avgNumOfLexicalizations = newValue;
            this.updateLexicalizationSetMetadata();
        }
    }

    private updateLexicalizationSetMetadata() {
        this.metadataRegistryService.deleteEmbeddedLexicalizationSet(new IRI(this.lexicalizationSetMetadata.identity)).subscribe(
            () => {
                let lexicalizationModelPar: string;
                this.lexicalModelMap.forEach(lexModel => {
                    if (this.lexicalizationModel == lexModel.label) {
                        lexicalizationModelPar = lexModel.iri;
                    }
                });
                let lexiconDatasetPar: IRI;
                if (this.lexiconDataset != null) {
                    lexiconDatasetPar = new IRI(this.lexiconDataset);
                }

                this.metadataRegistryService.addEmbeddedLexicalizationSet(this.dataset.identity,
                    new IRI(lexicalizationModelPar), this.language, new IRI(this.lexicalizationSetMetadata.identity),
                    lexiconDatasetPar, this.references, this.lexicalEntries, this.lexicalizations, this.percentage, this.avgNumOfLexicalizations).subscribe(
                        () => {
                            this.lexicalizationSetMetadata.lexiconDataset = this.lexiconDataset;
                            this.lexicalizationSetMetadata.lexicalizationModel = lexicalizationModelPar;
                            this.lexicalizationSetMetadata.language = this.language;
                            this.lexicalizationSetMetadata.references = this.references;
                            this.lexicalizationSetMetadata.lexicalEntries = this.lexicalEntries;
                            this.lexicalizationSetMetadata.lexicalizations = this.lexicalizations;
                            this.lexicalizationSetMetadata.percentage = this.percentage;
                            this.lexicalizationSetMetadata.avgNumOfLexicalizations = this.avgNumOfLexicalizations;
                        }
                    );
            }
        );
    }


}
