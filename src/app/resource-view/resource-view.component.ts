import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { GraphModalServices } from '../graph/modals/graph-modal.service';
import { AnnotatedValue, IRI, LocalResourcePosition, PredicateObjects, RemoteResourcePosition, ResAttribute, Resource, ResourcePosition, Value } from '../models/Resources';
import { PropertyFacet, ResourceViewCtx, ResViewPartition } from '../models/ResourceView';
import { SemanticTurkey } from '../models/Vocabulary';
import { ResourceViewServices } from '../services/resource-view.service';
import { PMKIContext, ProjectContext } from '../utils/PMKIContext';
import { PMKIProperties } from '../utils/PMKIProperties';
import { ResourceDeserializer, ResourceUtils, SortAttribute } from '../utils/ResourceUtils';
import { ResViewModalsServices } from './modals/resource-view-modal.service';

@Component({
    selector: 'resource-view',
    templateUrl: './resource-view.component.html',
    styleUrls: ['./resource-view.css'],
    host: { class: "vbox" }
})
export class ResourceViewComponent {

    @Input() resource: Resource;
    @Input() context: ResourceViewCtx;
    @Input() projectCtx: ProjectContext;
    @Output() dblclickObj: EventEmitter<AnnotatedValue<Resource>> = new EventEmitter<AnnotatedValue<Resource>>();

    annotatedResource: AnnotatedValue<Resource>;

    loading: boolean = false;

    private showInferredPristine: boolean = false; //useful to decide whether repeat the getResourceView request once the includeInferred changes
    showInferred: boolean = false;

    rendering: boolean = true; //tells if the resource shown inside the partitions should be rendered

    private valueFilterLangEnabled: boolean;

    private unknownHost: boolean = false; //tells if the resource view of the current resource failed to be fetched due to a UnknownHostException
    private unexistingResource: boolean = false; //tells if the requested resource does not exist (empty description)

    private btnGraphAvailable: boolean = true;
    private btnSettingsAvailable: boolean = true

    //partitions
    private resViewResponse: any = null; //to store the getResourceView response and avoid to repeat the request when user switches on/off inference
    private broadersColl: PredicateObjects[] = null;
    private classAxiomColl: PredicateObjects[] = null;
    private constituentsColl: PredicateObjects[] = null;
    private denotationsColl: PredicateObjects[] = null;
    private disjointPropertiesColl: PredicateObjects[] = null;
    private domainsColl: PredicateObjects[] = null;
    private equivalentPropertiesColl: PredicateObjects[] = null;
    private evokedLexicalConceptsColl: PredicateObjects[] = null;
    private formBasedPreviewColl: PredicateObjects[] = null;
    private formRepresentationsColl: PredicateObjects[] = null;
    private importsColl: PredicateObjects[] = null;
    private inverseofColl: PredicateObjects[] = null;
    private labelRelationsColl: PredicateObjects[] = null;
    private lexicalFormsColl: PredicateObjects[] = null;
    private lexicalizationsColl: PredicateObjects[] = null;
    private lexicalSensesColl: PredicateObjects[] = null;
    private membersColl: PredicateObjects[] = null;
    private membersOrderedColl: PredicateObjects[] = null;
    private notesColl: PredicateObjects[] = null;
    private propertiesColl: PredicateObjects[] = null;
    private propertyFacets: PropertyFacet[] = null;
    private rangesColl: PredicateObjects[] = null;
    private rdfsMembersColl: PredicateObjects[] = null;
    private schemesColl: PredicateObjects[] = null;
    private subPropertyChainsColl: PredicateObjects[] = null;
    private subtermsColl: PredicateObjects[] = null;
    private superpropertiesColl: PredicateObjects[] = null;
    private topconceptofColl: PredicateObjects[] = null;
    private typesColl: PredicateObjects[] = null;

    constructor(private resViewService: ResourceViewServices, private pmkiProp: PMKIProperties,
        private resViewModals: ResViewModalsServices, private graphModals: GraphModalServices
    ) { }


