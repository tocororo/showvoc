import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { GraphModule } from '../graph/graph.module';
import { WidgetModule } from '../widget/widget.module';
import { AlignmentTreeNodeComponent } from './alignments-tree-panel/alignment-tree-node.component';
import { AlignmentsTreePanelComponent } from './alignments-tree-panel/alignments-tree-panel.component';
import { AlignmentsTreeComponent } from './alignments-tree-panel/alignments-tree.component';
import { AlignmentsTableComponent } from './alignments-table/alignments-table.component';
import { AlignmentsView } from './alignments-view.component';
import { AlignmentsComponent } from './alignments.component';
import { AlignmentsModal } from './modals/alignments-modal';
import { AlignmentsModalsServices } from './modals/alignments-modal.service';

@NgModule({
    declarations: [
        AlignmentsComponent,
        AlignmentsModal,
        AlignmentsTreePanelComponent,
        AlignmentsTableComponent,
        AlignmentsTreeComponent,
        AlignmentTreeNodeComponent,
        AlignmentsView
    ],
    imports: [
        CommonModule,
        FormsModule,
        GraphModule,
        TranslateModule,
        WidgetModule
    ],
    exports: [
        AlignmentsTreePanelComponent,
        AlignmentsView
    ],
    providers: [
        AlignmentsModalsServices
    ],
    entryComponents: [
        AlignmentsModal
    ]
})
export class AlignmentsModule { }
