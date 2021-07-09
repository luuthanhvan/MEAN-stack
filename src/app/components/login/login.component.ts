import { Component, OnInit } from '@angular/core';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material';
import { snackbarConfig } from '../../helpers/snackbar_config';
import { LoadingService } from '../../services/loading/loading.service';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
	signinForm : FormGroup;
	submitted : boolean = false;
	isLoggingFailed : boolean = false;

	// some variables for the the snackbar (a kind of toast message)
    errorMessage: string;
    label: string = '';
    setAutoHide: boolean = true;
    duration: number = 1500;
    horizontalPosition: MatSnackBarHorizontalPosition = 'center';
    verticalPosition: MatSnackBarVerticalPosition = 'bottom';


	constructor(private formBuilder : FormBuilder,
				private authService : AuthService,
				private router : Router,
				public snackBar: MatSnackBar,
                private loadingService: LoadingService,) {
	}

	ngOnInit() {
		this.signinForm = this.formBuilder.group({
			username: new FormControl('', [Validators.required]),
			password: new FormControl('', [Validators.required, Validators.minLength(6)])
		});

		const isLoggedIn = this.authService.isLoggedIn();

		if(isLoggedIn){
			this.router.navigateByUrl('/dashboard');
		}
	}

	get signinFormControl(){
		return this.signinForm.controls;
	}

	onSubmit(form: FormGroup){
		this.submitted = true;
		let userInfo = form.value;

		this.authService
			.signin(userInfo.username, userInfo.password)
			.subscribe(
				(res) => {
					this.authService.setToken(res['data'].token);
					this.router.navigateByUrl('/dashboard');
				}, 
				(err) => {
					this.errorMessage = err.error['message'].message;
					// show error message
					let config = snackbarConfig(this.verticalPosition, this.horizontalPosition, this.setAutoHide, this.duration, ['failed']);
					this.snackBar.open(this.errorMessage, this.label, config);
				}
			);
	}
}
