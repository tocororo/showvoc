import { Component, OnInit } from '@angular/core';
import { AuthServices } from '../services/auth.service';
import { ExportServices } from '../services/export.service';
import { ResourcesServices } from '../services/resources.service';
import { UserServices } from '../services/user.service';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	host: { class: "pageComponent" }
})
export class HomeComponent implements OnInit {

	constructor(private authService: AuthServices, private userService: UserServices, private exportService: ExportServices, private resourceService: ResourcesServices) { }

	ngOnInit() {
		// this.authService.login("admin@vocbench.com", "admin", false).subscribe(
		// 	user => {
		// 		console.log("login", user);
		// 		this.userService.getUser().subscribe(
		// 			user => {
		// 				console.log("getUser", user);
		// 			}
		// 		)

		// 		PMKIContext.setDataset({id: "skosxl", title: "skosxl", model: Model.SKOS, lexicalizationModel: "skosxl", url: "url", description: ""})
		// 		this.exportService.export().subscribe();
		// 	}
		// )

		// PMKIContext.setDataset({id: "skosxl", title: "skosxl", model: Model.SKOS, lexicalizationModel: "skosxl", url: "url", description: ""})
		// this.exportService.export().subscribe();

		// this.resourceService.getResourceDescription(SKOS.collection).subscribe(
		// 	resp => {},
		// 	err => {}
		// );
	}

}
