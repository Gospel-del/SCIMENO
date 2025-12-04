import { Client, ClientCreate, ClientModel } from './../client';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClientsForm } from '../clients-form/clients-form';

@Component({
  selector: 'app-clients-add',
  imports: [CommonModule, FormsModule, ClientsForm],
  templateUrl: './clients-add.html',
  styleUrl: './clients-add.css'
})
export class ClientsAdd implements OnInit {
  client! : Client;
  ngOnInit(): void {
    console.log("this.client = ", this.client)
    this.client = new ClientModel({
      idClient: -1,
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      statut: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

}
