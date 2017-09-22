import { Component,ViewChild,ElementRef } from '@angular/core';
import { App, IonicPage, NavController, NavParams,Platform, LoadingController, AlertController,ViewController } from 'ionic-angular';
import { WebApiProvider } from '../../providers/web-api/web-api';
import { SearchGpsPage } from '../search-gps/search-gps';
import { NetworkServiceProvider } from '../../providers/network-service/network-service';

/**
 * Generated class for the NearModalPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

declare var google;

@IonicPage()
@Component({
  selector: 'page-near-modal',
  templateUrl: 'near-modal.html',
})
export class NearModalPage {
  
  @ViewChild('map') mapElement: ElementRef;
  apiPath = {"directory": "","method": "","parameters": ""};
  path = {"ruta_nombre":"", "ruta_inicio_latitud":"","ruta_inicio_longitud":"","ruta_destino_latitud":"","ruta_destino_longitud":"","puntos_intermedios":[]};
  pathId:string;
  map: any;
  directionsService: any;
  directionsDisplay: any;
  photo: any;
  driver = {"nombre": "","celular": "","cedula": "","email": "","usuarioId": ""};
  km: any; //Kilometers de la ruta
  timePath: any; //Tiempo que toma llegar en carro
  isLoading: Boolean = true;
  loader:any;

  constructor(
    public navCtrl: NavController,
    public platform: Platform,
    public loadingCtrl: LoadingController,
    public viewCtrl: ViewController,
    public alertController: AlertController,
    public networkService:NetworkServiceProvider,
    public appCtrl: App,
    public webApi: WebApiProvider,
    public navParams: NavParams) {
      this.pathId = this.navParams.get("pathId");
      this.LoadProfileDriver(this.navParams.get("driverId"));

    }
  
    ionViewWillEnter () { 
      this.photo = 'assets/img/profile-img.png';
    }
   

  ionViewDidLoad() {
    this.loader = this.loadingCtrl.create({
      content: "Cargando Información..."
    });
    this.loader.present();
    this.platform.ready().then(() => { 
     
        this.CallGetPathsAPI(this.pathId);
       
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

  LoadProfileDriver(driverId) {
    let settings = {"directory": "User/GetUser/","method": "GET","parameters": driverId};
    this.webApi.CallWebApi(settings).then(
      data => {
        this.isLoading = false;
        this.loader.dismiss();     
        this.driver.nombre = data.usuario_nombre;
        if(data.usuario_cedula == null || data.usuario_cedula == null){
          data.usuario_cedula = "";
        }
        if(data.usuario_celular == null || data.usuario_celular == null){
          data.usuario_celular = "";
        }
        this.driver.cedula = data.usuario_cedula;
        this.driver.celular = data.usuario_celular;
        this.driver.email = data.usuario_correo;
        this.photo = 'data:image/png;base64,' + data.usuario_foto;
        
      },
      error => {
        this.AlertErrorMessage("Ups! Problemas con la conexión a internet!", "Por favor revisa tu conexión e intenta de nuevo.");
        console.log(error);       
      }
    ).catch((error) => {
      this.AlertErrorMessage('No tenemos acceso al servidor', 'Lo sentimos');
      console.log(error);
    });
    
  }

  Cancel(){
    this.viewCtrl.dismiss();
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
              this.km = "("+(response.routes[0].legs[0].distance.value)/1000 + " km)";
              this.timePath = response.routes[0].legs[0].duration.text;
            }
          } else {
            console.log(status)
          }
        });
  }
  // Metodos que llaman al API 
  // Método para obtener el detalle de una sola ruta
  CallGetPathsAPI(idPath){
      this.apiPath.directory = 'Path/GetPathById';
      this.apiPath.method = 'GET';
      this.apiPath.parameters = '/'+idPath;
     
      this.webApi.CallWebApi(this.apiPath).then(
          data => {
            this.GetPathsMidPointAPI(idPath);
            this.path = data;
            if(data == false ){
             this.AlertMessage();
            }
           
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

    GoJoinPath(){
   // this.viewCtrl.dismiss({join: true,  pathId: this.pathId});
      this.viewCtrl.dismiss();
      this.appCtrl.getRootNav().push(SearchGpsPage,{join: true,  pathId: this.pathId});
     
    }

}
