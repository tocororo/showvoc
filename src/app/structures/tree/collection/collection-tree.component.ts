import { ChangeDetectorRef, Component, QueryList, ViewChildren } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { SharedModalsServices } from 'src/app/modal-dialogs/shared-modals/shared-modal.service';
import { RDFResourceRolesEnum } from 'src/app/models/Resources';
import { SearchServices } from 'src/app/services/search.service';
import { SkosServices } from 'src/app/services/skos.service';
import { SVEventHandler } from 'src/app/utils/SVEventHandler';
import { ResourceUtils, SortAttribute } from 'src/app/utils/ResourceUtils';
import { AbstractTree } from '../abstract-tree';
import { CollectionTreeNodeComponent } from './collection-tree-node.component';

@Component({
    selector: 'collection-tree',
    templateUrl: './collection-tree.component.html',
    host: { class: "structureComponent" }
})
export class CollectionTreeComponent extends AbstractTree {

    @ViewChildren(CollectionTreeNodeComponent) viewChildrenNode: QueryList<CollectionTreeNodeComponent>;

    structRole: RDFResourceRolesEnum = RDFResourceRolesEnum.skosCollection;

    constructor(private skosService: SkosServices, searchService: SearchServices, basicModals: BasicModalsServices, sharedModals: SharedModalsServices, 
        eventHandler: SVEventHandler, changeDetectorRef: ChangeDetectorRef) {
        super(eventHandler, searchService, basicModals, sharedModals, changeDetectorRef);
    }

    initImpl() {
        this.loading = true;
        this.skosService.getRootCollections().pipe(
            finalize(() => { this.loading = false; })
        ).subscribe(
            collections => {
                let orderAttribute: SortAttribute = this.rendering ? SortAttribute.show : SortAttribute.value;
                ResourceUtils.sortResources(collections, orderAttribute);
                this.nodes = collections;
            }
        );
    }

}
