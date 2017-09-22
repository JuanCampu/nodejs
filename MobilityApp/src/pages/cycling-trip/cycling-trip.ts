import { Component, ViewChild, ElementRef} from '@angular/core';
import { IonicPage, NavController, NavParams,AlertController, LoadingController} from 'ionic-angular';

import { WebApiProvider } from '../../providers/web-api/web-api';
import { Storage } from '@ionic/storage';

import { Geolocation } from '@ionic-native/geolocation';
/**
 * Generated class for the CyclingTripPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

declare var google;
@IonicPage()
@Component({
  selector: 'page-cycling-trip',
  templateUrl: 'cycling-trip.html',
})
export class CyclingTripPage {
  @ViewChild('map') mapElement: ElementRef;
  map: any;
  directionsService: any;
  directionsDisplay: any;
  updatePosition: any;
  updatePositionSubscribe: any;
  loader: any;
  apiPath = {"directory": "","method": "","parameters": ""};
  marker: any;
  polylineArray = [];
  finishTab = false;
  
  endDate: any;
  endHour = new Date();
  trip = {"bicitrayecto_inicio_fecha": "","bicitrayecto_inicio_hora": "","bicitrayecto_inicio_latitud": "", "bicitrayecto_inicio_longitud": "","bicitrayecto_destino_fecha": "","bicitrayecto_destino_hora": "", "bicitrayecto_destino_latitud":"","bicitrayecto_destino_longitud": "","bicitrayecto_metros": "", "usuario_id": ""};
  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    public geolocation: Geolocation,
    public alertController: AlertController,
    public loadingCtrl: LoadingController,
    public webApi: WebApiProvider,
    public storage: Storage) {
  }

  ionViewDidLoad() {
    this.loader = this.loadingCtrl.create({
      content: "Cargando mapa..."
    });
    this.loader.present();
    let options = {
      maximumAge: 30000,
      enableHighAccuracy: true
    }
    
    this.geolocation.getCurrentPosition(options).then((resp) =>{
      
      if(resp.coords != null){
        let latLng = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
        let now = new Date();
        this.trip.bicitrayecto_inicio_fecha = now.getFullYear() + "/" + (now.getMonth()+1) + "/" + now.getDate();
        this.trip.bicitrayecto_inicio_latitud = ""+ resp.coords.latitude;
        this.trip.bicitrayecto_inicio_longitud =""+ resp.coords.longitude;
        this.trip.bicitrayecto_inicio_hora = now.toLocaleTimeString();
        let mapOptions = {
          center: latLng, zoom: 16, mapTypeId: google.maps.MapTypeId.ROADMAP, streetViewControl: false
        }    
        this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
        this.directionsService = new google.maps.DirectionsService;
        this.directionsDisplay = new google.maps.DirectionsRenderer;
        this.directionsDisplay.setMap(this.map);
      }else{
        //ALERT
      }
      this.loader.dismiss();
    });
  }
  StartTrip(){
    this.marker = new google.maps.Marker({
      map: this.map,
      icon: "assets/img/bicycle.png"
    });
    this.finishTab = true;
    let options = {
      maximumAge: 30000,
      enableHighAccuracy: true
    }
    this.updatePosition = this.geolocation.watchPosition(options);
    this.updatePositionSubscribe = this.updatePosition.subscribe((data)=>{
      if(data.coords != null){
        this.trip.bicitrayecto_destino_latitud = ""+  data.coords.latitude;
        this.trip.bicitrayecto_destino_longitud = ""+ data.coords.longitude;
        var latlng = new google.maps.LatLng(data.coords.latitude, data.coords.longitude);
        this.marker.setPosition(latlng);
        this.polylineArray.push(latlng);
        var biclyclePath = new google.maps.Polyline({
          path: this.polylineArray,
          geodesic: true,
          strokeColor: '#FF0000',
          strokeOpacity: 1.0,
          strokeWeight: 2
        });
        biclyclePath.setMap(this.map);
      }
    });
  }
  FinishTrip(){
    let alert = this.alertController.create({
      title: "Seguro?",
      message: "Está seguro de terminar su viaje",
      buttons : [
        { text: "No"},
        {
          text: "Sí",
          handler: () =>{
            this.loader.setContent("Finalizando viaje...");
            this.loader.present();
            this.updatePositionSubscribe.unsubscribe();
            this.KeepTrip();
          }
        }
      ]
    });
    alert.present();
  }
  KeepTrip(){
    this.loader.setContent("Guardando viaje...");
    this.loader.present();
    this.storage.ready().then(() =>{
      this.storage.get("userId").then((ID) =>{
        let now = new Date();
        this.trip.bicitrayecto_destino_fecha = now.getFullYear() + "/" + (now.getMonth()+1) + "/" + now.getDate();
        this.trip.bicitrayecto_destino_hora = now.toLocaleTimeString();
        this.trip.usuario_id = ID;
        this.trip.bicitrayecto_metros =  ""+this.GetMetersFromPolygon(this.polylineArray);
        this.apiPath.directory = 'Bicycle/CreateTrip';
        this.apiPath.method = 'POST';
        this.apiPath.parameters = 'bicycleTrip='+ JSON.stringify(this.trip);
        this.webApi.CallWebApi(this.apiPath).then(
          data => {
            this.loader.dismiss();
            let alert = this.alertController.create({
              title: "Ya tienes un nuevo viaje",
              message: "Se guardo correctamente",
                buttons: [
                  { text: 'Aceptar', 
                    handler: () => {
                      this.navCtrl.pop();                  
                    }
                  }
                ]
            });
            alert.present(); 
          },
          error =>{
            this.loader.dismiss();
          }
        ).catch((error) => {
          this.loader.dismiss();
        });
      })
    })
  }
  GetMetersFromPolygon(array): any{
    let meters = 0
    for(var i = 0; i < (array.length-1); i++){
      meters += this.GetDistanceFromLatLonInM(array[i].lat(), array[i].lng(), array[i+1].lat(), array[i].lng());
    }
    return meters;
  }
  GetDistanceFromLatLonInM(lat1,lon1,lat2,lon2): any {
    var R = 6371; 
    var dLat = this.Deg2rad(lat2-lat1);  
    var dLon = this.Deg2rad(lon2-lon1);
    var a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.Deg2rad(lat1)) * Math.cos(this.Deg2rad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d*1000;
  }
  Deg2rad(deg) {
    return deg * (Math.PI/180)
  }
}

