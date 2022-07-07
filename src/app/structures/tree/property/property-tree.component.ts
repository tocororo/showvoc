import { ChangeDetectorRef, Component, Input, QueryList, SimpleChanges, ViewChildren } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { SharedModalsServices } from 'src/app/modal-dialogs/shared-modals/shared-modal.service';
import { AnnotatedValue, IRI, RDFResourceRolesEnum } from 'src/app/models/Resources';
import { PropertiesServices } from 'src/app/services/properties.service';
import { SearchServices } from 'src/app/services/search.service';
import { SVEventHandler } from 'src/app/utils/SVEventHandler';
import { ResourceUtils, SortAttribute } from 'src/app/utils/ResourceUtils';
import { AbstractTree } from '../abstract-tree';
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

    structRole: RDFResourceRolesEnum = RDFResourceRolesEnum.property;

    constructor(private propertyService: PropertiesServices, searchService: SearchServices, basicModals: BasicModalsServices, sharedModals: SharedModalsServices, 
        eventHandler: SVEventHandler, changeDetectorRef: ChangeDetectorRef) {
        super(eventHandler, searchService, basicModals, sharedModals, changeDetectorRef);
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
            this.propertyService.getPropertiesInfo(this.rootProperties).pipe(
                finalize(() => { this.loading = false; })
            ).subscribe(
                props => {
                    ResourceUtils.sortResources(props, orderAttribute);
                    this.nodes = props;
                }
            );
        } else if (this.resource) {
            //at the moment I don't implement this part since it should not be necessary in ShowVoc since it is in readonly
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
            getPropertiesFn.pipe(
                finalize(() => { this.loading = false; })
            ).subscribe(
                props => {
                    ResourceUtils.sortResources(props, orderAttribute);
                    this.nodes = props;
                }
            );
        }
    }

}
