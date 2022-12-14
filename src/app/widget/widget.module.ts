import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { QueryParameterForm } from '../datasets/sparql/query-parameterization/query-parameter-form.component';
import { YasguiComponent } from '../datasets/sparql/yasgui.component';
import { BarChartComponent } from './charts/bar-chart.component';
import { PieChartComponent } from './charts/pie-chart.component';
import { SeriesChartLegendComponent } from './charts/series-chart-legend.component';
import { HtmlEditorComponent } from './codemirror/html-editor/html-editor.component';
import { MustacheEditorComponent } from './codemirror/mustache-editor/mustache-editor.component';
import { SanitizerDirective } from './directives/sanitizer.directive';
import { ExtensionConfiguratorComponent } from './extensionConfigurator/extension-configurator.component';
import { InputEditableComponent } from './input-editable/input-editable.component';
import { LangStringEditorComponent } from './langstring-editor/langstring-editor.component';
import { LanguageItemComponent } from './language-item/language-item.component';
import { PasswordInputComponent } from './password-input/password-input.component';
import { FilePickerComponent } from './pickers/file-picker/file-picker.component';
import { LangPickerComponent } from './pickers/lang-picker/lang-picker.component';
import { LiteralPickerComponent } from './pickers/value-picker/literal-picker.component';
import { ResourcePickerComponent } from './pickers/value-picker/resource-picker.component';
import { ValuePickerComponent } from './pickers/value-picker/value-picker.component';
import { RdfResourceComponent } from './rdf-resource/rdf-resource.component';
import { ResourceListSelectionComponent } from './rdf-resource/resource-list-selection.component';
import { ResourceListComponent } from './rdf-resource/resource-list.component';
import { RenderingEditor } from './rendering-editor/rendering-editor.component';
import { ResizableLayoutComponent } from './resizable-layout/resizable-layout.component';
import { DataSizeRenderer } from './settings-renderer/datasize-renderer';
import { NestedSettingSetRendererComponent } from './settings-renderer/nested-settings-renderer.component';
import { SettingMapRendererComponent } from './settings-renderer/setting-map-renderer.component';
import { SettingPropRendererComponent } from './settings-renderer/setting-prop-renderer.component';
import { SettingSetRendererComponent } from './settings-renderer/setting-set-renderer.component';
import { SettingValueRendererComponent } from './settings-renderer/setting-value-renderer.component';
import { SettingsRendererPanelComponent } from './settings-renderer/settings-renderer-panel.component';
import { SettingsRendererComponent } from './settings-renderer/settings-renderer.component';
import { ToastsContainer } from './toast/toast-container';
import { ToastService } from './toast/toast-service';
import { TypedLiteralInputComponent } from './typed-literal-input/typed-literal-input.component';

@NgModule({
    imports: [
        CodemirrorModule,
        CommonModule,
        DragDropModule,
        FormsModule,
        NgbToastModule,
        NgxChartsModule,
        TranslateModule,
    ],
    declarations: [
        BarChartComponent,
        DataSizeRenderer,
        ExtensionConfiguratorComponent,
        FilePickerComponent,
        HtmlEditorComponent,
        InputEditableComponent,
        LangPickerComponent,
        LangStringEditorComponent,
        LanguageItemComponent,
        LiteralPickerComponent,
        MustacheEditorComponent,
        NestedSettingSetRendererComponent,
        PasswordInputComponent,
        PieChartComponent,
        QueryParameterForm,
        RdfResourceComponent,
        RenderingEditor,
        ResourceListComponent,
        ResourceListSelectionComponent,
        ResourcePickerComponent,
        ResizableLayoutComponent,
        SanitizerDirective,
        SeriesChartLegendComponent,
        SettingMapRendererComponent,
        SettingPropRendererComponent,
        SettingSetRendererComponent,
        SettingsRendererPanelComponent,
        SettingsRendererComponent,
        SettingValueRendererComponent,
        ToastsContainer,
        TypedLiteralInputComponent,
        ValuePickerComponent,
        YasguiComponent
    ],
    exports: [
        BarChartComponent,
        DataSizeRenderer,
        ExtensionConfiguratorComponent,
        FilePickerComponent,
        HtmlEditorComponent,
        InputEditableComponent,
        LangPickerComponent,
        LangStringEditorComponent,
        LanguageItemComponent,
        LiteralPickerComponent,
        MustacheEditorComponent,
        PasswordInputComponent,
        PieChartComponent,
        QueryParameterForm,
        RdfResourceComponent,
        RenderingEditor,
        ResourceListComponent,
        ResourceListSelectionComponent,
        ResourcePickerComponent,
        ResizableLayoutComponent,
        SanitizerDirective,
        SettingMapRendererComponent,
        SettingSetRendererComponent,
        SettingsRendererPanelComponent,
        SettingsRendererComponent,
        ToastsContainer,
        TypedLiteralInputComponent,
        ValuePickerComponent,
        YasguiComponent
    ],
    entryComponents: [
    ],
    providers: [
        ToastService
    ]
})
export class WidgetModule { }
