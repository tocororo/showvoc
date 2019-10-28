import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbAlertModule, NgbDropdownModule, NgbTabsetModule } from '@ng-bootstrap/ng-bootstrap';
import { AlignmentsModule } from '../alignments/alignments.module';
import { WidgetModule } from '../widget/widget.module';
import { LexicalEntryListPanelComponent } from './list/lexical-entry/lexical-entry-list-panel.component';
import { LexicalEntryListSettingsModal } from './list/lexical-entry/lexical-entry-list-settings-modal';
import { LexicalEntryListComponent } from './list/lexical-entry/lexical-entry-list.component';
import { LexiconListPanelComponent } from './list/lexicon/lexicon-list-panel.component';
import { LexiconListComponent } from './list/lexicon/lexicon-list.component';
import { ListNodeComponent } from './list/list-node.component';
import { SchemeListPanelComponent } from './list/scheme/scheme-list-panel.component';
import { SchemeListComponent } from './list/scheme/scheme-list.component';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { SearchSettingsModal } from './search-bar/search-settings-modal';
import { StructureTabsetComponent } from './structure-tabset/structure-tabset.component';
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
        CollectionTreeComponent,
        CollectionTreeNodeComponent,
        CollectionTreePanelComponent,
        ConceptTreeComponent,
        ConceptTreeNodeComponent,
        ConceptTreePanelComponent,
        ConceptTreeSettingsModal,
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
        StructureTabsetComponent,

        SearchBarComponent,
        SearchSettingsModal
    ],
    imports: [
        AlignmentsModule,
        CommonModule,
        FormsModule,
        NgbAlertModule,
        NgbDropdownModule,
        NgbTabsetModule,
        WidgetModule
    ],
    exports: [
        StructureTabsetComponent,
        CollectionTreePanelComponent, ConceptTreePanelComponent, PropertyTreePanelComponent,
        SchemeListPanelComponent, LexiconListPanelComponent, LexicalEntryListPanelComponent
    ],
    entryComponents: [
        ConceptTreeSettingsModal,
        LexicalEntryListSettingsModal,
        SearchSettingsModal
    ]
})
export class StructuresModule { }
