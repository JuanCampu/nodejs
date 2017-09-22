import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Network } from '@ionic-native/network';
import { Subscription} from 'rxjs/Subscription';
import {  ToastController } from 'ionic-angular';
/*
  Generated class for the NetworkServiceProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class NetworkServiceProvider {
  
  public connectionState:boolean = true;
  toastApp: any;
  connected: Subscription;  
  disconnected: Subscription;

  constructor(public http: Http,  public toast: ToastController, public network: Network ) {
   
  }

  displayNetworkUpdate(connectionState: string){
    if(typeof this.toastApp !== 'undefined'){
      this.toastApp.dismiss(); 
    }
    //let networkType = this.network.type;
   /*  if(connectionState == "online"){
        connectionState = "está conectado";
    }else{
        connectionState = "no está conectado";
    }

    if(networkType == "none"){
        networkType = "la red";
    } */
    this.toastApp = this.toast.create({
      //message: `Usted  ${connectionState} a ${networkType}`,
      message: `No hay conexión a internet!`,
      duration: 5000,
      showCloseButton: true,
      closeButtonText: 'X',
      dismissOnPageChange: true
    });
    this.toastApp.present(); 
  }

  SubscribreConnection() {
    this.connected = this.network.onConnect().subscribe(data => {
      this.connectionState = true;
    }, error => console.error(error));

    this.disconnected = this.network.onDisconnect().subscribe(data => {
      this.connectionState = false;
      this.displayNetworkUpdate(data.type);
      }, error => console.error(error));
  }



}
