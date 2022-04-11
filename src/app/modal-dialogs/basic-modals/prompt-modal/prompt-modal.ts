import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'prompt-modal',
    templateUrl: './prompt-modal.html',
    styleUrls: ['../../modals.css']
})
export class PromptModal implements OnInit {

    @Input() title: string;
    @Input() label: { value: string, tooltip?: string };
    @Input() message: string;
    @Input() value: string;
    @Input() hideClose: boolean = false;
    @Input() inputOptional: boolean = false;

    constructor(public activeModal: NgbActiveModal) { }

    ngOnInit() {
    }

    isInputValid(): boolean {
        return (this.value != undefined && this.value.trim() != "");
    }

    ok() {
        if (this.inputOptional || this.isInputValid()) {
            this.activeModal.close(this.value);
        }
    }

    close() {
        this.activeModal.dismiss();
    }

}
