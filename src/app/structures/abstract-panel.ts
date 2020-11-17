import { Directive, EventEmitter, Input, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { BasicModalsServices } from '../modal-dialogs/basic-modals/basic-modals.service';
import { AnnotatedValue, IRI, RDFResourceRolesEnum } from '../models/Resources';
import { PMKIEventHandler } from '../utils/PMKIEventHandler';
import { PMKIProperties } from '../utils/PMKIProperties';
import { TreeListContext } from '../utils/UIUtils';

@Directive()
export abstract class AbstractPanel {

    /**
     * VIEWCHILD, INPUTS / OUTPUTS
     */

    @Input() context: TreeListContext;
    @Input() hideSearch: boolean = false; //if true hide the search bar

    @Output() nodeSelected = new EventEmitter<AnnotatedValue<IRI>>();

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
    protected eventHandler: PMKIEventHandler;
    protected pmkiProp: PMKIProperties;
    constructor(basicModals: BasicModalsServices, eventHandler: PMKIEventHandler, pmkiProp: PMKIProperties) {
        this.basicModals = basicModals;
        this.eventHandler = eventHandler;
        this.pmkiProp = pmkiProp;

        this.eventSubscriptions.push(eventHandler.showDeprecatedChangedEvent.subscribe(
            (showDeprecated: boolean) => this.showDeprecated = showDeprecated));
    }

    /**
     * METHODS
     */

    ngOnInit() {
        this.showDeprecated = this.pmkiProp.getShowDeprecated();
    }

    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
    }

    abstract handleSearchResults(results: AnnotatedValue<IRI>[]): void;

    abstract openAt(node: AnnotatedValue<IRI>): void;

    //actions
    abstract refresh(): void;

    onNodeSelected(node: AnnotatedValue<IRI>) {
        this.selectedNode = node;
        this.nodeSelected.emit(node);
    }

}