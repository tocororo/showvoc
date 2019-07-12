import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { PreferencesModule } from '../preferences/preferences.module';
import { WidgetModule } from '../widget/widget.module';
import { D3Service } from './d3/d3.service';
import { DraggableDirective } from './d3/draggable.directive';
import { ZoomableDirective } from './d3/zoomable.directive';
import { AlignmentGraphPanelComponent } from './impl/alignment-graph/alignment-graph-panel.component';
import { AlignmentGraphComponent } from './impl/alignment-graph/alignment-graph.component';
import { AlignmentNodeComponent } from './impl/alignment-graph/alignment-node.component';
import { DatasetDetailsPanel } from './impl/alignment-graph/dataset-details-panel';
import { DataGraphPanel } from './impl/data-graph/data-graph-panel';
import { DataGraphComponent } from './impl/data-graph/data-graph.component';
import { DataNodeComponent } from './impl/data-graph/data-node.component';
import { LinkComponent } from './impl/link.component';
import { DataGraphSettingsModal } from './modals/data-graph-settings-modal';
import { GraphModal } from './modals/graph-modal';
import { GraphModalServices } from './modals/graph-modal.service';
import { LinksFilterModal } from './modals/links-filter-modal';
import { ResViewPartitionFilter } from './modals/res-view-partition-filter';
import { ForceControlPanel } from './widget/force-control-panel';
import { ResourceDetailsPanel } from './widget/resource-details-panel';

@NgModule({
    declarations: [
        DraggableDirective, 
        ZoomableDirective,

        LinkComponent, 

        AlignmentNodeComponent,
        AlignmentGraphComponent,
        AlignmentGraphPanelComponent,
        DatasetDetailsPanel,

        DataNodeComponent, 
        DataGraphComponent,
        DataGraphPanel, 
        // NodeModelComponent, 
        // ModelGraphPanel,
        // ModelGraphComponent, 
        ForceControlPanel, 
        ResourceDetailsPanel, 
        ResViewPartitionFilter,
        //modals
        GraphModal,
        LinksFilterModal, 
        DataGraphSettingsModal
    ],
    imports: [
        CommonModule,
        FormsModule,
        NgbDropdownModule,
        PreferencesModule,
        WidgetModule
    ],
    exports: [
        AlignmentGraphPanelComponent
    ],
    providers: [ D3Service, GraphModalServices ],
    entryComponents: [
        GraphModal, 
        LinksFilterModal,
        DataGraphSettingsModal
    ]
})
export class GraphModule { }
