import { Utilisateur, UtilisateurModel } from './../user';
import { User } from './../../../core/services/user';
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


import { NgClass, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { UserForm } from "../user-form/user-form";

@Component({
  selector: 'app-users-create',
  standalone: true,
  imports: [CommonModule, FormsModule, UserForm],
  templateUrl: './users-create.html',
  styleUrl: './users-create.css'
})
export class UsersCreateComponent implements OnInit {
  user!: Utilisateur;
  constructor() { }
  ngOnInit() {
    this.user = {
      idUtilisateur: 0,
      nom: '',
      prenom: '',
      fonction: '-1',
      email: '',
      telephone: '',
      motDePasse: '',
      statut: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
}
