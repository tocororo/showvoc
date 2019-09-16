import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ModalsModule } from '../modal-dialogs/modals.module';
import { WidgetModule } from '../widget/widget.module';
import { LoginComponent } from './login.component';
import { RegistrationComponent } from './registration.component';
import { ResetPasswordComponent } from './reset-password.component';

@NgModule({
	declarations: [
        LoginComponent,
		RegistrationComponent,
		ResetPasswordComponent
	],
	imports: [
		CommonModule,
		FormsModule,
        ModalsModule,
        RouterModule,
		WidgetModule
	],
	providers: []
})
export class UserModule { }
