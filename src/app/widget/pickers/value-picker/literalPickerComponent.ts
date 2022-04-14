import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { CreationModalServices } from 'src/app/modal-dialogs/creation-modals/creationModalServices';
import { AnnotatedValue, IRI, Literal } from 'src/app/models/Resources';
import { NTriplesUtil } from '../../../utils/ResourceUtils';

@Component({
    selector: 'literal-picker',
    templateUrl: './literalPickerComponent.html',
})
export class LiteralPickerComponent {

    @Input() literal: AnnotatedValue<Literal>;
    @Input() plain: boolean = true; //if true, the component allows to create/pick plain literal
    @Input() typed: boolean = true; //if true, the component allows to create/pick typed literal
    @Input() datatypes: IRI[]; //list of allowed datatypes
    @Input() disabled: boolean = false;
    @Output() literalChanged = new EventEmitter<AnnotatedValue<Literal>>();

    literalNT: string;

    constructor(private creationModals: CreationModalServices) { }

    ngOnInit() {
        this.init();
    }

    ngOnChanges(changes: SimpleChanges) {
        this.init();
    }

    private init() {
        if (this.literal) {
            if (typeof this.literal == 'string') {
                this.literal = new AnnotatedValue(NTriplesUtil.parseLiteral(this.literal));
            }
            this.literalNT = this.literal.getValue().toNT();
        }
    }

    pickLiteral() {
        this.creationModals.newTypedLiteral({ key: "DATA.ACTIONS.CREATE_LITERAL" }, null, null, this.datatypes).then(
            (value: AnnotatedValue<Literal>) => {
                this.literal = value;
                this.literalNT = this.literal.getValue().toNT();
                this.literalChanged.emit(this.literal);
            },
            () => { }
        );
    }

}