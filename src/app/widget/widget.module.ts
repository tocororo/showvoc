import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RdfResourceComponent } from './rdf-resource/rdf-resource.component';
import { ResizableLayoutComponent } from './resizable-layout/resizable-layout.component';

@NgModule({
	declarations: [RdfResourceComponent, ResizableLayoutComponent],
	imports: [
		CommonModule
	],
	exports: [
		RdfResourceComponent, ResizableLayoutComponent
	]
})
export class WidgetModule { }
