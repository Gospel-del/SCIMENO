import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Nature } from '../nature';
import { NaturesService } from '../../../core/services/natures.service';
import { Router } from '@angular/router';
import { TypeCategorie } from '../../categories';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

interface Toast {
  message: string[];             // tableau de chaînes
  type: 'success' | 'error';
  timeout?: any;
  visible?: boolean;
}
@Component({
  selector: 'app-natures-form',
  imports: [CommonModule,
    FormsModule],
  templateUrl: './natures-form.html',
  styleUrl: './natures-form.css'
})
export class NaturesForm {
  @Input() nature!: Nature;
  isAddForm: boolean = false;
  creationSuccess = false;
  serverErrors: string[] = [];
  loading = false;
  bSaveName: String = "Enregistrer";
  typeCategorieList = Object.entries(TypeCategorie).map(([key, value]) => ({
    key,
    label: value
  }))
  .filter(e => e.key != 'EMP');

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

  constructor(private natureService: NaturesService,
    private router: Router) {}

  ngOnInit() {
    this.isAddForm = false;
    this.bSaveName = "Enregistrer"
    if(this.nature){
      if((this.router.url.includes('/create')) || (this.nature.idNature == -10)){
        this.isAddForm = true;
      }
    }
    if(! this.isAddForm){
      this.bSaveName = "Modifier"
    }
  }


  close(){
    this.router.navigate(['natures/']);
  }

  onSubmit() {
    this.creationSuccess = false;
    this.serverErrors = [];
    this.loading = true;
    if (this.nature) {

      const obs = this.isAddForm
        ? this.natureService.createNature(this.nature)
        : this.natureService.updateNature(this.nature);

      obs.pipe(finalize(() => (this.loading = false))).subscribe({
        next: (result) => {
          if(result){
            this.creationSuccess = true;
            console.log('Sauvegarde réussie', result);
            if(this.isAddForm){
              this.nature = {
                idNature: -5,
                nomNature: '',
                typeNature: '',
                detailNature: '',
                status: true,
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
