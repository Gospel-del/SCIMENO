import { Component, OnInit } from '@angular/core';
import { NaturesForm } from '../natures-form/natures-form';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NaturesService } from '../../../core/services/natures.service';
import { Nature } from '../nature';

@Component({
  selector: 'app-natures-edit',
  imports: [CommonModule, FormsModule, NaturesForm],
  templateUrl: './natures-edit.html',
  styleUrl: './natures-edit.css'
})
export class NaturesEdit implements OnInit {
  nature! : Nature;

  constructor(private naturesService: NaturesService) {}

  ngOnInit(): void {
    const nature = this.naturesService.getNatureToEdit();
    if (nature) {
      this.nature = nature;
    } else {
      // Si aucun client trouvé, redirige ou gère le cas
      console.error("Aucune nature à éditer !");
    }
    this.naturesService.clearNatureToEdit();
  }

}
