import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { string } from 'mathjs';
import { ProjetsServices } from '../services/projets.services';
import { ClientService } from '../services/client.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class FooterComponent implements OnInit{
  nbProjets: number = 0;
  nbClients: number = 0;

  constructor(
    private projetsServices: ProjetsServices,
    private clientService: ClientService
  ) {}

  ngOnInit(): void {
    this.loadNumber();
  }

  loadNumber() {
    forkJoin({
      projets: this.projetsServices.listProjets(0, 10),
      clients: this.clientService.listClients(1, 10)
    }).subscribe({
      next: ({ projets, clients }) => {
        if (projets && projets.success && projets.data && clients && clients.success && clients.data) {
          this.nbProjets = projets.data.total;
          this.nbClients = clients.data.total;
        } else {
          this.nbClients = 0;
          this.nbProjets = 0;
        }
      },
      error:() =>{

      }
    });
  }
}
