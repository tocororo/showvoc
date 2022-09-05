import { Component, Input, SimpleChanges } from "@angular/core";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ModalOptions } from 'src/app/modal-dialogs/Modals';
import { DatasetMetadata2, LexicalizationSetMetadata } from 'src/app/models/Metadata';
import { IRI } from 'src/app/models/Resources';
import { MetadataRegistryServices } from 'src/app/services/metadata-registry.service';
import { NewEmbeddedLexicalizationModal } from './newEmbeddedLexicalizationModal';

@Component({
    selector: "lexicalization-sets-panel",
    templateUrl: "./lexicalization-sets-panel.component.html",
    host: { class: "vbox" },
    styles: [`.activePanel { border: 2px solid #cde8ff; border-radius: 6px; }`],
})
export class LexicalizationSetsPanelComponent {

    @Input() dataset: DatasetMetadata2;

    lexicalizationSets: LexicalizationSetMetadata[] = []; //lex set of the selected dataset
    selectedLexicalizationSet: LexicalizationSetMetadata;
    lexSetSort: SortEnum = SortEnum.lang_asc;

    addEmbeddedLexicalizationSetAuthorized: boolean;
    removeEmbeddedLexicalizationSetAuthorized: boolean;
    updateEmbeddedLexicalizationSetAuthorized: boolean;

    loading: boolean;
    deleting: boolean;
    assessing: boolean;

    constructor(private metadataRegistryService: MetadataRegistryServices, private modalService: NgbModal) { }

    ngOnInit() {
        //temporarily true since this component is reachable only by admin in MDR
        this.addEmbeddedLexicalizationSetAuthorized = true;
        this.removeEmbeddedLexicalizationSetAuthorized = true;
        this.updateEmbeddedLexicalizationSetAuthorized = true;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['dataset'] && changes['dataset'].currentValue) {
            this.initEmbeddedLexicalizationSets();
        }
    }

    private initEmbeddedLexicalizationSets() {
        this.lexicalizationSets = null;
        this.loading = true;
        this.metadataRegistryService.getEmbeddedLexicalizationSets(this.dataset.identity)
            .pipe(finalize(() => { this.loading = false; }))
            .subscribe(
                sets => {
                    // UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
                    this.lexicalizationSets = sets;
                    this.sortLexicalizationSetsImpl(this.lexSetSort);
                    this.selectedLexicalizationSet = null;
                }
            );
    }

    selectLexicalizationSet(ls: LexicalizationSetMetadata) {
        if (this.selectedLexicalizationSet == ls) {
            this.selectedLexicalizationSet = null;
        } else {
            this.selectedLexicalizationSet = ls;
        }
    }

    sortLexicalizationSets(criteria: 'language' | 'lexicalizations') {
        if (criteria == "language") {
            if (this.lexSetSort == SortEnum.lang_asc) {
                this.sortLexicalizationSetsImpl(SortEnum.lang_desc);
            } else if (this.lexSetSort == SortEnum.lang_desc) {
                this.sortLexicalizationSetsImpl(SortEnum.lang_asc);
            } else {
                this.sortLexicalizationSetsImpl(SortEnum.lang_asc);
            }
        } else {
            if (this.lexSetSort == SortEnum.lex_asc) {
                this.sortLexicalizationSetsImpl(SortEnum.lex_desc);
            } else if (this.lexSetSort == SortEnum.lex_desc) {
                this.sortLexicalizationSetsImpl(SortEnum.lex_asc);
            } else {
                this.sortLexicalizationSetsImpl(SortEnum.lex_asc);
            }
        }
    }

    sortLexicalizationSetsImpl(criteria: SortEnum) {
        if (criteria == SortEnum.lang_asc) {
            this.lexicalizationSets.sort((l1, l2) => {
                return l1.language.localeCompare(l2.language);
            });
        } else if (criteria == SortEnum.lang_desc) {
            this.lexicalizationSets.sort((l1, l2) => {
                return l2.language.localeCompare(l1.language);
            });
        } else { //lexicalizations
            this.lexicalizationSets.sort((l1, l2) => {
                /*
                - If both lex set has lexicalizations, compare them
                - If only one of lex set has lexicalizations, set first the one which has it
                - If none of them has lexicalizations, sort by language
                */
                if (l1.lexicalizations && l2.lexicalizations) {
                    if (criteria == SortEnum.lex_asc) {
                        return l2.lexicalizations - l1.lexicalizations;
                    } else {
                        return l1.lexicalizations - l2.lexicalizations;
                    }
                } else if (l1.lexicalizations && !l2.lexicalizations) {
                    if (criteria == SortEnum.lex_asc) {
                        return -1;
                    } else {
                        return 1;
                    }
                } else if (!l1.lexicalizations && l2.lexicalizations) {
                    if (criteria == SortEnum.lex_asc) {
                        return 1;
                    } else {
                        return -1;
                    }
                } else {
                    if (criteria == SortEnum.lex_asc) {
                        return l1.language.localeCompare(l2.language);
                    } else {
                        return l2.language.localeCompare(l1.language);
                    }
                }
            });
        }
        this.lexSetSort = criteria;
    }

    assessLexicalizationModel() {
        this.assessing = true;
        this.metadataRegistryService.assessLexicalizationModel(this.dataset.identity)
            .pipe(finalize(() => { this.assessing = false; }))
            .subscribe(
                () => {
                    this.initEmbeddedLexicalizationSets();
                }
            );
    }

    addEmbeddedLexicalizationSet() {
        const modalRef: NgbModalRef = this.modalService.open(NewEmbeddedLexicalizationModal, new ModalOptions());
        modalRef.componentInstance.catalogRecordIdentity = this.dataset.identity;
        return modalRef.result.then(
            () => {
                this.initEmbeddedLexicalizationSets();
            },
            () => { }
        );
    }

    deleteEmbeddedLexicalizationSet() {
        this.metadataRegistryService.deleteEmbeddedLexicalizationSet(new IRI(this.selectedLexicalizationSet.identity)).subscribe(
            () => {
                this.initEmbeddedLexicalizationSets();
            }
        );
    }

    deleteAllEmbeddedLexicalizationSet() {
        let deleteFn: any[] = [];
        this.lexicalizationSets.forEach(ls => {
            deleteFn.push(this.metadataRegistryService.deleteEmbeddedLexicalizationSet(new IRI(ls.identity)));
        });
        this.deleting = true;
        forkJoin(deleteFn)
            .pipe(finalize(() => { this.deleting = false; }))
            .subscribe(
                () => {
                    this.initEmbeddedLexicalizationSets();
                }
            );
    }

}

enum SortEnum {
    lang_asc = "lang_asc",
    lang_desc = "lang_desc",
    lex_asc = "lex_asc",
    lex_desc = "lex_desc",
}