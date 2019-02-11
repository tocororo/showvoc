import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AnnotatedValue, Value, ResAttribute, RDFResourceRolesEnum, IRI } from 'src/app/models/Resources';
import { SKOS } from 'src/app/models/Vocabulary';

@Component({
	selector: 'app-dataset-view',
	templateUrl: './dataset-view.component.html',
	styleUrls: ['./dataset-view.component.css']
})
export class DatasetViewComponent implements OnInit {

	datasetId: string;

	resource: AnnotatedValue<Value>;

	constructor(private route: ActivatedRoute) { }

	ngOnInit() {
		this.datasetId = this.route.snapshot.paramMap.get('id');

		let value: IRI = SKOS.concept;
		this.resource = new AnnotatedValue(value);
		this.resource.setAttribute(ResAttribute.ROLE, RDFResourceRolesEnum.cls);
		this.resource.setAttribute(ResAttribute.SHOW, value.getIRI().replace(value.getNamespace(), SKOS.prefix + ":"));
	}

}
