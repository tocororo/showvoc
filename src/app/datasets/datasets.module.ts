import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatasetsComponent } from './datasets.component';
import { FormsModule } from '@angular/forms';
import { DatasetViewComponent } from './dataset-view/dataset-view.component';
import { RouterModule } from '@angular/router';
import { DataStructureModule } from '../data-structure/data-structure.module';
import { WidgetModule } from '../widget/widget.module';
import { NgbTabsetModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
	declarations: [DatasetsComponent, DatasetViewComponent],
	imports: [
		CommonModule,
		FormsModule,
		RouterModule,
		DataStructureModule,
		NgbTabsetModule
		// WidgetModule
	]
})
export class DatasetsModule { }
