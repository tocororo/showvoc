import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { AnnotatedValue, Value, ResAttribute, RDFResourceRolesEnum, Literal, Resource, ResourceUtils } from 'src/app/models/Resources';
import { UIUtils } from 'src/app/utils/UIUtils';

@Component({
	selector: 'rdf-resource',
	templateUrl: './rdf-resource.component.html',
	styleUrls: ['./rdf-resource.component.css'],
	host: { class: "d-flex align-items-center" }
})
export class RdfResourceComponent implements OnInit {

	@Input() resource: AnnotatedValue<Value>;
	@Input() rendering: boolean = true; //if true the resource should be rendered with the show, with the qname otherwise

	resourceWithLang: boolean = false; //true if resource is a literal (or a skosxl:Label) with language
	langFlagAvailable: boolean = false; //true if the language has a flag icon available (used only if resourceWithLang is true)
	lang: string; //language of the resource (used only if resourceWithLang is true)

	imgSrc: string; //src of the image icon

	constructor() { }

	ngOnInit() {
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes['resource'] && changes['resource'].currentValue) {
			this.initImgSrc();
			this.resourceWithLang = this.isResourceWithLang();
			if (this.resourceWithLang) {
				this.lang = this.getLang();
				this.langFlagAvailable = this.isLangFlagAvailable();
			}
		}
	}

	/**
	 * Initializes the source of the icon image
	 */
	private initImgSrc() {
		this.imgSrc = UIUtils.getImageSrc(this.resource);
	}

	/**
	 * returns true if the current resource has language: it could be a literal with language or
	 * a skosxl:Label with language
	 */
	private isResourceWithLang(): boolean {
		var lang: string;
		if (this.resource.getValue() instanceof Literal) {
			lang = (<Literal>this.resource.getValue()).getLanguage();
		}
		return (lang != undefined && lang != null && lang != "");
	}

	/**
	 * Returns the language tag of the current resource in order to show it as title of resource icon (flag)
	 * Note: this should be used in template only when isResourceWithLang returns true
	 */
	private getLang(): string {
		let lang: string = null;
		if (this.resource.getValue() instanceof Resource) {
			let role: RDFResourceRolesEnum = this.resource.getAttribute(ResAttribute.ROLE);
			if (role == RDFResourceRolesEnum.xLabel) {
				lang = this.resource.getAttribute(ResAttribute.LANG);
			}
		} else if (this.resource.getValue() instanceof Literal) {
			lang = (<Literal>this.resource.getValue()).getLanguage();
		}
		return lang;
	}

	/**
	 * Returns true if the current resource langTag has a flag image available and the show_flag is true.
	 * This method should be called only for resource with lang, so it should depend from isResourceWithLang
	 */
	private isLangFlagAvailable(): boolean {
		return !this.imgSrc.includes("unknown");
	}

	getRendering(): string {
		return ResourceUtils.getRendering(this.resource, this.rendering);
	}

	private getUnknownFlagImgSrc(): string {
		//pass an invalid langTag so the method returns the empty flag image source
		return UIUtils.getFlagImgSrc("unknown");
	}

	/**
	 * Tells if the described resource is explicit.
	 * Useful for flag icons since they have not the "transparent" version (as for the concept/class/property... icons)
	 */
	private isExplicit(): boolean {
		return this.resource.getAttribute(ResAttribute.EXPLICIT) || this.resource.getAttribute(ResAttribute.EXPLICIT) == undefined;
	}

}