import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatasetsComponent } from './datasets.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [DatasetsComponent],
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class DatasetsModule { }
