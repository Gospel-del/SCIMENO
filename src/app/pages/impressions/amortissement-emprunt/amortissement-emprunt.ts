import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Element } from '../interfaces';


@Component({
  selector: 'app-amortissement-emprunt',
  imports: [CommonModule, FormsModule, MatProgressSpinnerModule, MatDialogModule, MatButtonModule],
  templateUrl: './amortissement-emprunt.html',
  styleUrl: '../impressions.css'//'./amortissement-emprunt.css'
})
export class AmortissementEmprunt implements OnInit {
  titleTable : string = "Tableau d'amortissement des emprunts";
  @Input() elements: Element[] = [];

  @ViewChild('revenusTable', { static: false }) revenusTable!: ElementRef<HTMLTableElement>;

  ngOnInit(): void {

  }

  getRange(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i );
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  }
}
