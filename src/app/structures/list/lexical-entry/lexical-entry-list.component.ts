import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { Observable, of } from 'rxjs';
import { finalize, mergeMap } from 'rxjs/operators';
import { LexEntryVisualizationMode, LexicalEntryListPreference, SafeToGo, SafeToGoMap } from 'src/app/models/Properties';
import { AnnotatedValue, IRI, RDFResourceRolesEnum } from 'src/app/models/Resources';
import { OntoLexLemonServices } from 'src/app/services/ontolex-lemon.service';
import { SVContext } from 'src/app/utils/SVContext';
import { SVEventHandler } from 'src/app/utils/SVEventHandler';
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
    @Output() requireSettings = new EventEmitter<void>(); //requires to the parent panel to open/change settings

    structRole: RDFResourceRolesEnum = RDFResourceRolesEnum.ontolexLexicalEntry;

    safeToGoLimit: number;
    safeToGo: SafeToGo = { safe: true };
    unsafeIndexOneChar: boolean; //true if in case of safeToGo = false, the current index is 1-char

    visualizationMode: LexEntryVisualizationMode;

    translationParam: { elemCount: number, safeToGoLimit: number };

    constructor(private ontolexService: OntoLexLemonServices, eventHandler: SVEventHandler) {
        super(eventHandler);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['index'] && !changes['index'].firstChange || changes['lexicon'] && !changes['lexicon'].firstChange) {
            this.init();
        }
    }

    initImpl() {
        this.visualizationMode = SVContext.getProjectCtx().getProjectPreferences().lexEntryListPreferences.visualization;
        if (this.visualizationMode == LexEntryVisualizationMode.indexBased && this.index != undefined) {
            this.checkInitializationSafe().subscribe(
                () => {
                    if (this.safeToGo.safe) {
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
        } else if (this.visualizationMode == LexEntryVisualizationMode.searchBased) {
            //don't do nothing
        }
    }

    /**
     * Forces the safeness of the structure even if it was reported as not safe, then re initialize it
     */
    forceSafeness() {
        this.safeToGo = { safe: true };
        let lexEntryListPreference: LexicalEntryListPreference = SVContext.getProjectCtx().getProjectPreferences().lexEntryListPreferences;
        let safeToGoMap: SafeToGoMap = lexEntryListPreference.safeToGoMap;
        let checksum = this.getInitRequestChecksum();
        safeToGoMap[checksum] = this.safeToGo;
        this.initImpl();
    }

    /**
     * Perform a check in order to prevent the initialization of the structure with too many elements.
     * Return true if the initialization is safe or if the user agreed to init the structure anyway
     */
    private checkInitializationSafe(): Observable<void> {
        let lexEntryListPreference: LexicalEntryListPreference = SVContext.getProjectCtx().getProjectPreferences().lexEntryListPreferences;
        let safeToGoMap: SafeToGoMap = lexEntryListPreference.safeToGoMap;
        this.safeToGoLimit = lexEntryListPreference.safeToGoLimit;
        this.unsafeIndexOneChar = lexEntryListPreference.indexLength == 1;

        let checksum = this.getInitRequestChecksum();

        let safeness: SafeToGo = safeToGoMap[checksum];
        if (safeness != null) { //found safeness in cache
            this.safeToGo = safeness;
            return of(null);
        } else { //never initialized => count
            this.loading = true;
            return this.ontolexService.countLexicalEntriesByAlphabeticIndex(this.index, this.lexicon).pipe(
                mergeMap(count => {
                    this.loading = false;
                    safeness = { safe: count < this.safeToGoLimit, count: count };
                    safeToGoMap[checksum] = safeness; //cache the safetyness
                    this.safeToGo = safeness;
                    this.translationParam = { elemCount: this.safeToGo.count, safeToGoLimit: this.safeToGoLimit };
                    return of(null);
                })
            );
        }
    }

    private getInitRequestChecksum() {
        let checksum = "lexicon:" + ((this.lexicon != null) ? this.lexicon.toNT() : null) + "&index:" + this.index;
        return checksum;
    }

    public forceList(list: AnnotatedValue<IRI>[]) {
        this.setInitialStatus();
        this.nodes = list;
    }

}