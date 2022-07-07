import { Directive, EventEmitter, Input, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { BasicModalsServices } from '../modal-dialogs/basic-modals/basic-modals.service';
import { SharedModalsServices } from '../modal-dialogs/shared-modals/shared-modal.service';
import { AnnotatedValue, IRI, RDFResourceRolesEnum, Resource } from '../models/Resources';
import { SVEventHandler } from '../utils/SVEventHandler';
import { SVProperties } from '../utils/SVProperties';
import { TreeListContext } from '../utils/UIUtils';

@Directive()
export abstract class AbstractPanel {

    /**
     * VIEWCHILD, INPUTS / OUTPUTS
     */

    @Input() context: TreeListContext;
    @Input() hideSearch: boolean = false; //if true hide the search bar

    @Output() nodeSelected = new EventEmitter<AnnotatedValue<IRI>>();
    @Output() advancedSearchResult: EventEmitter<AnnotatedValue<Resource>> = new EventEmitter();

    /**
     * ATTRIBUTES
     */

    abstract panelRole: RDFResourceRolesEnum; //declare the type of resources in the panel

    rendering: boolean = true; //if true the nodes in the tree should be rendered with the show, with the qname otherwise
    showDeprecated: boolean = true;
    eventSubscriptions: Subscription[] = [];
    selectedNode: AnnotatedValue<IRI> = null;

    /**
     * CONSTRUCTOR
     */
    protected basicModals: BasicModalsServices;
    protected sharedModals: SharedModalsServices;
    protected eventHandler: SVEventHandler;
    protected svProp: SVProperties;
    constructor(basicModals: BasicModalsServices, sharedModals: SharedModalsServices, eventHandler: SVEventHandler, svProp: SVProperties) {
        this.basicModals = basicModals;
        this.sharedModals = sharedModals;
        this.eventHandler = eventHandler;
        this.svProp = svProp;

        this.eventSubscriptions.push(eventHandler.showDeprecatedChangedEvent.subscribe(
            (showDeprecated: boolean) => { this.showDeprecated = showDeprecated; }));
    }

    /**
     * METHODS
     */

    ngOnInit() {
        this.showDeprecated = this.svProp.getShowDeprecated();
    }

    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
    }

    abstract handleSearchResults(results: AnnotatedValue<IRI>[]): void;

    abstract openAt(node: AnnotatedValue<IRI>): void;

    handleAdvSearchResult(resource: AnnotatedValue<IRI>) {
        this.advancedSearchResult.emit(resource);
    }

    //actions
    abstract refresh(): void;

    onNodeSelected(node: AnnotatedValue<IRI>) {
        this.selectedNode = node;
        this.nodeSelected.emit(node);
    }

}