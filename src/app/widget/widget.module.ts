import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PasswordInputComponent } from './password-input/password-input.component';
import { RdfResourceComponent } from './rdf-resource/rdf-resource.component';
import { ResourceListComponent } from './rdf-resource/resource-list.component';
import { ResizableLayoutComponent } from './resizable-layout/resizable-layout.component';

@NgModule({
	declarations: [
		PasswordInputComponent,
		RdfResourceComponent,
		ResourceListComponent,
		ResizableLayoutComponent
	],
	imports: [
		CommonModule,
		FormsModule
	],
	exports: [
		PasswordInputComponent,
		RdfResourceComponent,
		ResourceListComponent,
		ResizableLayoutComponent
	]
})
export class WidgetModule { }
