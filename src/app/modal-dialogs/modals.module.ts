import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WidgetModule } from '../widget/widget.module';
import { AlertModal } from './basic-modals/alert-modal/alert-modal';
import { BasicModalsServices } from './basic-modals/basic-modals.service';
import { ConfirmModal } from './basic-modals/confirm-modal/confirm-modal';
import { ResourceSelectionModal } from './basic-modals/selection-modal/resource-selection-modal';

@NgModule({
    declarations: [
        AlertModal,
        ConfirmModal,
        ResourceSelectionModal
    ],
	imports: [
		CommonModule, FormsModule, WidgetModule
	],
	providers: [
		BasicModalsServices
	],
	entryComponents: [
        AlertModal,
        ConfirmModal,
        ResourceSelectionModal
	]
})
export class ModalsModule { }
