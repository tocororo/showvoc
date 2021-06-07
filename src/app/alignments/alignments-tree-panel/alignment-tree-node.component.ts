import { Component, ElementRef, EventEmitter, Input, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { LinksetMetadata } from 'src/app/models/Metadata';
import { Project } from 'src/app/models/Project';
import { MetadataRegistryServices } from 'src/app/services/metadata-registry.service';

@Component({
    selector: 'alignment-tree-node',
    templateUrl: './alignment-tree-node.component.html',
})
export class AlignmentTreeNodeComponent {

    @Input() linkset: LinksetMetadata;
    @Input() showPercentage: boolean;
    @Output() nodeSelected = new EventEmitter<LinksetMetadata>();

    @ViewChildren(AlignmentTreeNodeComponent) viewChildrenNode: QueryList<AlignmentTreeNodeComponent>;
    @ViewChild('treeNodeElement') treeNodeElement: ElementRef;

    /**
     * ATTRIBUTES
     */
    children: LinksetMetadata[] = [];
    open: boolean = false;
    loading: boolean = false;

    showExpandCollapseBtn: boolean = true; //tells if the expand/collapse node button should be visible (it depends on more_attr and showDeprecated)

    constructor(private metadataRegistryService: MetadataRegistryServices) {}

    /**
     * Implementation of the expansion. It calls the  service for getting the child of a node in the given tree
     */
    expandNode() {
        this.metadataRegistryService.getEmbeddedLinksets(this.linkset.getRelevantTargetDataset().dataset).subscribe(
            linkset => {
                this.children = linkset;
                this.children.forEach(l => {
                    l.sourceDatasetProject = new Project(this.linkset.getTargetDatasetShow());
                })

                this.open = true;
                this.showExpandCollapseBtn = this.children.length != 0;
            }
        )
    }

    collapseNode() {
        this.open = false;
        this.children = [];
    }


    onNodeSelected(node: LinksetMetadata) {
        this.nodeSelected.emit(node);
    }

}
