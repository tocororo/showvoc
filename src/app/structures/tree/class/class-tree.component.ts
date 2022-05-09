import { Component, Input, QueryList, SimpleChanges, ViewChildren } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { SharedModalsServices } from 'src/app/modal-dialogs/shared-modals/shared-modal.service';
import { IRI, RDFResourceRolesEnum } from 'src/app/models/Resources';
import { ClassesServices } from 'src/app/services/classes.service';
import { SearchServices } from 'src/app/services/search.service';
import { SVContext } from 'src/app/utils/SVContext';
import { SVEventHandler } from 'src/app/utils/SVEventHandler';
import { ResourceUtils, SortAttribute } from 'src/app/utils/ResourceUtils';
import { AbstractTree } from '../abstract-tree';
import { ClassTreeNodeComponent } from './class-tree-node.component';

@Component({
    selector: 'class-tree',
    templateUrl: './class-tree.component.html',
    host: { class: "structureComponent" }
})
export class ClassTreeComponent extends AbstractTree {
    @Input() filterEnabled: boolean = false;
    @Input() roots: IRI[];

    @ViewChildren(ClassTreeNodeComponent) viewChildrenNode: QueryList<ClassTreeNodeComponent>;

    structRole: RDFResourceRolesEnum = RDFResourceRolesEnum.cls;

    constructor(private clsService: ClassesServices, searchService: SearchServices, basicModals: BasicModalsServices, sharedModals: SharedModalsServices, eventHandler: SVEventHandler) {
        super(eventHandler, searchService, basicModals, sharedModals);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['roots']) {
            this.init();
        }
    }

    initImpl() {
        let clsTreeRoots: IRI[] = this.roots;
        if (clsTreeRoots == undefined || clsTreeRoots.length == 0) {
            clsTreeRoots = [new IRI(SVContext.getProjectCtx().getProjectPreferences().classTreePreferences.rootClassUri)];
        }

        this.loading = true;
        this.clsService.getClassesInfo(clsTreeRoots).pipe(
            finalize(() => { this.loading = false; })
        ).subscribe(
            classes => {
                let orderAttribute: SortAttribute = this.rendering ? SortAttribute.show : SortAttribute.value;
                ResourceUtils.sortResources(classes, orderAttribute);
                this.nodes = classes;
            }
        );
    }

}
