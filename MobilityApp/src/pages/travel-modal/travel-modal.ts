import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';

import { WebApiProvider } from '../../providers/web-api/web-api';
/**
 * Generated class for the TravelModalPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
declare var google;
@IonicPage()
@Component({
  selector: 'page-travel-modal',
  templateUrl: 'travel-modal.html',
})
export class TravelModalPage {

  @ViewChild('map') mapElement: ElementRef;
  map: any;
  directionsService: any;
  directionsDisplay: any;
  loader: any;
  path:any;//Response de la ruta
  apiPath = {"directory": "","method": "","parameters": ""};  
  pathId: any;
  subscriptionId: any;
  subscription: any; //Response de la suscripcion
  userId: any;
  user:any = {"usuario_nombre": "","usuario_celular": "","usuario_correo":"", "usuario_foto": "assets/img/profile-img.png"}; //Response de la usuario
  metros:string;
  fecha:any;
  horaInicio:any;
  horaFin:any;
  isLoading = true;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    public alertController: AlertController,
    public webApi: WebApiProvider
  ) {
    this.pathId = navParams.get('pathId');
    this.userId = navParams.get('userId');
    this.metros = navParams.get('metros');
    this.horaInicio = this.TimeConvert(navParams.get('horaInicio'));
    this.horaFin = this.TimeConvert(navParams.get('horaFin'));
    this.fecha = navParams.get('fecha');
    this.subscriptionId = navParams.get('subscriptionId');
  }


 TimeConvert (time) {
    // Check correct time format and split into components
    time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
  
    if (time.length > 1) { // If time format correct
      time = time.slice (1);  // Remove full string match value
      time[5] = +time[0] < 12 ? 'AM' : 'PM'; // Set AM/PM
      time[0] = +time[0] % 12 || 12; // Adjust hours
    }
    return time.join (''); // return adjusted time or original string
  }
  
  ionViewDidLoad() {
    console.log('ionViewDidLoad TravelModalPage');
    this.loader = this.loadingCtrl.create({
      content:"Cargando solicitud..."
    });
    this.loader.present();
    let latLng = new google.maps.LatLng(4.5993592, -74.0778212);
    let mapOptions = {
      center: latLng, zoom: 17, mapTypeId: google.maps.MapTypeId.ROADMAP, streetViewControl: false
    }    
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    this.directionsService = new google.maps.DirectionsService;
    this.directionsDisplay = new google.maps.DirectionsRenderer;
    this.directionsDisplay.setMap(this.map);
    this.CallGetPath();
  }




  TraceRoute(){
    if(this.path.ruta_puntos_intermedios.length == 0){
      this.directionsService.route({
        origin: {lat: parseFloat(this.path.ruta_inicio_latitud), lng: parseFloat(this.path.ruta_inicio_longitud)},
        destination:{lat: parseFloat(this.path.ruta_destino_latitud), lng: parseFloat(this.path.ruta_destino_longitud)},
        travelMode: 'DRIVING',
      }, (response, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          this.directionsDisplay.setDirections(response);
          this.directionsDisplay.setMap(this.map);
        } else {
          console.log(status);
        }
      });
    }else{
      let wayPoints = []
      this.path.ruta_puntos_intermedios.forEach(element => {
        if(element.punto_direccion != "" && element.punto_latitud != ""){
          wayPoints.push({
            location: {lat: parseFloat(element.punto_latitud), lng: parseFloat(element.punto_longitud)},
            stopover: false
          });
        }
      });
      this.directionsService.route({
        origin: {lat: parseFloat(this.path.ruta_inicio_latitud), lng: parseFloat(this.path.ruta_inicio_longitud)},
        destination:{lat: parseFloat(this.path.ruta_destino_latitud), lng: parseFloat(this.path.ruta_destino_longitud)},
        waypoints: wayPoints,
        travelMode: 'DRIVING',
      }, (response, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          this.directionsDisplay.setDirections(response);
          this.directionsDisplay.setMap(this.map);
        } else {
          console.log(status);
        }
      });
    }
  }

     /*
  * Llamando a cada una de las suscripciones
  */
  CallGetPath(){
    this.loader.setContent("Cargando ruta...");
    this.apiPath.directory = 'Path/GetPathById';
    this.apiPath.method = 'GET';
    this.apiPath.parameters = '/' + this.pathId;
    this.webApi.CallWebApi(this.apiPath).then(
        data => { 
          if(data == false){
            this.WrongAlert();
          }else{
            this.path = data;
            this.TraceRoute(); 
            this.CallGetSubscription();
          }
        },
        error =>{
          console.log(error);
        }
    ).catch((error) => {
    });
  }

  CallGetSubscription(){
    this.loader.setContent("Cargando suscripcion...");
    this.apiPath.directory = 'Path/GetSubscription';
    this.apiPath.method = 'GET';
    this.apiPath.parameters = '/' + this.subscriptionId;
    this.webApi.CallWebApi(this.apiPath).then(
      data => { 
        if(data == false){
          this.WrongAlert();
        }else{
          this.subscription = data;
          this.ChargeSubscription();
          this.CallGetUser();
        }
      },
      error =>{
        console.log(error);
      }
    ).catch((error) => {
    });
  }

  CallGetUser(){
    this.loader.setContent("Cargando información de usuario...");
    this.apiPath.directory = 'User/GetUser';
    this.apiPath.method = 'GET';
    this.apiPath.parameters = '/' + this.userId;
    this.webApi.CallWebApi(this.apiPath).then(
      data => {
        this.isLoading = false;
        this.loader.dismiss();
        if(data == false){
          this.WrongAlert();
        }else{
          data.usuario_foto = "data:image/png;base64," +data.usuario_foto;
          /* this.user.usuario_nombre = data.usuario_nombre;
          this.user.usuario_celular = data.usuario_celular;
          this.user.usuario_foto = data.usuario_foto; */
          this.user = data;
        }
      },
      error =>{
        this.loader.dismiss();
        console.log(error);
      }
    ).catch((error) => {
      this.loader.dismiss();
    });
  }

  ChargeSubscription(){
    let markerStart = new google.maps.Marker({
      position: {lat: parseFloat(this.subscription.suscripcion_inicio_latitud), lng: parseFloat(this.subscription.suscripcion_inicio_longitud)},
      title: "Se sube ",
      icon: "assets/img/userStart.png"
    });
    markerStart.setMap(this.map);
    let markerEnd = new google.maps.Marker({
      position: {lat: parseFloat(this.subscription.suscripcion_destino_latitud), lng: parseFloat(this.subscription.suscripcion_destino_longitud)},
      title: "Se baja ",
      icon: "assets/img/userEnd.png"
    });
    markerEnd.setMap(this.map);
  }

  WrongAlert(){ 
    this.loader.dismiss();
    let alert = this.alertController.create({
      enableBackdropDismiss:false,
      title: "Ups! hubo un error",
      message: "No pudimos cargar esta solicitud",
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

}
