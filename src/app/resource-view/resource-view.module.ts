import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ResourceViewComponent } from './resource-view.component';
import { WidgetModule } from '../widget/widget.module';
import { FormsModule } from '@angular/forms';

@NgModule({
	declarations: [ResourceViewComponent],
	imports: [
		CommonModule, WidgetModule, FormsModule
	],
	exports: [
		ResourceViewComponent
	]
})
export class ResourceViewModule { }
