import { UserService } from './../services/user.service';
import { Component, Output, EventEmitter, OnInit, input, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth';
import { MenuItem, ADMIN_MENU } from '../../models/menu.model';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { UtilisateurPasswordUpdate } from '../../pages/users/user';

declare var $: any; // pour jQuery / Bootstrap modal
interface Toast {
  message: string[];             // tableau de chaînes
  type: 'success' | 'error';
  timeout?: any;
  visible?: boolean;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent implements OnInit {
  //@Input() structuredMenu: MenuItem[] = [];
  @Input() structuredMenu: MenuItem[] = [];
  //@Output() menuClicked = new EventEmitter<string>();
  currentUser$;
  @Output() menuClicked = new EventEmitter<string>();
  /*
  constructor(private authService: AuthService,
    private dialog: MatDialog
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }
  ngOnInit(): void {
    console.log("menuItems = ", ADMIN_MENU)
  }
    */

  logout(): void {
    this.authService.logout();
  }

  onMenuClick(menuName: string): void {
    console.log('🖱️ Header: Clic détecté sur le menu:', menuName);
    this.menuClicked.emit(menuName);
    console.log('📤 Header: Event menuClicked émis vers LayoutComponent');
  }


  passwordForm: FormGroup;
  showOld = false;
  showNew = false;
  showConfirm = false;
  strength = '';
  strengthLabel = '';
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
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private userService: UserService,
  ) {
    this.currentUser$ = this.authService.currentUser$;

    this.passwordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Si route contient param 'changePassword', ouvrir le modal automatiquement
    this.route.queryParams.subscribe(params => {
      if (params['changePassword'] === 'true') {
        this.openPasswordModal();
      }
    });
  }

  get passwordMismatch() {
    const n = this.passwordForm.value.newPassword;
    const c = this.passwordForm.value.confirmPassword;
    return n && c && n !== c;
  }

  checkStrength() {
    const pwd = this.passwordForm.value.newPassword || '';
    const hasLetters = /[a-zA-Z]/.test(pwd);
    const hasNumbers = /[0-9]/.test(pwd);
    const hasSpecial = /[@$!%*?&]/.test(pwd);
    const long = pwd.length >= 8;

    if (long && hasLetters && hasNumbers && hasSpecial) {
      this.strength = 'strong';
      this.strengthLabel = 'Fort';
    } else if (pwd.length >= 6 && ((hasLetters && hasNumbers) || (hasLetters && hasSpecial))) {
      this.strength = 'medium';
      this.strengthLabel = 'Moyen';
    } else {
      this.strength = 'weak';
      this.strengthLabel = 'Faible';
    }
  }

  submitPassword() {
    if (this.passwordForm.invalid || this.passwordMismatch) return;

    const userPwd = {
      idUtilisateur: 1,
      ancienMotDePasse: this.passwordForm.value.oldPassword,
      nouveauMotDePasse: this.passwordForm.value.newPassword,
    } as UtilisateurPasswordUpdate
    this.userService.updatePassword(userPwd).subscribe({
      next: (result) => {
        console.log("result = ", result);
        if(result){
          this.passwordForm = this.fb.group({
            oldPassword: ['', Validators.required],
            newPassword: ['', Validators.required],
            confirmPassword: ['', Validators.required]
          });
          this.showToast(["Mot de passe modifié avec success"], "success");
          // Fermer le modal
          $('#passwordModal').modal('hide');
        }else{
          this.showToast(["Une erreur est survenue lors de l\'enregistrement"], "error");
        }
      },
      error: (err: HttpErrorResponse) => {
        this.serverErrors.push(err.error?.message || 'Erreur inconnue.');
        this.showToast(this.serverErrors, "error");
      }
    })

  }

  closePasswordModal() {
    $('#passwordModal').modal('hide');
  }

  openPasswordModal() {
    this.passwordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });
    $('#passwordModal').modal('show');
  }
}
