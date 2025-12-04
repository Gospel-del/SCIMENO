import { Utilisateur } from './../user';
import { User } from './../../../core/services/user';
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { finalize } from 'rxjs/operators';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MessageModal } from '../../message-modal/message-modal';
import { HttpErrorResponse } from '@angular/common/http';
import { FonctionUser, FonctionUserLabel } from '../fonctions';

interface Toast {
  message: string[];             // tableau de chaînes
  type: 'success' | 'error';
  timeout?: any;
  visible?: boolean;
}

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule],
  templateUrl: './user-form.html',
  styleUrl: './user-form.css'
})
export class UserForm {
  @Input() user!: Utilisateur;
  isAddForm: boolean = false;
  creationSuccess = false;
  serverErrors: string[] = [];
  loading = false;
  bSaveName: String = "Enregistrer";


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

  fonctionUserList = Object.values(FonctionUser).map(key => ({
    key,
    label: FonctionUserLabel[key]
  }));

  constructor(private userService: UserService,
    private router: Router,
    private dialog: MatDialog) {}

  ngOnInit() {
    this.isAddForm = false;
    this.bSaveName = "Enregistrer"
    if(this.user){
      if((this.router.url.includes('/create')) || (this.user.idUtilisateur == -1)){
        this.isAddForm = true;
      }
    }
    if(! this.isAddForm){
      this.bSaveName = "Modifier"
    }

  }

  close(){
    this.router.navigate(['users/']);
  }

  onSubmit() {
    this.creationSuccess = false;
    this.serverErrors = [];
    this.loading = true;
    if (this.user) {

      const obs = this.isAddForm
        ? this.userService.createUser(this.user)
        : this.userService.updateUser(this.user);

      obs.pipe(finalize(() => (this.loading = false))).subscribe({
        next: (result) => {
          if(result){
            this.creationSuccess = true;
            console.log('Sauvegarde réussie', result);
            if(this.isAddForm){
              this.user = {
                idUtilisateur: 0,
                nom: '',
                prenom: '',
                fonction: '',
                email: '',
                telephone: '',
                motDePasse: '',
                statut: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
              this.showToast(["Sauvegarde réussie !"], "success");
            }else{
              this.showToast(["Modification réussie !"], "success");
            }
          }else{
            this.showToast(["Une erreur est survenue lors de l\'enregistrement"], "error");
          }
        },
        error: (err: HttpErrorResponse) => {
          this.serverErrors.push(err.error?.message || 'Erreur inconnue.');
          this.showToast(this.serverErrors, "error");
        }
      });
    }
  }
}
