import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the BicyclePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-bicycle',
  templateUrl: 'bicycle.html',
})
export class BicyclePage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  GoPage(page){
    if(page == "bicycle-map"){
      this.navCtrl.push('BicycleMapPage');
    }else if(page == "cycling-trip"){
      this.navCtrl.push('CyclingTripPage');
    }else{
      this.navCtrl.push('BicycleHistoryPage');
    }
  }

}
