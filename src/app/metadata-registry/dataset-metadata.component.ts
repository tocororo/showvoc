import { ChangeDetectorRef, Component, EventEmitter, Input, Output, SimpleChanges } from "@angular/core";
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MdrVoc } from 'src/app/models/Vocabulary';
import { BasicModalsServices } from '../modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from '../modal-dialogs/Modals';
import { SharedModalsServices } from '../modal-dialogs/shared-modals/shared-modal.service';
import { DatasetMetadata2 } from '../models/Metadata';
import { IRI, Literal } from '../models/Resources';
import { MetadataRegistryServices } from '../services/metadata-registry.service';
import { LocalizedMap } from '../widget/localized-editor/localized-editor-modal';

@Component({
    selector: "dataset-metadata",
    templateUrl: "./dataset-metadata.component.html",
})
export class DatasetMetadataComponent {

    @Input() dataset: DatasetMetadata2;
    @Input() disabled: boolean;

    // datasetMetadata: DatasetMetadata;
    @Output() update = new EventEmitter();

    private dereferUnknown: string = "Unknown";
    private dereferYes: string = "Yes";
    private dereferNo: string = "No";

    dereferenciationValues: string[] = [this.dereferUnknown, this.dereferYes, this.dereferNo];
    dereferenciationNormalized: string;

    sparqlLimitations: boolean;

    mdrUpdateAuthorized: boolean;

    constructor(private metadataRegistryService: MetadataRegistryServices, private basicModals: BasicModalsServices, private sharedModals: SharedModalsServices, 
        private changeDetectorRef: ChangeDetectorRef) { }

