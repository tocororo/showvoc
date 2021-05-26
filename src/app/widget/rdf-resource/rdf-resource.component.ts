import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { AnnotatedValue, Literal, RDFResourceRolesEnum, ResAttribute, Resource, Value, ResourceNature } from 'src/app/models/Resources';
import { ResourceUtils } from 'src/app/utils/ResourceUtils';
import { UIUtils } from 'src/app/utils/UIUtils';
import { XmlSchema } from 'src/app/models/Vocabulary';
import { SVProperties } from 'src/app/utils/SVProperties';

@Component({
    selector: 'rdf-resource',
    templateUrl: './rdf-resource.component.html'
})
export class RdfResourceComponent {

    @Input() resource: AnnotatedValue<Value>;
    @Input() rendering: boolean = true; //if true the resource should be rendered with the show, with the qname otherwise

    renderingLabel: string;
    renderingClass: string = "";

    langFlagAvailable: boolean = false; //true if the language has a flag icon available (used only if resourceWithLang is true)
    lang: string; //language of the resource (used only if resourceWithLang is true)

    literalWithLink: boolean = false; //true if the resource is a literal which contains url
    splittedLiteral: string[]; //when literalWithLink is true, even elements are plain text, odd elements are url

    imgSrc: string; //src of the image icon
    natureTooltip: string;

    constructor(private svProp: SVProperties) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['resource'] && changes['resource'].currentValue) {
            this.initRenderingLabel();
            this.initImgSrc();

            this.lang = this.initLang();
            if (this.lang) {
                this.langFlagAvailable = this.isLangFlagAvailable();
            }

            this.initLiteralWithLink();
            this.initRenderingClass();
            this.initNatureTooltip();
        } if (changes['rendering']) {
            this.initRenderingLabel();
        }
    }

    private initRenderingLabel() {
        this.renderingLabel = ResourceUtils.getRendering(this.resource, this.rendering);
    }

	/**
	 * Initializes the class of the resource text: green if the resource is in the staging-add-graph, red if it's in the staging-remove-graph
	 */
    private initRenderingClass() {
        this.renderingClass = "";
        let value = this.resource.getValue();
        if (value instanceof Resource) {
            if (ResourceUtils.isResourceInStagingAdd(this.resource)) {
                this.renderingClass += " proposedAddRes";
            } else if (ResourceUtils.isResourceInStagingRemove(this.resource)) {
                this.renderingClass += " proposedRemoveRes";
            }
        }

        if (ResourceUtils.isTripleInStagingAdd(this.resource)) {
            this.renderingClass += " proposedAddTriple";
        } else if (ResourceUtils.isTripleInStagingRemove(this.resource)) {
            this.renderingClass += " proposedRemoveTriple";
        }
    }

    private initNatureTooltip() {
        this.natureTooltip = null;
        let value = this.resource.getValue();
        if (value instanceof Resource) {
            let natureListSerlalized: string[] = [];
            let natureList: ResourceNature[] = this.resource.getNature();
            natureList.forEach(n => {
                let graphsToNT: string[] = [];
                n.graphs.forEach(g => {
                    graphsToNT.push(g.toNT());
                });
                natureListSerlalized.push(ResourceUtils.getResourceRoleLabel(n.role) + " in: " + graphsToNT.join(", "));
            });
            this.natureTooltip = natureListSerlalized.join("\n\n");
        }
    }

	/**
	 * If the resource is a literal with a link, splits the literal value so it can be rendered with different elements
	 * like <span> for plain text (even elements of array) or <a> for url (odd elements)
	 */
    private initLiteralWithLink() {
        this.literalWithLink = false;
        let value = this.resource.getValue();
        if (value instanceof Literal) {
            let label = value.getLabel();
            let regexToken = /(((ftp|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=]+)|((mailto:)?[_.\w-]+@([\w][\w\-]+\.)+[a-zA-Z]{2,3})/g;
            let urlArray: string[] = [];

            let matchArray: RegExpExecArray;
            while ((matchArray = regexToken.exec(label)) !== null) {
                urlArray.push(matchArray[0]);
            }

            if (urlArray.length > 0) {
                this.literalWithLink = true;
                this.splittedLiteral = [];
                for (var i = 0; i < urlArray.length; i++) {
                    let idx: number = 0;
                    let urlStartIdx: number = label.indexOf(urlArray[i]);
                    let urlEndIdx: number = label.indexOf(urlArray[i]) + urlArray[i].length;
                    this.splittedLiteral.push(label.substring(idx, urlStartIdx)); //what there is before url
                    this.splittedLiteral.push(label.substring(urlStartIdx, urlEndIdx)); //url
                    idx = urlEndIdx;
                    label = label.substring(idx);
                    //what there is between url and the end of the string
                    if (urlArray[i + 1] == null && idx != label.length) { //if there is no further links but there is text after last url
                        this.splittedLiteral.push(label.substring(idx, label.length));
                    }
                }
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
	 * Returns the language tag of the current resource in order to show it as title of resource icon (flag)
	 * Note: this should be used in template only when isResourceWithLang returns true
	 */
    private initLang(): string {
        let lang: string = null;
        let value = this.resource.getValue();
        if (value instanceof Resource) {
            let role: RDFResourceRolesEnum = this.resource.getAttribute(ResAttribute.ROLE);
            if (role == RDFResourceRolesEnum.xLabel) {
                lang = this.resource.getAttribute(ResAttribute.LANG);
            }
        } else if (value instanceof Literal) {
            lang = value.getLanguage();
            let datatype = value.getDatatype();
            if (datatype != null && datatype.equals(XmlSchema.language)) {
                lang = value.getLabel();
            }
        }
        return lang;
    }

	/**
	 * Returns true if the current resource langTag has a flag image available and the show_flag is true.
	 * This method should be called only for resource with lang, so it should depend from isResourceWithLang
	 */
    private isLangFlagAvailable(): boolean {
        if (this.svProp.getShowFlags()) {
            return !this.imgSrc.includes("unknown");
        } else {
            return false;
        }
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