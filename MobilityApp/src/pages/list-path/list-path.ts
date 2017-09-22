import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, LoadingController,AlertController,ModalController } from 'ionic-angular';

import { Storage } from '@ionic/storage';
import { WebApiProvider } from '../../providers/web-api/web-api';
import { PathModalPage } from '../path-modal/path-modal';
/**
 * Generated class for the ListPathPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-list-path',
  templateUrl: 'list-path.html',
})
export class ListPathPage {

  paths:any;
  apiPath = {"directory": "","method": "","parameters": ""};
  owner:Boolean;
  title:String;
  alert: any;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public webApi: WebApiProvider,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public alertController: AlertController,
    public modalCtrl: ModalController,
    public actionSheetCtrl: ActionSheetController
  ) {
    this.owner  = navParams.get("isOwner"); 
  }

  ionViewDidLoad() {
     this.storage.ready().then(() => {
      this.storage.get('userId').then((Id) => {
        if(this.owner){
          this.title = "Mis rutas";
          this.CallGetOwnerPathsAPI(Id);
        }else{
          this.title = "Rutas suscritas";
          this.CallGetPathsAPI(Id);
        }
        
      });
    });
    
  }

  PresentOwnerSheet(pathId){
    let actionSheet = this.actionSheetCtrl.create({
      title: "Elige una opción",
      buttons: [{
        text:"Detalle",
        handler: () =>{
          this.PresentPathModal(pathId);
          return true;
        }
      },{
        text: "Borrar",
        handler: () =>{
          setTimeout(()=>{
            this.DeletePath(pathId);
          }, 400);
          return true;
        }
      },{
        text: 'Cancelar',
        role: 'cancel'
      }]
    });
    actionSheet.present();
  }
  PresentNotOwnerSheet(subscriptionId, pathId){
    let actionSheet = this.actionSheetCtrl.create({
      title: "Elige una opción",
      buttons: [{
        text:"Viaje en curso",
        handler: () =>{
          this.GoToTravel(pathId);
          return true;
        }
      },{
        text:"Borrar",
        handler: () =>{
          setTimeout(() =>{
            let alert2 = this.alertController.create({
              title: "¿Está seguro de borrar?",
              message:"Si se borra esta suscripcion, el viaje que se está haciendo no contará en tu historial",
              buttons: [{text: "  No  "},
                {
                  text: "   Sí   ",
                  handler: () =>{
                    this.DeleteSubscription(subscriptionId);
                  }
                }
              ]
            });
            alert2.present();
          }, 400);
          return true;
        }
      },{
        text: 'Cancelar',
        role: 'cancel'
      }]
    });
    actionSheet.present();
  }
  GoToTravel(pathId){
    this.apiPath.directory = 'Path/GetPathById';
    this.apiPath.method = 'GET';
    this.apiPath.parameters = '/'+pathId;
    let loader = this.loadingCtrl.create({
      content: "Obteniendo ruta..."
    });
    loader.present();
    this.webApi.CallWebApi(this.apiPath).then(
      data => {
        loader.dismiss();
        if(data != null && data.ruta_estado == 1){
          this.alert = this.alertController.create({
            title: "Aún no",
            message: "La ruta todavía no ha iniciado",
              buttons: [{ text: 'Está bien'}]
          });
          this.alert.present(); 
        }else if(data.ruta_estado == 2){
          this.alert = this.alertController.create({
            title: "La ruta ya inicio",
            message: "Ya puedes ver cómo va la ruta",
              buttons: [{ text: 'Ir a la ruta', handler: () =>{
                this.navCtrl.push("TravelPage", {path: pathId, suscriptor: true});                
              }}]
          });
          this.alert.present(); 
        }else{
          this.alert = this.alertController.create({
            title: "Hubo un error",
            message: "Intentalo más tarde",
              buttons: [{ text: 'Está bien'}]
          });
          this.alert.present(); 
        }
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
  DeleteSubscription(subscriptionId){
    this.apiPath.directory = 'Path/DeleteSubscription';
    this.apiPath.method = 'POST';
    this.apiPath.parameters = 'subscriptionId='+subscriptionId;
    let loader = this.loadingCtrl.create({
      content: "Obteniendo ruta..."
    });
    loader.present();
    this.webApi.CallWebApi(this.apiPath).then(
      data => {
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
  DeletePath(pathId){
    this.alert = this.alertController.create({
      title: "¿Está seguro?",
      message: "Quiere borrar la ruta",
      buttons: [
        {text: "  No  ", handler: ()=>{this.alert.dismiss();}},
        {text: "   Sí   ", handler: () =>{
          this.apiPath.directory = 'Path/DeletePath';
          this.apiPath.method = 'POST';
          this.apiPath.parameters = 'pathId='+pathId;
          let loader = this.loadingCtrl.create({
            content: "Borrando rutas..."
          });
          loader.present();
          this.webApi.CallWebApi(this.apiPath).then(
            data => {
              loader.dismiss();
              if(data == false){
                let title = "Borrando ruta";
                let message =  "No se ha podido borrar, revisa si está en curso o activa.";
                let alert2 = this.alertController.create({
                  title: title,
                  message: message,
                    buttons: [
                      { text: 'Está bien'}
                    ]
                });
                alert2.present();
              }else{
                let title = "Borrando ruta";
                let message =  "Tu ruta se ha borrado satisfactoriamente";
                let alert2 = this.alertController.create({
                  title: title,
                  message: message,
                    buttons: [
                      { text: 'Está bien', handler: () =>{
                        this.navCtrl.pop();
                      }}
                    ]
                });
                alert2.present();
              }
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
        }}
      ]
    });
    this.alert.present();
  }

  AlertMessage(title,message){
    this.alert = this.alertController.create({
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
                if(this.owner){
                  this.navCtrl.push('NewPathPage');
                }else{
                  this.navCtrl.push('SearchPathPage');
                }
              }
            }
          ]
      });
      this.alert.present(); 
  }

  PresentPathModal(pathId) {
    let profileModal = this.modalCtrl.create(PathModalPage,{ path: pathId , isOwner: this.owner});
    profileModal.present();
  }

  // Metodos que llaman al API 

  // Método para obtener  todas las rutas que un usuario tiene pero del cual no es propietario
  CallGetPathsAPI(userId){
    this.apiPath.directory = 'Path/GetNotOwnerPaths';
    this.apiPath.method = 'GET';
    this.apiPath.parameters = '/'+userId;
    let loader = this.loadingCtrl.create({
      content: "Cargando Rutas"
    });
    loader.present();
    this.webApi.CallWebApi(this.apiPath).then(
        data => {
          this.paths = data;
          loader.dismiss();  
          if(data == false ){
            let title = "Ups! no estás registrado en ninguna ruta";
            let message =  "Te invitamos a registrarte en una.";
            this.AlertMessage(title,message);
          }
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
  // Método para obtener  todas las rutas en las cuales  un usuario es  propietario
  CallGetOwnerPathsAPI(userId){
    this.apiPath.directory = 'Path/GetOwnerPaths';
    this.apiPath.method = 'GET';
    this.apiPath.parameters = '/'+userId;
    let loader = this.loadingCtrl.create({
      content: "Cargando Rutas"
    });
    loader.present();
    this.webApi.CallWebApi(this.apiPath).then(
        data => {
          this.paths = data;
          loader.dismiss();  
          if(data == false &&  this.owner ){
            let title = "Ups! no teines registrada ninguna ruta";
            let message =  "Te invitamos a crear una.";
            this.AlertMessage(title,message);
          }
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

  AlertErrorMessage(title, message){
    this.alert = this.alertController.create({
      title: title,
      message: message,
      buttons: [{ 
        text: 'Aceptar', 
        handler: () => {
          this.navCtrl.push('StartPage');
        }
      }]
    });
    this.alert.present(); 
  } 

}
