import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the PathPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-path',
  templateUrl: 'path.html',
})
export class PathPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  GoPage(page){
    //parametro isOwner indica  la lista que se va a cargar. true = rutas suscritas de las que no es propietario. false = rutas de las cuales es propietario 
    if(page == "rutas"){
      this.navCtrl.push('ListPathPage',{isOwner : true});
    }else if(page == "suscritas"){
      this.navCtrl.push('ListPathPage',{isOwner : false});
    }else{
      this.navCtrl.push('NewPathPage');
    }
  }

}
