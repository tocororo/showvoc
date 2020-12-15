import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbDropdownModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { AlignmentsModule } from '../alignments/alignments.module';
import { BasicModalsServices } from '../modal-dialogs/basic-modals/basic-modals.service';
import { ResourceViewModule } from '../resource-view/resource-view.module';
import { StructuresModule } from '../structures/structures.module';
import { WidgetModule } from '../widget/widget.module';
import { DatasetDataComponent } from './data/dataset-data.component';
import { DatasetViewComponent } from './dataset-view/dataset-view.component';
import { DatasetsComponent } from './datasets.component';
import { ExportResultRdfModal } from './sparql/export-result-rdf-modal';
import { SparqlTabComponent } from './sparql/sparql-tab.component';
import { SparqlComponent } from './sparql/sparql.component';
import { YasguiComponent } from './sparql/yasgui.component';

@NgModule({
	declarations: [
		DatasetsComponent,
		DatasetViewComponent,
		DatasetDataComponent,
		SparqlComponent,
		SparqlTabComponent,
		YasguiComponent,
		ExportResultRdfModal
	],
	imports: [
		AlignmentsModule,
		CommonModule,
		FormsModule,
		NgbDropdownModule,
		NgbNavModule,
		ResourceViewModule,
		RouterModule,
		StructuresModule,
		TranslateModule,
		WidgetModule,
	],
	providers: [
		BasicModalsServices
	],
	entryComponents: [
		ExportResultRdfModal
	]
})
export class DatasetsModule { }
