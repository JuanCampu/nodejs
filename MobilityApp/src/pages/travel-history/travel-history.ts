import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,LoadingController,AlertController, ModalController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { WebApiProvider } from '../../providers/web-api/web-api';

import { TravelModalPage } from '../travel-modal/travel-modal';
/**
 * Generated class for the TravelHistoryPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-travel-history',
  templateUrl: 'travel-history.html',
})
export class TravelHistoryPage {

  trayectorys = {"total_viajes": 0 ,"total_kilometros": 0, "total_arboles": 0};
  apiPath = {"directory": "","method": "","parameters": ""};
  isLoading = true;
  trips:any;
  userId:any;

  constructor(
    public navCtrl: NavController, 
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public webApi: WebApiProvider,
    public modalCtrl: ModalController,
    public alertController: AlertController,
    public navParams: NavParams) {
  }

  ionViewDidLoad() {
    this.storage.ready().then(() => {
      this.storage.get('userId').then((Id) => {
        this.userId = Id;
        this.CallGetTrajectoryAPI(Id);
      });
    });
  }

  CallGetTrajectoryAPI(userId){
    this.apiPath.directory = 'Trajectory/GetTrajactorys';
    this.apiPath.method = 'GET';
    this.apiPath.parameters = '/'+userId;
    let loader = this.loadingCtrl.create({
      content: "Cargando información..."
    });
    loader.present();
    this.webApi.CallWebApi(this.apiPath).then(
        data => {
  
          if(data == false ){
            let title = "Ups! no tienes ninguna ruta terminada";
            let message =  "Te invitamos a buscar una viaje compartido.";
            this.AlertMessage(title,message);
          }else{  
            if(data instanceof Array){
              this.trips = data;
              data.forEach((value, array, index) => {
                this.trayectorys.total_viajes = array + 1;
                this.trayectorys.total_kilometros += Number(value.trayecto_metros);
              });
              this.trayectorys.total_kilometros = Math.floor((this.trayectorys.total_kilometros/1000));
              this.trayectorys.total_arboles = Math.floor((this.trayectorys.total_kilometros/121.6));
            }
            this.isLoading = false;
          }        
          loader.dismiss();   
        },
        error =>{
         
          loader.dismiss();
          this.AlertErrorMessage("Ups! Problemas con la conexión a internet!", "Por favor revisa tu conexión e intenta de nuevo.");
          console.log(error);
        }
    ).catch((error) => {

      loader.dismiss();
      this.AlertErrorMessage("Ups! Problemas con la conexión a internet!", "Por favor revisa tu conexión e intenta de nuevo.");
      console.log(error);
    });
  }

  PresentTravelModal(pathId,subsId,metros,fecha,horaInicio,horaFin) {
    let travelModal = this.modalCtrl.create(TravelModalPage,{ pathId: pathId ,userId: this.userId,subscriptionId: pathId,metros: metros,fecha: fecha,horaInicio: horaInicio,horaFin: horaFin});
    travelModal.present();
  }


  AlertMessage(title,message){
    let alert = this.alertController.create({
        title: title,
        message: message,
          buttons: [
            { text: 'Regresar', 
              handler: () => {
                  this.navCtrl.pop();
              }
            },
            { text: "Buscar ruta", 
              handler:() =>{
                this.navCtrl.push('SearchPathPage');
              }
            }
          ]
      });
      alert.present(); 
  }

  AlertErrorMessage(title, message){
    let alert = this.alertController.create({
      title: title,
      message: message,
      buttons: [{ 
        text: 'Aceptar', 
        handler: () => {
          this.navCtrl.push('StartPage');
        }
      }]
    });
    alert.present(); 
  } 

}
