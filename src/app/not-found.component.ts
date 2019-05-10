import { Component } from '@angular/core';

@Component({
	selector: 'not-found-component',
	template: `
	<div class="container my-3"><h1>Page not found</h1></div>
	`,
	host: { class: "pageComponent" }
})
export class NotFoundComponent {


}
