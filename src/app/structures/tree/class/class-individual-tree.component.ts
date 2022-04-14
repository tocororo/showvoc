import { Component, EventEmitter, Input, Output, SimpleChanges, ViewChild } from "@angular/core";
import { AnnotatedValue, IRI } from 'src/app/models/Resources';
import { SVContext } from 'src/app/utils/SVContext';
import { SKOS } from '../../../models/Vocabulary';
import { TreeListContext } from "../../../utils/UIUtils";
import { ClassTreePanelComponent } from './class-tree-panel.component';

@Component({
    selector: "class-individual-tree",
    templateUrl: "./class-individual-tree.component.html",
    host: { class: "vbox" }
})
export class ClassIndividualTreeComponent {

    @Input() context: TreeListContext;
    @Input() roots: IRI[]; //roots of the class three
    @Input() schemes: IRI[]; //scheme to use in case the class selected is skos:Concept
    @Input() allowMultiselection: boolean = false; //tells if the multiselection is allowed in the instance list panel
    @Output() nodeSelected = new EventEmitter<AnnotatedValue<IRI>>();//when an instance or a concept is selected
    @Output() nodeChecked = new EventEmitter<AnnotatedValue<IRI>[]>();
    @Output() multiselectionStatus = new EventEmitter<boolean>(); //emitted when the multiselection changes status (activated/deactivated)
    /*in the future I might need an Output for selected class. In case, change nodeSelected in instanceSelected and
    create classSelected Output. (Memo: nodeSelected is to maintain the same Output of the other tree components)*/

    @ViewChild(ClassTreePanelComponent, { static: true }) classTreePanelChild: ClassTreePanelComponent;

    selectedClass: AnnotatedValue<IRI> = null; //the class selected from class tree
    currentSchemes: IRI[];//the scheme selecte in the concept tree (only if selected class is skos:Concept)
    selectedInstance: AnnotatedValue<IRI>; //the instance (or concept) selected in the instance list (or concept tree)

    ngOnInit() {
        if (this.schemes === undefined) { //if @Input scheme is not provided at all, get it from project preference
            this.currentSchemes = SVContext.getProjectCtx().getProjectPreferences().activeSchemes;
        } else { //if @Input scheme is provided (it could be null => no scheme-mode), initialize the tree with this scheme
            this.currentSchemes = this.schemes;
        }
        if (this.context == undefined) { //if not overwritten from a parent component (e.g. addPropertyValueModal), set its default
            this.context = TreeListContext.clsIndTree;
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['roots']) { //when roots changes, deselect eventals class and instance selected
            this.selectedClass = null;
            this.selectedInstance = null;
            //when there is only one class, select it automatically
            if (this.roots && this.roots.length == 1) {
                setTimeout(() => { //give time to initialize child component (without this, openTreeAt in class tree generates error)
                    this.classTreePanelChild.openAt(new AnnotatedValue(this.roots[0]));
                });
            }
        }
    }

    /**
     * Listener to the event nodeSelected thrown by the class-tree. Updates the selectedClass
     */
    onTreeClassSelected(cls: AnnotatedValue<IRI>) {
        if (this.selectedClass == undefined || !this.selectedClass.getValue().equals(cls.getValue())) {
            this.selectedInstance = null; //reset the instance only if selected class changes
            this.nodeSelected.emit(null);
        }
        this.selectedClass = cls;
    }

    /**
     * Listener to click on element in the instance list. Updates the selectedInstance
     */
    onInstanceSelected(instance: AnnotatedValue<IRI>) {
        this.selectedInstance = instance;
        this.nodeSelected.emit(this.selectedInstance);
    }

    onNodeChecked(nodes: AnnotatedValue<IRI>[]) {
        this.nodeChecked.emit(nodes);
    }

    /**
     * Listener to schemeChanged event emitted by concept-tree when range class is skos:Concept.
     */
    onConceptTreeSchemeChange() {
        this.selectedInstance = null;
        this.nodeSelected.emit(this.selectedInstance);
    }

    /**
     * Listener to lexiconChanged event emitted by lexical-entry-list when range class is ontolex:LexicalEntry.
     */
    onLexEntryLexiconChange() {
        this.selectedInstance = null;
        this.nodeSelected.emit(this.selectedInstance);
    }

    onMultiselectionChange(multiselection: boolean) {
        this.multiselectionStatus.emit(multiselection);
    }

    /**
     * Tells if the current selected range class is skos:Concept. It's useful to show concept tree
     * instead of instance list in the modal
     */
    isRangeConcept(): boolean {
        return (this.selectedClass != undefined && this.selectedClass.getValue().equals(SKOS.concept));
    }

}