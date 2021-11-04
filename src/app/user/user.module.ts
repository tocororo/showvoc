import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ModalsModule } from '../modal-dialogs/modals.module';
import { WidgetModule } from '../widget/widget.module';
import { ChangePasswordModal } from './change-password-modal';
import { LoginComponent } from './login.component';
import { RegistrationComponent } from './registration.component';
import { ResetPasswordComponent } from './reset-password.component';
import { UserProfileComponent } from './user-profile.component';

@NgModule({
	declarations: [
		ChangePasswordModal,
        LoginComponent,
		RegistrationComponent,
		ResetPasswordComponent,
		UserProfileComponent
	],
	imports: [
		CommonModule,
		DragDropModule,
		FormsModule,
        ModalsModule,
		RouterModule,
		TranslateModule,
		WidgetModule
	],
	providers: [],
	entryComponents: [
		ChangePasswordModal
	]
})
export class UserModule { }
