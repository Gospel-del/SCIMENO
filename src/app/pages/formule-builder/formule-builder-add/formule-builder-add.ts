import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormuleBuilderForm } from '../formule-builder-form/formule-builder-form';
import { RegleCalcul, RegleCalculModel } from '../../regle-calculs/regle-calcul';

@Component({
  selector: 'app-formule-builder-add',
  imports: [CommonModule, FormsModule, FormuleBuilderForm],
  templateUrl: './formule-builder-add.html',
  styleUrl: './formule-builder-add.css',
})
export class FormuleBuilderAdd implements OnInit{
  regleCalcul! : RegleCalcul;
  ngOnInit(): void {
    this.regleCalcul = new RegleCalculModel({
      idRegleCalcul: -1,
      idSousNature: -1,
      typeCalcul: 'IND',
      tauxRegleCalcul: 0,
      detailRegleCalcul: '',
      sous_natures_entree: [],
      status: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
}
