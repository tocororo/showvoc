import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
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
import { SelectionModal } from './basic-modals/selection-modal/selection-modal';
import { BrowsingModalsServices } from './browsing-modals/browsing-modal.service';
import { ClassIndividualTreeModal } from './browsing-modals/class-individual-tree-modal/class-individual-tree-modal';
import { ClassTreeModal } from './browsing-modals/class-tree-modal/class-tree-modal';
import { CollectionTreeModal } from './browsing-modals/collection-tree-modal/collection-tree-modal';
import { ConceptTreeModal } from './browsing-modals/concept-tree-modal/concept-tree-modal';
import { LexicalEntryListModal } from './browsing-modals/lexical-entry-list-modal/lexical-entry-list-modal';
import { LexiconListModal } from './browsing-modals/lexicon-list-modal/lexicon-list-modal';
import { PropertyTreeModal } from './browsing-modals/property-tree-modal/property-tree-modal';
import { SchemeListModal } from './browsing-modals/scheme-list-modal/scheme-list-modal';
import { CreationModalServices } from './creation-modals/creationModalServices';
import { NewTypedLiteralModal } from './creation-modals/newTypedLiteralModal/new-typed-literal-modal';
import { LoadConfigurationModal } from './shared-modals/configuration-store-modal/load-configuration-modal';
import { StoreConfigurationModal } from './shared-modals/configuration-store-modal/store-configuration-modal';
import { LanguageSelectorModal } from './shared-modals/languages-selector-modal/languages-selector-modal';
import { PluginConfigurationModal } from './shared-modals/plugin-configuration/plugin-configuration-modal';
import { ResourcePickerModal } from './shared-modals/resource-picker-modal/resource-picker-modal';
import { SharedModalsServices } from './shared-modals/shared-modal.service';

@NgModule({
    declarations: [
        AlertModal,
        ClassIndividualTreeModal,
        ClassTreeModal,
        CollectionTreeModal,
        ConceptTreeModal,
        ConfirmCheckModal,
        ConfirmModal,
        DownloadModal,
        LanguageSelectorModal,
        LexicalEntryListModal,
        LexiconListModal,
        LoadConfigurationModal,
        NewTypedLiteralModal,
        PluginConfigurationModal,
        PromptModal,
        PromptNumberModal,
        PropertyTreeModal,
        ResourcePickerModal,
        ResourceSelectionModal,
        SchemeListModal,
        SelectionModal,
        StoreConfigurationModal
    ],
    imports: [
        CommonModule, 
        DragDropModule,
        FormsModule,
        ResourceViewModule,
        StructuresModule,
        TranslateModule,
        WidgetModule,  
    ],
    providers: [
        BasicModalsServices, BrowsingModalsServices, CreationModalServices, SharedModalsServices
    ],
    entryComponents: [
        AlertModal,
        ClassIndividualTreeModal,
        ClassTreeModal,
        CollectionTreeModal,
        ConceptTreeModal,
        ConfirmCheckModal,
        ConfirmModal,
        DownloadModal,
        LanguageSelectorModal,
        LexicalEntryListModal,
        LexiconListModal,
        LoadConfigurationModal,
        NewTypedLiteralModal,
        PluginConfigurationModal,
        PromptModal,
        PromptNumberModal,
        PropertyTreeModal,
        ResourcePickerModal,
        ResourceSelectionModal,
        SchemeListModal,
        SelectionModal,
        StoreConfigurationModal,
    ]
})
export class ModalsModule { }
