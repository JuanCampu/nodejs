import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, LoadingController, AlertController,Platform} from 'ionic-angular';

import { Validators, FormBuilder, FormGroup, FormArray} from '@angular/forms';

import { GoogleMapPage } from '../google-map/google-map';
import { WebApiProvider } from '../../providers/web-api/web-api';

import { Network } from '@ionic-native/network';
import { Storage } from '@ionic/storage';
import { NetworkServiceProvider } from '../../providers/network-service/network-service';
declare var google;
/**
 * Generated class for the NewPathPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-new-path',
  templateUrl: 'new-path.html',
})
export class NewPathPage {
  @ViewChild('map') mapElement: ElementRef;  
  map: any;
  directionsService: any;
  directionsDisplay: any;
  firstPage: false;
  private pathForm: FormGroup;
  calendarId: any;
  vehicles: Array<{vehiculo_id: string, vehiculo_placa: string, vehiculo_cupo: string}> = []; 
  //Quota is the property to Path; easy way to double select in one
  quaota: any;
  mapIsViewed: Boolean = false;
  loader:any;
  isLoading: Boolean = true;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    public modalCtrl: ModalController,
    public webApi: WebApiProvider,
    public loadingCtrl: LoadingController,
    public networkService:NetworkServiceProvider,
    public alertController: AlertController,
    public network: Network,
    public platform: Platform,
    public storage: Storage
  ) {
    this.pathForm = this.formBuilder.group({
      vehiculo_id: ['', Validators.required],
      ruta_cupo: ['', Validators.required],
      ruta_inicio_direccion: ['', Validators.required],
      ruta_inicio_latitud: ['', Validators.required],
      ruta_inicio_longitud: ['', Validators.required],
      ruta_destino_direccion: ['', Validators.required],
      ruta_destino_latitud: ['', Validators.required],
      ruta_destino_longitud:['', Validators.required],
      ruta_nombre:['', Validators.required],
      //RUTA ESTADO: 0 => Creada 1 => Activa 2 => En curso 3=> Borrada por el usuario
      ruta_estado:[0, Validators.required],
      middlePoints: this.formBuilder.array([
        ]),
      owner: [true],
      usuario_id:['', Validators.required]
    });
  }
  ChoosingVehicle(){
    this.pathForm.controls.ruta_cupo.setValue(this.quaota-1);
  }
  ionViewDidLoad(){
    
    this.LoadingMessage();
    let latLng = new google.maps.LatLng(4.5993592, -74.0778212);
    let mapOptions = {
      center: latLng, zoom: 17, mapTypeId: google.maps.MapTypeId.ROADMAP, streetViewControl: false
    }    
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    this.directionsService = new google.maps.DirectionsService;
    this.directionsDisplay = new google.maps.DirectionsRenderer;
    this.directionsDisplay.setMap(this.map);
    this.storage.ready().then(()=>{
      this.storage.get('userId').then((id) => {
        this.pathForm.controls.usuario_id.setValue(id);
        //Settings to Call API 
        let apiPath = {"directory": "Vehicle/GetVehiclesIdByUserId",
        "method": "GET",
        "parameters": "/"+id};
        this.webApi.CallWebApi(apiPath).then((data) => {
          if(data == false){
            this.loader.dismiss();
            let alert = this.alertController.create({
              title: "Ups no tienes vehículos",
              message: "Para crear una ruta necesitas tener al menos 1 vechículo",
              buttons: [{ text: 'Aceptar', handler: () =>{ this.navCtrl.pop() }}]
            });
            this.isLoading = false;
            alert.present();
          }else{
            this.loader.dismiss();
            this.isLoading = false;
            this.vehicles = data;
          }
        }, (error) => {
          this.loader.dismiss();
          this.AlertErrorMessage("Ups! Problemas con la conexión a internet!", "Por favor revisa tu conexión e intenta de nuevo.");
        });
      }).catch((error)=>{
        this.loader.dismiss();
        this.AlertErrorMessage("Ups! Problemas con la conexión a internet!", "Por favor revisa tu conexión e intenta de nuevo.");
      });
    });
    
  }
  EditDirection(event){
    // Si es el punto inicial 
    if(event[3] == 0){
      this.pathForm.controls["ruta_inicio_direccion"].setValue(event[2]); 
      this.pathForm.controls["ruta_inicio_latitud"].setValue(event[0]);
      this.pathForm.controls["ruta_inicio_longitud"].setValue(event[1]);
    }
    //Si es el punto final 
    if(event[3] == 1){
      this.pathForm.controls["ruta_destino_direccion"].setValue(event[2]); 
      this.pathForm.controls["ruta_destino_latitud"].setValue(event[0]);
      this.pathForm.controls["ruta_destino_longitud"].setValue(event[1]);
    }
    // Para cualquier punto intermedio
    let controlElement = this.pathForm.controls.middlePoints["controls"]
    if(event[3] > 1 && controlElement[event[3]-2] != null){
      controlElement[event[3]-2].controls["punto_latitud"].setValue(event[0]); 
      controlElement[event[3]-2].controls["punto_longitud"].setValue(event[1]);
      controlElement[event[3]-2].controls["punto_direccion"].setValue(event[2]);
    }
  }
  ShowMap(index){
    //No permite que se muestren nunca 2 mapas
    if(this.mapIsViewed){
      return;
    }
    // Si es el punto inicial 
    this.mapIsViewed = true;
    if(index == 0){
      let modalMap: any;
      if(this.pathForm.value.ruta_inicio_latitud != "" && this.pathForm.value.ruta_inicio_longitud != ""){
        modalMap = this.modalCtrl.create(GoogleMapPage, {latitude: this.pathForm.value.ruta_inicio_latitud, longitude: this.pathForm.value.ruta_inicio_longitud});
      }else{
        modalMap = this.modalCtrl.create(GoogleMapPage);      
      }
      
      modalMap.onDidDismiss(data => {
        if(data != null){
          this.pathForm.controls["ruta_inicio_direccion"].setValue(data.address); 
          this.pathForm.controls["ruta_inicio_latitud"].setValue(data.latitude);
          this.pathForm.controls["ruta_inicio_longitud"].setValue(data.longitude);
          //Trazar la ruta en caso de que se pueda 
          this.VerifyPathToDraw();
        }
        this.mapIsViewed = false;
      });
      modalMap.present();
    }
    //Si es el punto final 
    if(index == 1){
      let modalMap: any;
      if(this.pathForm.value.ruta_destino_latitud != "" && this.pathForm.value.ruta_destino_longitud != ""){
        modalMap = this.modalCtrl.create(GoogleMapPage, {latitude: this.pathForm.value.ruta_destino_latitud, longitude: this.pathForm.value.ruta_destino_longitud});
      }else{
        modalMap = this.modalCtrl.create(GoogleMapPage);      
      }
      
      modalMap.onDidDismiss(data => {
        if(data != null){
          this.pathForm.controls["ruta_destino_direccion"].setValue(data.address); 
          this.pathForm.controls["ruta_destino_latitud"].setValue(data.latitude);
          this.pathForm.controls["ruta_destino_longitud"].setValue(data.longitude);
          //Trazar la ruta en caso de que se pueda 
          this.VerifyPathToDraw();
        }
        this.mapIsViewed = false;
      });
      modalMap.present();
    }
    // Para cualquier punto intermedio (index-2)
    if(index > 1){
      let modalMap: any;
      let controlElement = this.pathForm.controls.middlePoints["controls"];
      if(controlElement[index-2].value.punto_latitud != "" && controlElement[index-2].value.punto_longitud  != ""){
        modalMap = this.modalCtrl.create(GoogleMapPage, {latitude: controlElement[index-2].value.punto_latitud , longitude: controlElement[index-2].value.punto_longitud });
      }else{
        modalMap = this.modalCtrl.create(GoogleMapPage);      
      }
      modalMap.onDidDismiss(data => {
        if(data != null){
          controlElement[index-2].controls["punto_direccion"].setValue(data.address); 
          controlElement[index-2].controls["punto_longitud"].setValue(data.longitude);
          controlElement[index-2].controls["punto_latitud"].setValue(data.latitude); 
          //Trazar la ruta en caso de que se pueda 
          this.VerifyPathToDraw();
        }
        this.mapIsViewed = false;
      });
      modalMap.present();
    }
    
    
  }
  VerifyPathToDraw(){
    if(this.pathForm.value.ruta_inicio_latitud != "" && this.pathForm.value.ruta_inicio_longitud != "" &&
      this.pathForm.value.ruta_destino_latitud != "" && this.pathForm.value.ruta_destino_longitud != ""){
        this.UpdateMapPath();
    }
  }
  AddMiddlePoint(){
    let middlePoints = this.pathForm.get('middlePoints') as FormArray;
    middlePoints.push(
      this.formBuilder.group({
        punto_latitud: [''],
        punto_longitud: [''],
        punto_direccion: ['']
      })
    );
  }
  RemoveMiddlePoint(){
    let middlePoints = this.pathForm.get('middlePoints') as FormArray;
    middlePoints.removeAt(middlePoints.length-1);
    this.VerifyPathToDraw();
  }
  UpdateMapPath(){
    if(this.pathForm.value["ruta_inicio_latitud"] == "" ||  this.pathForm.value["ruta_destino_latitud"] == ""){
      this.ShowAlert("Rellene todos los campos" ,"Error");
      return;
    }
    let wayPoints = []
    this.pathForm.value["middlePoints"].forEach(element => {
      if(element.punto_direccion != "" && element.punto_latitud != ""){
        wayPoints.push({
          location: {lat: element.punto_latitud, lng: element.punto_longitud},
          stopover: false
        });
      }
    });
    if(wayPoints.length > 0){
      this.directionsService.route({
        origin: {lat: this.pathForm.value["ruta_inicio_latitud"], lng: this.pathForm.value["ruta_inicio_longitud"]},
        destination:{lat: this.pathForm.value["ruta_destino_latitud"], lng: this.pathForm.value["ruta_destino_longitud"]},
        waypoints: wayPoints,
        travelMode: 'DRIVING'
      }, (response, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          this.directionsDisplay.setDirections(response);
          this.directionsDisplay.setMap(this.map);
        } else {
          console.log(status);
        }
      });
    }else{
      this.directionsService.route({
        origin: {lat: this.pathForm.value["ruta_inicio_latitud"], lng: this.pathForm.value["ruta_inicio_longitud"]},
        destination:{lat: this.pathForm.value["ruta_destino_latitud"], lng: this.pathForm.value["ruta_destino_longitud"]},
        travelMode: 'DRIVING',
      }, (response, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          this.directionsDisplay.setDirections(response);
          this.directionsDisplay.setMap(this.map);
        } else {
          console.log(status)
        }
      });
    }
  }
  CreatePath(){
    let loader = this.loadingCtrl.create({
      content: "Creando una nueva ruta"
    });
    loader.present();
    let middlePoints = this.pathForm.get('middlePoints') as FormArray;
    for(var i = 0; i < middlePoints.length; i++){
      let point = middlePoints.at(i); 
      if(point.value.punto_direccion == "" || point.value.punto_latitud == ""){
        middlePoints.removeAt(i);
        i = i - 1;
      }
    }
    /* this.calendar.hasReadWritePermission().then((request) =>{
      if(request){
       
      }else{
        this.calendar.requestReadWritePermission();
        loader.dismiss();
      }
    }); */
    let settings = {"directory": "Path/CreatePath/","method": "POST","parameters": "path=" + JSON.stringify(this.pathForm.value)};
    this.webApi.CallWebApi(settings).then( 
      data => {
        loader.dismiss();
        if(data == false){
          let alert = this.alertController.create({
            title: 'Lo sentimos',
            message: 'Hubo un error intentalo más tarde',
            buttons: [{ 
              text: 'Aceptar', handler: () =>{
              this.navCtrl.pop();
            }}]
          });
          alert.present();
        }else{
          let alert = this.alertController.create({
            title: 'Grandioso',
            message: 'Haz una nueva ruta con exito',
            buttons: [{ 
              text: 'Aceptar', handler: () =>{
              this.navCtrl.pop();
            }}]
          });
          alert.present();
        }
      }, 
      error =>{
        loader.dismiss();
        this.ShowAlert('Lo sentimos, no se pudo crear', 'Error');
      }
    ).catch(error => {
      loader.dismiss();
      this.ShowAlert('Revisa tu conexión a internet, no pudimos crear una nueva ruta.', 'Error');
    });
  }
  ShowAlert(message: string, title: string) {
    let alert = this.alertController.create({
      title: title,
      message: message,
      buttons: [{ text: 'Aceptar' }]
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

  LoadingMessage(){
    this.loader = this.loadingCtrl.create({
      content: "Consultando Información"
    });
    this.loader.present();
  }
}
