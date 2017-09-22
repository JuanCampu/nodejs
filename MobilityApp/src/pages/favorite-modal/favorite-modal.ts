import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController,AlertController,ModalController} from 'ionic-angular';

import { WebApiProvider } from '../../providers/web-api/web-api';
import {Validators, FormBuilder, FormGroup } from '@angular/forms';
import { GoogleMapPage } from '../google-map/google-map';
import { NetworkServiceProvider } from '../../providers/network-service/network-service';
/**
 * Generated class for the FavoriteModalPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-favorite-modal',
  templateUrl: 'favorite-modal.html',
})
export class FavoriteModalPage {
  
  private siteForm : FormGroup;
  site = {"sitio_id": "","sitio_nombre": "","sitio_descripcion": "","sitio_latitud": "","sitio_longitud": "","sitio_direccion": "","usuario_id": ""};
  isVisited = {"nombre": false,"descripcion": false, "direccion":false }; //Indica si el usuario está dentro del input o fuera de el (focus o onblur)  
  mapIsViewed: Boolean = false;

  constructor(
    public navCtrl: NavController, 
    public formBuilder: FormBuilder,
    public webApi: WebApiProvider,
    public alertController: AlertController,
    public viewCtrl: ViewController,
    public networkService:NetworkServiceProvider,
    public modalCtrl: ModalController,
    public navParams: NavParams)
   {
      
      this.site = this.navParams.get('sitio');
      this.siteForm = this.formBuilder.group({
        sitio_id:[this.site.sitio_id],
        sitio_latitud:[this.site.sitio_latitud],
        sitio_longitud:[this.site.sitio_longitud],
        sitio_descripcion:[this.site.sitio_descripcion,[Validators.required,Validators.maxLength(70),Validators.minLength(3),Validators.pattern('[a-zA-Z ]{0,80}')]],
        sitio_direccion:[this.site.sitio_direccion,[Validators.required,Validators.maxLength(80),Validators.minLength(4)]],
        sitio_nombre:[this.site.sitio_nombre,[Validators.required,Validators.maxLength(20),Validators.minLength(4),Validators.pattern('[a-zA-Z ]{0,80}')]]
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
    if(this.site.sitio_latitud != "" && this.site.sitio_longitud != ""){
      modalMap = this.modalCtrl.create(GoogleMapPage, {latitude: this.site.sitio_latitud , longitude: this.site.sitio_longitud});
    }else{
      modalMap = this.modalCtrl.create(GoogleMapPage);      
    }
    this.modalCtrl.create(GoogleMapPage);
    modalMap.onDidDismiss(data => {
      if(data != null){ 
        this.siteForm.controls.sitio_direccion.setValue(data.address); 
        this.siteForm.controls.sitio_latitud.setValue(data.latitude);  
        this.siteForm.controls.sitio_longitud.setValue(data.longitude); 
      }
      this.mapIsViewed = false;
    });
    modalMap.present();
  }
  Cancel(){
    this.viewCtrl.dismiss();
  }

  EditSite(){
   
    this.site.sitio_descripcion = this.siteForm.controls.sitio_descripcion.value;
    this.site.sitio_direccion = this.siteForm.controls.sitio_direccion.value;
    this.site.sitio_latitud = this.siteForm.controls.sitio_latitud.value;
    this.site.sitio_longitud = this.siteForm.controls.sitio_longitud.value;
    this.site.sitio_nombre = this.siteForm.controls.sitio_nombre.value;

    this.CallEditSite(this.site);
  }

  CallEditSite(site){
    let settings = {"directory": "Sites/UpdateFavoriteSite/","method": "POST","parameters":  "site=" +JSON.stringify(site)};
    this.webApi.CallWebApi(settings).then((data) =>{
      if(data== true){
        let alert = this.alertController.create({
          title: "Sitio actualizado",
          message: "Sitio fue actualizado correctamente.",
          buttons: [{ 
            text: 'Aceptar', 
            handler: () => {
              this.viewCtrl.dismiss();
            }
          }]
        });
        alert.present();
      }else{
        let alert = this.alertController.create({
          title: "Ups! Hubo un error",
          message: "No pudimos editar tu sitio, intenta más tarde.",
          buttons: [{ 
            text: 'Aceptar', 
            handler: () => {
              this.viewCtrl.dismiss();
            }
          }]
        });
        alert.present();
      }
    },(error)=>{
      this.AlertErrorMessage("Ups! Problemas con la conexión a internet!", "Por favor revisa tu conexión e intenta de nuevo.");
    }).catch((error) =>{
      this.AlertErrorMessage("Ups! Problemas con la conexión a internet!", "Por favor revisa tu conexión e intenta de nuevo.");
    })
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
