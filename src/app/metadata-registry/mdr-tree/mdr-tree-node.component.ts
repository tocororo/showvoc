import { Component, EventEmitter, Input, Output, QueryList, ViewChildren } from "@angular/core";
import { TranslateService } from '@ngx-translate/core';
import { CatalogRecord2, DatasetNature } from 'src/app/models/Metadata';
import { CommonUtils } from "src/app/models/Shared";
import { MetadataRegistryServices } from 'src/app/services/metadata-registry.service';

@Component({
    selector: "mdr-tree-node",
    templateUrl: "./mdr-tree-node.component.html",
    styleUrls: ['./mdr-tree.css'],
})
export class MetadataRegistryTreeNodeComponent {

    @Input() record: CatalogRecord2;
    @Input() root: boolean = true;
    @Output() nodeSelected = new EventEmitter<CatalogRecord2>();

    @ViewChildren(MetadataRegistryTreeNodeComponent) viewChildrenNode: QueryList<MetadataRegistryTreeNodeComponent>;

    children: CatalogRecord2[] = [];
    open: boolean = false;

    showExpandCollapseBtn: boolean = false; //tells if the expand/collapse node button should be visible (it depends on more_attr and showDeprecated)

    issuedLocal: string;
    modifiedLocal: string;

    constructor(private metadataRegistryService: MetadataRegistryServices, private translate: TranslateService) {}

    ngOnInit() {
        this.showExpandCollapseBtn = this.record.dataset.nature == DatasetNature.ABSTRACT;

        this.issuedLocal = CommonUtils.datetimeToLocale(this.record.issued);
        this.modifiedLocal = this.record.modified ? CommonUtils.datetimeToLocale(this.record.modified) : null;
    }

    selectNode() {
        this.nodeSelected.emit(this.record);
    }

    expandNode() {
        this.open = true;
        this.metadataRegistryService.listConnectedDatasets(this.record.dataset.identity).subscribe(
            records => {
                this.children = records;
            }
        );
    }

    collapseNode() {
        this.open = false;
        this.children = [];
    }

    onNodeSelected(node: CatalogRecord2) {
        this.nodeSelected.emit(node);
    }

}
