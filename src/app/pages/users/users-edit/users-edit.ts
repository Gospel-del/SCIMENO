import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Utilisateur } from '../user';
import { UserService } from '../../../core/services/user.service';
import { UserForm } from '../user-form/user-form';

@Component({
  selector: 'app-users-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, UserForm],
  templateUrl: './users-edit.html',
  styleUrl: './users-edit.css'
})
export class UsersEditComponent  implements OnInit {
  user!: Utilisateur;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    const user = this.userService.getUserToEdit();
    if (user) {
      this.user = user;
    } else {
      // Si aucun client trouvé, redirige ou gère le cas
      console.error("Aucun user à éditer !");
    }
    this.userService.clearUserToEdit();
  }
}
