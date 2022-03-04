import { Component, OnInit } from "@angular/core";
import { DatasetMetadata, ProjectDatasetMapping } from "src/app/models/Metadata";
import { Settings } from "src/app/models/Plugins";
import { Project } from "src/app/models/Project";
import { AnnotatedValue, IRI } from "src/app/models/Resources";
import { MetadataRegistryServices } from "src/app/services/metadata-registry.service";
import { SVContext } from "src/app/utils/SVContext";

@Component({
	selector: 'metadata-component',
	templateUrl: './metadata.component.html',
    host: { class: "pageComponent" },
	styles: [`
	.table > tbody > tr:first-child > td {
		border-top: none;
	}
	`]
})
export class MetadataComponent implements OnInit {

	project: Project;
	facets: {[key:string]: any};
	dataset: AnnotatedValue<IRI>;
	datasetMetadata: DatasetMetadata;

    constructor(private metadataRegistryService: MetadataRegistryServices) { }

	ngOnInit() {
		this.project = SVContext.getWorkingProject();
		this.metadataRegistryService.findDatasetForProjects([this.project]).subscribe(
			(datasetsMapping: ProjectDatasetMapping) => {
				console.log(datasetsMapping);
				this.dataset = datasetsMapping[this.project.getName()];
				this.metadataRegistryService.getDatasetMetadata(this.dataset.getValue()).subscribe(
					(metadata: DatasetMetadata) => {
						this.datasetMetadata = metadata;
					}
				);
			}
		);

		let pFacets: Settings = this.project.getFacets();
		let facetsMap = pFacets.getPropertiesAsMap();
		this.facets = this.flattenizeFacetsMap(facetsMap);
	}

	/**
	 * Convert a facets map (which can have nested map as value) to a flat map.
	 * E.g. 
	 * { 
	 * 		key: value1,
	 * 		key2: {
	 * 			key21: value21,
	 * 			key22: value22
	 * 		}
	 * }
	 * 
	 * become
	 * 
	 * { 
	 * 		key: value1,
	 *		key21: value21,
	 *		key22: value22
	 * }
	 * @param facets 
	 * @returns 
	 */
	private flattenizeFacetsMap(facets: {[key:string]: any}): {[key:string]: string} {
		let fMap: {[key:string]: string} = {};
		for (let fKey in facets) {
			if (facets[fKey] instanceof Object) { //value is a nested map
				let nestedMap = this.flattenizeFacetsMap(facets[fKey]);
				for (let nestedKey in nestedMap) {
					fMap[nestedKey] = nestedMap[nestedKey];
				}
			} else { //plain string value
				fMap[fKey] = facets[fKey]
			}
		}
		return fMap;
	}

}