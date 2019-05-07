import { Component, OnInit } from '@angular/core';
import { AuthServices } from '../services/auth.service';
import { ExportServices } from '../services/export.service';
import { ResourcesServices } from '../services/resources.service';
import { UserServices } from '../services/user.service';

@Component({
	selector: 'home-component',
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
		// 		// this.exportService.export().subscribe();
		// 	}
		// )

		// this.exportService.export().subscribe();
	}

}
