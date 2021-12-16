import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoaderService } from '@core/loader.service';
import { Observable, of, Subject } from 'rxjs';
import { AuthService } from '@secure/auth.service';

@Component({
  selector: 'app-sign',
  templateUrl: './sign.component.html',
  styleUrls: ['./sign.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignComponent implements OnInit, OnDestroy {
  viewMode = 'signup';
  private readonly destroy = new Subject<void>();
  loginForm!: FormGroup;
  errorMessage = '';
  error: { name: string, message: string } = { name: '', message: '' };
  email = '';
  resetPassword = false;
  _isLoading!: Observable<boolean>;
  listenerFn!: () => void;
  EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
  isValidMailFormat = of(false);
  constructor(private authService: AuthService, private fb: FormBuilder, private ui: LoaderService
    , private router: Router, private changeDetector: ChangeDetectorRef) {
    this.createForm();
  }
  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {
    this.isValidMailFormat = of(
      this.loginForm.controls['email'].value.toString().length === 0 &&
        !this.EMAIL_REGEXP.test(this.loginForm.controls['email'].value)
    );
  }
  createForm() {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
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
  onClick(viewMode: 'signup' | 'signin') {
    this.viewMode = viewMode;
    this.changeDetector.detectChanges();
  }
}
