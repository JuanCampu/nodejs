import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,LoadingController,AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { WebApiProvider } from '../../providers/web-api/web-api';

/**
 * Generated class for the BicycleHistoryPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-bicycle-history',
  templateUrl: 'bicycle-history.html',
})
export class BicycleHistoryPage {
  trayectorys = {"total_viajes": 0 ,"total_kilometros": 0, "total_arboles": 0};
  apiPath = {"directory": "","method": "","parameters": ""};
  isLoading = true;
  constructor(public navCtrl: NavController, 
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public webApi: WebApiProvider,
    public alertController: AlertController,
    public navParams: NavParams) {
  }

  ionViewDidLoad() {
    this.storage.ready().then(() => {
      this.storage.get('userId').then((Id) => {
        this.CallGetTrips(Id);
      });
    });
  }

  CallGetTrips(userId){
    this.apiPath.directory = 'Bicycle/GetCyclingTrip';
    this.apiPath.method = 'GET';
    this.apiPath.parameters = '/'+userId;
    let loader = this.loadingCtrl.create({
      content: "Cargando Biciviajes..."
    });
    loader.present();
    this.webApi.CallWebApi(this.apiPath).then(
        data => {
          loader.dismiss();
          if(data == false ){
            let title = "Ups! no tienes ninguna ruta terminada";
            let message =  "Te invitamos a crear biciviajes";
            this.AlertMessage(title,message);
          }else{
            if(data instanceof Array){
              data.forEach((value, array, index) => {
                this.trayectorys.total_viajes = array + 1;
                this.trayectorys.total_kilometros += Number(value.bicitrayecto_metros);
              });
              this.trayectorys.total_kilometros = Math.round((this.trayectorys.total_kilometros/1000) * 100) / 100; // Redondear a dos decimales 
              this.trayectorys.total_arboles = Math.floor((this.trayectorys.total_kilometros/121.6));
            }
            this.isLoading = false;
          }
          
        },
        error =>{
          this.isLoading = false;
          loader.dismiss();
          this.AlertErrorMessage("Ups! Problemas con la conexión a internet!", "Por favor revisa tu conexión e intenta de nuevo.");
          console.log(error);
        }
    ).catch((error) => {
      this.isLoading = false;
      loader.dismiss();
      this.AlertErrorMessage("Ups! Problemas con la conexión a internet!", "Por favor revisa tu conexión e intenta de nuevo.");
      console.log(error);
    });
  }

  AlertMessage(title,message){
    let alert = this.alertController.create({
        title: title,
        message: message,
          buttons: [
            { text: 'Está bien', 
              handler: () => {
                  this.navCtrl.pop();
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
