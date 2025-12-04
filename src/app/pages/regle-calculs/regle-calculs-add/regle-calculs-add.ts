import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RegleCalculsForm } from '../regle-calculs-form/regle-calculs-form';
import { RegleCalcul, RegleCalculModel } from '../regle-calcul';

@Component({
  selector: 'app-regle-calculs-add',
  imports: [CommonModule, FormsModule, RegleCalculsForm],
  templateUrl: './regle-calculs-add.html',
  styleUrl: './regle-calculs-add.css'
})
export class RegleCalculsAdd implements OnInit{
  regleCalcul! : RegleCalcul;
  ngOnInit(): void {
    this.regleCalcul = new RegleCalculModel({
      idRegleCalcul: -1,
      idSousNature: -1,
      typeCalcul: '',
      tauxRegleCalcul: 0,
      detailRegleCalcul: '',
      sous_natures_entree: [],
      status: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
}
