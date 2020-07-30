import { Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalOptions } from 'src/app/modal-dialogs/Modals';
import { LexEntryVisualizationMode } from 'src/app/models/Properties';
import { AnnotatedValue, IRI, RDFResourceRolesEnum, Resource } from 'src/app/models/Resources';
import { OntoLexLemonServices } from 'src/app/services/ontolex-lemon.service';
import { PMKIContext } from 'src/app/utils/PMKIContext';
import { PMKIEventHandler } from 'src/app/utils/PMKIEventHandler';
import { PMKIProperties } from 'src/app/utils/PMKIProperties';
import { ResourceUtils, SortAttribute } from 'src/app/utils/ResourceUtils';
import { SearchBarComponent } from '../../search-bar/search-bar.component';
import { AbstractListPanel } from '../abstract-list-panel';
import { LexicalEntryListSettingsModal } from './lexical-entry-list-settings-modal';
import { LexicalEntryListComponent } from './lexical-entry-list.component';

@Component({
    selector: "lexical-entry-list-panel",
    templateUrl: "./lexical-entry-list-panel.component.html",
    host: { class: "vbox" }
})
export class LexicalEntryListPanelComponent extends AbstractListPanel {
    @Input() lexicon: IRI;
    @Input() lexiconChangeable: boolean = false; //if true, above the tree is shown a menu to select a lexicon
    @Output() lexiconChanged = new EventEmitter<IRI>();//when dynamic lexicon is changed
    @Output() indexChanged = new EventEmitter<string>();//when index changed

    @ViewChild(LexicalEntryListComponent) viewChildList: LexicalEntryListComponent;
    @ViewChild(SearchBarComponent) searchBar: SearchBarComponent;

    panelRole: RDFResourceRolesEnum = RDFResourceRolesEnum.ontolexLexicalEntry;

    private lexiconList: AnnotatedValue<IRI>[];//list of lexicons, visible only when lexiconChangeable is true
    workingLexicon: IRI;//keep track of the selected lexicon: could be assigned throught @Input lexicon or lexicon selection
    //(useful expecially when lexiconChangeable is true so the changes don't effect the lexicon in context)

    visualizationMode: LexEntryVisualizationMode;

    //for visualization indexBased
    private alphabet: string[] = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    private firstDigitIndex: string = this.alphabet[0];
    private secondDigitIndex: string = this.alphabet[0];
    index: string;
    private indexLenght: number;

    closedAlert: boolean;

    constructor(basicModals: BasicModalsServices, eventHandler: PMKIEventHandler, pmkiProp: PMKIProperties, private ontolexService: OntoLexLemonServices,
        private modalService: NgbModal) {
        super(basicModals, eventHandler, pmkiProp);
        this.eventSubscriptions.push(eventHandler.lexiconChangedEvent.subscribe(
            (lexicon: IRI) => this.onLexiconChanged(lexicon))
        );
    }

    ngOnInit() {
        super.ngOnInit();

        /**
         * in order to avoid to set twice the workingLexicon (now during the @Input check and then during the lexiconChangeable check),
         * store it in a temp variable and then set to the workingLexicon (in case of lexiconChangeable, the workingLexicon would be
         * subscribed from the active lexicon in the lexicon list)
         */
        let activeLexicon: IRI;
        if (this.lexicon == undefined) { //if @Input is not provided, get the lexicon from the preferences
            activeLexicon = PMKIContext.getProjectCtx().getProjectPreferences().activeLexicon;
        } else { //if @Input lexicon is provided, initialize the tree with this lexicon
            activeLexicon = this.lexicon;
        }
        if (this.lexiconChangeable) {
            //init the scheme list if the concept tree allows dynamic change of lexicon
            this.ontolexService.getLexicons().subscribe(
                lexicons => {
                    this.lexiconList = lexicons;
                    this.workingLexicon = this.lexiconList.find(l => l.getValue().equals(activeLexicon)).getValue();
                }
            );
        } else {
            this.workingLexicon = activeLexicon;
        }

        let lexEntryListPrefs = PMKIContext.getProjectCtx().getProjectPreferences().lexEntryListPreferences;
        // settings modal di lex-entry list deve permettere il change di solo del setting permesso
        this.visualizationMode = lexEntryListPrefs.visualization;
        this.indexLenght = lexEntryListPrefs.indexLength;
        this.onDigitChange();
    }


