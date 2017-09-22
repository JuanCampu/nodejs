import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams} from 'ionic-angular';
import { SearchNamePage } from '../search-name/search-name';
import { SearchGpsPage } from '../search-gps/search-gps';
/**
 * Generated class for the SearchPathPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */


@IonicPage()
@Component({
  selector: 'page-search-path',
  templateUrl: 'search-path.html',
})
export class SearchPathPage {


  
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams
    ) {}
  

  SearchBy(nombre){
    if(nombre){
      this.navCtrl.push(SearchNamePage);
    }else{
      this.navCtrl.push(SearchGpsPage);
    }
  }

}
