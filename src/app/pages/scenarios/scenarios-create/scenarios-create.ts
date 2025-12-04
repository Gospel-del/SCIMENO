import { GlobalFonctionService } from './../../../core/services/global-fonction.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ScenariosService } from '../../../core/services/scenarios';
import { ScenarioCreate } from '../../../models/scenarios';

@Component({
  selector: 'app-scenarios-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './scenarios-create.html',
  styleUrl: './scenarios-create.css'
})
export class ScenariosCreateComponent implements OnInit {
  scenario: ScenarioCreate = {
    nom_scenario: '',
    coef_majoration: 0,
    description: '',
    actif: true
  };
  loading = false;
  error: string | null = null;

  constructor(
    private globalFonctionService: GlobalFonctionService,
    private scenariosService: ScenariosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Initialisation si nécessaire
  }

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      return;
    }

    this.loading = true;
    this.error = null;

    // Validation du coefficient (doit être entre 0 et 1)
    if (this.scenario.coef_majoration < 0 || this.scenario.coef_majoration > 1) {
      this.error = 'Le coefficient de majoration doit être entre 0 et 1';
      this.loading = false;
      return;
    }

    this.scenariosService.createScenario(this.scenario).subscribe({
      next: (createdScenario) => {
        if (createdScenario) {
          this.router.navigate(['/scenarios']);
        } else {
          this.error = 'Erreur lors de la création du scénario';
          this.loading = false;
        }
      },
      error: (error) => {
        this.error = error.error?.message || 'Erreur lors de la création du scénario';
        this.loading = false;
        console.error('Erreur:', error);
      }
    });
  }

  checkMax(event: any, min: number|null, max: number|null, model?: any) {
    const correctedValue = this.globalFonctionService.limitValue(event.target.value, min, max);
    event.target.value = correctedValue;

    if (model) {
      model.control.setValue(correctedValue, { emitEvent: false });
    }
  }

  onCancel(): void {
    this.router.navigate(['/scenarios']);
  }

  resetForm(form: NgForm): void {
    form.resetForm();
    this.scenario = {
      nom_scenario: '',
      coef_majoration: 0,
      description: '',
      actif: true
    };
    this.error = null;
  }
}

