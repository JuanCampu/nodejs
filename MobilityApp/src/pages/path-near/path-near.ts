import { Component } from '@angular/core';
import { IonicPage, NavController,AlertController, NavParams,LoadingController, ModalController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { WebApiProvider } from '../../providers/web-api/web-api';
import { NearModalPage } from '../near-modal/near-modal';
/**
 * Generated class for the PathNearPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-path-near',
  templateUrl: 'path-near.html',
})
export class PathNearPage {

  dots:any; // Arreglo donde se almacenan los puntos para realizar la consulta
  searchedName: string;
  apiPath = {"directory": "","method": "","parameters": ""};// Arreglo para consultar el API
  paths:any; //arreglo donde se almacenan todas las rutas cercanas que esten activas
  loader:any;
 

  constructor(
    public navCtrl: NavController,
    public storage: Storage, 
    public webApi: WebApiProvider,
    public loadingCtrl: LoadingController,
    public alertController: AlertController,
    public modalCtrl: ModalController,
    public navParams: NavParams) {
        this.dots = navParams.get("dots");
        if(navParams.get("dots")){
          this.dots = navParams.get("dots");
          this.ChargePathsList();
        }else if(navParams.get("name")){
          this.searchedName = navParams.get("name");
          this.ChargePathsListByName();
        }
  }
 
  ionViewDidLoad() {
    let message = "Consultando la información";
    this.LoadingMessage(message);
  }

  ChargePathsList(){
    this.storage.ready().then(() =>{
      this.storage.get('userId').then(Id =>{
        this.apiPath.directory = 'Path/GetPathsLimitNotOwnerT';
        this.apiPath.method = 'GET';
        this.apiPath.parameters =  '/'+this.dots.ruta_inicio_latitud +'/'+this.dots.ruta_inicio_longitud+'/'+this.dots.ruta_destino_latitud+'/'+this.dots.ruta_destino_longitud+'/'+Id;
        this.webApi.CallWebApi(this.apiPath).then(
          data =>{
            if(data != false && data != "isSuscribed"){
              this.loader.dismiss();
              this.paths = data;
            }else if (data == "isSuscribed") {
              this.loader.dismiss();
              let title = "Ups! Usted ya se ecuentra suscrito a una ruta.";
              let message = "Suscripción activa.";
              this.AlertMessage(title,message);  
            } else {
              this.loader.dismiss();
              let title = "Ups! No se encontraron rutas cercanas a tu ruta.";
              let message = "Prueba con otra ruta o intentalo más tarde.";
              this.AlertMessage(title,message);  
            }
          },error =>{
            this.AlertErrorMessage("Ups! Problemas con la conexión a internet!", "Por favor revisa tu conexión e intenta de nuevo.");
            console.log("Catch Error: " + error);
          }).catch( (error) =>{   
            this.AlertErrorMessage('No tenemos acceso al servidor', 'Lo sentimos');   
            console.log("Catch Error: " + error);
          });
      });
    });
  }

  ChargePathsListByName(){
    this.storage.ready().then(() =>{
      this.storage.get('userId').then(Id =>{
        this.apiPath.directory = 'Path/GetPathsNotOwnerByName';
        this.apiPath.method = 'GET';
        this.apiPath.parameters = '/'+Id +'/'+this.searchedName;
        this.webApi.CallWebApi(this.apiPath).then(
          data =>{
            if(data != false && data != "isSuscribed" ){
              this.loader.dismiss();
              this.paths = data;
            }else if (data == "isSuscribed") {
              this.loader.dismiss();
              let title = "Ups! Usted ya se ecuentra suscrito a una ruta.";
              let message = "Suscripción activa.";
              this.AlertMessage(title,message);  
            }else{
              this.loader.dismiss();
              let title = "Ups! No se encontraron rutas activas con este nombre.";
              let message = "Prueba con otro nombre  o intentalo más tarde.";
              this.AlertMessage(title,message);  
            }
          },error =>{
            this.AlertErrorMessage("Ups! Problemas con la conexión a internet!", "Por favor revisa tu conexión e intenta de nuevo.");
            console.log("Catch Error: " + error);
          }).catch( (error) =>{      
            this.AlertErrorMessage('No tenemos acceso al servidor', 'Lo sentimos');
            console.log("Catch Error: " + error);
          });
      });
    });
  }

  PresentPathModal(pathId,driverId) {
    
    let nearModal = this.modalCtrl.create(NearModalPage,{pathId: pathId, driverId: driverId});
    nearModal.present();
  }

  AlertMessage(title, message){
    let alert = this.alertController.create({
      title: title,
      message: message,
      buttons: [{ 
        text: 'Aceptar', 
        handler: () => {
          this.navCtrl.pop();
        }
      }]
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

  LoadingMessage(message){
    this.loader = this.loadingCtrl.create({
      content: message
    });
    this.loader.present();
  }

}
