import { Component, Input, SimpleChanges } from '@angular/core';
import { Observable, of, from } from 'rxjs';
import { finalize, map, flatMap } from 'rxjs/operators';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from 'src/app/modal-dialogs/Modals';
import { LexEntryVisualizationMode, LexicalEntryListPreference, SafeToGoMap } from 'src/app/models/Properties';
import { AnnotatedValue, IRI, RDFResourceRolesEnum } from 'src/app/models/Resources';
import { OntoLexLemonServices } from 'src/app/services/ontolex-lemon.service';
import { PMKIContext } from 'src/app/utils/PMKIContext';
import { PMKIEventHandler } from 'src/app/utils/PMKIEventHandler';
import { ResourceUtils, SortAttribute } from 'src/app/utils/ResourceUtils';
import { AbstractList } from '../abstract-list';

@Component({
    selector: 'lexical-entry-list',
    templateUrl: './lexical-entry-list.component.html',
    host: { class: "structureComponent" }
})
export class LexicalEntryListComponent extends AbstractList {

    @Input() lexicon: IRI;
    @Input() index: string; //initial letter of the entries to show

    structRole: RDFResourceRolesEnum = RDFResourceRolesEnum.ontolexLexicalEntry;

    private safeToGoLimit: number = 1000;

    constructor(private ontolexService: OntoLexLemonServices, private basicModals: BasicModalsServices, eventHandler: PMKIEventHandler) {
        super(eventHandler);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['index'] && !changes['index'].firstChange || changes['lexicon'] && !changes['lexicon'].firstChange) {
            this.init();
        }
    }

    initImpl() {
        if (this.lexicon != undefined) {
            let visualization: LexEntryVisualizationMode = PMKIContext.getProjectCtx().getProjectPreferences().lexEntryListPreferences.visualization;
            if (visualization == LexEntryVisualizationMode.indexBased && this.index != undefined) {
                this.checkInitializationSafe().subscribe(
                    proceed => {
                        if (proceed) {
                            this.loading = true;
                            this.ontolexService.getLexicalEntriesByAlphabeticIndex(this.index, this.lexicon).pipe(
                                finalize(() => this.loading = false)
                            ).subscribe(
                                entries => {
                                    let orderAttribute: SortAttribute = this.rendering ? SortAttribute.show : SortAttribute.value;
                                    ResourceUtils.sortResources(entries, orderAttribute);
                                    this.nodes = entries;

                                    if (this.pendingSearchRes) {
                                        this.openListAt(this.pendingSearchRes);
                                    }
                                }
                            );
                        }
                    }
                );
            } else if (visualization == LexEntryVisualizationMode.searchBased) {
                //don't do nothing
            }
        }
    }

    /**
     * Perform a check in order to prevent the initialization of the structure with too many elements.
     * Return true if the initialization is safe or if the user agreed to init the structure anyway
     */
    private checkInitializationSafe(): Observable<boolean> {
        let lexEntryListPreference: LexicalEntryListPreference = PMKIContext.getProjectCtx().getProjectPreferences().lexEntryListPreferences;
        let unsafetyMessage: string = "The LexicalEntry list has too many elements. " + 
            "Retrieving them all could be a long process, you might experience performance decrease or it might even hang the system. ";
        if (LexEntryVisualizationMode.indexBased && lexEntryListPreference.indexLength == 1) {
            unsafetyMessage += "It is highly recommended to improve the index length or to switch from 'index' to 'search-based' visualization mode.\n";
        } else { //length 2
            unsafetyMessage += "It is highly recommended to switch from 'index' to 'search-based' visualization mode.\n";
        }
        unsafetyMessage += "Do you want to force the list initialization anyway?";

        let safeToGoMap: SafeToGoMap = lexEntryListPreference.safeToGoMap;
        let checksum = "lexicon:" + this.lexicon.toNT() + "&index:" + this.index;
        let safe: boolean = safeToGoMap[checksum];
        if (safe === true) {
            return of(true); //cached to be safe => allow initialization
        } else if (safe === false) { //cached to be not safe => warn the user
            return from(
                this.basicModals.confirm("LexicalEntry list", unsafetyMessage, ModalType.warning).then(
                    () => { return true; },
                    () => { return false; }
                )
            );
        } else { //never initialized => count
            this.loading = true;
            return this.ontolexService.countLexicalEntriesByAlphabeticIndex(this.index, this.lexicon).pipe(
                finalize(() => this.loading = false),
                flatMap(count => {
                    safe = count < this.safeToGoLimit;
                    safeToGoMap[checksum] = safe; //cache the safetyness
                    if (safe) { 
                        return of(true)
                    } else { //limit exceeded, not safe => warn the user to switch to search based
                        return from(
                            this.basicModals.confirm("LexicalEntry list", unsafetyMessage, ModalType.warning).then(
                                () => { return true; },
                                () => { return false; }
                            )
                        );
                    }
                })
            );
        }
    }

    public forceList(list: AnnotatedValue<IRI>[]) {
        this.setInitialStatus();
        this.nodes = list;
    }

}
