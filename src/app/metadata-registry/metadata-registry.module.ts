import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbDropdownModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { AlignmentsModule } from '../alignments/alignments.module';
import { WidgetModule } from '../widget/widget.module';
import { DatasetMetadataComponent } from './dataset-metadata.component';
import { LexicalizationSetMetadataComponent } from './lexicalization-sets-panel/lexicalization-set-metadata.component';
import { LexicalizationSetsPanelComponent } from './lexicalization-sets-panel/lexicalization-sets-panel.component';
import { NewEmbeddedLexicalizationModal } from './lexicalization-sets-panel/newEmbeddedLexicalizationModal';
import { ConnectToAbsDatasetModal } from './mdr-tree/connect-to-abs-dataset-modal';
import { DatasetResourceComponent } from './mdr-tree/dataset-resource.component';
import { MetadataRegistryTreeNodeComponent } from './mdr-tree/mdr-tree-node.component';
import { MetadataRegistryTreePanelComponent } from './mdr-tree/mdr-tree-panel.component';
import { MetadataRegistryTreeComponent } from './mdr-tree/mdr-tree.component';
import { NewDatasetModal } from './mdr-tree/new-dataset-modal';
import { MetadataRegistryComponent } from './metadata-registry.component';

@NgModule({
    declarations: [
        ConnectToAbsDatasetModal,
        DatasetMetadataComponent,
        DatasetResourceComponent,
        LexicalizationSetMetadataComponent,
        LexicalizationSetsPanelComponent,
        MetadataRegistryComponent,
        MetadataRegistryTreeComponent,
        MetadataRegistryTreeNodeComponent,
        MetadataRegistryTreePanelComponent,
        NewDatasetModal,
        NewEmbeddedLexicalizationModal
    ],
    imports: [
        AlignmentsModule,
        CommonModule,
        DragDropModule,
        FormsModule,
        NgbDropdownModule,
        NgbNavModule,
        TranslateModule,
        WidgetModule,
    ],
    exports: [
        LexicalizationSetMetadataComponent
    ],
    entryComponents: [
        ConnectToAbsDatasetModal,
        NewDatasetModal,
        NewEmbeddedLexicalizationModal
    ]
})
export class MetadataRegistryModule { }
