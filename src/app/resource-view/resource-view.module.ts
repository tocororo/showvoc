import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ResourceViewComponent } from './resource-view.component';
import { WidgetModule } from '../widget/widget.module';

@NgModule({
	declarations: [ResourceViewComponent],
	imports: [
		CommonModule, WidgetModule
	],
	exports: [
		ResourceViewComponent
	]
})
export class ResourceViewModule { }
