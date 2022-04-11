import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { PreferencesModule } from '../preferences/preferences.module';
import { WidgetModule } from '../widget/widget.module';
import { D3Service } from './d3/d3.service';
import { DraggableDirective } from './d3/draggable.directive';
import { ZoomableDirective } from './d3/zoomable.directive';
import { AlignmentDetailsPanel } from './impl/alignment-graph/alignment-details-panel';
import { AlignmentGraphPanelComponent } from './impl/alignment-graph/alignment-graph-panel.component';
import { AlignmentGraphComponent } from './impl/alignment-graph/alignment-graph.component';
import { AlignmentLinkComponent } from './impl/alignment-graph/alignment-link.component';
import { AlignmentNodeComponent } from './impl/alignment-graph/alignment-node.component';
import { DatasetDetailsPanel } from './impl/alignment-graph/dataset-details-panel';
import { DataGraphPanel } from './impl/data-graph/data-graph-panel';
import { DataGraphComponent } from './impl/data-graph/data-graph.component';
import { DataLinkComponent } from './impl/data-graph/data-link.component';
import { DataNodeComponent } from './impl/data-graph/data-node.component';
import { DataGraphSettingsModal } from './modals/data-graph-settings-modal';
import { GraphModal } from './modals/graph-modal';
import { GraphModalServices } from './modals/graph-modal.service';
import { LinksFilterModal } from './modals/links-filter-modal';
import { PartitionFilter } from './modals/partition-filter';
import { ForceControlPanel } from './widget/force-control-panel';
import { ResourceDetailsPanel } from './widget/resource-details-panel';

@NgModule({
    declarations: [
        DraggableDirective,
        ZoomableDirective,

        AlignmentLinkComponent,
        AlignmentNodeComponent,
        AlignmentGraphComponent,
        AlignmentGraphPanelComponent,
        AlignmentDetailsPanel,
        DatasetDetailsPanel,

        DataLinkComponent,
        DataNodeComponent,
        DataGraphComponent,
        DataGraphPanel,

        ForceControlPanel,
        ResourceDetailsPanel,
        PartitionFilter,
        //modals
        GraphModal,
        LinksFilterModal,
        DataGraphSettingsModal
    ],
    imports: [
        CommonModule,
        DragDropModule,
        FormsModule,
        NgbDropdownModule,
        PreferencesModule,
        TranslateModule,
        WidgetModule
    ],
    exports: [
        AlignmentGraphPanelComponent
    ],
    providers: [D3Service, GraphModalServices],
    entryComponents: [
        GraphModal,
        LinksFilterModal,
        DataGraphSettingsModal
    ]
})
export class GraphModule { }
