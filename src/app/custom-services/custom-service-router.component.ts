import { Component } from "@angular/core";

@Component({
    selector: "custom-services-router",
    templateUrl: "./custom-service-router.component.html",
    host: { class: "pageComponent" }
})
export class CustomServiceRouterComponent {

    currentRoute: "customService" | "reporter" = "customService";


    constructor() { }

}