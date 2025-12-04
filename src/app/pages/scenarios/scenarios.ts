import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ScenariosService } from '../../core/services/scenarios';
import { ScenarioSousNatureService } from '../../core/services/scenario-sous-nature.service';
import { NaturesService } from '../../core/services/natures.service';
import { SousNaturesService } from '../../core/services/sous-natures.service';
import { ScenarioModel, ScenarioSousNatureModel, ScenarioSousNatureCreate, ScenarioSousNatureUpdate } from '../../models/scenarios';
import { Nature } from '../natures/nature';
import { SousNature } from '../sous-natures/sous-nature';
import { TypeCategorie } from '../categories';

interface ScenarioSousNatureElement {
  scenario: ScenarioModel;
  sousNature: SousNature;
  nature: Nature;
  scenarioSousNature: ScenarioSousNatureModel;
}

@Component({
  selector: 'app-scenarios',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './scenarios.html',
  styleUrl: './scenarios.css'
})
export class ScenariosComponent implements OnInit {
  scenarios: ScenarioModel[] = [];
  loading = false;
  error: string | null = null;
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  total = 0;
  actifOnly = false;
  searchTerm = '';

  // Pour la section des liens scenario-sous_nature
  showLinksSection = false;
  linksLoading = false;
  linksError: string | null = null;
  linksPageIndex = 1;
  linksPageSize = 10;
  linksTotal = 0;
  linksTotalPages = 1;
  selectedScenarioId: number | null = null;
  scenarioSousNatureElements: ScenarioSousNatureElement[] = [];
  natures: Nature[] = [];
  sousNatures: SousNature[] = [];
  typeCategorieList = Object.entries(TypeCategorie).map(([key, value]) => ({
    key,
    label: value
  }));
  categorieMap: Record<string, string> = {};

  // Pour la modale de création/modification de lien
  showLinkModal = false;
  isEditMode = false;
  currentLinkElement: ScenarioSousNatureElement | null = null;
  modalForm = {
    scenarioId: null as number | null,
    selectedSousNatureIds: [] as number[]
  };
  scenarioSearchTerm = '';
  filteredScenarios: ScenarioModel[] = [];
  allScenariosForSearch: ScenarioModel[] = [];
  showScenarioTable = false;
  sousNatureSearchTerm = '';
  filteredSousNatures: SousNature[] = [];
  modalError: string | null = null;
  modalLoading = false;

  constructor(
    private scenariosService: ScenariosService,
    private scenarioSousNatureService: ScenarioSousNatureService,
    private naturesService: NaturesService,
    private sousNaturesService: SousNaturesService
  ) {
    this.categorieMap = this.typeCategorieList.reduce((acc, item) => {
      acc[item.key] = item.label;
      return acc;
    }, {} as Record<string, string>);
  }

  ngOnInit(): void {
    this.loadScenarios();
  }

