import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { Storage } from '@ionic/storage';

import { WebApiProvider } from '../../providers/web-api/web-api';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  apiPath = {"directory": "","method": "","parameters": ""};
  constructor(public navCtrl: NavController, public storage: Storage, public webApi: WebApiProvider) {

  }
  ionViewDidEnter() {
    this.storage.ready().then(() => {
      this.storage.get('emailState').then((name) =>{
        this.storage.get('travelState').then((travelState) =>{
          if(name == 'register'){  
            if(travelState == 1){
              this.storage.get("travelId").then((travelId) =>{
                this.storage.get("travelHour").then((travelHour)=>{
                  this.storage.get("travelTime").then((travelTime)=>{
                    let dateNow = new Date();
                    let dateSchedule = new Date(travelHour);
                    let difference = dateNow.getTime() - dateSchedule.getTime();
                    //No había iniciado la ruta
                    if(difference < (travelTime*60000)){
                      setTimeout(() => {this.StartPath(travelId)}, ((travelTime*60000)-difference));
                    }else if(difference < (60000*(5+travelTime))){
                      this.StartPath(travelId);
                    }else if(difference < (60000*(10+travelTime))){
                      this.PathNotStartedWarning(travelId);
                    }else{
                      this.PathNotStarted(travelId);
                    }
                  });
                });
              });
              this.navCtrl.setRoot('StartPage');
            }else if(travelState == 2){
              this.storage.get("travelId").then((travelId) =>{
                this.navCtrl.push("TravelPage", {path: travelId});
              });
            }else{
              this.navCtrl.setRoot('StartPage');
            }
          }else if(name == 'inProcess'){
            this.navCtrl.setRoot('RegisterPage');
          }else{
            this.navCtrl.setRoot('TutorialPage');
          }
        });
      });
    });
  }
  PathNotStarted(pathId){
    this.apiPath.directory = 'Path/PathNotStarted';
    this.apiPath.method = 'POST';
    this.apiPath.parameters = 'pathId='+JSON.stringify(pathId);
    this.webApi.CallWebApi(this.apiPath);
    this.storage.ready().then(()=>{
      this.storage.set('travelState', 0);
    });
  }
  PathNotStartedWarning(pathId){
    let path = {
      pathId: pathId,
      start: false
    }
    this.apiPath.directory = 'Path/StartPath';
    this.apiPath.method = 'POST';
    this.apiPath.parameters = 'path='+JSON.stringify(path);
    this.webApi.CallWebApi(this.apiPath);
    this.storage.ready().then(()=>{
      this.storage.set('travelState', 0);
    });
  }
  StartPath(pathId){
    this.storage.ready().then(()=>{
      this.storage.get('userId').then((id) => {
        this.apiPath.directory = 'Path/StartPath';
        this.apiPath.method = 'POST';
        this.apiPath.parameters = 'pathId='+pathId+'&userId='+id;
        this.webApi.CallWebApi(this.apiPath);
      });
    });
  }
}
