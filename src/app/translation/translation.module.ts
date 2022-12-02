import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { WidgetModule } from '../widget/widget.module';
import { TranslationResultComponent } from './translation-result.component';
import { TranslationComponent } from './translation.component';

@NgModule({
    declarations: [
        TranslationComponent,
        TranslationResultComponent
    ],
    imports: [
        CommonModule,
        DragDropModule,
        FormsModule,
        NgbDropdownModule,
        RouterModule,
        TranslateModule,
        WidgetModule,
    ],
    entryComponents: [
    ]
})
export class TranslationModule { }
