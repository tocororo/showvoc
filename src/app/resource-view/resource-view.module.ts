import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WidgetModule } from '../widget/widget.module';
import { BasicRendererComponent } from './renderer/basic-renderer.component';
import { ResourceViewComponent } from './resource-view.component';

@NgModule({
	declarations: [
		ResourceViewComponent,
		BasicRendererComponent
	],
	imports: [
		CommonModule, WidgetModule, FormsModule
	],
	exports: [
		ResourceViewComponent
	]
})
export class ResourceViewModule { }
