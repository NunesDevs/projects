import {ChangeDetectionStrategy,Component,computed,signal} from '@angular/core';
import {MonstersListComponent} from './monsters-list/monsters-list.component';
import data from '../assets/data/starwars.data.json';
import {validateCatalog,viewCatalog} from './catalog';
@Component({selector:'app-root',standalone:true,imports:[MonstersListComponent],templateUrl:'./app.component.html',styleUrl:'./app.component.scss',changeDetection:ChangeDetectionStrategy.OnPush})
export class AppComponent {
 readonly characters=validateCatalog(data);
 readonly query=signal('');readonly role=signal('all');readonly sort=signal('name');
 readonly visible=computed(()=>viewCatalog(this.characters,{query:this.query(),role:this.role(),sort:this.sort()}));
 reset():void{this.query.set('');this.role.set('all');this.sort.set('name');}
}
