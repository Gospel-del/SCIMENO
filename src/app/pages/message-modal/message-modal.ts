import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent, MatDialogActions } from '@angular/material/dialog';

@Component({
  selector: 'app-message-modal',
  imports: [MatDialogContent, MatDialogActions, CommonModule, FormsModule],
  templateUrl: './message-modal.html',
  styleUrl: './message-modal.css'
})
export class MessageModal {
  constructor(
    public dialogRef: MatDialogRef<MessageModal>,
    @Inject(MAT_DIALOG_DATA) public errors: string[]
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}
