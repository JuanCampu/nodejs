import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Storage } from '@ionic/storage';
/**
 * Generated class for the TutorialPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-tutorial',
  templateUrl: 'tutorial.html',
})
export class TutorialPage {

  visited:boolean = false;
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public storage : Storage) {

  }
  
  ionViewDidLoad(){
    this.storage.ready().then(() => {
      this.storage.get('userId').then((Id) => {
       if(Id){
          this.visited = true;
        }
      });
    });
  }

  next() {
    this.storage.ready().then(() => {
      this.storage.get('state').then((value) => {
       if(value == 'register'){
          this.navCtrl.push('StartPage');
        }else{
          this.navCtrl.push('RegisterPage');
        }
      });
    });
  }

  GoStart(){
    this.navCtrl.push('StartPage');
  }
}
