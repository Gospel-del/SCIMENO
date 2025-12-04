import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Client, ClientUpdate } from '../client';
import { ClientsForm } from '../clients-form/clients-form';
import { ClientService } from '../../../core/services/client.service';

@Component({
  selector: 'app-clients-edit',
  imports: [CommonModule, FormsModule, ClientsForm],
  templateUrl: './clients-edit.html',
  styleUrl: './clients-edit.css'
})
export class ClientsEdit implements OnInit {
  client!: Client;

  constructor(private clientService: ClientService) {}

  ngOnInit(): void {
    const client = this.clientService.getClientToEdit();
    console.log("client_ = ", client)
    if (client) {
      this.client = client;
    } else {
      // Si aucun client trouvé, redirige ou gère le cas
      console.error("Aucun client à éditer !");
    }
    this.clientService.clearClientToEdit();
  }

}
