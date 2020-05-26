import { Component, Input, SimpleChanges } from '@angular/core';
import { Observable, of } from 'rxjs';
import { finalize, flatMap } from 'rxjs/operators';
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
    safeToGo: boolean = true;
    unsafeScenario: UnsafeScenario; //describe the scenario where the usafeness happened (useful for customizing the warning alert)

    constructor(private ontolexService: OntoLexLemonServices, eventHandler: PMKIEventHandler) {
        super(eventHandler);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['index'] && !changes['index'].firstChange || changes['lexicon'] && !changes['lexicon'].firstChange) {
            this.init();
        }
    }

    initImpl() {
        let visualization: LexEntryVisualizationMode = PMKIContext.getProjectCtx().getProjectPreferences().lexEntryListPreferences.visualization;
        if (visualization == LexEntryVisualizationMode.indexBased && this.index != undefined) {
            this.checkInitializationSafe().subscribe(
                () => {
                    if (this.safeToGo) {
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

    /**
     * Forces the safeness of the structure even if it was reported as not safe, then re initialize it
     */
    forceSafeness() {
        this.safeToGo = true;
        let lexEntryListPreference: LexicalEntryListPreference = PMKIContext.getProjectCtx().getProjectPreferences().lexEntryListPreferences;
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
        let lexEntryListPreference: LexicalEntryListPreference = PMKIContext.getProjectCtx().getProjectPreferences().lexEntryListPreferences;

        if (this.lexicon == null) {
            this.unsafeScenario = UnsafeScenario.noLexiconMode;
        } else { //lexicon selected
            if (lexEntryListPreference.indexLength == 1) {
                this.unsafeScenario = UnsafeScenario.oneCharIndex;
            } else {
                this.unsafeScenario = UnsafeScenario.twoCharIndex;
            }
        }

        let safeToGoMap: SafeToGoMap = lexEntryListPreference.safeToGoMap;

        let checksum = this.getInitRequestChecksum();

        let safe: boolean = safeToGoMap[checksum];
        if (safe != null) { //found safeness in cache
            this.safeToGo = safe;
            return of(null);
        } else { //never initialized => count
            this.loading = true;
            return this.ontolexService.countLexicalEntriesByAlphabeticIndex(this.index, this.lexicon).pipe(
                finalize(() => this.loading = false),
                flatMap(count => {
                    safe = count < this.safeToGoLimit;
                    safeToGoMap[checksum] = safe; //cache the safetyness
                    this.safeToGo = safe;
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

enum UnsafeScenario {
    noLexiconMode = "noLexiconMode", //when there is no lexicon selected => suggest to select a lexicon or to switch to search based
    oneCharIndex = "oneCharIndex", //index-based mode with 1-char => suggest to increase the index length or to switch to search based
    twoCharIndex = "twoCharIndex", //index-based mode with 2-char => suggest to switch to search based
    //for each case it is also provided the possibility to force the initialization
}