    ngOnChanges(changes: SimpleChanges) {
        this.showInferred = this.pmkiProp.getInferenceInResourceView();
        this.rendering = this.pmkiProp.getRenderingInResourceView();
        this.annotatedResource = new AnnotatedValue(this.resource);

        //graph available if RV is not in modal and has no projectCtx overriding the default
        this.btnGraphAvailable = this.projectCtx == null && this.context != ResourceViewCtx.modal;
        //settings available only if there is no context overriding the default
        this.btnSettingsAvailable = this.projectCtx == null; 

        if (changes['resource'] && changes['resource'].currentValue) {
            //if not the first change, avoid to refresh res view if resource is not changed
            if (!changes['resource'].firstChange) {
                let prevRes: Resource = changes['resource'].previousValue;
                if (prevRes.equals(this.resource)) {
                    return;
                }
            }
            this.buildResourceView(this.resource);//refresh resource view when Input resource changes
        }
    }

    private buildResourceView(res: Resource) {
        this.showInferredPristine = this.showInferred;
        this.loading = true;
        this.resetPartitions();
        this.resViewService.getResourceView(res).pipe(
            finalize(() => this.loading = false)
        ).subscribe(
            stResp => {
                this.resViewResponse = stResp;
                this.fillPartitions();
                this.unknownHost = false;
            },
            (err: Error) => {
                if (err.name.endsWith("UnknownHostException")) {
                    this.unknownHost = true;
                }
            }
        );
    }

    private resetPartitions() {
        this.broadersColl = null;
        this.classAxiomColl = null;
        this.constituentsColl = null;
        this.denotationsColl = null;
        this.disjointPropertiesColl = null;
        this.domainsColl = null;
        this.equivalentPropertiesColl = null;
        this.evokedLexicalConceptsColl = null;
        this.formBasedPreviewColl = null;
        this.formRepresentationsColl = null;
        this.importsColl = null;
        this.inverseofColl = null;
        this.labelRelationsColl = null;
        this.lexicalFormsColl = null;
        this.lexicalizationsColl = null;
        this.lexicalSensesColl = null;
        this.membersColl = null;
        this.membersOrderedColl = null;
        this.notesColl = null;
        this.propertiesColl = null;
        this.propertyFacets = null;
        this.rangesColl = null;
        this.rdfsMembersColl = null;
        this.schemesColl = null;
        this.subPropertyChainsColl = null;
        this.subtermsColl = null;
        this.superpropertiesColl = null;
        this.topconceptofColl = null;
        this.typesColl = null;
    }

