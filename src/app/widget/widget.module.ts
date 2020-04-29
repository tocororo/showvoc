import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SanitizerDirective } from './directives/sanitizer.directive';
import { ExtensionConfiguratorComponent } from './extensionConfigurator/extension-configurator.component';
import { InputEditableComponent } from './input-editable/input-editable.component';
import { LanguageItemComponent } from './language-item/language-item.component';
import { PasswordInputComponent } from './password-input/password-input.component';
import { FilePickerComponent } from './pickers/file-picker/file-picker.component';
import { RdfResourceComponent } from './rdf-resource/rdf-resource.component';
import { ResourceListComponent } from './rdf-resource/resource-list.component';
import { RenderingEditorModal } from './rendering-editor/rendering-editor-modal';
import { RenderingEditor } from './rendering-editor/rendering-editor.component';
import { ResizableLayoutComponent } from './resizable-layout/resizable-layout.component';
import { SettingMapRendererComponent } from './settings-renderer/setting-map-renderer.component';
import { SettingSetRendererComponent } from './settings-renderer/setting-set-renderer.component';
import { SettingsRendererPanelComponent } from './settings-renderer/settings-renderer-panel.component';
import { SettingsRendererComponent } from './settings-renderer/settings-renderer.component';

@NgModule({
    declarations: [
        ExtensionConfiguratorComponent,
        FilePickerComponent,
        InputEditableComponent,
        LanguageItemComponent,
        PasswordInputComponent,
        RdfResourceComponent,
        RenderingEditor,
        RenderingEditorModal,
        ResourceListComponent,
        ResizableLayoutComponent,
        SanitizerDirective,
        SettingMapRendererComponent,
        SettingSetRendererComponent,
        SettingsRendererPanelComponent,
        SettingsRendererComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
    ],
    exports: [
        ExtensionConfiguratorComponent,
        FilePickerComponent,
        InputEditableComponent,
        LanguageItemComponent,
        PasswordInputComponent,
        RdfResourceComponent,
        RenderingEditor,
        RenderingEditorModal,
        ResourceListComponent,
        ResizableLayoutComponent,
        SanitizerDirective,
        SettingMapRendererComponent,
        SettingSetRendererComponent,
        SettingsRendererPanelComponent,
        SettingsRendererComponent,
    ],
    entryComponents: [
        RenderingEditorModal
    ]
})
export class WidgetModule { }
