import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { ExtensionConfiguratorComponent } from './extensionConfigurator/extension-configurator.component';
import { LanguageItemComponent } from './language-item/language-item.component';
import { PasswordInputComponent } from './password-input/password-input.component';
import { FilePickerComponent } from './pickers/file-picker/file-picker.component';
import { RdfResourceComponent } from './rdf-resource/rdf-resource.component';
import { ResourceListComponent } from './rdf-resource/resource-list.component';
import { ResizableLayoutComponent } from './resizable-layout/resizable-layout.component';
import { SettingMapRendererComponent } from './settings-renderer/setting-map-renderer.component';
import { SettingSetRendererComponent } from './settings-renderer/setting-set-renderer.component';
import { SettingsRendererPanelComponent } from './settings-renderer/settings-renderer-panel.component';
import { SettingsRendererComponent } from './settings-renderer/settings-renderer.component';

@NgModule({
	declarations: [
		ExtensionConfiguratorComponent,
		FilePickerComponent,
		LanguageItemComponent,
		PasswordInputComponent,
		RdfResourceComponent,
		ResourceListComponent,
		ResizableLayoutComponent,
		SettingMapRendererComponent,
		SettingSetRendererComponent,
		SettingsRendererPanelComponent,
		SettingsRendererComponent,
	],
	imports: [
		CommonModule,
		FormsModule,
		NgbAlertModule,
	],
	exports: [
		ExtensionConfiguratorComponent,
		FilePickerComponent,
		LanguageItemComponent,
		PasswordInputComponent,
		RdfResourceComponent,
		ResourceListComponent,
		ResizableLayoutComponent,
		SettingMapRendererComponent,
		SettingSetRendererComponent,
		SettingsRendererPanelComponent,
		SettingsRendererComponent,
	]
})
export class WidgetModule { }
