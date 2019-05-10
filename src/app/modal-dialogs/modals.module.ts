import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ResourceViewModule } from '../resource-view/resource-view.module';
import { WidgetModule } from '../widget/widget.module';
import { AlertModal } from './basic-modals/alert-modal/alert-modal';
import { BasicModalsServices } from './basic-modals/basic-modals.service';
import { ConfirmModal } from './basic-modals/confirm-modal/confirm-modal';
import { DownloadModal } from './basic-modals/download-modal/download-modal';
import { ResourceSelectionModal } from './basic-modals/selection-modal/resource-selection-modal';
import { ResourceViewModal } from './shared-modals/resource-view-modal/resource-view-modal';
import { SharedModalsServices } from './shared-modals/shared-modal.service';

@NgModule({
    declarations: [
        AlertModal,
        ConfirmModal,
        DownloadModal,
        ResourceSelectionModal,
        ResourceViewModal
    ],
	imports: [
		CommonModule, FormsModule, WidgetModule, ResourceViewModule
	],
	providers: [
		BasicModalsServices, SharedModalsServices
	],
	entryComponents: [
        AlertModal,
        ConfirmModal,
        DownloadModal,
        ResourceSelectionModal,
        ResourceViewModal
	]
})
export class ModalsModule { }
