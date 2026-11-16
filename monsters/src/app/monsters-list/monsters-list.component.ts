import {ChangeDetectionStrategy,Component,input} from '@angular/core';
import type {Character,StatKey} from '../catalog';
@Component({selector:'app-monsters-list',standalone:true,templateUrl:'./monsters-list.component.html',styleUrl:'./monsters-list.component.scss',changeDetection:ChangeDetectionStrategy.OnPush})
export class MonstersListComponent {
 readonly characters=input.required<readonly Character[]>();
 readonly attributes:readonly (readonly [StatKey,string])[]=[['strength','Força'],['dexterity','Destreza'],['power','Poder'],['defense','Defesa'],['intelligence','Inteligência']];
}
