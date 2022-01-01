import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoaderService } from '@core/loader.service';
import { BehaviorSubject, Observable, of, Subject, takeUntil } from 'rxjs';
import { AuthService } from '@secure/auth.service';

@Component({
  selector: 'app-sign',
  templateUrl: './sign.component.html',
  styleUrls: ['./sign.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignComponent implements OnInit, OnDestroy {
  viewMode = new BehaviorSubject<boolean>(false);
  mismatchPasswordsError = new BehaviorSubject<boolean>(false);
  private readonly destroy = new Subject<void>();
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  errorMessage = '';
  error: { name: string; message: string } = { name: '', message: '' };
  email = '';
  emailCont!: AbstractControl;
  resetPassword = false;
  _isLoading!: Observable<boolean>;
  EMAIL_REGEXP =
    /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
  isValidMailFormat = of(false);
  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private ui: LoaderService,
    private router: Router
  ) {
    this.viewMode.pipe(takeUntil(this.destroy)).subscribe((viewMode) => {
    if(!viewMode){ 
      this.createRegisForm();
      this.emailCont = this.registerForm.controls['email'];
    } else {
      this.createLogForm();
      this.emailCont = this.loginForm.controls['email'];
    }
    });
  }
  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {
    this.isValidMailFormat = of(
      this.emailCont.value.toString().length === 0 &&
        !this.EMAIL_REGEXP.test(this.emailCont.value)
    );
  }
  createRegisForm() {
    this.registerForm = this.fb.group(
      {
        name: ['', Validators.required],
        lastname: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
        password2: ['', Validators.required],
      },
      {
        validator: matchingPasswords(
          'password',
          'password2',
          this.mismatchPasswordsError
        ),
      }
    );
  }
  createLogForm() {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
  }
  async triedGoogleLogin() {
    this.ui.show();
    await this.authService.loginToGoogle();
    setTimeout(() => {
      this.router.navigate(['secure/user']);
    }, 0);
  }
  sendResetEmail() {
    this.clearErrorMessage();

    this.authService
      .resetPassword(this.loginForm.controls['email'].value)
      .then(() => {
        this.resetPassword = true;
        alert('A password reset link has been sent to your email address!');
      })
      .catch((_error: { name: string; message: string }) => {
        this.error = _error;
      });
  }
  clearErrorMessage() {
    this.errorMessage = '';
    this.error = { name: '', message: '' };
  }
  onClick(viewMode: boolean) {
    this.viewMode.next(viewMode);
  }
  public onSubmit(formValue: any) {
  }
}

export function matchingPasswords(
  passwordKey: string,
  confirmPasswordKey: string,
  mismatchPasswordsError: any
) {
  return (group: FormGroup) => {
    const password = group.controls[passwordKey];
    const confirmPassword = group.controls[confirmPasswordKey];

    if (password.value !== confirmPassword.value) {
      mismatchPasswordsError.next(true);
      return {
        mismatchedPasswords: true,
      };
    } else mismatchPasswordsError.next(false);
    return {
      mismatchedPasswords: false,
    };
  };
}
