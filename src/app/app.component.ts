import { Component } from '@angular/core';

@Component({
	selector: 'app-root',
	templateUrl: 'app.component.html',
	host: { class: 'd-flex flex-column' }
})
export class AppComponent {

	// appVersion = require('../../package.json').version;

	navbarCollapsed: boolean = true;

}
