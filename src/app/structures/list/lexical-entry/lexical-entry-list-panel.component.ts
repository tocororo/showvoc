import { Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalOptions } from 'src/app/modal-dialogs/Modals';
import { LexEntryVisualizationMode } from 'src/app/models/Properties';
import { AnnotatedValue, IRI, RDFResourceRolesEnum } from 'src/app/models/Resources';
import { OntoLexLemonServices } from 'src/app/services/ontolex-lemon.service';
import { PMKIEventHandler } from 'src/app/utils/PMKIEventHandler';
import { PMKIProperties } from 'src/app/utils/PMKIProperties';
import { ResourceUtils, SortAttribute } from 'src/app/utils/ResourceUtils';
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

    panelRole: RDFResourceRolesEnum = RDFResourceRolesEnum.ontolexLexicalEntry;

    private lexiconList: AnnotatedValue<IRI>[];//list of lexicons, visible only when lexiconChangeable is true
    workingLexicon: IRI;//keep track of the selected lexicon: could be assigned throught @Input lexicon or lexicon selection
    //(useful expecially when lexiconChangeable is true so the changes don't effect the lexicon in context)

    visualizationMode: LexEntryVisualizationMode;

    //for visualization indexBased
    private alphabet: string[] = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
    private firstDigitIndex: string = this.alphabet[0];
    private secondDigitIndex: string = this.alphabet[0];
    index: string;
    private indexLenght: number;

    constructor(basicModals: BasicModalsServices, eventHandler: PMKIEventHandler, vbProp: PMKIProperties, private ontolexService: OntoLexLemonServices,
        private modalService: NgbModal) {
        super(basicModals, eventHandler, vbProp);
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
            activeLexicon = this.pmkiProp.getActiveLexicon();
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

        this.visualizationMode = this.pmkiProp.getLexicalEntryListPreferences().visualization;
        this.indexLenght = this.pmkiProp.getLexicalEntryListPreferences().indexLength;
        this.onDigitChange();
    }


    handleSearchResults(results: AnnotatedValue<IRI>[]) {
        if (results.length == 1) {
            this.openAt(results[0]);
        } else { //multiple results, ask the user which one select
            ResourceUtils.sortResources(results, this.rendering ? SortAttribute.show : SortAttribute.value);
            this.basicModals.selectResource("Search results", results.length + " results found.", results, this.rendering).then(
                (selectedResource: AnnotatedValue<IRI>) => {
                    this.openAt(selectedResource);
                },
                () => {}
            );
        }
    }

    public openAt(node: AnnotatedValue<IRI>) {
        this.viewChildList.openListAt(node);
    }

    refresh() {
        this.viewChildList.init();
    }

    settings() {
        const modalRef: NgbModalRef = this.modalService.open(LexicalEntryListSettingsModal, new ModalOptions() );
        modalRef.result.then(
            () => {
                this.visualizationMode = this.pmkiProp.getLexicalEntryListPreferences().visualization;
                if (this.visualizationMode == LexEntryVisualizationMode.searchBased) {
                    this.viewChildList.forceList([]);
                } else {
                    this.indexLenght = this.pmkiProp.getLexicalEntryListPreferences().indexLength;
                    this.onDigitChange();
                    this.refresh();
                }
            },
            () => {}
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
        if (this.visualizationMode == LexEntryVisualizationMode.searchBased) {
            this.viewChildList.forceList([]);
        }
    }

}