import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, LoadingController, NavParams, AlertController,ViewController,Platform, Select } from 'ionic-angular';

import { Storage } from '@ionic/storage';
import { WebApiProvider } from '../../providers/web-api/web-api';
import { NetworkServiceProvider } from '../../providers/network-service/network-service';
/**
 * Generated class for the PathModalPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

 declare var google;

@IonicPage()
@Component({
  selector: 'page-path-modal',
  templateUrl: 'path-modal.html',
})
export class PathModalPage {
  @ViewChild('map') mapElement: ElementRef;
  @ViewChild('selectTime') select: Select;
  timesForPath = [{'text':'2 min', 'value': 2},{'text':'15 min', 'value': 15}, {'text':'30 min', 'value': 30},{'text':'45 min', 'value': 45}, {'text':'1 hora', 'value': 60}];
  timeChoosed: any;
  path = {"ruta_nombre":"", "ruta_inicio_latitud":"","ruta_inicio_longitud":"","ruta_destino_latitud":"","ruta_destino_longitud":"","puntos_intermedios":[]};
  pathId:String;
  directionsService: any;
  directionsDisplay: any;
  map: any;
  apiPath = {"directory": "","method": "","parameters": ""};
  owner: Boolean; 
  km: any; //Kilometers de la ruta
  timePath: any; //Tiempo que toma llegar en carro
  otherPath: Boolean = true; //Si otra ruta ya se programo, no se podría programar esta ruta
  isActivePath: Boolean = false;  
  constructor(
      public navCtrl: NavController, 
      public navParams: NavParams,
      public webApi: WebApiProvider,
      public alertController: AlertController,
      public networkService:NetworkServiceProvider,
      public viewCtrl: ViewController,
      public platform: Platform,
      public loadingCtrl: LoadingController,
      public storage: Storage,
  ){ 
    this.pathId = navParams.get('path');
    this.owner = navParams.get('isOwner');
  }

  ionViewDidLoad() {
    this.platform.ready().then(() => { 
        if (this.networkService.connectionState) { 
          this.CallGetPathsAPI(this.pathId);
        }
    }); 
    let latLng = new google.maps.LatLng(4.5993592, -74.0778212);
    let mapOptions = {
      center: latLng, zoom: 17, mapTypeId: google.maps.MapTypeId.ROADMAP, streetViewControl: false
    }    
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    this.directionsService = new google.maps.DirectionsService;
    this.directionsDisplay = new google.maps.DirectionsRenderer;
    this.directionsDisplay.setMap(this.map);
  }
  ionViewWillEnter(){
    this.storage.ready().then(() =>{
      this.storage.get("travelState").then((travelState) =>{
        if(travelState == 0 || travelState == null){
          this.otherPath = false;
        }else{
          this.storage.get("travelId").then((Id)=>{
            this.isActivePath = (Id == this.pathId) ? true: false;
          });
        }
      });
    });
  }
  Cancel(){
    this.viewCtrl.dismiss();
  }
  DeactivatePath(){
    let alert = this.alertController.create({
      title: "Desactivando ruta",
      message: "¿Quieres desactivar tu ruta antes de iniciar?",
      enableBackdropDismiss: false,
        buttons: [
          {text: ' No ', },{ 
            text: ' Sí ', 
            handler: () => {
              let path = {
                pathId: this.pathId,
                start: false
              }
              this.apiPath.directory = 'Path/InitializePath';
              this.apiPath.method = 'POST';
              this.apiPath.parameters = 'path='+JSON.stringify(path);
              this.webApi.CallWebApi(this.apiPath);
              this.storage.ready().then(() =>{
                this.storage.set("travelState", 0);
              });
              alert.dismiss();
              this.navCtrl.pop();
              return false;
            }
          }
        ]
    });
    alert.present();
  }
  TraceRoute(){
    let wayPoints = [];
    if(this.path.puntos_intermedios instanceof Array){  
      this.path.puntos_intermedios.forEach(element => {
        if(element.punto_latitud != "" && element.punto_longitud != ""){
          wayPoints.push({
            location: {lat: parseFloat(element.punto_latitud), lng: parseFloat(element.punto_longitud)},
            stopover: false
          });
        }
      });
    }else{
       wayPoints =  null;
    }
        this.directionsService.route({
          origin: {lat: parseFloat(this.path.ruta_inicio_latitud), lng: parseFloat(this.path.ruta_inicio_longitud)},
          destination:{lat: parseFloat(this.path.ruta_destino_latitud), lng: parseFloat(this.path.ruta_destino_longitud)},
          waypoints: wayPoints,
          travelMode: 'DRIVING'
        }, (response, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            this.directionsDisplay.setDirections(response);
            this.directionsDisplay.setMap(this.map);
            if(response.routes != null && response.routes[0].legs != null){
              this.km = (response.routes[0].legs[0].distance.value)/1000 + " km";
              this.timePath = response.routes[0].legs[0].duration.text;
            }
          } else {
            console.log(status)
          }
        });
  }
  ChoosingTime(){
    this.apiPath.directory = 'Path/ActivePath';
    this.apiPath.method = 'POST';
    this.apiPath.parameters = 'pathId='+this.pathId;
    let loader = this.loadingCtrl.create({
      content: "Activando la ruta..."
    });
    loader.present();
    this.webApi.CallWebApi(this.apiPath).then(
        data => {
          loader.dismiss(); 
          let alert = this.alertController.create({
            title: "Has activado tu ruta",
            message: "Ahora tus compañeros podran suscribirse",
              buttons: [
                { text: 'Está bien', 
                  handler: () => {
                      this.navCtrl.pop();
                  }
                }
              ]
          });
          alert.present(); 
        },
        error =>{
          loader.dismiss(); 
          this.AlertErrorMessage("Ups! Problemas con la conexión a internet!", "Por favor revisa tu conexión e intenta de nuevo.");
          console.log(error);
        }
    ).catch((error) => {
        loader.dismiss(); 
        this.AlertErrorMessage('No tenemos acceso al servidor', 'Lo sentimos');
        console.log(error); 
    });
    this.storage.ready().then(() =>{
      this.storage.set("travelState", 1);
      this.storage.set("travelHour", new Date());
      this.storage.set("travelId", this.pathId);
      this.storage.set("travelTime", this.timeChoosed);
    });
    setTimeout(() => {this.StartPath(this.pathId)}, this.timeChoosed*60000);
  }
  StartPath(pathId){
    this.storage.ready().then(()=>{
      this.storage.get('userId').then((id) => {
        this.storage.get("travelState").then((state) =>{
          this.storage.get("travelId").then((travelId) =>{
            if(state != 0 && travelId == pathId){
              this.apiPath.directory = 'Path/StartPath';
              this.apiPath.method = 'POST';
              this.apiPath.parameters = 'pathId='+pathId+'&userId='+id;
              this.webApi.CallWebApi(this.apiPath);
            }
          });
        })
      });
    });
  }
  ActivePath(){
    this.select.open();
  }
  AlertMessage(){
    let alert = this.alertController.create({
        title: "Ups! No se encontro ninguna información sobre esta ruta",
        message: "Te invitamos a probar más tarde.",
          buttons: [
            { text: 'Regresar', 
              handler: () => {
                  this.navCtrl.pop();
                  
              }
            }
          ]
      });
      alert.present(); 
  }
  // Metodos que llaman al API 
  // Método para obtener el detalle de una sola ruta
  CallGetPathsAPI(idPath){
    this.apiPath.directory = 'Path/GetPathById';
    this.apiPath.method = 'GET';
    this.apiPath.parameters = '/'+idPath;
    let loader = this.loadingCtrl.create({
      content: "Cargando Información..."
    });
    loader.present();
    this.webApi.CallWebApi(this.apiPath).then(
        data => {
          this.GetPathsMidPointAPI(idPath);
          loader.dismiss(); 
          this.path = data;
          if(data == false ){
           this.AlertMessage();
          }
        },
        error =>{
          loader.dismiss(); 
          this.AlertErrorMessage("Ups! Problemas con la conexión a internet!", "Por favor revisa tu conexión e intenta de nuevo.");
          console.log(error);
        }
    ).catch((error) => {
        loader.dismiss();  
        this.AlertErrorMessage('No tenemos acceso al servidor', 'Lo sentimos');
        console.log(error);
    });
  }
  // Método para obtener los puntos intermedios de una  ruta
  GetPathsMidPointAPI(pathId){
    this.apiPath.directory = 'Path/GetPathMidPoint';
    this.apiPath.method = 'GET';
    this.apiPath.parameters = '/'+pathId;
    this.webApi.CallWebApi(this.apiPath).then(
        data => {
          this.path.puntos_intermedios = data;
          this.TraceRoute();  
        },
        error =>{
          this.AlertErrorMessage("Ups! Problemas con la conexión a internet!", "Por favor revisa tu conexión e intenta de nuevo.");
          console.log(error);
        }
    ).catch((error) => {
      this.AlertErrorMessage('No tenemos acceso al servidor', 'Lo sentimos');
      console.log(error);
    });
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
  