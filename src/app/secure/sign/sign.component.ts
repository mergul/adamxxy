import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
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
  viewMode = new BehaviorSubject<boolean>(true);
  mismatchPasswordsError = new BehaviorSubject<boolean>(false);
  regStatusValidity = new BehaviorSubject<boolean>(false);
  logStatusValidity = new BehaviorSubject<boolean>(false);
  private readonly destroy = new Subject<void>();
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  errorMessage = '';
  error: { name: string; message: string } = { name: '', message: '' };
  email = '';
  emailCont!: AbstractControl;
  passCont!: AbstractControl;
  resetPassword = false;
  _isLoading!: Observable<boolean>;
  EMAIL_REGEXP =
    /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
  // isValidMailFormat = of(false);
  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private ui: LoaderService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {
    this.viewMode.pipe(takeUntil(this.destroy)).subscribe((viewMode) => {
      if (viewMode) {
        this.createRegisForm();
        this.emailCont = this.registerForm.controls['email'];
        this.passCont = this.registerForm.controls['password'];
        this.registerForm.statusChanges
          .pipe(takeUntil(this.destroy))
          .subscribe((status) =>
            this.regStatusValidity.next(status === 'VALID')
          );
      } else {
        this.createLogForm();
        this.emailCont = this.loginForm.controls['email'];
        this.passCont = this.loginForm.controls['password'];
        this.loginForm.statusChanges
          .pipe(takeUntil(this.destroy))
          .subscribe((status) =>
            this.logStatusValidity.next(status === 'VALID')
          );
      }
      setTimeout(() => {
        this.cd.detectChanges();
      }, 0);
    });
  }
  checkError(control: AbstractControl) {
    return !!control.value&&(control.invalid && (control.dirty || control.touched)); 
  }
  stringifyError(error: ValidationErrors) {
    return Object.keys(error)
      .filter((key) => key !== 'required')
      .map((key) => 'Invalid ' + key + ' error!!!')
      .join(' ');
  }
  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {
    // this.isValidMailFormat = of(
    //   this.emailCont.value.toString().length === 0 &&
    //     !this.EMAIL_REGEXP.test(this.emailCont.value)
    // );
  }
  createRegisForm() {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]],
      lastname: ['', [Validators.required, Validators.minLength(1)]],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(25),
        ],
      ],
      password2: [
        '',
        [
          Validators.required,
          matchingPasswords('password', this.mismatchPasswordsError),
        ],
      ],
    });
  }
  createLogForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
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
        this.cd.detectChanges();
      });
  }
  clearErrorMessage() {
    this.errorMessage = '';
    this.error = { name: '', message: '' };
  }
  onClick(viewMode: boolean) {
    this.viewMode.next(viewMode);
  }
  public async onSubmit(value: any) {
    console.log(JSON.stringify(value));
    if (this.viewMode.value) {
      console.log('sign up');
      await this.authService.signUp(value.email, value.password);
    } else {
      console.log('sign in');
      await this.authService.signIn(value.email, value.password)
      .catch((_error: { name: string; message: string }) => {
        this.error = _error;
        this.cd.detectChanges();
      });
    }
  }
}

export function matchingPasswords(
  passwordKey: string,
  mismatchPasswordsError: BehaviorSubject<boolean>
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control || !control.parent) {
      return mismatchPasswordsError.asObservable();
    }
    const password = (control.parent?.controls as any)[passwordKey];

    if (password.value !== control.value) {
      mismatchPasswordsError.next(true);
      return { mismatchPasswords: true };
    } else mismatchPasswordsError.next(false);
    return null;
  };
}