    /**
     * Fill all the partitions of the RV. This not requires that the RV description is fetched again from server,
     * in fact if the user switches on/off the inference, there's no need to perform a new request.
     */
    private fillPartitions() {
        var resourcePartition: any = this.resViewResponse.resource;
        this.annotatedResource = ResourceDeserializer.createResource(resourcePartition);

        var broadersPartition: any = this.resViewResponse[ResViewPartition.broaders];
        if (broadersPartition != null) {
            this.broadersColl = ResourceDeserializer.createPredicateObjectsList(broadersPartition);
            this.filterPredObjList(this.broadersColl);
            this.sortObjects(this.broadersColl);
        }

        var classAxiomsPartition: any = this.resViewResponse[ResViewPartition.classaxioms];
        if (classAxiomsPartition != null) {
            this.classAxiomColl = ResourceDeserializer.createPredicateObjectsList(classAxiomsPartition);
            this.filterPredObjList(this.classAxiomColl);
            this.sortObjects(this.classAxiomColl);
        }

        var constituentsPartition: any = this.resViewResponse[ResViewPartition.constituents];
        if (constituentsPartition != null) {
            this.constituentsColl = ResourceDeserializer.createPredicateObjectsList(constituentsPartition);
            this.filterPredObjList(this.constituentsColl);
            // this.sortObjects(this.constituentsColl); ordered server-side
        }

        var denotationsPartition: any = this.resViewResponse[ResViewPartition.denotations];
        if (denotationsPartition != null) {
            this.denotationsColl = ResourceDeserializer.createPredicateObjectsList(denotationsPartition);
            this.filterPredObjList(this.denotationsColl);
            this.sortObjects(this.denotationsColl);
        }

        var disjointPropertiesPartition: any = this.resViewResponse[ResViewPartition.disjointProperties];
        if (disjointPropertiesPartition != null) {
            this.disjointPropertiesColl = ResourceDeserializer.createPredicateObjectsList(disjointPropertiesPartition);
            this.filterPredObjList(this.disjointPropertiesColl);
            this.sortObjects(this.disjointPropertiesColl);
        }

        var domainsPartition: any = this.resViewResponse[ResViewPartition.domains];
        if (domainsPartition != null) {
            this.domainsColl = ResourceDeserializer.createPredicateObjectsList(domainsPartition);
            this.filterPredObjList(this.domainsColl);
            this.sortObjects(this.domainsColl);
        }

        var equivalentPropertiesPartition: any = this.resViewResponse[ResViewPartition.equivalentProperties];
        if (equivalentPropertiesPartition != null) {
            this.equivalentPropertiesColl = ResourceDeserializer.createPredicateObjectsList(equivalentPropertiesPartition);
            this.filterPredObjList(this.equivalentPropertiesColl);
            this.sortObjects(this.equivalentPropertiesColl);
        }

        var evokedLexicalConceptsPartition: any = this.resViewResponse[ResViewPartition.evokedLexicalConcepts];
        if (evokedLexicalConceptsPartition != null) {
            this.evokedLexicalConceptsColl = ResourceDeserializer.createPredicateObjectsList(evokedLexicalConceptsPartition);
            this.filterPredObjList(this.evokedLexicalConceptsColl);
            this.sortObjects(this.evokedLexicalConceptsColl);
        }

        var facetsPartition: any = this.resViewResponse[ResViewPartition.facets];
        if (facetsPartition != null) {
            this.parseFacetsPartition(facetsPartition);
            this.filterPredObjList(this.inverseofColl);
            this.sortObjects(this.inverseofColl);
        }

        var formBasedPreviewPartition: any = this.resViewResponse[ResViewPartition.formBasedPreview];
        if (formBasedPreviewPartition != null) {
            this.formBasedPreviewColl = ResourceDeserializer.createPredicateObjectsList(formBasedPreviewPartition);
            this.filterPredObjList(this.formBasedPreviewColl);
            this.sortObjects(this.formBasedPreviewColl);
        }

        var formRepresentationsPartition: any = this.resViewResponse[ResViewPartition.formRepresentations];
        if (formRepresentationsPartition != null) {
            this.formRepresentationsColl = ResourceDeserializer.createPredicateObjectsList(formRepresentationsPartition);
            this.filterPredObjList(this.formRepresentationsColl);
            this.sortObjects(this.formRepresentationsColl);
        }

        var importsPartition: any = this.resViewResponse[ResViewPartition.imports];
        if (importsPartition != null) {
            this.importsColl = ResourceDeserializer.createPredicateObjectsList(importsPartition);
            this.filterPredObjList(this.importsColl);
            this.sortObjects(this.importsColl);
        }

        var labelRelationsPartition: any = this.resViewResponse[ResViewPartition.labelRelations];
        if (labelRelationsPartition != null) {
            this.labelRelationsColl = ResourceDeserializer.createPredicateObjectsList(labelRelationsPartition);
            this.filterPredObjList(this.labelRelationsColl);
            this.sortObjects(this.labelRelationsColl);
        }

        var lexicalizationsPartition: any = this.resViewResponse[ResViewPartition.lexicalizations];
        if (lexicalizationsPartition != null) {
            this.lexicalizationsColl = ResourceDeserializer.createPredicateObjectsList(lexicalizationsPartition);
            this.filterPredObjList(this.lexicalizationsColl);
            //do not sort (the sort is performed in the partition according the language)
            this.sortLexicalizations(this.lexicalizationsColl);
        }

        var lexicalFormsPartition: any = this.resViewResponse[ResViewPartition.lexicalForms];
        if (lexicalFormsPartition != null) {
            this.lexicalFormsColl = ResourceDeserializer.createPredicateObjectsList(lexicalFormsPartition);
            this.filterPredObjList(this.lexicalFormsColl);
            this.sortObjects(this.lexicalFormsColl);
        }

        var lexicalSensesPartition: any = this.resViewResponse[ResViewPartition.lexicalSenses];
        if (lexicalFormsPartition != null) {
            this.lexicalSensesColl = ResourceDeserializer.createPredicateObjectsList(lexicalSensesPartition);
            this.filterPredObjList(this.lexicalSensesColl);
            this.sortObjects(this.lexicalSensesColl);
        }

        var membersPartition: any = this.resViewResponse[ResViewPartition.members];
        if (membersPartition != null) {
            this.membersColl = ResourceDeserializer.createPredicateObjectsList(membersPartition);
            this.filterPredObjList(this.membersColl);
            this.sortObjects(this.membersColl);
        }

        var membersOrderedPartition: any = this.resViewResponse[ResViewPartition.membersOrdered];
        if (membersOrderedPartition != null) {
            this.membersOrderedColl = ResourceDeserializer.createPredicateObjectsList(membersOrderedPartition);
            //response doesn't declare the "explicit" for the collection members, set the attribute based on the explicit of the collection
            for (var i = 0; i < this.membersOrderedColl.length; i++) { //for each pred-obj-list
                let collections = this.membersOrderedColl[i].getObjects();
                for (var j = 0; j < collections.length; j++) { //for each collection (member list, should be just 1)
                    if (collections[j].getAttribute(ResAttribute.EXPLICIT)) { //set member explicit only if collection is explicit
                        let members: AnnotatedValue<Resource>[] = collections[j].getAttribute(ResAttribute.MEMBERS);
                        for (var k = 0; k < members.length; k++) {
                            members[k].setAttribute(ResAttribute.EXPLICIT, true);
                        }
                    }
                }
            }
            this.filterPredObjList(this.membersOrderedColl);
            this.sortObjects(this.membersOrderedColl);
        }

        var notesPartition: any = this.resViewResponse[ResViewPartition.notes];
        if (notesPartition != null) {
            this.notesColl = ResourceDeserializer.createPredicateObjectsList(notesPartition);
            this.filterPredObjList(this.notesColl);
            this.sortObjects(this.notesColl);
        }

        var propertiesPartition: any = this.resViewResponse[ResViewPartition.properties];
        this.propertiesColl = ResourceDeserializer.createPredicateObjectsList(propertiesPartition);
        this.filterPredObjList(this.propertiesColl);
        this.sortObjects(this.propertiesColl);

        var rangesPartition: any = this.resViewResponse[ResViewPartition.ranges];
        if (rangesPartition != null) {
            this.rangesColl = ResourceDeserializer.createPredicateObjectsList(rangesPartition);
            this.filterPredObjList(this.rangesColl);
            this.sortObjects(this.rangesColl);
        }

        var rdfsMembersPartition: any = this.resViewResponse[ResViewPartition.rdfsMembers];
        if (rdfsMembersPartition != null) {
            this.rdfsMembersColl = ResourceDeserializer.createPredicateObjectsList(rdfsMembersPartition);
            this.filterPredObjList(this.rdfsMembersColl);
            // this.sortObjects(this.rdfsMembersColl); ordered server-side
        }

        var schemesPartition: any = this.resViewResponse[ResViewPartition.schemes];
        if (schemesPartition != null) {
            this.schemesColl = ResourceDeserializer.createPredicateObjectsList(schemesPartition);
            this.filterPredObjList(this.schemesColl);
            this.sortObjects(this.schemesColl);
        }

        var subPropertyChainsPartition: any = this.resViewResponse[ResViewPartition.subPropertyChains];
        if (subPropertyChainsPartition != null) {
            this.subPropertyChainsColl = ResourceDeserializer.createPredicateObjectsList(subPropertyChainsPartition);
            this.filterPredObjList(this.subPropertyChainsColl);
            this.sortObjects(this.subPropertyChainsColl);
        }

        var subtermsPartition: any = this.resViewResponse[ResViewPartition.subterms];
        if (subtermsPartition != null) {
            this.subtermsColl = ResourceDeserializer.createPredicateObjectsList(subtermsPartition);
            this.filterPredObjList(this.subtermsColl);
            this.sortObjects(this.subtermsColl);
        }

        var superPropertiesPartition: any = this.resViewResponse[ResViewPartition.superproperties];
        if (superPropertiesPartition != null) {
            this.superpropertiesColl = ResourceDeserializer.createPredicateObjectsList(superPropertiesPartition);
            this.filterPredObjList(this.superpropertiesColl);
            this.sortObjects(this.superpropertiesColl);
        }

        var topConceptOfPartition: any = this.resViewResponse[ResViewPartition.topconceptof];
        if (topConceptOfPartition != null) {
            this.topconceptofColl = ResourceDeserializer.createPredicateObjectsList(topConceptOfPartition);
            this.filterPredObjList(this.topconceptofColl);
            this.sortObjects(this.topconceptofColl);
        }

        var typesPartition: any = this.resViewResponse[ResViewPartition.types];
        if (typesPartition != null) {
            this.typesColl = ResourceDeserializer.createPredicateObjectsList(typesPartition);
            this.filterPredObjList(this.typesColl);
            this.sortObjects(this.typesColl);
        }

        if (
            //partitions of individual, so this are always returned, also when resource is not defined, I need to check also if lenght == 0
            (this.lexicalizationsColl == null || this.lexicalizationsColl.length == 0) &&
            (this.propertiesColl == null || this.propertiesColl.length == 0) &&
            (this.typesColl == null || this.typesColl.length == 0) &&
            //partitions optional
            this.broadersColl == null &&
            this.classAxiomColl == null &&
            this.constituentsColl == null &&
            this.denotationsColl == null &&
            this.disjointPropertiesColl == null &&
            this.domainsColl == null &&
            this.equivalentPropertiesColl == null &&
            this.evokedLexicalConceptsColl == null &&
            this.formBasedPreviewColl == null &&
            this.formRepresentationsColl == null &&
            this.importsColl == null &&
            this.inverseofColl == null &&
            this.labelRelationsColl == null &&
            this.lexicalFormsColl == null &&
            this.lexicalSensesColl == null &&
            this.membersColl == null &&
            this.membersOrderedColl == null &&
            this.notesColl == null &&
            this.propertyFacets == null &&
            this.rangesColl == null &&
            this.rdfsMembersColl == null &&
            this.subPropertyChainsColl == null &&
            this.schemesColl == null &&
            this.subtermsColl == null &&
            this.superpropertiesColl == null &&
            this.topconceptofColl == null
        ) {
            this.unexistingResource = true;
        } else {
            this.unexistingResource = false;
        }
    }

