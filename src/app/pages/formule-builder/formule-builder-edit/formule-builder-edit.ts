import { Component, OnInit } from '@angular/core';
import { FormuleBuilderForm } from '../formule-builder-form/formule-builder-form';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RegleCalculService } from '../../../core/services/regle-calcul-service';
import { RegleCalcul } from '../../regle-calculs/regle-calcul';

@Component({
  selector: 'app-formule-builder-edit',
  imports: [CommonModule, FormsModule, FormuleBuilderForm],
  templateUrl: './formule-builder-edit.html',
  styleUrl: './formule-builder-edit.css',
})
export class FormuleBuilderEdit implements OnInit{
  regleCalcul! : RegleCalcul;
  constructor(private regleCalculService: RegleCalculService) {}

  ngOnInit(): void {
    const regleCalcul = this.regleCalculService.getRegleCalculToEdit();
    if (regleCalcul) {
      this.regleCalcul = regleCalcul;
    } else {
      // Si aucun client trouvé, redirige ou gère le cas
      console.error("Aucune element à éditer !");
    }
    this.regleCalculService.clearRegleCalculToEdit();
  }

}
