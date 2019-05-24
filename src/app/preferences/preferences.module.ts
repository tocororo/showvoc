import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WidgetModule } from '../widget/widget.module';
import { LanguageValueFilterComponent } from './languages/language-value-filter.component';


@NgModule({
    declarations: [
        LanguageValueFilterComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        WidgetModule,
    ],
    exports: [
        LanguageValueFilterComponent
    ],
    providers: [],
})
export class PreferencesModule { }