import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NaturesForm } from '../natures-form/natures-form';
import { Nature, NatureModel } from '../nature';

@Component({
  selector: 'app-natures-add',
  imports: [CommonModule, FormsModule, NaturesForm],
  templateUrl: './natures-add.html',
  styleUrl: './natures-add.css'
})
export class NaturesAdd implements OnInit {
  nature! : Nature;
  ngOnInit(): void {
    this.nature = new NatureModel({
      idNature: -5,
      nomNature: '',
      typeNature: '',
      detailNature: '',
      status: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
}
