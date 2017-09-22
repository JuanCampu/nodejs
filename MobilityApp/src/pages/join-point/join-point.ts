import { Component,  ViewChild, ElementRef} from '@angular/core';
import { IonicPage, NavController, NavParams , ViewController, LoadingController, AlertController} from 'ionic-angular';

import { WebApiProvider } from '../../providers/web-api/web-api';
import { NetworkServiceProvider } from '../../providers/network-service/network-service';

/**
 * Generated class for the JoinPointPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
declare var google;
@IonicPage()
@Component({
  selector: 'page-join-point',
  templateUrl: 'join-point.html',
})
export class JoinPointPage {
  @ViewChild('map') mapElement: ElementRef;
  private map: any;
  private geocoder: any;
  private visible = true;
  private path: any;
  private pathId: any;
  private loader: any;
  private directionsService: any;
  private directionsDisplay: any;
  private apiPath = {"directory": "","method": "","parameters": ""};
  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public alertController: AlertController,
    public loadingCtrl: LoadingController,
    public networkService:NetworkServiceProvider,
    public webApi: WebApiProvider) {
      this.geocoder = new google.maps.Geocoder;
      this.pathId = navParams.get('path');
  }

  ionViewWillEnter() {
    this.loader = this.loadingCtrl.create({
      content: "Cargando la ruta..."
    });
    this.loader.present();
    //Settings to call API
    let apiPath = {"directory": "Path/GetPathById",
        "method": "GET",
        "parameters": "/"+this.pathId};
    this.webApi.CallWebApi(apiPath).then((data) =>{
      this.path = data;
      this.loader.setContent("Configurando mapa...");
      this.ConfigureMap();
    }, error =>{
          this.AlertErrorMessage("Ups! Problemas con la conexión a internet!", "Por favor revisa tu conexión e intenta de nuevo.");
          console.log(error);
        }
    ).catch((error) => {
      this.AlertErrorMessage('No tenemos acceso al servidor', 'Lo sentimos');
      console.log(error);
    });
  }
  ConfigureMap(){
    let latLng = new google.maps.LatLng(4.5993592, -74.0778212);
    let mapOptions = {
      center: latLng, zoom: 17, mapTypeId: google.maps.MapTypeId.ROADMAP, streetViewControl: false
    }
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    this.directionsService = new google.maps.DirectionsService;
    this.directionsDisplay = new google.maps.DirectionsRenderer;
    let wayPoints = []
    this.path.ruta_puntos_intermedios.forEach(element => {
      if(element.punto_direccion != "" && element.punto_latitud != ""){
        wayPoints.push({
          location: {lat: parseFloat(element.punto_latitud), lng: parseFloat(element.punto_longitud)},
          stopover: false
        });
      }
    });
    if(wayPoints.length > 0){
      this.directionsService.route({
        origin: {lat: parseFloat(this.path.ruta_inicio_latitud), lng: parseFloat(this.path.ruta_inicio_longitud)},
        destination:{lat: parseFloat(this.path.ruta_destino_latitud), lng: parseFloat(this.path.ruta_destino_longitud)},
        waypoints: wayPoints,
        travelMode: 'DRIVING'
      }, (response, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          this.directionsDisplay.setDirections(response);
          this.directionsDisplay.setMap(this.map);
          this.visible = false;
        } else {
          console.log(status);
        }
        this.loader.dismiss();
      });
    }else{
      this.directionsService.route({
      origin: {lat: parseFloat(this.path.ruta_inicio_latitud), lng: parseFloat(this.path.ruta_inicio_longitud)},
        destination:{lat: parseFloat(this.path.ruta_destino_latitud), lng: parseFloat(this.path.ruta_destino_longitud)},
        travelMode: 'DRIVING',
      }, (response, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          this.directionsDisplay.setDirections(response);
          this.directionsDisplay.setMap(this.map);
          this.visible = false;
        } else {
          console.log(status);
        }
        this.loader.dismiss();
      });
    }
  }
  Cancel(){
    this.viewCtrl.dismiss();
  }
  SelectPoint(){ 
    let latitude = parseFloat(this.map.getCenter().lat()); 
    let longitude = parseFloat(this.map.getCenter().lng());
    let latlng = {lat: latitude, lng: longitude};
    let address = "Geocode Failed";
    this.geocoder.geocode({location: latlng}, (results, status) => {
      if(status === 'OK'){
        if(results[0]){
          address = results[0].formatted_address;
        }else{
          address = "Not found";
        }
      }
      let data = {
        latitude: latitude,
        longitude: longitude,
        address: address
      }
      this.apiPath.directory = 'Path/GetIsOnThePath';
      this.apiPath.method = 'GET';
      this.apiPath.parameters = '/'+ latitude + '/'+ longitude + '/'+  this.pathId;
      this.IsOnThePath(data);
    });
    
    
  }

  IsOnThePath(locationData){
     this.webApi.CallWebApi(this.apiPath).then(
        data => {
          if(data == true){
            this.viewCtrl.dismiss(locationData);
          }else{
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

  AlertMessage(){
    let alert = this.alertController.create({
        title: "Ups! Este punto no se encuentra cerca de la ruta." ,
        message: "Por favor acerque el punto a la ruta.",
          buttons: [
            { text: 'Regresar', 
              handler: () => {
                 
              }
            }
          ]
      });
      alert.present(); 
  }
}