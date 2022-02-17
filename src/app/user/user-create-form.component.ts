import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AuthServiceMode } from '../models/Properties';
import { UserForm } from '../models/User';
import { SVContext } from '../utils/SVContext';

@Component({
    selector: 'user-create-form',
    templateUrl: './user-create-form.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UserCreateFormComponent), multi: true,
    }]
})
export class UserCreateFormComponent implements ControlValueAccessor {

    @Input() constraint: UserConstraint;

    authServMode: AuthServiceMode; //in case of SAML hides pwd fields

    userForm: UserForm = new UserForm();

    constructor() { }

    ngOnInit() {
        this.authServMode = SVContext.getSystemSettings().authService;
        if (this.authServMode == AuthServiceMode.SAML) {
            if (this.constraint) {
                this.userForm.email = this.constraint.email;
                this.userForm.givenName = this.constraint.givenName;
                this.userForm.familyName = this.constraint.familyName;
            }
            //set a fake password since in SAML pwd is not necessary, but are still needed for creating user
            let fakePwd: string = Math.random()+"";
            this.userForm.password = fakePwd;
            this.userForm.confirmedPassword = fakePwd;
        }
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.onModelChanged();
        });
    }

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

export interface UserConstraint {
    email: string;
    givenName: string;
    familyName: string;
}