import { Component, OnInit } from '@angular/core';
import { Projet, ProjetModel } from '../projet';
import { ProjetsForm } from "../projets-form/projets-form";

@Component({
  selector: 'app-projets-add',
  imports: [ProjetsForm],
  templateUrl: './projets-add.html',
  styleUrl: './projets-add.css'
})
export class ProjetsAdd  implements OnInit{
  projet! : Projet;
  ngOnInit(): void {
    this.projet = new ProjetModel({
      idProjet: -1,
      nomProjet: '',
      dateProjet: new Date().toISOString().substring(0, 10),
      localisation: '',
      typeProjet: '',
      modeExploitation: '',
      statutJuridique: '',
      typeLocataireCible: '',
      dureeProjet: 1,
      superficieTerrain: 0,
      superficieConstruite: 0,
      nombreAnneesProjet: 0,
      informationsComplementaires: '',
      idClient: -1,
      statut: true,
      created_at: new Date().toISOString().substring(0, 10),
      updated_at: new Date().toISOString()
    });
  }
}
