import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, AlertController, LoadingController } from 'ionic-angular';

import {Validators, FormBuilder, FormGroup} from '@angular/forms';

import { WebApiProvider } from '../../providers/web-api/web-api';
import { GoogleMapPage} from '../google-map/google-map';

import { NetworkServiceProvider } from '../../providers/network-service/network-service';
import { Storage } from '@ionic/storage';
/**
 * Generated class for the NewFavoriteSitePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-new-favorite-site',
  templateUrl: 'new-favorite-site.html',
})
export class NewFavoriteSitePage {
 
  private siteForm: FormGroup;
  mapIsViewed: boolean = false;

  isVisited = {"sitio_nombre": false,"sitio_descripcion": false}; //Indica si el usuario está dentro del input o fuera de el (focus o onblur)  
  
  constructor(
    public modalCtrl: ModalController,
    public navCtrl: NavController, 
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    private formBuilder: FormBuilder,
    public networkService:NetworkServiceProvider,
    public alertController: AlertController,
    public storage: Storage,
    public webApi: WebApiProvider) {
      this.siteForm = this.formBuilder.group({
            sitio_nombre: ['', [Validators.required,Validators.maxLength(40),Validators.minLength(3),Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ ]{0,80}')]],
            sitio_descripcion: ['', Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ ]{0,80}')],
            sitio_direccion: ['', Validators.required],
            sitio_longitud: ['', Validators.required],
            sitio_latitud: ['', Validators.required],
            usuario_id:['', Validators.required]
      });
      this.storage.ready().then(() =>{
        this.storage.get('userId').then((Id) => {
          this.siteForm.controls['usuario_id'].setValue(Id);
        })
      });
  }
  isVisitedChangeForm(input){
    if(this.isVisited[input] == false){
      this.isVisited[input] = true;
    }else{
      this.isVisited[input] = false;
    }
  }
  ShowMap(){
    if(this.mapIsViewed){
      return;
    }
    this.mapIsViewed = true;
    let modalMap: any;
    if(this.siteForm.value.sitio_latitud != "" && this.siteForm.value.sitio_longitud != ""){
      modalMap = this.modalCtrl.create(GoogleMapPage, {latitude: this.siteForm.value.sitio_latitud, longitude: this.siteForm.value.sitio_longitud});
    }else{
      modalMap = this.modalCtrl.create(GoogleMapPage);      
    }
    modalMap.onDidDismiss(data => {
      if(data != null){
        this.siteForm.controls["sitio_direccion"].setValue(data.address); 
        this.siteForm.controls["sitio_latitud"].setValue(data.latitude);
        this.siteForm.controls["sitio_longitud"].setValue(data.longitude);
      }
      this.mapIsViewed = false;
    });
    modalMap.present();
  }
  CreateFavoriteSite(){
    let loader = this.loadingCtrl.create({
      content: "Creando su nuevo sitio"
    });
    loader.present();
    if(this.siteForm.value.sitio_latitud == null || this.siteForm.value.sitio_longitud == null){
      loader.dismiss();
      this.ShowAlert("Su lugar no es valido", "Seleccione otro lugar");
      return;
    }
    this.webApi.CreateNewSite(this.siteForm.value).then( 
      data => {
        loader.dismiss();
        if(data){
          let alert = this.alertController.create({
            title: 'Grandioso',
            message: 'Haz creado tu sitio con exito',
            buttons: [{ text: 'Aceptar', handler: () => {
              this.navCtrl.pop();
            }}]
          });
          alert.present();
        }else{
          loader.dismiss();
          this.ShowAlert('No pudimos crear tu sitio, intentalo más tarde', 'Lo sentimos')
        }
      },
      error =>{
          loader.dismiss();
          this.ShowAlert("Ups! Problemas con la conexión a internet!", "Por favor revisa tu conexión e intenta de nuevo." )
    }).catch( error =>{
      loader.dismiss();
      this.AlertErrorMessage('No tenemos acceso al servidor', 'Lo sentimos');
      console.log(error);
    });
  }
  UpdateLocation(event){
    this.siteForm.controls["sitio_latitud"].setValue(event[0]);
    this.siteForm.controls["sitio_longitud"].setValue(event[1]);
    this.siteForm.controls["sitio_direccion"].setValue(event[2]);
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

  ShowAlert(message: string, title: string) {
    let alert = this.alertController.create({
      title: title,
      message: message,
      buttons: [{ text: 'Aceptar' }]
    });
    alert.present();
  }
}