    /**
     * Facets partition has a structure different from the other (object list and predicate-object list),
     * so it requires a parser ad hoc (doesn't use the parsers in ResourceDeserializer)
     */
    private parseFacetsPartition(facetsPartition: any) {
        this.propertyFacets = [];
        for (var facetName in facetsPartition) {
            if (facetName == "inverseOf") continue;
            this.propertyFacets.push({
                name: facetName,
                value: facetsPartition[facetName].value,
                explicit: facetsPartition[facetName].explicit
            })
        }
        //parse inverseOf partition in facets
        this.inverseofColl = ResourceDeserializer.createPredicateObjectsList(facetsPartition.inverseOf);
    }

    private filterPredObjList(predObjList: PredicateObjects[]) {
        this.filterInferredFromPredObjList(predObjList);
        this.filterValueLanguageFromPrefObjList(predObjList);
    }

    /**
     * Based on the showInferred param, filter out or let pass inferred information in a predicate-objects list
     */
    private filterInferredFromPredObjList(predObjList: PredicateObjects[]) {
        if (!this.showInferred) {
            for (var i = 0; i < predObjList.length; i++) {
                var objList: AnnotatedValue<Value>[] = predObjList[i].getObjects();
                for (var j = 0; j < objList.length; j++) {
                    let objGraphs: IRI[] = objList[j].getTripleGraphs();
                    if (objGraphs.some(g => g.getIRI() == SemanticTurkey.inferenceGraph)) {
                        objList.splice(j, 1);
                        j--;
                    }
                }
                //after filtering the objects list, if the predicate has no more objects, remove it from predObjList
                if (objList.length == 0) {
                    predObjList.splice(i, 1);
                    i--;
                }
            }
        }
    }

