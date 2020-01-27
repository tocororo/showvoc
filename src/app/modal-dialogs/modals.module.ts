import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ResourceViewModule } from '../resource-view/resource-view.module';
import { StructuresModule } from '../structures/structures.module';
import { WidgetModule } from '../widget/widget.module';
import { AlertModal } from './basic-modals/alert-modal/alert-modal';
import { BasicModalsServices } from './basic-modals/basic-modals.service';
import { ConfirmCheckModal } from './basic-modals/confirm-modal/confirm-check-modal';
import { ConfirmModal } from './basic-modals/confirm-modal/confirm-modal';
import { DownloadModal } from './basic-modals/download-modal/download-modal';
import { PromptModal } from './basic-modals/prompt-modal/prompt-modal';
import { PromptNumberModal } from './basic-modals/prompt-modal/prompt-number-modal';
import { ResourceSelectionModal } from './basic-modals/selection-modal/resource-selection-modal';
import { BrowsingModalsServices } from './browsing-modals/browsing-modal.service';
import { ClassTreeModal } from './browsing-modals/class-tree-modal/class-tree-modal';
import { CollectionTreeModal } from './browsing-modals/collection-tree-modal/collection-tree-modal';
import { ConceptTreeModal } from './browsing-modals/concept-tree-modal/concept-tree-modal';
import { LexicalEntryListModal } from './browsing-modals/lexical-entry-list-modal/lexical-entry-list-modal';
import { LexiconListModal } from './browsing-modals/lexicon-list-modal/lexicon-list-modal';
import { PropertyTreeModal } from './browsing-modals/property-tree-modal/property-tree-modal';
import { SchemeListModal } from './browsing-modals/scheme-list-modal/scheme-list-modal';
import { PluginConfigurationModal } from './shared-modals/plugin-configuration/plugin-configuration-modal';
import { SharedModalsServices } from './shared-modals/shared-modal.service';

@NgModule({
    declarations: [
        AlertModal,
        ClassTreeModal,
        CollectionTreeModal,
        ConceptTreeModal,
        ConfirmCheckModal,
        ConfirmModal,
        DownloadModal,
        LexicalEntryListModal,
        LexiconListModal,
        PluginConfigurationModal,
        PromptModal,
        PromptNumberModal,
        PropertyTreeModal,
        ResourceSelectionModal,
        SchemeListModal
    ],
    imports: [
        CommonModule, FormsModule, WidgetModule, ResourceViewModule, StructuresModule
    ],
    providers: [
        BasicModalsServices, BrowsingModalsServices, SharedModalsServices
    ],
    entryComponents: [
        AlertModal,
        ClassTreeModal,
        CollectionTreeModal,
        ConceptTreeModal,
        ConfirmCheckModal,
        ConfirmModal,
        DownloadModal,
        LexicalEntryListModal,
        LexiconListModal,
        PluginConfigurationModal,
        PromptModal,
        PromptNumberModal,
        PropertyTreeModal,
        ResourceSelectionModal,
        SchemeListModal
    ]
})
export class ModalsModule { }
