import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { StructuresModule } from '../structures/structures.module';
import { DatasetViewComponent } from './dataset-view/dataset-view.component';
import { DatasetsComponent } from './datasets.component';
import { WidgetModule } from '../widget/widget.module';
import { BasicModalsServices } from '../modal-dialogs/basic-modals/basic-modals.service';
import { ResourceViewModule } from '../resource-view/resource-view.module';

@NgModule({
	declarations: [DatasetsComponent, DatasetViewComponent],
	imports: [
		CommonModule,
		FormsModule,
		RouterModule,
		WidgetModule,
		StructuresModule,
		ResourceViewModule
	],
	providers: [
		BasicModalsServices
	]
})
export class DatasetsModule { }
