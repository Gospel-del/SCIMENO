import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ScenariosService } from '../../../core/services/scenarios';
import { ScenarioUpdate, ScenarioModel } from '../../../models/scenarios';

@Component({
  selector: 'app-scenarios-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './scenarios-edit.html',
  styleUrl: './scenarios-edit.css'
})
export class ScenariosEditComponent implements OnInit {
  scenario: ScenarioUpdate = {
    id_scenario: 0,
    nom_scenario: '',
    coef_majoration: 0,
    description: '',
    actif: true
  };
  loading = false;
  error: string | null = null;
  scenarioId: number | null = null;

  constructor(
    private scenariosService: ScenariosService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Récupérer l'ID depuis la route ou depuis le service
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.scenarioId = +params['id'];
        this.loadScenario(this.scenarioId);
      } else {
        // Essayer de récupérer depuis le service (si on vient de la liste)
        const scenarioToEdit = this.scenariosService.getScenarioToEdit();
        if (scenarioToEdit) {
          this.scenarioId = scenarioToEdit.id_scenario;
          this.loadScenarioFromModel(scenarioToEdit);
        } else {
          this.error = 'Aucun scénario à modifier';
        }
      }
    });
  }

  loadScenario(id: number): void {
    this.loading = true;
    this.error = null;

    this.scenariosService.getScenarioById(id).subscribe({
      next: (scenario) => {
        if (scenario) {
          this.loadScenarioFromModel(scenario);
        } else {
          this.error = 'Scénario non trouvé';
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement du scénario';
        this.loading = false;
        console.error('Erreur:', error);
      }
    });
  }

  loadScenarioFromModel(scenario: ScenarioModel): void {
    this.scenario = {
      id_scenario: scenario.id_scenario,
      nom_scenario: scenario.nom_scenario,
      coef_majoration: scenario.coef_majoration,
      description: scenario.description || '',
      actif: scenario.actif
    };
    this.scenarioId = scenario.id_scenario;
  }

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      return;
    }

    if (!this.scenarioId) {
      this.error = 'ID du scénario manquant';
      return;
    }

    this.loading = true;
    this.error = null;

    // Validation du coefficient (doit être entre 0 et 1)
    if (this.scenario.coef_majoration !== undefined &&
        (this.scenario.coef_majoration < 0 || this.scenario.coef_majoration > 1)) {
      this.error = 'Le coefficient de majoration doit être entre 0 et 1';
      this.loading = false;
      return;
    }

    this.scenariosService.updateScenario(this.scenario).subscribe({
      next: (updatedScenario) => {
        if (updatedScenario) {
          this.scenariosService.clearScenarioToEdit();
          this.router.navigate(['/scenarios']);
        } else {
          this.error = 'Erreur lors de la modification du scénario';
          this.loading = false;
        }
      },
      error: (error) => {
        this.error = error.error?.message || 'Erreur lors de la modification du scénario';
        this.loading = false;
        console.error('Erreur:', error);
      }
    });
  }

  onCancel(): void {
    this.scenariosService.clearScenarioToEdit();
    this.router.navigate(['/scenarios']);
  }

  resetForm(form: NgForm): void {
    if (this.scenarioId) {
      this.loadScenario(this.scenarioId);
    }
    this.error = null;
  }
}

