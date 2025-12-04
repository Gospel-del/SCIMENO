import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalFonctionService {

  mergeUnique<T>(target: T[], source: T[], keySelector: (item: T) => any): T[] {
    const existingKeys = new Set(target.map(keySelector));
    const newItems = source.filter(item => !existingKeys.has(keySelector(item)));
    return [...target, ...newItems];
  }

  isFullFloat(str: string): boolean {
    // autorise chiffres avec un seul point
    return /^-?\d+(\.\d+)?$/.test(str);
  }

  limitValue(value: string, min: number|null, max: number|null) {
    // Autoriser uniquement chiffres + virgule + point
    value = value.replace(/[^0-9.,]/g, "");
    // Remplacer virgule par point
    value = value.replace(",", ".");

    // si dernier caractère = point
    if (value.endsWith('.')) {

      // 1. Tester si `value + '0'` est un float
      const testValue = value + '0';

      console.log("value = nan", (parseFloat(testValue)))
      if (!this.isFullFloat(testValue)) {
        // invalide, supprimer le dernier point
        value = value.slice(0, -1);
      }

      return value;
    }


    let num = parseFloat(value);

    if (!isNaN(num)) {
      // Clamp min/max
      if (min !== null && num < min) num = min;
      if (max !== null && num > max) num = max;

      return num
    } else {
      // Si vide ou pas un nombre, on remet la chaîne
      return value
    }
  }
}
