import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Client, ClientModel } from './client';
import { ClientService } from '../../core/services/client.service';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from '../confirm-dialog/confirm-dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface Toast {
  message: string[];             // tableau de chaînes
  type: 'success' | 'error';
  timeout?: any;
  visible?: boolean;
}

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule, MatProgressSpinnerModule],
  templateUrl: './clients.html',
  styleUrl: './clients.css'
})
export class ClientsComponent implements OnInit {
  pageIndex: number = 1;
  pageSize: number = 10;
  total: number = 0;
  totalPages: number = 0;
  Math = Math;
  isLoading: boolean = true;
  error: string | null = "";
  searchTerm: string = "";

  clients: Client[] = [];

  toasts: Toast[] = [];

  showToast(messages: string[], type: 'success' | 'error' = 'success') {
    const toast: Toast = { message: messages, type, visible: false };
    this.toasts.push(toast);

    // Forcer le rendu avant animation
    requestAnimationFrame(() => {
      toast.visible = true;
    });

    // Auto-fermeture après 3 secondes
    toast.timeout = setTimeout(() => this.closeToast(toast), 3000);
  }

  closeToast(toast: Toast) {
    clearTimeout(toast.timeout);
    toast.visible = false;

    // Supprimer le toast après animation
    setTimeout(() => {
      this.toasts = this.toasts.filter(t => t !== toast);
    }, 400);
  }

  constructor(private clientService: ClientService, private router: Router, private dialog: MatDialog) {}

  ngOnInit() {
    this.loadClients();
  }

  loadClients(): void {
    this.isLoading = true;
    this.clientService.listClients(this.pageIndex, this.pageSize).subscribe({
      next: (response) => {
        if (response && response.success && response.data) {
          this.clients = response.data.clients.map(s => ClientModel.fromResponse(s));
          this.total = response.data.total;
          this.totalPages = response.data.total_pages;
          this.pageIndex = response.data.page;
        } else {
          this.error = response?.message || 'Erreur lors du chargement des clients';
          this.clients = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des clients';
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.pageIndex = page;
      this.loadClients();
    }
  }

  previousPage(): void {
    if (this.pageIndex > 1) {
      this.pageIndex--;
      this.loadClients();
    }
  }

  nextPage(): void {
    if (this.pageIndex < this.totalPages) {
      this.pageIndex++;
      this.loadClients();
    }
  }

  addClient(): void{
    this.router.navigate(['clients/create']);
  }

  search(): void {
    if (this.searchTerm.trim().length === 0) {
      this.loadClients();
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.clientService.searchClient(this.searchTerm).subscribe({
      next: (response) => {
        if (response && response.success && response.data) {
          this.clients = response.data.map(s => ClientModel.fromResponse(s));
          this.total = this.clients.length;
          this.totalPages = 1;
        } else {
          this.error = response?.message || 'Aucun client trouvée';
          this.clients = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors de la recherche';
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  supprimerClient(client: Client): void {
    // Logique de suppression
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '350px',
      data: {
        title: 'Confirmation',
        message: 'Voulez-vous vraiment supprimer le client ' + client.prenom + ' ' + client.nom +' ?',
        cancel: 'Non',
        valid: 'Oui'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        // supprimer le client ici
        this.clientService.deleteClient(client).subscribe(
          (response: any) => {
            this.showToast(["Suppression réussie !"], "success");
            this.loadClients();
          },
          (err: HttpErrorResponse) => {
            const serverErrors = [];
            serverErrors.push(err.error?.message || 'Erreur inconnue.');
            this.showToast(serverErrors, "error");
          }
        );
      }
    });
  }

  updateClient(client: Client): void{
    this.clientService.setClientToEdit(client);  // stocker dans le service
    this.router.navigate(['clients/edit']);
  }
}
