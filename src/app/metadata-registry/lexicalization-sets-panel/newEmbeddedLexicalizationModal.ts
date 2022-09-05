import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from 'src/app/modal-dialogs/Modals';
import { IRI } from 'src/app/models/Resources';
import { MetadataRegistryServices } from 'src/app/services/metadata-registry.service';
import { OntoLex, RDFS, SKOS, SKOSXL } from "../../models/Vocabulary";

@Component({
    selector: "embedded-lexicalization-modal",
    templateUrl: "./newEmbeddedLexicalizationModal.html",
})
export class NewEmbeddedLexicalizationModal {
    @Input() catalogRecordIdentity: IRI;

    lexicalModelList = [
        { value: RDFS.uri, label: "RDFS" },
        { value: SKOS.uri, label: "SKOS" },
        { value: SKOSXL.uri, label: "SKOSXL" },
        { value: OntoLex.uri, label: "OntoLex" }
    ];

    lexicalizationSet: string;
    lexiconDataset: string;
    lexicalizationModel: string = this.lexicalModelList[0].value;
    language: string;
    references: number;
    lexicalEntries: number;
    lexicalizations: number;
    percentage: number;
    avgNumOfLexicalizations: number;

    constructor(public activeModal: NgbActiveModal, private basicModals: BasicModalsServices, private metadataRegistryService: MetadataRegistryServices) { }

    isInputValid() {
        return this.language != null && this.language.trim() != "";
    }

    ok() {
        let lexicalizationSetPar: IRI;
        let lexiconDatasetPar: IRI;

        if (this.lexicalizationSet != null && this.lexicalizationSet.trim() != "") {
            if (IRI.regexp.test(this.lexicalizationSet)) {
                lexicalizationSetPar = new IRI(this.lexicalizationSet);
            } else {
                this.basicModals.alert({ key: "STATUS.INVALID_VALUE" }, { key: "MESSAGES.INVALID_IRI", params: { iri: this.lexicalizationSet } }, ModalType.warning);
                return;
            }
        }
        if (this.lexiconDataset != null && this.lexiconDataset.trim() != "") {
            if (IRI.regexp.test(this.lexiconDataset)) {
                lexiconDatasetPar = new IRI(this.lexiconDataset);
            } else {
                this.basicModals.alert({ key: "STATUS.INVALID_VALUE" }, { key: "MESSAGES.INVALID_IRI", params: { iri: this.lexiconDataset } }, ModalType.warning);
                return;
            }
        }

        let langRegexp = new RegExp("^[a-z]{2,3}(?:-[A-Z]{2,3}(?:-[a-zA-Z]{4})?)?$");
        if (!langRegexp.test(this.language)) {
            this.basicModals.alert({ key: "STATUS.INVALID_VALUE" }, { key: "MESSAGES.INVALID_LANG_TAG", params: { lang: this.language } }, ModalType.warning);
            return;
        }

        this.metadataRegistryService.addEmbeddedLexicalizationSet(this.catalogRecordIdentity,
            new IRI(this.lexicalizationModel), this.language, lexicalizationSetPar, lexiconDatasetPar,
            this.references, this.lexicalEntries, this.lexicalizations, this.percentage, this.avgNumOfLexicalizations).subscribe(
                stReps => {
                    this.activeModal.close();
                }
            );
    }

    cancel() {
        this.activeModal.dismiss();
    }

}