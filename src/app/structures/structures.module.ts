import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbDropdownModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { AlignmentsModule } from '../alignments/alignments.module';
import { WidgetModule } from '../widget/widget.module';
import { InstanceListPanelComponent } from './list/instance/instance-list-panel.component';
import { InstanceListSettingsModal } from './list/instance/instance-list-settings-modal';
import { InstanceListComponent } from './list/instance/instance-list.component';
import { LexicalEntryListPanelComponent } from './list/lexical-entry/lexical-entry-list-panel.component';
import { LexicalEntryListSettingsModal } from './list/lexical-entry/lexical-entry-list-settings-modal';
import { LexicalEntryListComponent } from './list/lexical-entry/lexical-entry-list.component';
import { LexiconListPanelComponent } from './list/lexicon/lexicon-list-panel.component';
import { LexiconListComponent } from './list/lexicon/lexicon-list.component';
import { ListNodeComponent } from './list/list-node.component';
import { SchemeListPanelComponent } from './list/scheme/scheme-list-panel.component';
import { SchemeListComponent } from './list/scheme/scheme-list.component';
import { AdvancedSearchModal } from './search-bar/advanced-search-modal';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { SearchSettingsModal } from './search-bar/search-settings-modal';
import { StructureTabsetComponent } from './structure-tabset/structure-tabset.component';
import { ClassIndividualTreeComponent } from './tree/class/class-individual-tree.component';
import { ClassInstancePanelComponent } from './tree/class/class-instance-panel.component';
import { ClassTreeNodeComponent } from './tree/class/class-tree-node.component';
import { ClassTreePanelComponent } from './tree/class/class-tree-panel.component';
import { ClassTreeSettingsModal } from './tree/class/class-tree-settings-modal';
import { ClassTreeComponent } from './tree/class/class-tree.component';
import { CollectionTreeNodeComponent } from './tree/collection/collection-tree-node.component';
import { CollectionTreePanelComponent } from './tree/collection/collection-tree-panel.component';
import { CollectionTreeComponent } from './tree/collection/collection-tree.component';
import { ConceptTreeNodeComponent } from './tree/concept/concept-tree-node.component';
import { ConceptTreePanelComponent } from './tree/concept/concept-tree-panel.component';
import { ConceptTreeSettingsModal } from './tree/concept/concept-tree-settings-modal';
import { ConceptTreeComponent } from './tree/concept/concept-tree.component';
import { PropertyTreeNodeComponent } from './tree/property/property-tree-node.component';
import { PropertyTreePanelComponent } from './tree/property/property-tree-panel.component';
import { PropertyTreeComponent } from './tree/property/property-tree.component';

@NgModule({
    declarations: [
        AdvancedSearchModal,
        ClassIndividualTreeComponent,
        ClassInstancePanelComponent,
        ClassTreeComponent,
        ClassTreeNodeComponent,
        ClassTreePanelComponent,
        ClassTreeSettingsModal,
        CollectionTreeComponent,
        CollectionTreeNodeComponent,
        CollectionTreePanelComponent,
        ConceptTreeComponent,
        ConceptTreeNodeComponent,
        ConceptTreePanelComponent,
        ConceptTreeSettingsModal,
        InstanceListComponent,
        InstanceListPanelComponent,
        InstanceListSettingsModal,
        LexiconListComponent,
        LexiconListPanelComponent,
        LexicalEntryListComponent,
        LexicalEntryListPanelComponent,
        LexicalEntryListSettingsModal,
        ListNodeComponent,
        PropertyTreeComponent,
        PropertyTreeNodeComponent,
        PropertyTreePanelComponent,
        SchemeListComponent,
        SchemeListPanelComponent,
        SearchBarComponent,
        SearchSettingsModal,
        StructureTabsetComponent,
    ],
    imports: [
        AlignmentsModule,
        DragDropModule,
        CommonModule,
        FormsModule,
        NgbDropdownModule,
        NgbNavModule,
        TranslateModule,
        WidgetModule
    ],
    exports: [
        StructureTabsetComponent,
        ClassIndividualTreeComponent,
        ClassInstancePanelComponent,
        ClassTreePanelComponent,
        CollectionTreePanelComponent,
        ConceptTreePanelComponent,
        LexicalEntryListPanelComponent,
        LexiconListPanelComponent,
        PropertyTreePanelComponent,
        SchemeListPanelComponent,
    ],
    entryComponents: [
        AdvancedSearchModal,
        ClassTreeSettingsModal,
        ConceptTreeSettingsModal,
        InstanceListSettingsModal,
        LexicalEntryListSettingsModal,
        SearchSettingsModal
    ]
})
export class StructuresModule { }
