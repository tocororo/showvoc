import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SVContext } from '../utils/SVContext';

@Component({
    selector: 'home-component',
    templateUrl: './home.component.html',
    host: { class: "pageComponent" },
    styles: [`
        .creditTitle { font-size: .875rem; font-weight: 700!important; }
        .organizzationName { color: #002244; font-size: .875rem; font-weight:bold; } 
        .organizzationSubtitle { color: #aa4400; font-size: .75rem; font-weight: bold; font-style: italic; }
        .organizzationLogo { max-width: 60px; max-height: 36px; }
    `],
})
export class HomeComponent implements OnInit {

    instanceName: string;

    showContribution: boolean;

    translationParam: { instanceName: string };

    safeCustomContentFromPref: SafeHtml;
    safeCustomContentFromFile: SafeHtml;

    constructor(private sanitizer: DomSanitizer) { }

    ngOnInit() {
        this.instanceName = window['showvoc_instance_name'];
        this.translationParam = { instanceName: this.instanceName };
        this.showContribution = !SVContext.getSystemSettings().disableContributions;

        let homeContent = SVContext.getSystemSettings().homeContent;
        if (homeContent != null) {
            this.safeCustomContentFromPref = this.sanitizer.bypassSecurityTrustHtml(homeContent);
        }

        fetch("assets/ext/home/custom_content.html").then(
            res => res.text()
        ).then(
            htmlContent => {
                this.safeCustomContentFromFile = this.sanitizer.bypassSecurityTrustHtml(htmlContent);
            }
        );
    }

}
