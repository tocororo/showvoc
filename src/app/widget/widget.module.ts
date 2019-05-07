import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RdfResourceComponent } from './rdf-resource/rdf-resource.component';
import { ResizableLayoutComponent } from './resizable-layout/resizable-layout.component';
import { ResourceListComponent } from './rdf-resource/resource-list.component';

@NgModule({
	declarations: [RdfResourceComponent, ResourceListComponent, ResizableLayoutComponent],
	imports: [
		CommonModule
	],
	exports: [
		RdfResourceComponent, ResourceListComponent, ResizableLayoutComponent
	]
})
export class WidgetModule { }
