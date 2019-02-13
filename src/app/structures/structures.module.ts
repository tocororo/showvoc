import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgbTabsetModule } from '@ng-bootstrap/ng-bootstrap';
import { WidgetModule } from '../widget/widget.module';
import { LexicalEntryListComponent } from './list/lexical-entry/lexical-entry-list.component';
import { LexiconListComponent } from './list/lexicon/lexicon-list.component';
import { ListNodeComponent } from './list/list-node.component';
import { SchemeListComponent } from './list/scheme/scheme-list.component';
import { StructureTabsetComponent } from './structure-tabset/structure-tabset.component';
import { CollectionTreeNodeComponent } from './tree/collection/collection-tree-node.component';
import { CollectionTreeComponent } from './tree/collection/collection-tree.component';
import { ConceptTreeNodeComponent } from './tree/concept/concept-tree-node.component';
import { ConceptTreeComponent } from './tree/concept/concept-tree.component';
import { PropertyTreeNodeComponent } from './tree/property/property-tree-node.component';
import { PropertyTreeComponent } from './tree/property/property-tree.component';

@NgModule({
	declarations: [
		StructureTabsetComponent,
		SchemeListComponent, LexiconListComponent, LexicalEntryListComponent, ListNodeComponent,
		CollectionTreeComponent, CollectionTreeNodeComponent,
		ConceptTreeComponent, ConceptTreeNodeComponent,
		PropertyTreeComponent, PropertyTreeNodeComponent,
	],
	imports: [
		CommonModule, WidgetModule, NgbTabsetModule
	],
	exports: [
		StructureTabsetComponent,
		// CollectionTreeComponent, ConceptTreeComponent, PropertyTreeComponent,
		// SchemeListComponent, LexiconListComponent, LexicalEntryListComponent
		
	]
})
export class StructuresModule { }
