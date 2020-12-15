import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { WidgetModule } from '../widget/widget.module';
import { LanguageValueFilterComponent } from './languages/language-value-filter.component';


@NgModule({
    declarations: [
        LanguageValueFilterComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        WidgetModule,
    ],
    exports: [
        LanguageValueFilterComponent
    ],
    providers: [],
})
export class PreferencesModule { }