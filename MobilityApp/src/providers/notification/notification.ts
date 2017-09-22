import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers} from '@angular/http';
import { AlertController, App,ModalController } from 'ionic-angular';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

import { ShowProfilePage } from '../../pages/show-profile/show-profile';
import { Storage } from '@ionic/storage';

import { WebApiProvider } from '../web-api/web-api';
/*
  Generated class for the NotificationProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class NotificationProvider {
  private baseUrl = 'http://moviapi.azurewebsites.net/index.php/';
  alert: any;
  constructor(public http: Http, 
    public storage: Storage, 
    public alertCtrl: AlertController,
    public webApi: WebApiProvider,
    public modalCtrl: ModalController,private app: App) {
  }

  CallRegisterDevice( email,device, registrationId){
    let url = this.baseUrl + "TestNH/RegisterDevice";
		let headers = new Headers({
			'Content-Type': 'application/x-www-form-urlencoded'
		});
		let body = 'deviceId=' + device + '&tag=' + email +'&registrationId='+registrationId;
		let options = new RequestOptions({ headers: headers });
		return this.http.post(url, body, options).toPromise().catch(this.handleError).then(this.extractData);
  }
  SendMessage(tag, message){
    let url = this.baseUrl + 'TestNH/Notification/'+ message +"/"+tag;
		return this.http.get(url).toPromise().catch(this.handleError).then(this.extractData);
  }
  RegisterDevice(){
    this.storage.ready().then(()=>{
      this.storage.get("deviceId").then((device) =>{
        this.storage.get("registrationId").then((registrationId) => {
          this.storage.get('email').then((email) =>{
            if(device != null && registrationId != null){
              if(email == "" || email == null){
                this.CallRegisterDevice("email", device, registrationId);
              }else{
                this.CallRegisterDevice(email, device, registrationId);                
              }
            }
          });
        });
      });
    });
  }
  OpenNotification(notification){
    console.log(notification);
    switch (notification.additionalData.type) {
      case "RequestSuscription":
        this.RequestNotification(notification);
        break;
      case "InitializePath":
        this.InitializePathNotification(notification);
        break;
      case "StartSuscriptorPath":
        this.StartSuscriptorPath(notification);
        break;
      case "InitializeOwnerPath":
        this.InitializeOwnerPath(notification);
        break;
      case "AcceptSubscription":
        this.AcceptSubscription(notification);
        break;
      case "CancelSubscription":
        this.CancelSubscription(notification);
        break;
      default: 
        console.log("Entro por el default del switch");
        break;
    }
    
  }
  CancelSubscription(notification){
    this.alert = this.alertCtrl.create({
      title: notification.title,
      message: notification.message,
        buttons: [{ text: "Está bien"}]
    });
    this.alert.present();
  }
  AcceptSubscription(notification){
    this.alert = this.alertCtrl.create({
      title: notification.title,
      message: notification.message,
        buttons: [{ text: "Está bien"}]
    });
    this.alert.present();
  }
  RequestNotification(notification){
    if(this.alert != null){
      this.alert.dismiss();
    }
    this.alert = this.alertCtrl.create({
        title: notification.title,
        message: notification.message,
        enableBackdropDismiss:false,
          buttons: [
            { text: "Denegar", handler: () => {
              this.alert.dismiss();
            }},
            { text: 'Revisar', 
              handler: () => {
                this.alert.dismiss();
                let subscriptionModal = this.modalCtrl.create(ShowProfilePage, {pathId: notification.additionalData.PathId, 
                  subscriptionId: notification.additionalData.SuscriptionId,
                  userId: notification.additionalData.UserId});
                subscriptionModal.present();
              }
            }
          ]
    });
    this.alert.present();
  }
  InitializePathNotification(notification){
    if(this.alert != null){
      this.alert.dismiss();
    }
    this.alert = this.alertCtrl.create({
        title: notification.title,
        message: notification.message
    });
    this.alert.present(); 
  }
  StartSuscriptorPath(notification){
    if(this.app.getActiveNav().getActive().name != "TravelPage"){
      let alert = this.alertCtrl.create({
        title: ""+notification.title,
        message: ""+notification.message,
        buttons: [{ text: "Está bien"}]
      });
      alert.present();
      this.app.getActiveNav().push("TravelPage", {path: notification.additionalData.PathId, suscriptor: true});
    }
  }
  InitializeOwnerPath(notification){
    if(this.alert != null){
      this.alert.dismiss();;
    }
    this.alert = this.alertCtrl.create({
      title: ""+notification.title,
      message: ""+notification.message,
      enableBackdropDismiss: false,
        buttons: [
          {
            text: 'No', 
            handler: () => {
              let path = {
                pathId: notification.additionalData.PathId,
                start: false
              }
              let settings = {"directory": "Path/InitializePath",
              "method": "POST",
              "parameters": "path=" +JSON.stringify(path)};
              this.webApi.CallWebApi(settings);
              this.alert.dismiss();
              this.storage.ready().then(()=>{
                this.storage.set('travelState', 0);
              });
              return false
            }
          },{ 
            text: 'Por supuesto', 
            handler: () => {
              let path = {
                pathId: notification.additionalData.PathId,
                start: true
              }
              let settings = {"directory": "Path/InitializePath",
              "method": "POST",
              "parameters": "path=" +JSON.stringify(path)};
              this.alert.dismiss();
              this.webApi.CallWebApi(settings).then(() =>{
                this.app.getActiveNav().push("TravelPage", {path: notification.additionalData.PathId});
              });
              return false;
            }
          }
        ]
    });
    this.alert.present();
  }

  private extractData(res: Response) {
    console.log(res);
    let body = res.json();
    return body;
  }

  private handleError(res: Response | any) {
    console.log(res);
    return Promise.reject("Hubo un error conectando al servidor");
  }
}
