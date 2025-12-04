import { ClientsEdit } from './../clients-edit/clients-edit';
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Client, ClientModel } from '../client';
import { Router } from '@angular/router';
import { catchError, finalize } from 'rxjs/operators';
import { ClientService } from '../../../core/services/client.service';
import { throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { not } from 'rxjs/internal/util/not';

interface Toast {
  message: string[];             // tableau de chaînes
  type: 'success' | 'error';
  timeout?: any;
  visible?: boolean;
}
@Component({
  selector: 'app-clients-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './clients-form.html',
  styleUrl: './clients-form.css'
})
export class ClientsForm {
  @Input() client!: Client;
  isAddForm: boolean = false;
  creationSuccess = false;
  serverErrors: string[] = [];
  loading = false;
  bSaveName: String = "Enregistrer";
  toasts: Toast[] = [];

  constructor(private clientService: ClientService, private router: Router) {}

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

  ngOnInit() {
    this.isAddForm = false;
    this.bSaveName = "Enregistrer"
    if(this.client){
      if((this.router.url.includes('/create')) || (this.client.idClient == -1)){
        this.isAddForm = true;
      }
    }
    if(! this.isAddForm){
      this.bSaveName = "Modifier"
    }
  }

  close(){
    this.router.navigate(['clients/']);
  }

  onSubmit() {
    this.creationSuccess = false;
    this.serverErrors = [];
    this.loading = true;

    if (this.client) {
      /*
      if (this.isAddForm) {

        this.clientService
          .createClient(this.client)
          .pipe(finalize(() => this.loading = false))
          .subscribe({
            next: (client) => {
              console.log('Client créé avec succès :', client);
              if(client){
                this.creationSuccess = true;
              }

              if(! this.creationSuccess){
                this.serverErrors.push("Une erreur inconnue est survenue.");
              }else{
                // Réinitialise le formulaire
                this.client = {
                  idClient: 0,
                  nom: '',
                  prenom: '',
                  email: '',
                  telephone: '',
                  statut: true,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              }
            },
            error: (error: HttpErrorResponse) => {
              // Gère les erreurs retournées par le serveur (format JSON ou string)
              if (error?.error?.message) {
                this.serverErrors.push(error.error.message);
              } else if (error?.message) {
                this.serverErrors.push(error.message);
              } else {
                this.serverErrors.push("Une erreur inconnue est survenue.");
              }

            }
          });

      } else {
        this.clientService
          .updateClient(this.client)
          .subscribe((client) =>
            console.log("Modification reussi")
          );
      }
      */

      const obs = this.isAddForm
        ? this.clientService.createClient(this.client)
        : this.clientService.updateClient(this.client);

      obs.pipe(finalize(() => (this.loading = false))).subscribe({
        next: (result) => {
          if(result){
            this.creationSuccess = true;
            console.log('Sauvegarde réussie', result);
            if(this.isAddForm){
              this.client = {
                idClient: 0,
                nom: '',
                prenom: '',
                email: '',
                telephone: '',
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
