import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { SearchComponent } from './search.component';

@NgModule({
    declarations: [SearchComponent],
    imports: [
        CommonModule,
        FormsModule,
        NgbDropdownModule,
        RouterModule
    ]
})
export class SearchModule { }
