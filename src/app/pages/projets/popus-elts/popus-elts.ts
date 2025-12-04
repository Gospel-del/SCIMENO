import { RegleCalcul } from './../../regle-calculs/regle-calcul';

import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialog } from '../../confirm-dialog/confirm-dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { CommonModule, JsonPipe } from '@angular/common';
import { SousNature } from '../../sous-natures/sous-nature';
import { Nature } from '../../natures/nature';
import { TypeCategorie } from '../../categories';
import { NaturesService } from '../../../core/services/natures.service';
import { SousNaturesService } from '../../../core/services/sous-natures.service';
import { forkJoin } from 'rxjs';
import { GlobalFonctionService } from '../../../core/services/global-fonction.service';
import { RegleCalculService } from '../../../core/services/regle-calcul-service';
import { RegleCalculs } from '../../regle-calculs/regle-calculs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormField, MatFormFieldModule, MatLabel } from "@angular/material/form-field";
import { MatInputModule } from '@angular/material/input';

interface Element {
  data : SousNature_Nature;
  selected : boolean;
}

interface SousNature_Nature{
  sousNature: SousNature;
  nature: Nature;
}

@Component({
  selector: 'app-popus-elts',
  imports: [
    MatInputModule,
    MatInputModule,
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatInputModule,
    MatDialogModule,
    MatProgressSpinnerModule,

    CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatProgressSpinnerModule, MatFormField, MatLabel, MatPaginator],
  templateUrl: './popus-elts.html',
  styleUrl: './popus-elts.css'
})
export class PopusElts implements OnInit{
  selectTitle: string = "Tout selectionner";
  isAllSelect: boolean = false;
  isLoading: boolean = false;
  elements: Element[] = [];
  pageIndex: number = 1;
  pageSize: number = 10;
  Math = Math;
  total: number = 0;
  natures: Nature[] = [];
  sousNatures: SousNature[] = [];
  newSousNatures: SousNature[] = [];
  typeCategorieList = Object.entries(TypeCategorie).map(([key, value]) => ({
    key,
    label: value
  }));
  categorieMap: Record<string, string> = {};
  sousNature_natures: SousNature_Nature[] = [];
  displayedColumns: string[] = ['nom', 'nature', 'selection'];
  dataSource!: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    public dialogRef: MatDialogRef<PopusElts>,
    private natureService: NaturesService,
    private sousNatureService: SousNaturesService,
    private regleCalculService: RegleCalculService,
    private globalFonctionService: GlobalFonctionService,
    @Inject(MAT_DIALOG_DATA) public data: {
      title: string;
      modulName: string;
      valid: string;
      cancel: string }
  ) {}

  ngOnInit(): void {
    this.categorieMap = this.typeCategorieList.reduce((acc, item) => {
      acc[item.key] = item.label;
      return acc;
    }, {} as Record<string, string>);
    //this.loadNatures();
    this.loadPageData();
  }

  toggleSelected(elt: any) {
    elt.selected = !elt.selected;
  }


  loadPageData(): void {
    this.isLoading = true;
    forkJoin({
      sousNatures: this.sousNatureService.listSousNatures(this.pageIndex, this.pageSize, this.data.modulName),
      natures: this.natureService.listNatures(1, 1000, this.data.modulName),
      regleCalculs: this.regleCalculService.listRegleCalculs(1, 1000, [this.data.modulName]),
    }).subscribe({
      next: ({ sousNatures, natures, regleCalculs }) => {
        this.sousNatures = sousNatures.data.sous_natures;
        //this.total = sousNatures.data.total;
        this.natures = natures.data.base_natures;
        this.newSousNatures = this.globalFonctionService.mergeUnique(this.newSousNatures, this.sousNatures, n => n.idSousNature);
        console.log("regleCalculs = ", regleCalculs.data.regles_calcul);
        this.buildSousNatureNature(regleCalculs.data.regles_calcul);
        this.isLoading = false;
        //this.cdr.detectChanges();
      },
      error: () => (this.isLoading = false)
    });
  }

  buildSousNatureNature(regleCalculs: RegleCalcul[]): void {
    this.sousNature_natures = this.newSousNatures.map(sn => {
      const nature = this.natures.find(n => n.idNature === sn.idNature);
      return { sousNature: sn as SousNature, nature: nature ?? {} as Nature };
    });

    this.elements = this.sousNature_natures
    .filter(e => {
      const idSousNature = e.sousNature.idSousNature;
      // Vérifie si cet id n’existe pas déjà dans regleCalculs
      const notInRegleCalculs = !regleCalculs.some(
        elt => elt.idSousNature === idSousNature &&
        !elt.detailRegleCalcul.includes("tauxVariable")
      );
      return notInRegleCalculs;
    })
    .filter(e => e.sousNature.idSousNature >= 0)
    .map(data => ({
      data,
      selected: false
    }));

    this.dataSource = new MatTableDataSource(this.elements);

  }

  onConfirm(): void {
    const selected: Element[] = this.elements.filter(e => e.selected);
    console.log("onConfirm = ", selected);
    this.dialogRef.close(selected);
  }

  onCancel(): void {
    const selected: Element[] = [];
    this.dialogRef.close(selected);
  }

  selectAll(): void{
    console.log("selectAll")
    this.isAllSelect = !this.isAllSelect;
    this.elements.forEach(e => e.selected = this.isAllSelect);
    if(this.isAllSelect){
      this.selectTitle = "Tout déselectionner";
    }else{
      this.selectTitle = "Tout selectionner";
    }
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
