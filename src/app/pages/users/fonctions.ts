export enum FonctionUser {
  ADMIN = "admin",
  STANDARD = "standard",
  LIMITE = "limite",
}

export const FonctionUserLabel: Record<FonctionUser, string> = {
  [FonctionUser.ADMIN]: "Administrateur",
  [FonctionUser.STANDARD]: "Utilisateur standard",
  [FonctionUser.LIMITE]: "Utilisateur limité",
};
