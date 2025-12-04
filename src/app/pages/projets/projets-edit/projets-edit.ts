import { Component, OnInit } from '@angular/core';
import { ProjetsForm } from '../projets-form/projets-form';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjetsServices } from '../../../core/services/projets.services';
import { Projet } from '../projet';

@Component({
  selector: 'app-projets-edit',
  imports: [CommonModule, FormsModule, ProjetsForm],
  templateUrl: './projets-edit.html',
  styleUrl: './projets-edit.css'
})
export class ProjetsEdit implements OnInit{
  projet!: Projet;
  isDuplicate: boolean = false;
  constructor(private projetsServices: ProjetsServices) {}

  ngOnInit(): void {
    const projet = this.projetsServices.getProjetToEdit();
    if (projet) {
      this.isDuplicate = this.projetsServices.getIsDuplicate();
      projet.created_at = projet.created_at.substring(0, 10);
      this.projet = projet;
    } else {
      // Si aucun client trouvé, redirige ou gère le cas
      console.error("Aucune element à éditer !");
    }
    this.projetsServices.clearProjetToEdit();
  }

}
