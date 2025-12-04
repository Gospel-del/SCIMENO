import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth';
import { JwtService } from '../../core/services/jwt.service';
import { UtilisateurModel } from '../users/user';
import { FonctionUser, FonctionUserLabel } from '../users/fonctions';

@Component({
  selector: 'app-auth-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-4">

  <div class="row">
    <div class="col-12">
      <div class="card shadow-sm border-0 rounded-lg">
        <div class="card-header bg-gradient-primary text-white">
          <h3 class="card-title mb-0">
            <i class="fas fa-shield-alt mr-2"></i>
            Test d'authentification JWT
          </h3>
        </div>

        <div class="card-body">

          <!-- Statut Auth -->
          <div class="mb-4">
            <h5>État de l'authentification :</h5>
            <div class="alert" [ngClass]="{'alert-success': isAuthenticated, 'alert-danger': !isAuthenticated}">
              <strong>Statut : </strong>
              <span class="badge" [ngClass]="{'badge-success': isAuthenticated, 'badge-danger': !isAuthenticated}">
                {{ isAuthenticated ? 'Connecté' : 'Non connecté' }}
              </span>
            </div>
          </div>

          <div class="row">

            <!-- Informations utilisateur -->
            <div class="col-md-6" *ngIf="currentUser">
              <div class="user-info card p-3 mb-3 shadow-sm rounded-lg">
                <h5 class="mb-3"><i class="fas fa-user mr-2"></i>  Utilisateur actuel</h5>
                <ul class="list-group list-group-flush">
                  <li class="list-group-item"><strong>Nom :</strong> {{ currentUser.prenom }} {{ currentUser.nom }}</li>
                  <li class="list-group-item"><strong>Email :</strong> {{ currentUser.email }}</li>
                  <li class="list-group-item"><strong>Fonction :</strong> {{ fonctionMap[currentUser.fonction || ''] }}</li>
                  <li class="list-group-item">
                    <strong>Statut :</strong>
                    <span class="badge" [class.badge-success]="currentUser.statut" [class.badge-secondary]="!currentUser.statut">
                      {{ currentUser.statut ? 'Actif' : 'Inactif' }}
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Informations token -->
            <div class="col-md-6" *ngIf="tokenInfo">
              <div class="token-info card p-3 mb-3 shadow-sm rounded-lg">
                <h5 class="mb-3"><i class="fas fa-key mr-2"></i>  Informations du token</h5>
                <ul class="list-group list-group-flush">
                  <li class="list-group-item"><strong>Email :</strong> {{ tokenInfo.email }}</li>
                  <li class="list-group-item"><strong>Émis le :</strong> {{ formatDate(tokenInfo.iat) }}</li>
                  <li class="list-group-item"><strong>Expire le :</strong> {{ formatDate(tokenInfo.exp) }}</li>
                </ul>
              </div>
            </div>

          </div> <!-- row -->

        </div> <!-- card-body -->
      </div> <!-- card -->
    </div> <!-- col -->
  </div> <!-- row -->

</div>

  `,
  styleUrl: './auth-test.css'
})
export class AuthTestComponent implements OnInit {
  isAuthenticated = false;
  currentUser: UtilisateurModel | null = null;
  tokenInfo: any = null;
  fonctionMap: Record<string, string> = {};
    fonctionUserList = Object.values(FonctionUser).map(key => ({
      key,
      label: FonctionUserLabel[key]
    }));

  constructor(
    private authService: AuthService,
    private jwtService: JwtService
  ) {}

  ngOnInit(): void {
    this.checkAuthStatus();
    this.fonctionMap = this.fonctionUserList.reduce((acc, item) => {
      acc[item.key] = item.label;
      return acc;
    }, {} as Record<string, string>);
  }

  private checkAuthStatus(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.currentUser = this.authService.getCurrentUser();

    const token = this.authService.getCurrentToken();
    if (token) {
      this.tokenInfo = this.jwtService.getUserFromToken(token);
    }
  }

  formatDate(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleString();
  }
}