    private filterValueLanguageFromPrefObjList(predObjList: PredicateObjects[]) {
        //even if already initialized, get each time the value of valueFilterLangEnabled in order to detect eventual changes of the pref
        this.valueFilterLangEnabled = PMKIContext.getProjectCtx(this.projectCtx).getProjectPreferences().filterValueLang.enabled;
        if (this.valueFilterLangEnabled) {
            let valueFilterLanguages = PMKIContext.getProjectCtx(this.projectCtx).getProjectPreferences().filterValueLang.languages;
            for (var i = 0; i < predObjList.length; i++) {
                var objList: AnnotatedValue<Value>[] = predObjList[i].getObjects();
                for (var j = 0; j < objList.length; j++) {
                    let lang = objList[j].getAttribute(ResAttribute.LANG);
                    //remove the object if it has a language not in the languages list of the filter
                    if (lang != null && valueFilterLanguages.indexOf(lang) == -1) {
                        objList.splice(j, 1);
                        j--;
                    }
                }
                //after filtering the objects list, if the predicate has no more objects, remove it from predObjList
                if (objList.length == 0) {
                    predObjList.splice(i, 1);
                    i--;
                }
            }
        }
    }

    private sortObjects(predObjList: PredicateObjects[]) {
        //sort by show if rendering is active, uri otherwise
        let orderAttribute: SortAttribute = this.rendering ? SortAttribute.show : SortAttribute.value;
        for (var i = 0; i < predObjList.length; i++) {
            let objList: AnnotatedValue<Value>[] = predObjList[i].getObjects();
            ResourceUtils.sortResources(objList, orderAttribute);
        }
    }

