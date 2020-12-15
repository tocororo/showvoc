import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { GraphModule } from '../graph/graph.module';
import { WidgetModule } from '../widget/widget.module';
import { AlignmentsListPanelComponent } from './alignments-list-panel/alignments-list-panel.component';
import { AlignmentsListComponent } from './alignments-list-panel/alignments-list.component';
import { AlignmentsTableComponent } from './alignments-table/alignments-table.component';
import { AlignmentsView } from './alignments-view.component';
import { AlignmentsComponent } from './alignments.component';
import { AlignmentsModal } from './modals/alignments-modal';
import { AlignmentsModalsServices } from './modals/alignments-modal.service';

@NgModule({
    declarations: [
        AlignmentsComponent,
        AlignmentsListComponent,
        AlignmentsModal,
        AlignmentsListPanelComponent,
        AlignmentsTableComponent,
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
        AlignmentsListPanelComponent,
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
