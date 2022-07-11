import { DragDropModule } from '@angular/cdk/drag-drop';
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
import { DatasetCardComponent } from './datasets-page/dataset-card.component';
import { DatasetsDirsComponent } from './datasets-page/datasets-dirs.component';
import { DatasetsListComponent } from './datasets-page/datasets-list.component';
import { DatasetsPageComponent } from './datasets-page/datasets-page.component';
import { DatasetsSettingsModal } from './datasets-page/datasets-settings-modal.component';
import { LexicalizationSetsRenderer } from './metadata/lexicalization-sets-renderer.component';
import { MetadataComponent } from './metadata/metadata.component';
import { TypeDistributionsComponent } from './metadata/type-distributions.component';
import { ExportResultRdfModal } from './sparql/export-result-rdf-modal';
import { SparqlTabComponent } from './sparql/sparql-tab.component';
import { SparqlComponent } from './sparql/sparql.component';
import { YasguiComponent } from './sparql/yasgui.component';

@NgModule({
    declarations: [
        DatasetCardComponent,
        DatasetDataComponent,
        DatasetViewComponent,
        DatasetsPageComponent,
        DatasetsDirsComponent,
        DatasetsListComponent,
        DatasetsSettingsModal,
        ExportResultRdfModal,
        LexicalizationSetsRenderer,
        MetadataComponent,
        SparqlComponent,
        SparqlTabComponent,
        TypeDistributionsComponent,
        YasguiComponent,
    ],
    imports: [
        AlignmentsModule,
        CommonModule,
        DragDropModule,
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
        DatasetsSettingsModal,
        ExportResultRdfModal
    ]
})
export class DatasetsModule { }