    private sortLexicalizations(predObjList: PredicateObjects[]) {
        for (var i = 0; i < predObjList.length; i++) {
            let objList: AnnotatedValue<Value>[] = predObjList[i].getObjects();
            if (this.rendering) {
                objList.sort((o1: AnnotatedValue<Value>, o2: AnnotatedValue<Value>) => {
                    if (o1.getAttribute(ResAttribute.LANG) < o2.getAttribute(ResAttribute.LANG)) return -1;
                    if (o1.getAttribute(ResAttribute.LANG) > o2.getAttribute(ResAttribute.LANG)) return 1;
                    //same lang code, order alphabetically
                    return o1.getShow().localeCompare(o2.getShow());
                });
            } else { //in case the rendering is off, sort according the value
                ResourceUtils.sortResources(objList, SortAttribute.value);
            }
        }
    }

    /**
     * HEADING BUTTON HANDLERS
     */

    switchInferred() {
        this.showInferred = !this.showInferred;
        this.pmkiProp.setInferenceInResourceView(this.showInferred);
        if (!this.showInferredPristine) { //resource view has been initialized with showInferred to false, so repeat the request
            this.buildResourceView(this.resource);
        } else { //resource view has been initialized with showInferred to true, so there's no need to repeat the request
            this.loading = true;
            this.fillPartitions();
            this.loading = false;
        }
    }

    switchRendering() {
        this.rendering = !this.rendering;
        this.pmkiProp.setRenderingInResourceView(this.rendering);
    }

    settings() {
        this.resViewModals.openSettings()
    }

    openDataGraph() {
        this.graphModals.openDataGraph(this.annotatedResource, this.rendering);
    }

    isShowGraphAvailable(): boolean {
        return this.context != ResourceViewCtx.modal; //graph not available in modal
    }

    /**
     * EVENT HANDLER
     */

    private objectDblClick(object: AnnotatedValue<Resource>) {
        this.dblclickObj.emit(object);
    }

}
