import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RdfResourceComponent } from './rdf-resource/rdf-resource.component';

@NgModule({
	declarations: [RdfResourceComponent],
	imports: [
		CommonModule
	],
	exports: [
		RdfResourceComponent
	]
})
export class WidgetModule { }
