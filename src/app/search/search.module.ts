import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { EditLanguageModal } from './edit-language-modal.component';
import { SearchComponent } from './search.component';

@NgModule({
    declarations: [
        EditLanguageModal,
        SearchComponent
    ],
    imports: [
        CommonModule,
        DragDropModule,
        FormsModule,
        NgbDropdownModule,
        RouterModule,
        TranslateModule
    ],
    entryComponents: [
        EditLanguageModal
    ]
})
export class SearchModule { }
