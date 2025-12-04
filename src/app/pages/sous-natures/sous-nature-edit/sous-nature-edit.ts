import { Component, OnInit } from '@angular/core';
import { SousNature } from '../sous-nature';
import { SousNaturesService } from '../../../core/services/sous-natures.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SousNatureForm } from '../sous-nature-form/sous-nature-form';

@Component({
  selector: 'app-sous-nature-edit',
  imports: [CommonModule, FormsModule, SousNatureForm],
  templateUrl: './sous-nature-edit.html',
  styleUrl: './sous-nature-edit.css'
})
export class SousNatureEdit implements OnInit {
  sousNature! : SousNature;

  constructor(private sousNatureService: SousNaturesService) {}

  ngOnInit(): void {
    const sousNature = this.sousNatureService.getSousNatureToEdit();
    console.error("sousNature : ", sousNature);
    if (sousNature) {
      this.sousNature = sousNature;
    } else {
      // Si aucun client trouvé, redirige ou gère le cas
      console.error("Aucune element à éditer !");
    }
    this.sousNatureService.clearSousNatureToEdit();
  }

}
