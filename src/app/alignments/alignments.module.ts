import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlignmentsComponent } from './alignments.component';
import { AlignmentsModal } from './modals/alignments-modal';
import { AlignmentsModalsServices } from './modals/alignments-modal.service';
import { AlignmentsListPanelComponent } from './alignments-list-panel/alignments-list-panel.component';
import { AlignmentsListComponent } from './alignments-list-panel/alignments-list.component';
import { AlignmentsView } from './alignments-view.component';

@NgModule({
    declarations: [
        AlignmentsComponent,
        AlignmentsListComponent,
        AlignmentsModal,
        AlignmentsListPanelComponent,
        AlignmentsView
    ],
    imports: [
        CommonModule,
        FormsModule,
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
