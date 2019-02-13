import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertModalComponent } from './basic-modals/alert-modal/alert-modal.component';
import { BasicModalsServices } from './basic-modals/basic-modals.service';
import { FormsModule } from '@angular/forms';

@NgModule({
	declarations: [AlertModalComponent],
	imports: [
		CommonModule, FormsModule
	],
	providers: [
		BasicModalsServices
	],
	entryComponents: [
		AlertModalComponent
	]
})
export class ModalsModule { }
