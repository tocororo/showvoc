import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MappingsModal } from './mappings-modal';
import { MappingsModalsServices } from './mappings-modal.service';
import { MappingsComponent } from './mappings.component';

@NgModule({
    declarations: [
        MappingsComponent,
        MappingsModal
    ],
    imports: [
        CommonModule,
        FormsModule,
    ],
    providers: [
        MappingsModalsServices
    ],
    entryComponents: [
        MappingsModal
    ]
})
export class MappingsModule { }