  loadScenarios(): void {
    this.loading = true;
    this.error = null;

    this.scenariosService.listScenarios(this.currentPage, this.pageSize, this.actifOnly).subscribe({
      next: (response) => {
        if (response && response.success && response.data) {
          this.scenarios = response.data.scenarios.map(s => ScenarioModel.fromResponse(s));
          this.total = response.data.total;
          this.totalPages = response.data.total_pages;
          this.currentPage = response.data.page;
        } else {
          this.error = response?.message || 'Erreur lors du chargement des scénarios';
          this.scenarios = [];
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des scénarios';
        this.loading = false;
        console.error('Erreur:', error);
      }
    });
  }

  deleteScenario(scenario: ScenarioModel): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le scénario "${scenario.nom_scenario}" ?`)) {
      this.scenariosService.deleteScenario(scenario.id_scenario).subscribe({
        next: (response) => {
          if (response && response.success) {
            this.loadScenarios(); // Recharger la liste
          } else {
            alert(response?.message || 'Erreur lors de la suppression');
          }
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          alert('Erreur lors de la suppression du scénario');
        }
      });
    }
  }

  toggleScenarioStatus(scenario: ScenarioModel): void {
    const newStatus = !scenario.actif;
    this.scenariosService.toggleScenario(scenario.id_scenario, newStatus).subscribe({
      next: (updatedScenario) => {
        if (updatedScenario) {
          const index = this.scenarios.findIndex(s => s.id_scenario === scenario.id_scenario);
          if (index !== -1) {
            this.scenarios[index] = updatedScenario;
          }
        }
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour:', error);
        alert('Erreur lors de la mise à jour du statut');
      }
    });
  }

  editScenario(scenario: ScenarioModel): void {
    this.scenariosService.setScenarioToEdit(scenario);
  }

  searchScenarios(): void {
    if (this.searchTerm.trim().length === 0) {
      this.loadScenarios();
      return;
    }

    this.loading = true;
    this.error = null;

    this.scenariosService.searchScenarios(this.searchTerm).subscribe({
      next: (response) => {
        if (response && response.success && response.data) {
          this.scenarios = response.data.map(s => ScenarioModel.fromResponse(s));
          this.total = this.scenarios.length;
          this.totalPages = 1;
        } else {
          this.error = response?.message || 'Aucun scénario trouvé';
          this.scenarios = [];
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors de la recherche';
        this.loading = false;
        console.error('Erreur:', error);
      }
    });
  }

  toggleActifOnly(): void {
    this.actifOnly = !this.actifOnly;
    this.currentPage = 1;
    this.loadScenarios();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadScenarios();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadScenarios();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadScenarios();
    }
  }

  // ========== Gestion des liens Scenario-SousNature ==========

  toggleLinksSection(): void {
    this.showLinksSection = !this.showLinksSection;
    if (this.showLinksSection && this.scenarioSousNatureElements.length === 0) {
      this.loadLinksData();
    }
  }

  loadLinksData(): void {
    this.linksLoading = true;
    this.linksError = null;

    forkJoin({
      sousNatures: this.sousNaturesService.listSousNatures(1, 1000),
      natures: this.naturesService.listNatures(1, 1000),
      scenarioSousNatures: this.scenarioSousNatureService.listScenarioSousNatures(
        this.linksPageIndex,
        this.linksPageSize,
        this.selectedScenarioId || undefined
      )
    }).subscribe({
      next: ({ sousNatures, natures, scenarioSousNatures }) => {
        if (scenarioSousNatures && scenarioSousNatures.success && scenarioSousNatures.data) {
          this.sousNatures = sousNatures.data.sous_natures;
          this.natures = natures.data.base_natures;
          this.buildLinksElements(scenarioSousNatures.data.scenario_sous_natures.map(
            ssn => ScenarioSousNatureModel.fromResponse(ssn)
          ));
          this.linksTotal = scenarioSousNatures.data.total;
          this.linksTotalPages = scenarioSousNatures.data.total_pages;
        } else {
          this.linksError = scenarioSousNatures?.message || 'Erreur lors du chargement des liens';
          this.scenarioSousNatureElements = [];
        }
        this.linksLoading = false;
      },
      error: (error) => {
        this.linksError = 'Erreur lors du chargement des données';
        this.linksLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  buildLinksElements(scenarioSousNatures: ScenarioSousNatureModel[]): void {
    this.scenarioSousNatureElements = scenarioSousNatures.map(ssn => {
      const sousNature = this.sousNatures.find(sn => sn.idSousNature === ssn.id_sous_nature);
      const nature = sousNature
        ? this.natures.find(n => n.idNature === sousNature.idNature)
        : undefined;
      const scenario = this.scenarios.find(s => s.id_scenario === ssn.id_scenario);

      return {
        scenario: (scenario ?? {} as ScenarioModel) as ScenarioModel,
        sousNature: (sousNature ?? {} as SousNature) as SousNature,
        nature: (nature ?? {} as Nature) as Nature,
        scenarioSousNature: ssn
      };
    });
  }

  onLinksPageChange(page: number): void {
    if (page < 1 || page > this.linksTotalPages) return;
    this.linksPageIndex = page;
    this.loadLinksData();
  }

  filterLinksByScenario(scenarioId: number | null): void {
    this.selectedScenarioId = scenarioId;
    this.linksPageIndex = 1;
    this.loadLinksData();
  }

  addScenarioSousNatureLink(): void {
    this.isEditMode = false;
    this.currentLinkElement = null;
    this.modalForm = {
      scenarioId: null,
      selectedSousNatureIds: []
    };
    this.scenarioSearchTerm = '';
    this.filteredScenarios = [];
    this.showScenarioTable = false;
    this.sousNatureSearchTerm = '';
    this.filteredSousNatures = [];
    this.modalError = null;
    this.showLinkModal = true;
    // Charger tous les scénarios pour la recherche
    this.loadAllScenarios();

    // S'assurer que les sous-natures sont chargées
    if (this.sousNatures.length === 0) {
      this.sousNaturesService.listSousNatures(1, 1000).subscribe({
        next: (response) => {
          if (response && response.success && response.data) {
            this.sousNatures = response.data.sous_natures;
            this.filterSousNatures();
          }
        },
        error: (error) => {
          console.error('Erreur lors du chargement des sous-natures:', error);
          this.filterSousNatures();
        }
      });
    } else {
      // Initialiser la liste filtrée des sous-natures
      this.filterSousNatures();
    }
  }

  updateScenarioSousNatureLink(element: ScenarioSousNatureElement): void {
    // La modification n'est plus disponible car on ne peut plus modifier les liens
    // Cette méthode est gardée pour compatibilité mais ne sera plus utilisée
    this.isEditMode = false;
    this.addScenarioSousNatureLink();
  }

  closeLinkModal(): void {
    this.showLinkModal = false;
    this.isEditMode = false;
    this.currentLinkElement = null;
    this.modalForm = {
      scenarioId: null,
      selectedSousNatureIds: []
    };
    this.scenarioSearchTerm = '';
    this.filteredScenarios = [];
    this.showScenarioTable = false;
    this.sousNatureSearchTerm = '';
    this.filteredSousNatures = [];
    this.modalError = null;
  }

  filterSousNatures(): void {
    if (this.sousNatureSearchTerm.trim().length === 0) {
      this.filteredSousNatures = [...this.sousNatures];
      return;
    }

    const searchLower = this.sousNatureSearchTerm.toLowerCase();
    this.filteredSousNatures = this.sousNatures.filter(sn =>
      sn.nomSousNature.toLowerCase().includes(searchLower) ||
      this.getNatureName(sn).toLowerCase().includes(searchLower) ||
      sn.idSousNature.toString().includes(searchLower)
    );
  }

  selectAllSousNatures(): void {
    this.filteredSousNatures.forEach(sn => {
      if (!this.modalForm.selectedSousNatureIds.includes(sn.idSousNature)) {
        this.modalForm.selectedSousNatureIds.push(sn.idSousNature);
      }
    });
  }

  deselectAllSousNatures(): void {
    // Retirer seulement les sous-natures filtrées de la sélection
    this.filteredSousNatures.forEach(sn => {
      const index = this.modalForm.selectedSousNatureIds.indexOf(sn.idSousNature);
      if (index > -1) {
        this.modalForm.selectedSousNatureIds.splice(index, 1);
      }
    });
  }

  loadAllScenarios(): void {
    this.scenariosService.listScenarios(1, 1000, false).subscribe({
      next: (response) => {
        if (response && response.success && response.data) {
          this.allScenariosForSearch = response.data.scenarios.map(s => ScenarioModel.fromResponse(s));
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des scénarios:', error);
      }
    });
  }

  searchScenariosInModal(): void {
    if (this.scenarioSearchTerm.trim().length === 0) {
      this.filteredScenarios = [];
      this.showScenarioTable = false;
      return;
    }

    this.showScenarioTable = true;
    const searchLower = this.scenarioSearchTerm.toLowerCase();
    this.filteredScenarios = this.allScenariosForSearch.filter(s =>
      s.nom_scenario.toLowerCase().includes(searchLower) ||
      s.id_scenario.toString().includes(searchLower)
    );
  }

  selectScenario(scenario: ScenarioModel): void {
    this.modalForm.scenarioId = scenario.id_scenario;
    this.scenarioSearchTerm = scenario.nom_scenario;
    this.showScenarioTable = false;
  }

  toggleSousNatureSelection(sousNatureId: number): void {
    const index = this.modalForm.selectedSousNatureIds.indexOf(sousNatureId);
    if (index > -1) {
      // Retirer de la sélection
      this.modalForm.selectedSousNatureIds.splice(index, 1);
    } else {
      // Ajouter à la sélection
      this.modalForm.selectedSousNatureIds.push(sousNatureId);
    }
  }

  isSousNatureSelected(sousNatureId: number): boolean {
    return this.modalForm.selectedSousNatureIds.includes(sousNatureId);
  }

  saveLink(): void {
    this.modalError = null;

    // Validation
    if (!this.modalForm.scenarioId) {
      this.modalError = 'Veuillez sélectionner un scénario';
      return;
    }
    if (this.modalForm.selectedSousNatureIds.length === 0) {
      this.modalError = 'Veuillez sélectionner au moins une sous-nature';
      return;
    }

    this.modalLoading = true;

    // Créer tous les liens pour les sous-natures sélectionnées
    const createPromises = this.modalForm.selectedSousNatureIds.map(sousNatureId => {
      const createData: ScenarioSousNatureCreate = {
        id_scenario: this.modalForm.scenarioId!,
        id_sous_nature: sousNatureId
      };
      return this.scenarioSousNatureService.createScenarioSousNature(createData);
    });

    // Utiliser forkJoin pour créer tous les liens en parallèle
    forkJoin(createPromises).subscribe({
      next: (responses) => {
        const successCount = responses.filter(r => r !== null).length;
        if (successCount === this.modalForm.selectedSousNatureIds.length) {
          this.loadLinksData();
          this.closeLinkModal();
        } else {
          this.modalError = `${successCount} sur ${this.modalForm.selectedSousNatureIds.length} lien(s) créé(s) avec succès`;
          // Recharger quand même pour voir les liens créés
          this.loadLinksData();
        }
        this.modalLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors de la création des liens:', error);
        // Essayer de créer les liens un par un pour identifier ceux qui échouent
        this.createLinksSequentially();
      }
    });
  }

  createLinksSequentially(): void {
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];
    let currentIndex = 0;

    const createNext = () => {
      if (currentIndex >= this.modalForm.selectedSousNatureIds.length) {
        // Tous les liens ont été traités
        if (successCount > 0) {
          this.loadLinksData();
        }
        if (errorCount > 0) {
          this.modalError = `${successCount} lien(s) créé(s), ${errorCount} erreur(s). ${errors.join('; ')}`;
        } else {
          this.closeLinkModal();
        }
        this.modalLoading = false;
        return;
      }

      const sousNatureId = this.modalForm.selectedSousNatureIds[currentIndex];
      const createData: ScenarioSousNatureCreate = {
        id_scenario: this.modalForm.scenarioId!,
        id_sous_nature: sousNatureId
      };

      this.scenarioSousNatureService.createScenarioSousNature(createData).subscribe({
        next: (response) => {
          if (response) {
            successCount++;
          } else {
            errorCount++;
            errors.push(`Sous-nature ${sousNatureId}`);
          }
          currentIndex++;
          createNext();
        },
        error: (error) => {
          errorCount++;
          const errorMsg = error.error?.message || 'Erreur inconnue';
          errors.push(`Sous-nature ${sousNatureId}: ${errorMsg}`);
          currentIndex++;
          createNext();
        }
      });
    };

    createNext();
  }

  refreshLinks(): void {
    this.loadLinksData();
  }

  getNatureName(sousNature: SousNature): string {
    if (!sousNature) return '';
    const nature = this.natures.find(n => n.idNature === sousNature.idNature);
    return nature ? nature.nomNature : '';
  }

  deleteScenarioSousNatureLink(element: ScenarioSousNatureElement): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le lien entre "${element.scenario.nom_scenario}" et "${element.sousNature.nomSousNature}" ?`)) {
      this.scenarioSousNatureService.deleteScenarioSousNature(
        element.scenarioSousNature.id_scenario_sous_nature
      ).subscribe({
        next: (response) => {
          if (response && response.success) {
            this.loadLinksData();
          } else {
            alert(response?.message || 'Erreur lors de la suppression');
          }
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          alert('Erreur lors de la suppression du lien');
        }
      });
    }
  }
}