    ngOnInit() {
        this.mdrUpdateAuthorized = true; //temporarily true since this component is reachable only by admin in MDR
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['dataset'] && changes['dataset'].currentValue) {
            this.initDatasetMetadata();
        }
    }

    private initDatasetMetadata() {
        // normalize dereferenciation
        if (this.dataset.dereferenciationSystem == null) {
            this.dereferenciationNormalized = this.dereferUnknown;
        } else if (this.dataset.dereferenciationSystem == MdrVoc.standardDereferenciation.getIRI()) {
            this.dereferenciationNormalized = this.dereferYes;
        } else if (this.dataset.dereferenciationSystem == MdrVoc.noDereferenciation.getIRI()) {
            this.dereferenciationNormalized = this.dereferNo;
        } else {
            this.dereferenciationValues.push(this.dataset.dereferenciationSystem);
            this.dereferenciationNormalized = this.dataset.dereferenciationSystem;
        }
        // normalize limitation
        this.sparqlLimitations = false;
        if (this.dataset.sparqlEndpoint.limitations != null) {
            this.sparqlLimitations = this.dataset.sparqlEndpoint.limitations.indexOf(MdrVoc.noAggregation.getIRI()) != -1;
        }
    }

    editTitles() {
        let localizedMap: LocalizedMap = new Map();
        this.dataset.titles.forEach(t => { localizedMap.set(t.getLanguage(), t.getLabel()); });
        this.sharedModals.localizedEditor({ key: "COMMONS.TITLE" }, localizedMap).then(
            (newLocalizedMap: LocalizedMap) => {
                let toUpdate: Literal[] = [];
                newLocalizedMap.forEach((title, lang) => {
                    let old = this.dataset.titles.find(t => t.getLanguage() == lang);
                    if (old == null || old.getLabel() != title) {
                        toUpdate.push(new Literal(title, lang));
                    }
                });
                let toDelete: Literal[] = [];
                this.dataset.titles.forEach(t => {
                    if (newLocalizedMap.get(t.getLanguage()) == null) {
                        toDelete.push(t);
                    }
                });
                if (toUpdate.length > 0) {
                    let updateFn: Observable<void>[] = toUpdate.map(t => {
                        return this.metadataRegistryService.setTitle(this.dataset.identity, t).pipe(
                            map(() => {
                                let updatedIdx = this.dataset.titles.findIndex(title => title.getLanguage() == t.getLanguage());
                                if (updatedIdx == -1) {
                                    this.dataset.titles.push(t); //new
                                } else {
                                    this.dataset.titles[updatedIdx] = t; //updated
                                }
                            })
                        );
                    });
                    forkJoin(updateFn).subscribe();
                }
                if (toDelete.length > 0) {
                    let removeFn: Observable<void>[] = toDelete.map(t => {
                        return this.metadataRegistryService.deleteTitle(this.dataset.identity, t).pipe(
                            map(() => {
                                this.dataset.titles.splice(this.dataset.titles.indexOf(t), 1);
                            })
                        );
                    });
                    forkJoin(removeFn).subscribe();
                }
            },
            () => { }
        );
    }

    editDescriptions() {
        let localizedMap: LocalizedMap = new Map();
        this.dataset.descriptions.forEach(d => { localizedMap.set(d.getLanguage(), d.getLabel()); });
        this.sharedModals.localizedEditor({ key: "COMMONS.DESCRIPTION" }, localizedMap, true).then(
            (newLocalizedMap: LocalizedMap) => {
                let toUpdate: Literal[] = [];
                newLocalizedMap.forEach((descr, lang) => {
                    let old = this.dataset.descriptions.find(d => d.getLanguage() == lang);
                    if (old == null || old.getLabel() != descr) {
                        toUpdate.push(new Literal(descr, lang));
                    }
                });
                let toDelete: Literal[] = [];
                this.dataset.descriptions.forEach(d => {
                    if (newLocalizedMap.get(d.getLanguage()) == null) {
                        toDelete.push(d);
                    }
                });
                if (toUpdate.length > 0) {
                    let updateFn: Observable<void>[] = toUpdate.map(d => {
                        return this.metadataRegistryService.setDescription(this.dataset.identity, d).pipe(
                            map(() => {
                                let updatedIdx = this.dataset.descriptions.findIndex(descr => descr.getLanguage() == d.getLanguage());
                                if (updatedIdx == -1) {
                                    this.dataset.descriptions.push(d); //new
                                } else {
                                    this.dataset.descriptions[updatedIdx] = d; //updated
                                }
                            })
                        );
                    });
                    forkJoin(updateFn).subscribe();
                }
                if (toDelete.length > 0) {
                    let removeFn: Observable<void>[] = toDelete.map(d => {
                        return this.metadataRegistryService.deleteDescription(this.dataset.identity, d).pipe(
                            map(() => {
                                this.dataset.descriptions.splice(this.dataset.descriptions.indexOf(d), 1);
                            })
                        );
                    });
                    forkJoin(removeFn).subscribe();
                }
            },
            () => { }
        );
    }


    updateSparqlEndpoint(newValue: string) {
        let sparqlEndpoint: IRI;
        if (newValue != null && newValue.trim() != "") {
            if (IRI.regexp.test(newValue)) {
                sparqlEndpoint = new IRI(newValue);
            } else { //invalid IRI
                this.basicModals.alert({ key: "STATUS.INVALID_VALUE" }, { key: "MESSAGES.INVALID_IRI", params: { iri: newValue } }, ModalType.warning);
                //restore old id
                let backupId: string = this.dataset.sparqlEndpoint.id;
                this.dataset.sparqlEndpoint.id = null + "new";
                this.changeDetectorRef.detectChanges(); //so that the ngOnChanges of Input value in input-editable is triggered
                this.dataset.sparqlEndpoint.id = backupId;
                return;
            }
        }
        this.metadataRegistryService.setSPARQLEndpoint(this.dataset.identity, sparqlEndpoint).subscribe(
            () => {
                if (this.dataset.sparqlEndpoint) {
                    this.dataset.sparqlEndpoint.id = sparqlEndpoint.getIRI();
                } else {
                    this.dataset.sparqlEndpoint = {
                        id: sparqlEndpoint.getIRI(),
                    };
                }
                this.initDatasetMetadata();
                this.update.emit();
            }
        );
    }

    updateDerefSystem(newValue: string) {
        let dereferenciablePar: boolean;
        if (newValue == this.dereferUnknown) {
            dereferenciablePar = null;
        } else if (newValue == this.dereferYes) {
            dereferenciablePar = true;
        } else if (newValue == this.dereferNo) {
            dereferenciablePar = false;
        } else { //custom choice, available only if it was already the dereferenciationSystem, so it wasn't canged
            return;
        }
        this.metadataRegistryService.setDereferenciability(this.dataset.identity, dereferenciablePar).subscribe(
            () => {
                this.dataset.dereferenciationSystem = newValue;
                this.initDatasetMetadata();
                this.update.emit();
            }
        );
    }

    updateSparqlLimitations() {
        if (this.sparqlLimitations) {
            this.metadataRegistryService.setSPARQLEndpointLimitation(new IRI(this.dataset.sparqlEndpoint.id), MdrVoc.noAggregation).subscribe(
                () => {
                    this.dataset.sparqlEndpoint.limitations = [MdrVoc.noAggregation.getIRI()];
                    this.initDatasetMetadata();
                    this.update.emit();
                }
            );
        } else {
            this.metadataRegistryService.removeSPARQLEndpointLimitation(new IRI(this.dataset.sparqlEndpoint.id), MdrVoc.noAggregation).subscribe(
                () => {
                    this.dataset.sparqlEndpoint.limitations.splice(this.dataset.sparqlEndpoint.limitations.indexOf(MdrVoc.noAggregation.getIRI()), 1);
                    this.initDatasetMetadata();
                    this.update.emit();
                }
            );
        }
    }

}
