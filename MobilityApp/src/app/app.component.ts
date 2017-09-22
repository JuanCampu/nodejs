import { Component, ViewChild} from '@angular/core';
import { Platform, Nav, AlertController, ModalController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';


import { HomePage } from '../pages/home/home';
import { SplashPage } from '../pages/splash/splash';
import { SearchPathPage } from '../pages/search-path/search-path';
import { ProfilePage } from '../pages/profile/profile';
import { StartPage } from '../pages/start/start';
import { RudVehiclePage } from '../pages/rud-vehicle/rud-vehicle';
import { RudFavoriteSitePage } from '../pages/rud-favorite-site/rud-favorite-site';
import { PathPage } from '../pages/path/path';
import { TutorialPage } from '../pages/tutorial/tutorial';
import { TravelHistoryPage } from '../pages/travel-history/travel-history';
import { BicyclePage }  from '../pages/bicycle/bicycle';

import { Storage } from '@ionic/storage';
import { Push, PushObject, PushOptions } from '@ionic-native/push';

import { NotificationProvider } from '../providers/notification/notification';
import { WebApiProvider } from '../providers/web-api/web-api';
import { CacheService } from "ionic-cache";

import { Network } from '@ionic-native/network';
import { NetworkServiceProvider } from '../providers/network-service/network-service';
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  rootPage:any = HomePage;
  pages: Array<{ title: string, component: any,android: string,ios: string }>;
  icons: any;
  pushObject: PushObject;
  alert: any;
  apiPath = {"directory": "","method": "","parameters": ""};// Arreglo para consultar el API

  constructor(public platform: Platform, 
    public statusBar: StatusBar, 
    public push: Push, 
    public splashScreen: SplashScreen, 
    public storage : Storage, 
    public notification: NotificationProvider,
    public alertCtrl: AlertController, 
    public network: Network,
    public webApi: WebApiProvider,
    public modalCtrl: ModalController,
    public networkService:NetworkServiceProvider,
    public cache: CacheService) {
    this.initializeApp();
    this.pages = [
        { title: 'Inicio', component: StartPage, android: 'md-calendar',ios: 'md-calendar'},
        { title: 'Perfil', component: ProfilePage , android: 'md-person',ios: 'md-person'},
        { title: 'Vehiculos', component: RudVehiclePage, android: 'md-car',ios: 'ios-car'},
        { title: 'Mis sitios favoritos', component: RudFavoriteSitePage, android: 'md-map',ios: 'ios-map'},
        { title: 'Rutas', component: PathPage, android: 'md-pin',ios: 'ios-pin'},
        { title: 'Buscar Viaje', component: SearchPathPage, android: 'md-search',ios: 'ios-search'},
        { title: 'Historial Viajes', component: TravelHistoryPage, android: 'ios-paper',ios: 'ios-paper'},
        { title: 'Bicimovilidad', component: BicyclePage, android: 'md-bicycle',ios: 'ios-bicycle'},
        { title: 'Tutorial', component: TutorialPage, android: 'md-images',ios: 'md-images'},
        { title: 'Cerrar Sesión', component: null, android: 'md-close-circle',ios: 'ios-close-circle'}
        
    ];
    cache.setDefaultTTL(60 * 60);
  }
  initializeApp() {
      this.platform.ready().then(() => {
        console.log("paso 0");
        if (this.network.type == 'none' ) { 
          // stuff if disconnected
          console.log("paso 1");
         this.networkService.connectionState = false;
        }else{
          this.networkService.connectionState = true;
        }
          this.statusBar.styleDefault();
           //this.splashScreen.hide(); // REMOVE THIS!
          let splash = this.modalCtrl.create(SplashPage);
         
          this.initPushPlugin();
          splash.present();
      });
  }
  initPushPlugin(){
    if(this.platform.is('android') || this.platform.is('ios')){
        this.push.hasPermission().then((res) => {
            if(res.isEnabled){
                this.configPushPlugin();
            }else{
                alert("No tienes permisos de notificación para esta aplicación");
            }
        });
    }
  }
  configPushPlugin(){
    console.log("Entre a configurar el plugin");
    const options: PushOptions = {
      android: { senderID: '772094390237', sound: true, forceShow: false, vibrate: true},
      ios: { alert: 'true', badge: true, sound: 'false'},
      windows: {}
    };
    
    this.pushObject = this.push.init(options);
    this.pushObject.on('notification').subscribe((notification: any) => {
        this.notification.OpenNotification(notification);
        this.pushObject.clearAllNotifications();
    });
    
    this.pushObject.on('registration').subscribe((registration: any) => {
      this.storage.ready().then(() => {
        this.storage.get('registrationId').then((registrationId) =>{
          console.log("Registro Id");
          console.log(registrationId);
          if(registrationId == undefined){
            console.log("Metodo de registro");
           this.GetRegistrationId();
          }
          this.storage.set('deviceId', registration.registrationId);
          console.log("Entre a registrar el dispositivo");
          this.notification.RegisterDevice();
        });
      });
    });
    this.pushObject.on('error').subscribe(error => console.error('Error with Push plugin', error));
    
  }
 /*  VerifyPaths(){
    this.storage.ready().then(() => {
      this.storage.get('emailState').then((name) =>{
        if(name == 'register'){
          this.storage.get('userId').then((userId) =>{
            this.apiPath.directory = 'Path/VerifyInitPaths';
            this.apiPath.method = 'POST';
            this.apiPath.parameters = "userId=" + userId;
            this.webApi.CallWebApi(this.apiPath);
          });
        }
      });
    });
  } */
  GetRegistrationId(){
    this.apiPath.directory = 'TestNH/CreateDevice';
    this.apiPath.method = 'POST';
    this.apiPath.parameters = "";
    this.webApi.CallWebApi(this.apiPath).then(
        data => {
          console.log(data);
          this.storage.set('registrationId', data.registrationId);
        },
        error =>{
          console.log("Error:"+error);
        }
    ).catch((error) => {
      console.log("Error:"+error);
    });
  }

  openPage(page) {
    if(page.component) {
        this.nav.push(page.component);
    } else {
        // Since the component is null, this is the logout option
        // ...
        this.storage.set('emailState', 'inProcess');
        this.storage.set('userId', 0);
        this.storage.set('email', "");
        this.notification.RegisterDevice();
        // logout logic
        // ...
        // redirect to home
        this.nav.setRoot(HomePage);
 
    }
  }
  

  ngAfterViewInit() {
    this.networkService.SubscribreConnection();
  }

}

