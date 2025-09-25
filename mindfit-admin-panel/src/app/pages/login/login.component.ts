import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../auth/auth.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  template: `
    <div class="h-[93dvh] bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div class="w-full max-w-md sm:max-w-lg">
        <!-- Logo and Header -->
        <div class="text-center mb-6 sm:mb-8">
          <img src="/logo_mindfit.png" alt="MindFit" class="w-16 h-20 sm:w-20 sm:h-25 mx-auto mb-4 sm:mb-6 drop-shadow-sm">
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2 tracking-tight px-4">Welcome Back</h1>
          <p class="text-gray-600 font-medium text-sm sm:text-base px-4">Sign in to MindFit Admin Dashboard</p>
        </div>

        <!-- Login Card -->
        <mat-card class="border-0 shadow-xl bg-white/80 backdrop-blur-sm mx-2 sm:mx-0">
          <mat-card-content class="p-6 sm:p-8">
            <!-- Error Message -->
            <div *ngIf="errorMessage" 
                 class="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-start">
              <mat-icon class="mr-2 text-red-500 mt-0.5 flex-shrink-0">error_outline</mat-icon>
              <span class="break-words">{{ errorMessage }}</span>
            </div>

            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4 sm:space-y-6">
              <!-- Email Field -->
              <mat-form-field appearance="outline" class="w-full modern-field">
                <mat-label class="font-medium">Email Address</mat-label>
                <input matInput 
                       type="email" 
                       formControlName="email" 
                       autocomplete="email"
                       placeholder="admin@mindfit.com"
                       class="text-base">
                <mat-icon matSuffix class="text-gray-400">alternate_email</mat-icon>
                <mat-error *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
                  <span class="font-medium">Please enter a valid email address</span>
                </mat-error>
              </mat-form-field>

              <!-- Password Field -->
              <mat-form-field appearance="outline" class="w-full modern-field">
                <mat-label class="font-medium">Password</mat-label>
                <input matInput 
                       [type]="hidePassword ? 'password' : 'text'"
                       formControlName="password" 
                       autocomplete="current-password"
                       placeholder="Enter your password"
                       class="text-base">
                <button matSuffix 
                        mat-icon-button 
                        type="button"
                        (click)="hidePassword = !hidePassword"
                        [attr.aria-label]="hidePassword ? 'Show password' : 'Hide password'"
                        class="text-gray-400 hover:text-gray-600">
                  <mat-icon>{{hidePassword ? 'visibility' : 'visibility_off'}}</mat-icon>
                </button>
                <mat-error *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
                  <span class="font-medium">Password is required</span>
                </mat-error>
              </mat-form-field>

              <!-- Submit Button -->
              <button mat-raised-button 
                      color="primary"
                      type="submit"
                      [disabled]="loginForm.invalid || loading"
                      class="w-full h-12 sm:h-14 text-sm sm:text-base font-semibold tracking-wide modern-button">
                <div class="flex items-center justify-center gap-2 sm:gap-3">
                  <mat-progress-spinner *ngIf="loading" 
                                       mode="indeterminate" 
                                       diameter="18"
                                       strokeWidth="3"></mat-progress-spinner>
                  <span class="truncate">{{ loading ? 'Signing you in...' : 'Sign In' }}</span>
                </div>
              </button>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- Footer -->
        <div class="text-center mt-6 sm:mt-8 px-4">
          <p class="text-xs sm:text-sm text-gray-500 font-medium">
            MindFit Admin Portal • Secure Access
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    .modern-field {
      --mdc-outlined-text-field-container-shape: 12px;
      --mdc-outlined-text-field-label-text-font: 500;
    }
    
    .modern-field .mat-mdc-form-field-focus-overlay {
      background-color: rgba(16, 185, 129, 0.04);
    }
    
    .modern-field .mat-mdc-text-field-wrapper:not(.mdc-text-field--disabled) .mdc-notched-outline__leading,
    .modern-field .mat-mdc-text-field-wrapper:not(.mdc-text-field--disabled) .mdc-notched-outline__notch,
    .modern-field .mat-mdc-text-field-wrapper:not(.mdc-text-field--disabled) .mdc-notched-outline__trailing {
      border-color: rgba(209, 213, 219, 1);
    }
    
    .modern-field .mat-mdc-text-field-wrapper.mdc-text-field--focused .mdc-notched-outline__leading,
    .modern-field .mat-mdc-text-field-wrapper.mdc-text-field--focused .mdc-notched-outline__notch,
    .modern-field .mat-mdc-text-field-wrapper.mdc-text-field--focused .mdc-notched-outline__trailing {
      border-color: rgb(16, 185, 129) !important;
      border-width: 2px !important;
    }
    
    .modern-button {
      --mdc-filled-button-container-shape: 12px;
      --mdc-filled-button-container-color: rgb(16, 185, 129);
      --mdc-filled-button-label-text-color: white;
      box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3), 0 2px 4px -1px rgba(16, 185, 129, 0.2);
      transition: all 0.2s ease;
    }
    
    .modern-button:hover:not([disabled]) {
      --mdc-filled-button-container-color: rgb(5, 150, 105);
      transform: translateY(-1px);
      box-shadow: 0 6px 10px -1px rgba(16, 185, 129, 0.4), 0 4px 6px -1px rgba(16, 185, 129, 0.3);
    }
    
    .modern-button:disabled {
      --mdc-filled-button-container-color: rgb(156, 163, 175);
      transform: none;
      box-shadow: none;
    }
    
    mat-progress-spinner {
      display: inline-block;
    }
    
    mat-card {
      border-radius: 16px !important;
    }
    
    h1, p {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
  `]
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  loginForm: FormGroup;
  loading = false;
  hidePassword = true;
  errorMessage = '';

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/users']);
    }
  }

  onSubmit(): void {
    this.errorMessage = '';
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    if (!this.loading) {
      this.loading = true;
      const credentials = this.loginForm.value;

      this.authService.login(credentials)
        .pipe(
          finalize(() => this.loading = false)
        )
        .subscribe({
          next: () => {
            this.toast.success('Login successful!');
            this.router.navigate(['/users']);
          },
          error: (error) => {
            console.error('Login failed:', error);
            const message = error?.error?.message || 'Invalid email or password';
            this.errorMessage = message;
            this.toast.error(message);
          }
        });
    }
  }
}
