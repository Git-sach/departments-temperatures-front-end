import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from '@angular/core';
import { Department } from 'src/app/shared/interfaces/department.interface';
import { Color } from 'src/app/shared/valueObjects/color';
import { TemperatureType } from '../../states/temperature-departments-state.service';

@Component({
  selector: 'app-svg-departments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './svg-departments.component.html',
  styleUrls: ['./svg-departments.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SvgDepartmentsComponent implements OnChanges {
  @Input({ required: true }) departmentsWichTemperatures: Department[] | null;

  @Input({ required: true }) selectedDepartment: Department | null = null;

  @Input({ required: true }) selectedTemperatureType: TemperatureType;

  @Output() departmentEmitter = new EventEmitter<Department>();

  public tMax: number = 0;
  public tMin: number = 0;

  departmentWichColors: Department[] = [];

  private numberOfColorsInGradient = 50;
  private negativeColor = new Color('4F2206');
  private positiveColor = new Color('F76B15');

  public gradientOfColor = this.negativeColor.creatGradient(
    this.positiveColor,
    this.numberOfColorsInGradient
  );

  // Obligé de passer pas un onChange car l'opération dépend de 2 inputs
  ngOnChanges(): void {
    if (this.departmentsWichTemperatures && this.selectedTemperatureType) {
      this.departmentWichColors = this.setColorToDepartments(
        this.departmentsWichTemperatures
      );
    }
  }

  selectDepartment(department: Department) {
    this.departmentEmitter.emit(department);
  }

  getTemperatureMinOfDepartments(departments: Department[]): number {
    return departments.reduce((acc, current) =>
      current[this.selectedTemperatureType]! <
      acc[this.selectedTemperatureType]!
        ? current
        : acc
    )[this.selectedTemperatureType]!;
  }

  getTemperatureMaxOfDepartments(departments: Department[]): number {
    return departments.reduce((acc, current) =>
      current[this.selectedTemperatureType]! >
      acc[this.selectedTemperatureType]!
        ? current
        : acc
    )[this.selectedTemperatureType]!;
  }

  /**
   * Applique des couleurs à une liste de départements en fonction de leurs températures moyennes.
   * Les couleurs sont déterminées en utilisant une échelle de couleur définie par un gradient.
   *
   * @param departments La liste des départements à laquelle appliquer les couleurs.
   * @returns Une nouvelle liste de départements avec les couleurs attribuées.
   */
  setColorToDepartments(departments: Department[]): Department[] {
    this.tMax = this.getTemperatureMaxOfDepartments(departments);
    this.tMin = this.getTemperatureMinOfDepartments(departments);

    let departmentsCopy: Department[] = JSON.parse(JSON.stringify(departments));

    departmentsCopy.map((department) => {
      const indexOfGradientColor = this.findNumericValueOfAnalogData(
        department[this.selectedTemperatureType]!,
        this.tMax,
        this.tMin,
        this.numberOfColorsInGradient
      );

      const color = `#${this.gradientOfColor[indexOfGradientColor].valueHexa}`;

      department.color = color;

      this.departmentWichColors = departmentsCopy;
    });

    return departmentsCopy;
  }

  /**
   * Échantillonne une valeur analogique en fonction des valeurs minimale et maximale, produisant un résultat numérique.
   *
   * Cette méthode prend en compte une valeur analogique, la valeur maximale et minimale possibles,
   * ainsi que le nombre d'échantillons pour déterminer la position numérique échantillonnée.
   *
   * exemple:
   * valeur min 1.1
   * valeur max 8.9
   * nbr echantillonage 10
   *
   * Pour la valeur numérique 1.1 nous avons 0
   * Pour la valeur numérique 8.9 nous avons 9
   *
   * @param value La valeur analogique à échantillonner.
   * @param valueMax La valeur maximale possible dans la plage de valeurs analogiques.
   * @param valueMin La valeur minimale possible dans la plage de valeurs analogiques.
   * @param sampling Le nombre d'échantillons considérés pour l'échantillonnage.
   * @returns La position échantillonnée, exprimée en valeur numérique entière, comprise entre 0 et le nombre d'échantillons - 1.
   */
  findNumericValueOfAnalogData(
    value: number,
    valueMax: number,
    valueMin: number,
    sampling: number
  ): number {
    return Math.floor(
      (value - valueMin) * ((sampling - 1) / (valueMax - valueMin))
    );
  }

  get tMaxCeil() {
    return Math.ceil(this.tMax);
  }
  get tMoyRounded() {
    return Math.round((this.tMax + this.tMin) / 2);
  }
  get tMinFloor() {
    return Math.floor(this.tMin);
  }
}
