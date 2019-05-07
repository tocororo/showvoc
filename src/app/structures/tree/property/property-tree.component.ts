import { Component, Input, SimpleChanges, QueryList, ViewChildren } from '@angular/core';
import { PropertiesServices } from 'src/app/services/properties.service';
import { PMKIEventHandler } from 'src/app/utils/PMKIEventHandler';
import { ResourceUtils, SortAttribute } from 'src/app/utils/ResourceUtils';
import { AbstractTree } from '../abstract-tree';
import { AnnotatedValue, IRI, RDFResourceRolesEnum } from 'src/app/models/Resources';
import { RDFS } from 'src/app/models/Vocabulary';
import { Observable } from 'rxjs';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { SearchServices } from 'src/app/services/search.service';
import { PropertyTreeNodeComponent } from './property-tree-node.component';

@Component({
	selector: 'property-tree',
	templateUrl: './property-tree.component.html',
	host: { class: "structureComponent" }
})
export class PropertyTreeComponent extends AbstractTree {

    @Input() resource: IRI;//provided to show just the properties with domain the type of the resource
    @Input() type: RDFResourceRolesEnum; //tells the type of the property to show in the tree
    @Input('roots') rootProperties: IRI[]; //in case the roots are provided to the component instead of being retrieved from server

    @ViewChildren(PropertyTreeNodeComponent) viewChildrenNode: QueryList<PropertyTreeNodeComponent>;

	constructor(private propertyService: PropertiesServices, private searchService: SearchServices, eventHandler: PMKIEventHandler, basicModals: BasicModalsServices) {
		super(eventHandler, basicModals);
    }
    
    /**
     * Called when @Input resource changes, reinitialize the tree
     */
    ngOnChanges(changes: SimpleChanges) {
        if (changes['resource']) {
            this.init();
        }
    }

    initImpl() {
        //sort by show if rendering is active, uri otherwise
        let orderAttribute: SortAttribute = this.rendering ? SortAttribute.show : SortAttribute.value;

        /* different cases:
         * - roots provided as Input: tree is build rooted on these properties
         * - roots not provided, Input resource provided: tree roots are those properties that has types of this resource as domain
         * - type provided: initialize tree just for the given property type 
         * - no Input provided: tree roots retrieved from server without restrinction
         */
        if (this.rootProperties) {
            this.loading = true;
            this.propertyService.getPropertiesInfo(this.rootProperties).subscribe(
                props => {
                    ResourceUtils.sortResources(props, orderAttribute);
                    this.nodes = props;
                    this.loading = false;
                }
            )
        } else if (this.resource) {
            //at the moment I don't implement this part since it should not be necessary in PMKI since it is in readonly
        } else {
            let getPropertiesFn: Observable<AnnotatedValue<IRI>[]>;
            if (this.type == RDFResourceRolesEnum.objectProperty) {
                getPropertiesFn = this.propertyService.getTopObjectProperties();
            } else if (this.type == RDFResourceRolesEnum.annotationProperty) {
                getPropertiesFn = this.propertyService.getTopAnnotationProperties();
            } else if (this.type == RDFResourceRolesEnum.datatypeProperty) {
                getPropertiesFn = this.propertyService.getTopDatatypeProperties();
            } else if (this.type == RDFResourceRolesEnum.ontologyProperty) {
                getPropertiesFn = this.propertyService.getTopOntologyProperties();
            } else if (this.type == RDFResourceRolesEnum.property) {
                getPropertiesFn = this.propertyService.getTopRDFProperties();
            } else {
                getPropertiesFn = this.propertyService.getTopProperties();
            }
            this.loading = true;
            getPropertiesFn.subscribe(
                props => {
                    ResourceUtils.sortResources(props, orderAttribute);
                    this.nodes = props;
                    this.loading = false;
                }
            );
        } 
    }

    openTreeAt(node: AnnotatedValue<IRI>) {
        this.searchService.getPathFromRoot(node.getValue(), RDFResourceRolesEnum.skosCollection).subscribe(
            path => {
                if (path.length == 0) {
                    this.onTreeNodeNotReachable(node);
                };
                this.expandPath(path);
            }
        );
    }

}
