import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from 'src/app/modal-dialogs/Modals';
import { Dataset, DatasetService } from 'src/app/models/Datasets';
import { AnnotatedValue, IRI } from 'src/app/models/Resources';
import { PMKIContext } from 'src/app/utils/PMKIContext';

@Component({
	selector: 'app-dataset-view',
	templateUrl: './dataset-view.component.html',
	styleUrls: ['./dataset-view.component.css']
})
export class DatasetViewComponent implements OnInit {

	dataset: Dataset;

	private resource: AnnotatedValue<IRI> = null;

	constructor(private basicModals: BasicModalsServices, private route: ActivatedRoute, private router: Router) { }

	ngOnInit() {
		let datasetId = this.route.snapshot.paramMap.get('id');

		this.dataset = PMKIContext.getDataset();
		/**
		 * the idea is that in production, the user could access the page of the dataset with the direct link,
		 * so the dataset in the ctx could be null and it needs to be retrieved from the server
		 */
		if (this.dataset == null) {
			//retrieve dataset description with a service invocation
			DatasetService.getDataset(datasetId).subscribe(d => {
				this.dataset = d;
				if (d == null) {
					this.basicModals.alert("Dataset not found", "The requested dateset (id: '" + datasetId + 
						"') does not exist. You will be redirect to the home page.", ModalType.warning).then(
						confirm => { this.router.navigate(["/"]) },
						cancel => { this.router.navigate(["/"]) }
					);
					//alert?
					// this.router.navigate(["/datasets"], { queryParams: { search: datasetId } });
				}
			});
		}
	}

	onNodeSelected(node: AnnotatedValue<IRI>) {
        this.resource = node;
	}
	
}
