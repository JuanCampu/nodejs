import { Component, ViewChild, ElementRef} from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController} from 'ionic-angular';

import { WebApiProvider } from '../../providers/web-api/web-api';


/**
 * Generated class for the BicycleMapPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
declare var google;
@IonicPage()
@Component({
  selector: 'page-bicycle-map',
  templateUrl: 'bicycle-map.html',
})
export class BicycleMapPage {
  @ViewChild('map') mapElement: ElementRef;
  map: any;
  loader: any;
  constructor(public navCtrl: NavController, public navParams: NavParams,  
    public loadingCtrl: LoadingController,
    public webApi: WebApiProvider,
    public alertController: AlertController) {
  }

  ionViewDidLoad() {
    this.loader = this.loadingCtrl.create({
      content: "Cargando ciclo rutas..."
    });
    this.loader.present();
    setTimeout( () =>{this.loader.setContent("Pedaleando...")}, 3500);
    setTimeout( () =>{this.loader.setContent("Ya estamos casi listos...")}, 10500);
    let latLng = new google.maps.LatLng(4.62457504964, -74.1139187163);
    let mapOptions = {
      center: latLng, zoom: 12, mapTypeId: google.maps.MapTypeId.ROADMAP, streetViewControl: false
    }    
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

    this.webApi.CallBicycleRoutes().then(
      data =>{
        this.loader.dismiss();
        data.forEach(element => {
          let coordinates = element.points.split(" ");
          let path = [];
          for(var i = 0; i < coordinates.length; i++){
            let localitation = coordinates[i].split(",");
            if(localitation.length == 2){
              let latLng2 = new google.maps.LatLng(parseFloat(localitation[1]), parseFloat(localitation[0]));
              path.push(latLng2);
            }
          }
          let polyline = new google.maps.Polyline({
            path: path,
            geodesic: true,
            strokeColor: ''+element.levelofservice,
            strokeOpacity: 1.0,
            strokeWeight: 3,
            title: element.tooltip
          });
          polyline.setMap(this.map);
        }); 
      }, error => {
        this.loader.dismiss();
        this.AlertMessage();
    }).catch(()=>{
      this.loader.dismiss();
      this.AlertMessage();
    });
  }
  AlertMessage(){
    let alert = this.alertController.create({
      title: "Ups! hubo un error",
      message: "No pudimos cargar las ciclo rutas",
      enableBackdropDismiss: false,
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

}
