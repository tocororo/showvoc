import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { PreferencesModule } from '../preferences/preferences.module';
import { WidgetModule } from '../widget/widget.module';
import { ResourceViewModal } from './modals/resource-view-modal';
import { ResViewModalsServices } from './modals/resource-view-modal.service';
import { ResViewSettingsModal } from './modals/resource-view-settings-modal';
import { BasicRendererComponent } from './renderer/basic-renderer.component';
import { ValueRendererComponent } from './renderer/value-renderer.component';
import { ResourceViewComponent } from './resource-view.component';

@NgModule({
    declarations: [
        BasicRendererComponent,
        ResourceViewComponent,
        ResourceViewModal,
        ResViewSettingsModal,
        ValueRendererComponent
    ],
    imports: [
        CommonModule,
        DragDropModule,
        FormsModule,
        NgbDropdownModule,
        PreferencesModule,
        TranslateModule,
        WidgetModule,
    ],
    exports: [
        ResourceViewComponent
    ],
    providers: [
        ResViewModalsServices
    ],
    entryComponents: [
        ResViewSettingsModal, ResourceViewModal
    ]
})
export class ResourceViewModule { }
