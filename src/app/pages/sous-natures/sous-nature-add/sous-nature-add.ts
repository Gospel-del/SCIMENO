import { Component, OnInit } from '@angular/core';
import { SousNature, SousNatureModel } from '../sous-nature';
import { SousNatureForm } from '../sous-nature-form/sous-nature-form';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sous-nature-add',
  imports: [CommonModule, FormsModule, SousNatureForm],
  templateUrl: './sous-nature-add.html',
  styleUrl: './sous-nature-add.css'
})
export class SousNatureAdd implements OnInit{
  sousNature! : SousNature;
  ngOnInit(): void {
    this.sousNature = new SousNatureModel({
      idSousNature: -5,
      idNature: -5,
      nomSousNature: '',
      detailSousNature: '',
      status: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }


}
