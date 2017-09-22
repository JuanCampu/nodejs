import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ModalController, AlertController, Platform } from 'ionic-angular';

import { WebApiProvider } from '../../providers/web-api/web-api';
import { PhotoProvider } from '../../providers/photo/photo';
import { Storage } from '@ionic/storage';
import { Network } from '@ionic-native/network';
import { VehicleModalPage } from '../vehicle-modal/vehicle-modal';
import { NetworkServiceProvider } from '../../providers/network-service/network-service';
/**
 * Generated class for the RudVehiclePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-rud-vehicle',
  templateUrl: 'rud-vehicle.html',
})
export class RudVehiclePage {

  photo: any;
  listVehicles: Array<{title: string, plaque: string,brand: string, model: string,color: string,photo: string,quota: string,icon: string, vehicleId: string,vehicleDisable: boolean,showDetails: boolean}> = []; 
  vehicle = {"vehiculo_placa": "","vehiculo_marca": "","vehiculo_modelo": "","vehiculo_color": "","vehiculo_cupo": "","vehiculo_id": ""};
  vehiclesName: any; 
  hiddenEditBtn = true;
  realData: any;
  apiPath = {"directory": "","method": "","parameters": ""};// Arreglo para consultar el API
  loader:any;// Variable para cargar mesaje de loading
  idUser:any;// Almacena el Id del usuario Actual
  totalQuantity=10;//Parametro de busqueda - Señala que tantos vehiculos se muestran 
  isLoading: Boolean = true;
  
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public storage: Storage, 
    public webApi: WebApiProvider, 
    public loadingCtrl: LoadingController,
    public photoProvider : PhotoProvider,
    public modalCtrl: ModalController,
    public networkService:NetworkServiceProvider,
    public network: Network,
    public platform: Platform,
    public alertController: AlertController
  ) {
    
  }
  ionViewDidEnter(){
    this.storage.ready().then(() => {
      this.storage.get('userId').then((id) => {
        this.idUser = id;
        this.GetVehicleListNameAPI();
      });
    });
  }


  AddNewVehicle(){
    this.navCtrl.push('NewVehiclePage');
 }

  DeleteVehicle(vehicleId) {
      let alert = this.alertController.create({
      title: "¿Está seguro?",
      message: "Presione el botón borrar si quiere borrar definitvamente el vehículo, o cancelar en caso contrario.",
      buttons: [
            {
              text: 'Cancelar',
              role: 'cancel'
            },{
              text: "Borrar",
              handler: () => {
                this.CallDeleteAPI(vehicleId);
              }
            }
          ]
        });
        alert.present();
  }

   /******************************************************************
  ********************************************************************
                        Metodos modal - Google Maps
  *********************************************************************
  ********************************************************************/
  PresentPathModal(vehicleId) {
    let vehicleModal = this.modalCtrl.create(VehicleModalPage,{ vehicleId: vehicleId });
    vehicleModal.onDidDismiss(() => {
      this.GetVehicleListNameAPI();
    });
    vehicleModal.present();
  }
  /******************************************************************
  ********************************************************************
                      Fin    Metodos modal - Google Maps
  *********************************************************************
  ********************************************************************/

  /******************************************************************
  ********************************************************************
                        Metodos que llaman al API 
  *********************************************************************
  ********************************************************************/

  CallDeleteAPI(vehicleId){//Elimina un Vehiculo seleccionado
      let loader = this.loadingCtrl.create({
       content: "Eliminando Vehiculo"
      });
      loader.present();
      let settings = {"directory": "Vehicle/DeleteVehicle/","method": "POST","parameters": "vehicleId=" + vehicleId};
       this.webApi.CallWebApi(settings).then(
          data => {    
            loader.dismiss();    
            let alert = this.alertController.create({
              title: "Vehículo Eliminado",
              message: "El vehículo fue eliminado de manera exitosa.",
               buttons: [
                  { text: 'Aceptar', 
                    handler: () => {
                      this.GetVehicleListNameAPI();
                    }
                  }
                ]
            });
            alert.present();
            
          },
          error => {
            loader.dismiss();
            this.loader.dismiss(); 
            let title = "Revisa tu conexión a internet";
            let message = "No pudimos realizar la acción!";
            this.AlertInternet(title,message);  
            console.log(error);          
          }
        ).catch((error) => {
      let alert = this.alertController.create({
        title: "Ups! Hubo un error",
        message: "No pudimos eliminar tu vehículo, intenta más tarde.",
          buttons: [{ text: 'Aceptar' }]
      });
      alert.present();
      });
  }

/******************************************************************
                    
  ********************************************************************/
    GetVehicleListNameAPI(){
      this.apiPath.directory = 'Vehicle/GetListVehiclesName';
      this.apiPath.method = 'GET';
      this.apiPath.parameters =  '/'+this.idUser;
      this.LoadingMessage();
      this.API();  
    }
    API(){
      this.webApi.CallWebApi(this.apiPath).then(
          data => {
            this.loader.dismiss(); 
            if(data instanceof Array){
              this.vehiclesName = data;
              this.isLoading = false;
            }else if(data != "noconnection"){
              let title = "Ups! no tienes ningún vehículo";
              let message = "Te invitamos a crear uno.";
              this.AlertNotVehicle(title,message);
            }else{
              let alert = this.alertController.create({
                title: "Revisa tu conexión a internet",
                message: "No pudimos traer la información!",
                  buttons: [
                    { text: 'Aceptar', 
                      handler: () => {
                        this.navCtrl.push('StartPage');
                      }
                    }
                  ]
              });
              alert.present();
            }
          },
          error =>{
            console.log(error);
            this.loader.dismiss(); 
            let title = "Revisa tu conexión a internet";
            let message = "No pudimos traer la información!";
            this.AlertInternet(title,message);  
          }
      ).catch((error) => {
        console.log(error);
        let alert = this.alertController.create({
          title: "Ups! Hubo un error",
          message: "No pudimos actualizar  tu vehículo, intenta más tarde.",
            buttons: [{ text: 'Aceptar' }]
        });
        alert.present();
      });
    }
  /******************************************************************
  ********************************************************************
                      Fin   Metodos que llaman al API 
  *********************************************************************
  ********************************************************************/

 /******************************************************************
  ********************************************************************
                        Metodos de alerta y loading 
  *********************************************************************
  ********************************************************************/
      AlertNotVehicle($title, $message){
        let alert = this.alertController.create({
          title: $title,
          message: $message,
          buttons: [
            { text: 'Cancelar', 
              handler: () => {
                this.navCtrl.push('StartPage'); 
              }
            },
            { text: "Crear Vehículo", 
              handler:() =>{
                this.navCtrl.push('NewVehiclePage');
              }
            }
          ]
        });
        alert.present(); 
      }
      AlertInternet($title, $message){
        let alert = this.alertController.create({
          title: $title,
          message: $message,
          buttons: [
            { text: 'Aceptar', 
              handler: () => {
                this.navCtrl.push('StartPage'); 
              }
            }
          ]
        });
        alert.present(); 
      }
      AlertCustomMessage($title, $message){
        let alert = this.alertController.create({
          title: $title,
          message: $message,
            buttons: [
              { text: 'Aceptar', 
                handler: () => {
                    this.navCtrl.pop();
                }
              }
            ]
        });
        alert.present(); 
      }
      LoadingMessage(){
      this.loader = this.loadingCtrl.create({
        content: "Consultando Información"
      });
      this.loader.present();
      }
  /******************************************************************
  ********************************************************************
                      Fin  Metodos de alerta y loading 
  *********************************************************************
  ********************************************************************/

}
