import { Component, ViewChild, ElementRef} from '@angular/core';
import { IonicPage, NavController, NavParams, Platform ,LoadingController, AlertController,  ViewController  } from 'ionic-angular';


import { WebApiProvider } from '../../providers/web-api/web-api';
import { NotificationProvider } from '../../providers/notification/notification';
import { Geolocation } from '@ionic-native/geolocation';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { Observable } from 'rxjs/Rx';

import { TextToSpeech } from '@ionic-native/text-to-speech';

import { Storage } from '@ionic/storage';
import { Subscription} from 'rxjs/Subscription';

import { Push, PushObject, PushOptions } from '@ionic-native/push';


/* import { GoogleMaps, GoogleMap, GoogleMapsEvent,  CameraPosition} from '@ionic-native/google-maps'; */
/**
 * Generated class for the TravelPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
declare var google;
@IonicPage()
@Component({
  selector: 'page-travel',
  templateUrl: 'travel.html',
})
export class TravelPage {
  @ViewChild('map') mapElement: ElementRef;
  map: any;
  directionsService: any;
  directionsDisplay: any;
  pathId: any;
  apiPath = {"directory": "","method": "","parameters": ""};
  loader:any;
  path: any;
  updatePosition: any;
  updatePositionSubscribe: any;
  marker: any;
  suscriptions = [];
  suscriptor: any;
  setIntervalId: any;
  destinationIsNear: Boolean = false;
  finishTab: Boolean = false; //false;
  isMapReady: Boolean = false;
  responseDirection: any;
  startDate : any;
  startHour = new Date();
  pause:Subscription;
  pushObject: PushObject;
  markers = [];
  constructor(
    public push: Push, 
    public geolocation: Geolocation,
    private tts: TextToSpeech,
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public webApi: WebApiProvider,
    public notification: NotificationProvider,
    public alertController: AlertController,
    public loadingCtrl: LoadingController, 
    public localNotifications: LocalNotifications,
    public viewCtrl: ViewController,
    public platform:  Platform,
    public storage: Storage) {
      this.pathId = navParams.get('path');
      this.suscriptor = navParams.get('suscriptor');
      platform.ready().then(() => {
        if((this.platform.is('android') || this.platform.is('ios')) && !this.suscriptor){
          this.push.hasPermission().then((res) => {
              if(res.isEnabled){
                  this.configPushPlugin();
              }else{
                  alert("No tienes permisos de notificación para esta aplicación");
              }
          });
        }
        this.pause = this.platform.pause.subscribe(() => {
          this.tts.speak("");
        });
    });
  }
  configPushPlugin(){
    const options: PushOptions = {
      android: { senderID: '772094390237', sound: true, forceShow: false, vibrate: true},
      ios: { alert: 'true', badge: true, sound: 'false'},
      windows: {}
    };
    
    this.pushObject = this.push.init(options);
    this.pushObject.on('notification').subscribe((notification: any) => {
      if(notification.additionalData.type == "CancelSubscription"){
        this.CancelSubscriptionInTravel(notification.additionalData.SubscriptionId);
      }
      this.notification.OpenNotification(notification);
      this.pushObject.clearAllNotifications();
  });
  }
  CancelSubscriptionInTravel(subscriptionId){
    //Eliminar marcador del mapa
    this.markers.forEach((element) => {
      element.setMap(null);
    });
    //Inicialar los markers
    this.markers = []
    this.suscriptions.forEach(element => {
      if(element.suscripcion_id == subscriptionId){
        //No se puede elegir la suscripcion
        element.disabled = true;
        element.pickUp = false;
        //No salgan anuncios sobre el usuario
        element.ad = true;
        element.toast = true;
      }else{
        let markerStart = new google.maps.Marker({
          position: {lat: parseFloat(element.suscripcion_inicio_latitud), lng: parseFloat(element.suscripcion_inicio_longitud)},
          title: "Se sube ",
          icon: "assets/img/userStart.png"
        });
        markerStart.setMap(this.map);
        this.markers.push(markerStart);
      }
    });

  }
  ionViewWillLeave(){
    this.tts.stop();
    this.tts.speak("");
    this.pause.unsubscribe();
  }
  ionViewDidLoad(){
    this.loader = this.loadingCtrl.create({
      content: "Cargando mapa..."
    });
    this.loader.present();
    let latLng = new google.maps.LatLng(4.5993592, -74.0778212);
    let mapOptions = {
      center: latLng, zoom: 17, mapTypeId: google.maps.MapTypeId.ROADMAP, streetViewControl: false
    }    
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    this.marker = new google.maps.Marker({
      map: this.map,
      icon: "assets/img/car.png"
    });
    let now = new Date();
    this.startDate = now.getFullYear() + "/" + (now.getMonth()+1) + "/" + now.getDate();
    this.directionsService = new google.maps.DirectionsService;
    this.directionsDisplay = new google.maps.DirectionsRenderer;
    this.directionsDisplay.setMap(this.map);
    this.CallGetPathsAPI(this.pathId);
    if(!this.suscriptor){
      this.storage.ready().then(() =>{
        this.storage.get("travelState").then((travelState)=>{
          if(travelState == 1){
            this.storage.set("travelState", 2);
            this.storage.set("travelId", this.pathId);
            this.storage.set("travelDate", this.startDate);
            this.storage.set("travelHour", this.startHour);
          }else if (travelState == 2){
            this.storage.get("travelDate").then((travelDate) =>{
              this.storage.get("travelHour").then((travelHour) =>{
                this.startDate = travelDate;
                this.startHour = new Date(travelHour);
              });
            });
          }
        });
      });
    }
  }
  UpdateSuscriptorCar(){
    this.apiPath.directory = 'Path/GetActualPosition';
    this.apiPath.method = 'GET';
    this.apiPath.parameters = '/'+this.pathId;
    this.webApi.CallWebApi(this.apiPath).then(
      data => {
        var latlng = new google.maps.LatLng(data.ruta_actual_latitud, data.ruta_actual_longitud);
        this.marker.setPosition(latlng);
      },
      error =>{
        console.log(error);
      }
    ).catch((error) => {
    });
  }
  UpdateSuscriptorOwner(){
    let data= {
      pathId: this.pathId,
      latitud: ""+this.marker.getPosition().lat(),
      longitude: ""+this.marker.getPosition().lng()
    }
    this.apiPath.directory = 'Path/PutActualPosition';
    this.apiPath.method = 'POST';
    this.apiPath.parameters = 'position='+JSON.stringify(data);
    this.webApi.CallWebApi(this.apiPath).then((resolve) =>{
      console.log(resolve);
    });;
  }
  UpdatePosition(){
    if(this.suscriptor != null && this.suscriptor == true){
      this.setIntervalId = Observable.interval(5000).subscribe(() =>{this.UpdateSuscriptorCar()});
    }else{
      let options = {
        maximumAge: 30000,
        enableHighAccuracy: true
      }
      this.updatePosition = this.geolocation.watchPosition(options);
      this.updatePositionSubscribe = this.updatePosition.subscribe((data)=>{
        if(data.coords != null){
          var latlng = new google.maps.LatLng(data.coords.latitude, data.coords.longitude);
          this.marker.setPosition(latlng);
          if(this.suscriptions.length > 0){
            this.suscriptions.forEach(element => {
              let distance = this.GetDistanceFromLatLonInM(data.coords.latitude, data.coords.longitude, element.suscripcion_inicio_latitud, element.suscripcion_inicio_longitud);
              // 300 es la distancia en Metros que avisará que una persona está cerca
              if(distance < 1000 && !element.ad){
                element.ad = true;
                this.apiPath.directory = 'Path/StartSuscriptorPath';
                this.apiPath.method = 'POST';
                this.apiPath.parameters = 'suscriptionId='+element.suscripcion_id;
                this.webApi.CallWebApi(this.apiPath).then((resolve) =>{
                  console.log(resolve);
                });
              }
              if(distance < 300 && !element.toast){
                element.toast = true; 
                let alert = this.alertController.create({
                  title: "",
                  message: "Recuerda que tienes que recoger a " + element.usuario_nombre,
                  buttons : [{text: "Ok"}]
                });
                alert.present();
                this.tts.speak({
                  text: 'Algo importante.   Recuerda que tienes que recoger a ' +element.usuario_nombre,
                  locale: 'es-ES',
                  rate: 0.75
                })
                .then(() => console.log('Success'))
                .catch((reason: any) => console.log(reason));
              }
            });
          }
          let distanceToDestination = this.GetDistanceFromLatLonInM(data.coords.latitude, data.coords.longitude, this.path.ruta_destino_latitud, this.path.ruta_destino_longitud);
          if(distanceToDestination < 300){
            this.destinationIsNear = true;
          }
        }
      });
      this.setIntervalId = Observable.interval(4000).subscribe(() =>{this.UpdateSuscriptorOwner()});      
    }
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
          this.responseDirection = response;
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
  CallGetSuscriptions(){
    this.apiPath.directory = 'Path/GetSuscriptions';
    this.apiPath.method = 'GET';
    this.apiPath.parameters = '/'+this.pathId;
    this.loader.setContent("Cargando suscripciones...");
    this.webApi.CallWebApi(this.apiPath).then(
        data => {
          this.loader.dismiss();  
          if((data == false || data == 'false') && !this.suscriptor ){
            let alert = this.alertController.create({
              title: "No hay suscripciones",
              message: "Lo sentimos, como no hay suscripciones, no contará como viaje compartido",
                buttons: [
                  { text: 'Está bien'}
                ]
            });
            alert.present();
          }else{
           if(!this.suscriptor){
            this.suscriptions = data;
            this.suscriptions.forEach(element => {
              let markerStart = new google.maps.Marker({
                position: {lat: parseFloat(element.suscripcion_inicio_latitud), lng: parseFloat(element.suscripcion_inicio_longitud)},
                title: "Se sube ",
                icon: "assets/img/userStart.png"
              });
              markerStart.setMap(this.map);
              this.markers.push(markerStart);
              /* let markerEnd = new google.maps.Marker({
                position: {lat: parseFloat(element.suscripcion_destino_latitud), lng: parseFloat(element.suscripcion_destino_longitud)},
                title: "Se baja " +element.usuario_nombre,
                icon: "assets/img/userEnd.png"
              });
              markerEnd.setMap(this.map);
              console.log(markerEnd); */
              element.toast = false;
              element.alert = false;
              element.ad = false;
              element.pickUp = true;
              element.disabled = false;
              element.km = 0;
            });
           }
          }
          this.UpdatePosition();
          this.loader.dismiss();
          this.isMapReady = true;
        },
        error =>{
          this.loader.dismiss();  
        }
    ).catch((error) => {
      this.loader.dismiss();   
    });
  }
  CallGetPathsAPI(idPath){
    this.loader.setContent("Cargando ruta...");
    this.apiPath.directory = 'Path/GetPathById';
    this.apiPath.method = 'GET';
    this.apiPath.parameters = '/' + this.pathId;
    this.webApi.CallWebApi(this.apiPath).then(
        data => { 
          if(data == false){
           this.AlertMessage();
          }
          this.CallGetSuscriptions();
          this.path = data;
          this.TraceRoute(); 
        },
        error =>{
          console.log(error);
        }
    ).catch((error) => {
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
            this.setIntervalId.unsubscribe();
            this.updatePositionSubscribe.unsubscribe();
            if(this.suscriptions.length <= 0){
              this.loader.dismiss();
              this.KeepTrip();
            }else{
              this.isMapReady = false;
              this.finishTab = true;
              this.loader.dismiss();
            }
          }
        }
      ]
    });
    alert.present();
  }
  KeepTrip(){
    this.loader = this.loadingCtrl.create({
      content: "Guardando viaje..."
    });
    this.loader.present();
    let now = new Date();
    let endDate = now.getFullYear() + "/" + (now.getMonth()+1) + "/" + now.getDate();
    let endHour = new Date().toLocaleTimeString();
    let subscriptionInfo = []
    
    this.storage.ready().then(() =>{
      this.storage.set("travelState", 0);
      this.storage.set("travelId", null);
      this.storage.set("travelHour", null);
    });

    if(this.suscriptions.length > 0){
      //Construyendo todos los puntos dentro de la ruta, con la suscripcion en detalle
      let wayPoints = []
      if(this.path.ruta_puntos_intermedios.length > 0){
        this.path.ruta_puntos_intermedios.forEach((element2) => {
          if(element2.punto_direccion != "" && element2.punto_latitud != ""){
            wayPoints.push({
              location: {lat: parseFloat(element2.punto_latitud), lng: parseFloat(element2.punto_longitud)},
              stopover: false
            });
          }
        });
      }else{
        wayPoints = null;
      }
      this.directionsService.route({
        origin: {lat: parseFloat(this.path.ruta_inicio_latitud), lng: parseFloat(this.path.ruta_inicio_longitud)},
        destination:{lat: parseFloat(this.path.ruta_destino_latitud), lng: parseFloat(this.path.ruta_destino_longitud)},
        waypoints: wayPoints,
        travelMode: 'DRIVING',
      },(response, status) => {
        subscriptionInfo.push({
          trayecto_metros: Math.round(response.routes[0].legs[0].distance.value),
          trayecto_inicio_fecha: this.startDate,
          trayecto_inicio_hora: this.startHour.toLocaleTimeString(),
          trayecto_pasajeros: this.suscriptions.length,
          trayecto_destino_fecha: endDate,
          trayecto_destino_hora: endHour,
          trayecto_inicio_latitud: this.path.ruta_inicio_latitud,
          trayecto_inicio_longitud: this.path.ruta_inicio_longitud,
          trayecto_destino_latitud: this.path.ruta_destino_latitud,
          trayecto_destino_longitud: this.path.ruta_destino_longitud,
          suscripcion_id: 0
        });
        this.suscriptions.forEach(element =>{
          if(element.pickUp){
            //Trayendo una consulta por cada uno para crear la ruta con los puntos intermedios
            let stepStart = null;
            let stepEnd = null;
            //Identificando los dos puntos de la ruta para encontrar la distancia precisa
            if(response.routes[0].legs[0].steps.length > 0){
              response.routes[0].legs[0].steps.forEach((element2, index) =>{
                if(stepStart == null){
                  let latLng = new google.maps.LatLng(parseFloat(element.suscripcion_inicio_latitud), parseFloat(element.suscripcion_inicio_longitud));
                  let arrayPolilyne = new google.maps.Polygon({paths: element2.path});     
                  let response = google.maps.geometry.poly.isLocationOnEdge(latLng, arrayPolilyne, 0.0005);
                  if(response){
                    stepStart = index;
                  }
                }
              });
              response.routes[0].legs[0].steps.forEach((element2, index) =>{
                if(stepEnd == null){
                  let latLng = new google.maps.LatLng(parseFloat(element.suscripcion_destino_latitud), parseFloat(element.suscripcion_destino_longitud));
                  let arrayPolilyne = new google.maps.Polygon({paths: element2.path});     
                  let response = google.maps.geometry.poly.isLocationOnEdge(latLng, arrayPolilyne, 0.0005);
                  if(response){
                    stepEnd = index;
                  }
                }
              });
            }
            //Sumando la distancia en KM para el usuario
            let km = 0;
            if(stepStart != null && stepEnd != null && stepStart ==  stepEnd){
              km +=  this.GetDistanceFromLatLonInM(parseFloat(element.suscripcion_inicio_latitud), parseFloat(element.suscripcion_inicio_longitud),  parseFloat(element.suscripcion_destino_latitud), parseFloat(element.suscripcion_destino_longitud));
            }else if(stepEnd > stepStart){
              let startPoint = response.routes[0].legs[0].steps[stepStart];
              km += this.GetDistanceFromLatLonInM(parseFloat(element.suscripcion_inicio_latitud), parseFloat(element.suscripcion_inicio_longitud),startPoint.end_point.lat() ,startPoint.end_point.lng());
              for(var j = stepStart+1; j < stepEnd; j++){
                km += response.routes[0].legs[0].steps[j].distance.value;
              }
              let endPoint = response.routes[0].legs[0].steps[stepEnd];            
              km += this.GetDistanceFromLatLonInM(parseFloat(element.suscripcion_destino_latitud), parseFloat(element.suscripcion_destino_longitud),endPoint.end_point.lat() ,endPoint.end_point.lng());          
            }
            subscriptionInfo.push({
              trayecto_metros: Math.round(km),
              trayecto_inicio_fecha: this.startDate,
              trayecto_inicio_hora: this.startHour.toLocaleTimeString(),
              trayecto_pasajeros: -1,
              trayecto_destino_fecha: endDate,
              trayecto_destino_hora: endHour,
              trayecto_inicio_latitud: element.suscripcion_inicio_latitud,
              trayecto_inicio_longitud: element.suscripcion_inicio_longitud,
              trayecto_destino_latitud: element.suscripcion_destino_latitud,
              trayecto_destino_longitud: element.suscripcion_destino_longitud,
              suscripcion_id: element.suscripcion_id
            });
          }
        });
        this.CallToKeepPath(subscriptionInfo);
      });
    }else{
      this.CallToKeepPath(subscriptionInfo);
    }
  }
  CallToKeepPath(subscriptionInfo){
    this.apiPath.directory = 'Path/FinishPath';
    this.apiPath.method = 'POST';
    this.apiPath.parameters = 'pathId='+this.pathId+'&subscriptions='+JSON.stringify(subscriptionInfo);
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
  }
  AlertMessage(){
    let alert = this.alertController.create({
      title: "Ups! hubo un error",
      message: "No pudimos cargar esta ruta",
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
  LoadingMessage(){
    this.loader = this.loadingCtrl.create({
      content: "Consultando Información"
    });
    this.loader.present();
  }
  /*
    Obtener medida entre dos puntos cercanos en la tierra a través de coordenadas
  */
  GetDistanceFromLatLonInM(lat1,lon1,lat2,lon2) {
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
