import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RegleCalcul } from '../regle-calcul';
import { RegleCalculsForm } from '../regle-calculs-form/regle-calculs-form';
import { RegleCalculService } from '../../../core/services/regle-calcul-service';

@Component({
  selector: 'app-regle-calculs-edit',
  imports: [CommonModule, FormsModule, RegleCalculsForm],
  templateUrl: './regle-calculs-edit.html',
  styleUrl: './regle-calculs-edit.css'
})
export class RegleCalculsEdit implements OnInit{
  regleCalcul! : RegleCalcul;
  constructor(private regleCalculService: RegleCalculService) {}

  ngOnInit(): void {
    const regleCalcul = this.regleCalculService.getRegleCalculToEdit();
    console.error("regleCalcul : ", regleCalcul);
    if (regleCalcul) {
      this.regleCalcul = regleCalcul;
    } else {
      // Si aucun client trouvé, redirige ou gère le cas
      console.error("Aucune element à éditer !");
    }
    this.regleCalculService.clearRegleCalculToEdit();
  }

}
