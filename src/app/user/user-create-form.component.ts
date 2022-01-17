import { Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { UserForm } from '../models/User';

@Component({
    selector: 'user-create-form',
    templateUrl: './user-create-form.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UserCreateFormComponent), multi: true,
    }]
})
export class UserCreateFormComponent implements ControlValueAccessor {

    userForm: UserForm = new UserForm();

    constructor() { }

    ngOnInit() { }

    isConfirmPwdOk() {
        return this.userForm.password == this.userForm.confirmedPassword;
    }

    onModelChanged() {
        this.propagateChange(this.userForm);
    }

    //---- method of ControlValueAccessor and Validator interfaces ----
    /**
     * Write a new value to the element.
     */
    writeValue(obj: UserForm) {
        if (obj) {
            this.userForm = obj;
        }
    }
    /**
     * Set the function to be called when the control receives a change event.
     */
    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }
    /**
     * Set the function to be called when the control receives a touch event. Not used.
     */
    registerOnTouched(fn: any): void { }

    // the method set in registerOnChange, it is just a placeholder for a method that takes one parameter, 
    // we use it to emit changes back to the parent
    private propagateChange = (_: any) => { };

    //--------------------------------------------------
}
