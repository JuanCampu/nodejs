import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ActionSheetController,LoadingController, Platform, ModalController } from 'ionic-angular';
import { GoogleMapPage } from '../google-map/google-map';
import {Validators, FormBuilder, FormGroup} from '@angular/forms';
import { Storage } from '@ionic/storage';
import { WebApiProvider } from '../../providers/web-api/web-api';
import { PathNearPage } from '../path-near/path-near';
import { JoinPointPage } from '../join-point/join-point';
import { StartPage } from '../start/start';
import { NetworkServiceProvider } from '../../providers/network-service/network-service';

/**
 * Generated class for the SearchGpsPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-search-gps',
  templateUrl: 'search-gps.html',
})
export class SearchGpsPage {
  
  private directionForm: FormGroup;
  private joinForm: FormGroup;
  loader:any;
  actionSheet:any;
  favoDirecButtons =   {"favoriteStart":[],"favoriteEnd": []};// Arreglo para consultar el API
  defaultButtons: Array<{text: string, icon: string,handler: any}>  = [];
  apiPath = {"directory": "","method": "","parameters": ""};// Arreglo para consultar el API
  isLoading: Boolean = true;
  joinPage:boolean;
  pathId:string;
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public platform: Platform,
    public modalCtrl: ModalController,
    public storage: Storage, 
    public webApi: WebApiProvider,
    public networkService:NetworkServiceProvider,
    public loadingCtrl: LoadingController,
    public alertController: AlertController,
    private formBuilder: FormBuilder,
    public actionSheetCtrl: ActionSheetController) {
     
      if(this.navParams.get("join") && this.navParams.get("pathId")){
        this.joinPage = true;
        this.pathId = this.navParams.get("pathId");
        
      }
      this.directionForm = this.formBuilder.group({
        ruta_inicio_direccion: ['', Validators.required],
        ruta_inicio_latitud: ['', Validators.required],
        ruta_inicio_longitud: ['', Validators.required],
        ruta_destino_direccion: ['', Validators.required],
        ruta_destino_latitud: ['', Validators.required],
        ruta_destino_longitud: ['', Validators.required],
      });
      this.joinForm = this.formBuilder.group({
        ruta_inicio_direccion: ['', Validators.required],
        ruta_inicio_latitud: ['', Validators.required],
        ruta_inicio_longitud: ['', Validators.required],
        ruta_destino_direccion: ['', Validators.required],
        ruta_destino_latitud: ['', Validators.required],
        ruta_destino_longitud: ['', Validators.required],
      });
  }

  ionViewDidLoad() {
    this.ChargeFavoList();
  }

  GoNearPaths(){
    this.navCtrl.push(PathNearPage, {dots: this.directionForm.value});
  }


  JoinToPath(){ 
 
    let load = this.loadingCtrl.create({
      content: "Creando solicitud..."
    });
    load.present();
    this.storage.ready().then(()=>{
      this.storage.get("userId").then((Id) =>{
        //Posible enviar a los métodos que llaman el API
        let suscription = {
          usuario_id: Id,
          ruta_id: this.pathId,
          suscripcion_propietario: false,
          suscripcion_activo: false,
          suscripcion_inicio_latitud: this.joinForm.controls["ruta_inicio_latitud"].value,
          suscripcion_inicio_longitud: this.joinForm.controls["ruta_inicio_longitud"].value,
          suscripcion_destino_latitud: this.joinForm.controls["ruta_destino_latitud"].value,
          suscripcion_destino_longitud: this.joinForm.controls["ruta_destino_longitud"].value,
        }
        let settings = {"directory": "Path/RequestToSuscribeOnPath/",
        "method": "POST",
        "parameters": "suscribeRequest=" +JSON.stringify(suscription)};
        this.webApi.CallWebApi(settings).then((response) =>{
          load.dismiss();
          if(response == "true"){
           
            this.AlertCustomMessage("Grandioso", "Se ha enviado la solicitud");
          }else if(response == "false"){
       
            this.AlertCustomMessage("Ups! Algo está mal", "Quizá ya has enviado una solicitud antes o hay un error de conexión.");
          }
          
        }).catch((error)=>{
          load.dismiss();
        });
      });
    });  
  }

  PresentMapModal(typeOfPoint) {
    let mapModal;
  
      if(this.directionForm.value.ruta_inicio_latitud != "" && this.directionForm.value.ruta_inicio_longitud != "" && typeOfPoint ==0){
        mapModal = this.modalCtrl.create(GoogleMapPage, {latitude: this.directionForm.value.ruta_inicio_latitud, longitude: this.directionForm.value.ruta_inicio_longitud});
      }else if (this.directionForm.value.ruta_destino_latitud != "" && this.directionForm.value.ruta_destino_longitud != "" && typeOfPoint !=0){
        mapModal = this.modalCtrl.create(GoogleMapPage, {latitude: this.directionForm.value.ruta_destino_latitud, longitude: this.directionForm.value.ruta_destino_longitud}); 
      }else{
        mapModal = this.modalCtrl.create(GoogleMapPage);  
      }
    mapModal.present();
    mapModal.onDidDismiss(data => {
      if(data != null){
          if(typeOfPoint == 0){
            this.directionForm.controls["ruta_inicio_direccion"].setValue(data.address); 
            this.directionForm.controls["ruta_inicio_latitud"].setValue(data.latitude);
            this.directionForm.controls["ruta_inicio_longitud"].setValue(data.longitude);
          }else{
            this.directionForm.controls["ruta_destino_direccion"].setValue(data.address); 
            this.directionForm.controls["ruta_destino_latitud"].setValue(data.latitude);
            this.directionForm.controls["ruta_destino_longitud"].setValue(data.longitude);
          }
      }
    });
  }

  JoinMapModal(typeOfPoint) {
    let mapModal;
      if(this.joinForm.value.ruta_inicio_latitud != "" && this.joinForm.value.ruta_inicio_longitud != "" && typeOfPoint ==0){
        mapModal = this.modalCtrl.create(JoinPointPage, {path:this.pathId});
      }else if (this.joinForm.value.ruta_destino_latitud != "" && this.joinForm.value.ruta_destino_longitud != "" && typeOfPoint !=0){
        mapModal = this.modalCtrl.create(JoinPointPage, {path:this.pathId}); 
      }else{
        mapModal = this.modalCtrl.create(JoinPointPage , {path:this.pathId});  
      }  
    mapModal.present();
    mapModal.onDidDismiss(data => {
      if(data != null){
          if(typeOfPoint == 0){
            this.joinForm.controls["ruta_inicio_direccion"].setValue(data.address); 
            this.joinForm.controls["ruta_inicio_latitud"].setValue(data.latitude);
            this.joinForm.controls["ruta_inicio_longitud"].setValue(data.longitude);
          }else{
            this.joinForm.controls["ruta_destino_direccion"].setValue(data.address); 
            this.joinForm.controls["ruta_destino_latitud"].setValue(data.latitude);
            this.joinForm.controls["ruta_destino_longitud"].setValue(data.longitude);
          }
      }
    });
  }

  //typeOfPoint : Define si el punto de partida o punto de llegada
  // 0 = punto de partida
  // 1 = punto de llegada
  //typeOfPage : Define el tipo de pagina 
  // 0 = Pagina de inicio por GPS
  // 1 = Unirse a un punto exacto en el mapa
  ActionSheetSuggestions(typeOfPoint,typeOfPage) {
 
    this.defaultButtons = [];
    if(typeOfPage == 0){
      this.defaultButtons.push({
        text: "Fija la ubicación en el mapa",
        icon: !this.platform.is('ios') ? 'ios-locate-outline' : null,
        handler: () => {
          this.PresentMapModal(typeOfPoint);
        }
      },{
        text: "Cancelar",
        icon: !this.platform.is('ios') ? 'close' : null,
        handler: () => {
          console.log('Cancel clicked');
        }
      });
    }else{
      this.defaultButtons.push({
        text: "Fija la ubicación en el mapa",
        icon: !this.platform.is('ios') ? 'ios-locate-outline' : null,
        handler: () => {
          this.JoinMapModal(typeOfPoint);
        }
      },{
        text: "Cancelar",
        icon: !this.platform.is('ios') ? 'close' : null,
        handler: () => {
          console.log('Cancel clicked');
        }
      });
    }
    
    this.ChargeSiteList(typeOfPoint,typeOfPage)
  }

  ChargeSiteList(typeOfPoint,typeOfPage){
    let favoriteButton = [];
    if(typeOfPage == 0){
      if(typeOfPoint == 0){
          favoriteButton = this.favoDirecButtons.favoriteStart.concat(this.defaultButtons);
      }else{
        favoriteButton = this.favoDirecButtons.favoriteEnd.concat(this.defaultButtons);
      }
    }else{
      if(typeOfPoint == 0){
          favoriteButton = this.defaultButtons;
      }else{
          favoriteButton = this.defaultButtons;
      }
    }  
    this.actionSheet = this.actionSheetCtrl.create({
      title: 'Elige una opción',
      buttons: favoriteButton
    });
    this.actionSheet.present();
  }

  ChargeFavoList(){
    let message = "Consultando información...";
    this.LoadingMessage(message);
    this.storage.ready().then(() =>{
      this.storage.get('userId').then(Id =>{
        this.apiPath.directory = 'Sites/GetFavoriteSites';
        this.apiPath.method = 'GET';
        this.apiPath.parameters =  '/'+Id;
        this.webApi.CallWebApi(this.apiPath).then(
          data =>{
         
            if(data instanceof Array){
              this.isLoading = false;
              this.loader.dismiss();
              data.forEach((value, array, index) => {
                this.favoDirecButtons.favoriteStart.push({
                    text: value['sitio_nombre'],
                    icon: !this.platform.is('ios') ? 'ios-pin-outline' : null,
                    handler: () => {
                      this.directionForm.controls["ruta_inicio_direccion"].setValue(value['sitio_direccion']); 
                      this.directionForm.controls["ruta_inicio_latitud"].setValue(value['sitio_latitud']);
                      this.directionForm.controls["ruta_inicio_longitud"].setValue(value['sitio_longitud']);
                    }
                  });
                  this.favoDirecButtons.favoriteEnd.push({
                    text: value['sitio_nombre'],
                    icon: !this.platform.is('ios') ? 'ios-pin-outline' : null,
                    handler: () => {
                      this.directionForm.controls["ruta_destino_direccion"].setValue(value['sitio_direccion']); 
                      this.directionForm.controls["ruta_destino_latitud"].setValue(value['sitio_latitud']);
                      this.directionForm.controls["ruta_destino_longitud"].setValue(value['sitio_longitud']);
                    }
                  });
              });
            }else{
              this.isLoading = false;
              this.loader.dismiss();
            }
            
          },error =>{
            this.loader.dismiss();
            this.AlertErrorMessage("Ups! Problemas con la conexión a internet!", "Por favor revisa tu conexión e intenta de nuevo.");
            console.log("Catch Error: " + error);
          }).catch( (error) =>{  
            this.loader.dismiss();   
            this.AlertErrorMessage("Ups! Problemas con la conexión a internet!", "Por favor revisa tu conexión e intenta de nuevo."); 
            console.log("Catch Error: " + error);
          });
      });
    });
  }


  
  AlertCustomMessage(title, message){
    let alert = this.alertController.create({
      title: title,
      message: message,
      buttons: [{ 
        text: 'Aceptar', 
        handler: () => {
          this.navCtrl.push(StartPage);
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

  LoadingMessage(message){
    this.loader = this.loadingCtrl.create({
      content: message
    });
    this.loader.present();
    }

}
