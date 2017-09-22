import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
/**
 * Generated class for the GoogleMapPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
declare var google;
@IonicPage()
@Component({
  selector: 'page-google-map',
  templateUrl: 'google-map.html',
})
export class GoogleMapPage {
  @ViewChild('map') mapElement: ElementRef;
  private map: any;
  private geocoder: any;
  private dragStart = false;
  private visible = true;
  private latitud : any;
  private longitud: any;
  constructor(
    public geolocation: Geolocation, public viewCtrl: ViewController, 
    public navCtrl: NavController, public navParams: NavParams) {
      this.geocoder = new google.maps.Geocoder;
      this.latitud = this.navParams.get("latitude");
      this.longitud = this.navParams.get("longitude");
  }
  ionViewWillEnter(){
    if(this.latitud != null && this.longitud != null){
      this.CreateMap(this.latitud, this.longitud);
    }else{
      if(this.geolocation == null){
        this.CreateMap(parseFloat(this.latitud), parseFloat(this.longitud));
      }else{
        this.geolocation.getCurrentPosition({enableHighAccuracy: true}).then((position) => {
          this.CreateMap(position.coords.latitude, position.coords.longitude);
        }, (err) => {
          this.CreateMap(4.5993592, -74.0778212);
        }).catch((err) => {
          this.CreateMap(4.5993592, -74.0778212);
        }); 
      }
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
      this.viewCtrl.dismiss(data);
    });
  }
  CreateMap(latitud: any, longitude: any){
      let latLng = new google.maps.LatLng(latitud, longitude);
      let mapOptions = {
        center: latLng, zoom: 17, mapTypeId: google.maps.MapTypeId.ROADMAP, streetViewControl: false
      }
      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
      this.visible = false;
      google.maps.event.addListener(this.map , 'dragstart', (event) => {
        this.dragStart = true;
      });
      google.maps.event.addListener(this.map , 'dragend', (event) => {
        this.dragStart = false;
      });
  }
}