    handleSearchResults(results: AnnotatedValue<IRI>[]) {
        this.visualizationMode = PMKIContext.getProjectCtx().getProjectPreferences().lexEntryListPreferences.visualization;
        if (this.visualizationMode == LexEntryVisualizationMode.indexBased) {
            if (results.length == 1) {
                this.openAt(results[0]);
            } else { //multiple results, ask the user which one select
                ResourceUtils.sortResources(results, this.rendering ? SortAttribute.show : SortAttribute.value);
                this.basicModals.selectResource("Search results", results.length + " results found.", results, this.rendering).then(
                    (selectedResource: AnnotatedValue<IRI>) => {
                        this.openAt(selectedResource);
                    },
                    () => { }
                );
            }
        } else {
            ResourceUtils.sortResources(results, this.rendering ? SortAttribute.show : SortAttribute.value);
            this.viewChildList.forceList(results);
        }
    }

    public selectSearchedResource(resource: AnnotatedValue<IRI>) {
        this.ontolexService.getLexicalEntryLexicons(resource.getValue()).subscribe(
            lexicons => {
                let isInActiveLexicon: boolean = ResourceUtils.containsNode(lexicons, this.workingLexicon);
                if (isInActiveLexicon) {
                    this.openAt(resource);
                } else {
                    let message = "Searched LexicalEntry '" + resource.getShow() + "' is not reachable in the list since it belongs to the following";
                    if (lexicons.length > 1) {
                        message += " lexicon. If you want to activate one of these lexicons and continue the search, "
                            + "please select the lexicon you want to activate and press OK.";
                    } else {
                        message += " lexicon. If you want to activate the lexicon and continue the search, please select it and press OK.";
                    }
                    this.basicModals.selectResource("Search", message, lexicons, this.rendering).then(
                        (lexicon: AnnotatedValue<Resource>) => {
                            this.pmkiProp.setActiveLexicon(PMKIContext.getProjectCtx(), <IRI>lexicon.getValue()); //update the active lexicon
                            setTimeout(() => { //wait for a change detection round, since after the setActiveLexicon, the lex entry list is reset
                                this.openAt(resource);
                            });
                        },
                        () => {}
                    );
                }
            }
        )
    }

    public openAt(node: AnnotatedValue<IRI>) {
        this.visualizationMode = PMKIContext.getProjectCtx().getProjectPreferences().lexEntryListPreferences.visualization;
        if (this.visualizationMode == LexEntryVisualizationMode.indexBased) {
            this.viewChildList.openListAt(node);
        } else { //search-based
            this.viewChildList.forceList([node]);
            setTimeout(() => {
                this.viewChildList.openListAt(node);
            });
        }
    }

    refresh() {
        this.visualizationMode = PMKIContext.getProjectCtx().getProjectPreferences().lexEntryListPreferences.visualization;
        if (this.visualizationMode == LexEntryVisualizationMode.indexBased) {
            // in index based visualization reinit the list
            this.viewChildList.init();
        } else if (this.visualizationMode == LexEntryVisualizationMode.searchBased) {
            //in search based visualization repeat the search
            this.viewChildList.setInitialStatus();
            this.searchBar.doSearchImpl();
        }
    }

    settings() {
        const modalRef: NgbModalRef = this.modalService.open(LexicalEntryListSettingsModal, new ModalOptions());
        modalRef.result.then(
            () => {
                this.visualizationMode = PMKIContext.getProjectCtx().getProjectPreferences().lexEntryListPreferences.visualization;
                if (this.visualizationMode == LexEntryVisualizationMode.searchBased) {
                    this.viewChildList.forceList([]);
                } else {
                    let newIndexLenght = PMKIContext.getProjectCtx().getProjectPreferences().lexEntryListPreferences.indexLength;
                    if (newIndexLenght != this.indexLenght) {
                        //in this case should not be necessary to refresh since the index change triggers a re-init on the child list
                        this.indexLenght = newIndexLenght;
                        this.onDigitChange();
                    } else { //other changes (limitation or visualization mode) requires reinitialization
                        this.refresh();
                    }
                }
            },
            () => { }
        );
    }


    //lexicon selection menu handlers

    /**
     * Listener to <select> element that allows to change dynamically the lexicon of the lex-entry list
     * (visible only if @Input lexiconChangeable is true).
     */
    private onLexiconSelectionChange() {
        this.lexiconChanged.emit(this.workingLexicon);
    }

    private getLexiconRendering(lexicon: AnnotatedValue<IRI>) {
        return ResourceUtils.getRendering(lexicon, this.rendering);
    }

    private onDigitChange() {
        this.index = (this.indexLenght == 1) ? this.firstDigitIndex : this.firstDigitIndex + this.secondDigitIndex;
        this.indexChanged.emit(this.index);
    }

    private onLexiconChanged(lexicon: IRI) {
        this.workingLexicon = lexicon;
        //in case of visualization search based reset the list
        this.visualizationMode = PMKIContext.getProjectCtx().getProjectPreferences().lexEntryListPreferences.visualization;
        if (this.visualizationMode == LexEntryVisualizationMode.searchBased) {
            this.viewChildList.forceList([]);
        }
    }

}