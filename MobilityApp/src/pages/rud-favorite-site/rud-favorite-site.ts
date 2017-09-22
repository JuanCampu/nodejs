import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ModalController, LoadingController,Platform} from 'ionic-angular';

import { WebApiProvider } from '../../providers/web-api/web-api';
import { Storage } from '@ionic/storage';
import { FavoriteModalPage } from '../favorite-modal/favorite-modal';
import { Network } from '@ionic-native/network';
import { NetworkServiceProvider } from '../../providers/network-service/network-service';

/**
 * Generated class for the RudFavoriteSitePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-rud-favorite-site',
  templateUrl: 'rud-favorite-site.html',
})
export class RudFavoriteSitePage {

  favoriteSites: Array<{sitio_id: string, sitio_nombre: string, sitio_descripcion: string,sitio_latitud: string, sitio_longitud: string,sitio_direccion: string, usuario_id: string}> = []; 
  site = {"sitio_id": "","sitio_nombre": "","sitio_descripcion": "","sitio_latitud": "","sitio_longitud": "","sitio_direccion": ""};

  realData: any;
  disabled = true;
  mapIsViewed: Boolean = false;
  isLoading: Boolean = true;
  apiPath = {"directory": "","method": "","parameters": ""};// Arreglo para consultar el API

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public webApi: WebApiProvider,
    public storage: Storage,
    public alertController: AlertController,
    public modalCtrl: ModalController,
    public networkService:NetworkServiceProvider,
    public network: Network,
    public platform: Platform,
    public loadingCtrl: LoadingController) {
  }

  ionViewWillEnter(){
    this.ChargeSiteList();
  }
  ChargeSiteList(){
    let loader = this.loadingCtrl.create({
      content: "Cargando tus sitios favoritos"
    });
    loader.present();
    this.storage.ready().then(() =>{
      this.storage.get('userId').then(Id =>{
        this.apiPath.directory = 'Sites/GetFavoriteSites';
        this.apiPath.method = 'GET';
        this.apiPath.parameters =  '/'+Id;
        this.webApi.CallWebApi(this.apiPath).then(
          data =>{
            loader.dismiss();
            if(data instanceof Array){
              this.realData = data;
              this.favoriteSites = [];
              data.forEach((value, array, index) => {
                this.favoriteSites.push({
                  sitio_id: value['sitio_id'],
                  sitio_nombre: value['sitio_nombre'],
                  sitio_descripcion: value['sitio_descripcion'],
                  sitio_latitud: value['sitio_latitud'],
                  sitio_longitud: value['sitio_longitud'],
                  sitio_direccion: value['sitio_direccion'],
                  usuario_id: value['usuario_id']
                });
              });
             
              this.isLoading = false;
            }else if(data != "noconnection"){
              let alert = this.alertController.create({
                title: "Ups! no tienes ningún sitio",
                message: "Crea un nuevo sitio favorito!",
                  buttons: [
                    { text: 'Cancelar', 
                      handler: () => {
                        this.navCtrl.push('StartPage');
                      }
                    },
                    { text: "Crear sitio", 
                      handler:() =>{
                        this.navCtrl.push('NewFavoriteSitePage');
                      }
                    }
                  ]
              });
              alert.present();
            }else{       
              let alert = this.alertController.create({
                title: "Revisa tu conexión a internet",
                message: "No pudimos traer la información!",
                  buttons: [
                    { text: 'Aceptar', 
                      handler: () => {
                        this.navCtrl.push('StartPage');
                      }
                    }
                  ]
              });
              alert.present();
            }
            
          }, 
          error =>{
            loader.dismiss();
            let alert = this.alertController.create({
              title: "Revisa tu conexión a internet",
              message: "No pudimos traer la información!",
                buttons: [
                  { text: 'Aceptar', 
                    handler: () => {
                      this.navCtrl.push('StartPage');
                    }
                  }
                ]
            });
            alert.present();
          }).catch( (error) =>{
            loader.dismiss();
            let alert = this.alertController.create({
              title: "Revisa tu conexión a internet",
              message: "No pudimos traer la información!",
                buttons: [{ text: 'Aceptar' }]
            });
            alert.present();
            console.log("Catch Error: " + error);
          });
      });
    });
  }
  

  AddNewSiteFavorite(){
     this.navCtrl.push('NewFavoriteSitePage');
  }

  /******************************************************************
  ********************************************************************
                        Metodos modal - Google Maps
  *********************************************************************
  ********************************************************************/
  PresentPathModal(index) {
    let vehicleModal = this.modalCtrl.create(FavoriteModalPage,{ sitio: this.favoriteSites[index] });
    vehicleModal.onDidDismiss(() => {
      this.ChargeSiteList();
    });
    vehicleModal.present();
  }
  /******************************************************************
  ********************************************************************
                      Fin    Metodos modal - Google Maps
  *********************************************************************
  ********************************************************************/
  DeleteSite(siteId){
    
    let alert = this.alertController.create({
      title: "¿Está seguro?",
      message: "Presione el botón borrar si quiere borrar definitvamente el sitio, o cancelar en caso contrario.",
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },{
          text: "Borrar",
          handler: () => {
             this.CallDeleteSite(siteId);
          }
        }
      ]
    });
    alert.present();
  }
  /* Llaman al API */
  CallDeleteSite(sitedId){
    let settings = {"directory": "Sites/DeleteFavorite/","method": "POST","parameters": 'siteId=' + sitedId};
    this.webApi.CallWebApi(settings).then((data) => {
       let alert = this.alertController.create({
          title: "Sitio borrado",
          message: "Sitio fue borrado correctamente.",
          buttons: [{ 
            text: 'Aceptar', 
            handler: () => {
              this.ChargeSiteList();
            }
          }]
        });
        alert.present();
    }, (error)=>{
      let alert = this.alertController.create({
        title: "Ups! Hubo un error",
        message: "No pudimos borrar tu sitio, intenta más tarde.",
          buttons: [{ text: 'Aceptar' }]
      });
      alert.present();
    }).catch((error) => {
      let alert = this.alertController.create({
        title: "Ups! Hubo un error",
        message: "No pudimos borrar tu sitio, intenta más tarde.",
          buttons: [{ text: 'Aceptar' }]
      });
      alert.present();
    })
  }
 
}
