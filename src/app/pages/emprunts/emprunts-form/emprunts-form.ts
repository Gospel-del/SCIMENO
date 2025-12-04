import { GlobalFonctionService } from './../../../core/services/global-fonction.service';
import { CommonModule } from '@angular/common';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Emprunt, EmpruntModel } from '../emprunt';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ModeAmortissements } from '../../projets/combo';
import { ComboBoxProjet } from '../../projets/interface-projet';

interface comboBoxProjet {
  id: number;
  name: string;
}

@Component({
  selector: 'app-emprunts-form',
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './emprunts-form.html',
  styleUrl: './emprunts-form.css'
})
export class EmpruntsForm implements OnInit{
  @Input() emprunt!: Emprunt;
  isAddForm: boolean = false;
  creationSuccess = false;
  serverErrors: string[] = [];
  loading = false;
  bSaveName: String = "Enregistrer"

  public modeAmortissements: ComboBoxProjet[] = ModeAmortissements;

  constructor(
    private globalFonctionService: GlobalFonctionService,
    private router: Router,


    public dialogRef: MatDialogRef<EmpruntsForm>,
    @Inject(MAT_DIALOG_DATA) public data: {
      title: string;
      emprunt: Emprunt;
      valid: string;
      cancel: string }
  ) {}

  ngOnInit() {
    const today = new Date();
    const iso = today.toISOString().split('T')[0]; // YYYY-MM-DD

    this.isAddForm = false;
    this.bSaveName = "Enregistrer"
    if(this.emprunt){
      if((this.router.url.includes('/create')) || (this.emprunt.idEmprunt == -5)){
        this.isAddForm = true;
      }
    }
    if(! this.isAddForm){
      this.bSaveName = "Modifier"
    }
    this.emprunt = this.data.emprunt;
  }

  onCancel(){
    this.dialogRef.close({isValid: false, data: []});
  }

  onConfirm(){
    if(new EmpruntModel(this.emprunt).isValidate().isValid){
      this.dialogRef.close({isValid: true, data: this.emprunt});
    }else{
      //
    }
  }

  isValid(): boolean{
    return new EmpruntModel(this.emprunt).isValidate().isValid;
  }

  checkMax(event: any, min: number|null, max: number|null, model?: any) {
    const correctedValue = this.globalFonctionService.limitValue(event.target.value, min, max);

    // Mettre à jour l’input HTML
    event.target.value = correctedValue;

    if (model) {
      model.control.setValue(correctedValue, { emitEvent: false });
    }
  }
}
