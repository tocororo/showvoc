import { Component, Input, SimpleChanges } from '@angular/core';
import { Language, Languages } from 'src/app/models/LanguagesCountries';
import { AnnotatedValue, IRI, Literal, ResAttribute, Resource, ResourceNature, Value } from 'src/app/models/Resources';
import { XmlSchema } from 'src/app/models/Vocabulary';
import { ResourceUtils } from 'src/app/utils/ResourceUtils';
import { SVProperties } from 'src/app/utils/SVProperties';
import { UIUtils } from 'src/app/utils/UIUtils';

@Component({
    selector: 'rdf-resource',
    templateUrl: './rdf-resource.component.html'
})
export class RdfResourceComponent {

    @Input() resource: AnnotatedValue<Value>;
    @Input() rendering: boolean = true; //if true the resource should be rendered with the show, with the qname otherwise

    renderingLabel: string;
    renderingClass: string = "";

    language: Language; //language of the resource

    datatype: IRI; //datatype of the resource

    literalWithLink: boolean = false; //true if the resource is a literal which contains url
    splittedLiteral: string[]; //when literalWithLink is true, even elements are plain text, odd elements are url

    imgSrc: string; //src of the image icon
    natureTooltip: string;

    constructor(private svProp: SVProperties) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['resource'] && changes['resource'].currentValue) {
            this.init();
        } if (changes['rendering']) {
            this.initRenderingLabel();
        }
    }

    init() {
        this.initRenderingLabel();
        this.initImgSrc();
        this.initLang();
        this.initDatatype();
        this.initLiteralWithLink();
        this.initRenderingClass();
        this.initNatureTooltip();
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

    private initDatatype(): void {
        //reset
        this.datatype = null;
        //init
        let value = this.resource.getValue();

        if (value instanceof Literal) { // if it is a literal
            this.datatype = value.getDatatype();
        } else { // otherwise, it is a resource, possibly with an additional property dataType (as it could be from a custom form preview)
            this.datatype = new IRI(this.resource.getAttribute(ResAttribute.DATA_TYPE));
        }
    }

    private initNatureTooltip() {
        let value = this.resource.getValue();
        this.natureTooltip = null;
        if (value instanceof Resource) {
            let natureList: ResourceNature[] = this.resource.getNature();
            if (natureList.length > 0) {
                let natureListSerlalized: string[] = [];
                natureList.forEach(n => {
                    let graphsToNT: string[] = [];
                    n.graphs.forEach(g => {
                        graphsToNT.push(g.toNT());
                    });
                    natureListSerlalized.push(ResourceUtils.getResourceRoleLabel(n.role) + ", defined in: " + graphsToNT.join(", "));
                });
                this.natureTooltip = natureListSerlalized.join("\n\n");
            } else { //nature empty => could be the case of a reified resource => check language or datatype (representing the one of the preview value)
                if (this.language != null) {
                    this.natureTooltip = this.language.tag;
                } else if (this.datatype != null) {
                    this.natureTooltip = this.datatype.toNT();
                }
            }
        } else if (value instanceof Literal) {
            if (this.language != null) {
                this.natureTooltip = this.language.tag;
            } else if (this.datatype != null) {
                this.natureTooltip = this.datatype.toNT();
            }
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
            let regexToken = /(((ftp|https?):\/\/)[-\w@:%_+.~#?,&//=]+)|((mailto:)?[_.\w-]+@([\w][\w-]+\.)+[a-zA-Z]{2,3})/g;
            let urlArray: string[] = [];

            let matchArray: RegExpExecArray;
            while ((matchArray = regexToken.exec(label)) !== null) {
                urlArray.push(matchArray[0]);
            }

            if (urlArray.length > 0) {
                this.literalWithLink = true;
                this.splittedLiteral = [];
                for (let i = 0; i < urlArray.length; i++) {
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
    private initLang(): void {
        //reset
        this.language = null;
        //init
        let value = this.resource.getValue();
        let lang: string;
        if (value.isResource()) { //even if it is a resource, get the lang (it could be a custom form preview)
            lang = this.resource.getAttribute(ResAttribute.LANG);
        } else if (value instanceof Literal) {
            lang = value.getLanguage();
            if (value.getDatatype().equals(XmlSchema.language)) {
                lang = value.getLanguage();
            }
        }
        if (lang != null) {
            this.language = Languages.getLanguageFromTag(lang);
        }
    }

    /**
     * Tells if the described resource is explicit.
     * Useful for flag icons since they have not the "transparent" version (as for the concept/class/property... icons)
     */
    isExplicit(): boolean {
        return this.resource.getAttribute(ResAttribute.EXPLICIT) || this.resource.getAttribute(ResAttribute.EXPLICIT) == undefined;
    }

}