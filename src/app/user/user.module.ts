import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ModalsModule } from '../modal-dialogs/modals.module';
import { WidgetModule } from '../widget/widget.module';
import { LoginComponent } from './login.component';
import { RegistrationComponent } from './registration.component';

@NgModule({
	declarations: [
        LoginComponent,
        RegistrationComponent
	],
	imports: [
		FormsModule,
        ModalsModule,
        RouterModule,
		WidgetModule
	],
	providers: []
})
export class UserModule { }
