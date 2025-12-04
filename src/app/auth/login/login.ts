import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { UserService } from '../../core/services/user.service';
import { HttpErrorResponse } from '@angular/common/http';

declare var $: any; // pour jQuery / Bootstrap modal
interface Toast {
  message: string[];             // tableau de chaînes
  type: 'success' | 'error';
  timeout?: any;
  visible?: boolean;
}

@Component({
  selector: 'app-login',
  imports: [CommonModule,
    ReactiveFormsModule,
    FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent implements OnInit{
  email: string = '';
  motDePasse: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  forgotPasswordForm!: FormGroup;
  serverErrors: string[] = [];
  toasts: Toast[] = [];

  showToast(messages: string[], type: 'success' | 'error' = 'success') {
    const toast: Toast = { message: messages, type, visible: false };
    this.toasts.push(toast);

    // Forcer le rendu avant animation
    requestAnimationFrame(() => {
      toast.visible = true;
    });

    // Auto-fermeture après 3 secondes
    toast.timeout = setTimeout(() => this.closeToast(toast), 3000);
  }

  closeToast(toast: Toast) {
    clearTimeout(toast.timeout);
    toast.visible = false;

    // Supprimer le toast après animation
    setTimeout(() => {
      this.toasts = this.toasts.filter(t => t !== toast);
    }, 400);
  }

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private userService: UserService,
  ) {}

  ngOnInit() {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  // fermer le modal
  closeForgotPasswordModal() {
    this.forgotPasswordForm.reset();
    this.serverErrors = [];
    $('#forgotPasswordModal').modal('hide');
  }

  // soumettre le formulaire
  submitForgotPassword() {
    if (this.forgotPasswordForm.invalid) return;

    const email = this.forgotPasswordForm.value.email;
    this.serverErrors = [];

    this.userService.forgotPassword(email).subscribe({
      next: (result) => {
        if(result && result.message){
          this.showToast([result.message], "success");
          // Fermer le modal
          this.closeForgotPasswordModal();
        }else{
          this.showToast(["Une erreur est survenue"], "error");
        }
      },
      error: (err: HttpErrorResponse) => {
        this.serverErrors.push(err.error?.message || 'Erreur inconnue.');
        this.showToast(this.serverErrors, "error");
      }
    })
  }


  openPasswordModal() {
    this.forgotPasswordForm.reset();
    this.serverErrors = [];
    $('#forgotPasswordModal').modal('show');
  }

  onSubmit(): void {
    if (!this.email || !this.motDePasse) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    console.log("success = start")

    this.authService.login(this.email, this.motDePasse).subscribe({
      next: (success) => {
        this.isLoading = false;
        if (success) {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = 'Email ou mot de passe incorrect';
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Erreur de connexion:', error);
        console.log("success = ", error)

        // Gérer les erreurs spécifiques du backend
        if (error.error && error.error.message) {
          this.errorMessage = error.error.message;
        } else if (error.status === 401) {
          this.errorMessage = 'Email ou mot de passe incorrect';
        } else if (error.status === 0) {
          this.errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
        } else {
          this.errorMessage = 'Une erreur est survenue lors de la connexion';
        }
      }
    });
  }
}
