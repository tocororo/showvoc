import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlignmentsModal as AlignmentsModal } from './alignments-modal';
import { AlignmentsModalsServices } from './alignments-modal.service';
import { AlignmentsComponent as AlignmentsComponent } from './alignments.component';

@NgModule({
    declarations: [
        AlignmentsComponent,
        AlignmentsModal
    ],
    imports: [
        CommonModule,
        FormsModule,
    ],
    providers: [
        AlignmentsModalsServices
    ],
    entryComponents: [
        AlignmentsModal
    ]
})
export class AlignmentsModule { }
