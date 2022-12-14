import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { GraphModule } from '../graph/graph.module';
import { WidgetModule } from '../widget/widget.module';
import { AlignmentsSearchbar } from './alignments-searchbar.component';
import { AlignmentsTableComponent } from './alignments-table/alignments-table.component';
import { AlignmentTreeNodeComponent } from './alignments-tree-panel/alignment-tree-node.component';
import { AlignmentsTreePanelComponent } from './alignments-tree-panel/alignments-tree-panel.component';
import { AlignmentsTreeComponent } from './alignments-tree-panel/alignments-tree.component';
import { AlignmentsView } from './alignments-view.component';
import { AlignmentsComponent } from './alignments.component';
import { AlignmentsModal } from './modals/alignments-modal';
import { AlignmentsModalsServices } from './modals/alignments-modal.service';
import { AlignmentsSearchResultsModal } from './modals/alignments-search-results-modal';

@NgModule({
    declarations: [
        AlignmentsComponent,
        AlignmentsModal,
        AlignmentsSearchbar,
        AlignmentsSearchResultsModal,
        AlignmentsTreePanelComponent,
        AlignmentsTableComponent,
        AlignmentsTreeComponent,
        AlignmentTreeNodeComponent,
        AlignmentsView
    ],
    imports: [
        CommonModule,
        DragDropModule,
        FormsModule,
        GraphModule,
        NgbDropdownModule,
        TranslateModule,
        WidgetModule
    ],
    exports: [
        AlignmentsTableComponent,
        AlignmentsTreePanelComponent,
        AlignmentsView
    ],
    providers: [
        AlignmentsModalsServices
    ],
    entryComponents: [
        AlignmentsModal,
        AlignmentsSearchResultsModal,
    ]
})
export class AlignmentsModule { }
