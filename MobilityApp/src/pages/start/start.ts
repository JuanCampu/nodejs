import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController, ToastController, LoadingController, AlertController} from 'ionic-angular';
import { WebApiProvider } from '../../providers/web-api/web-api';
import * as io from "socket.io-client";

/**import { Network } from '@ionic-native/network';
 * Generated class for the StartPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-start',
  templateUrl: 'start.html',
})
export class StartPage {

  isLoading: Boolean = true;
  noticias:any;
  socket:any; 
  chatinp:string;
  zone:any;
  chats:any;
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public webApi: WebApiProvider,
    public menuCtrl: MenuController,
    public alertController: AlertController,
    public ngZone: NgZone,
    public loadingCtrl: LoadingController,
    public toast: ToastController) {
      this.zone = ngZone;
      this.chats = [];
      this.chatinp = "";
      /*this.socket = io('http://localhost:2000/');
      this.socket.on("message", (msg) => {
        this.zone.run(()=>{
          this.chats.push(msg);
        });
      }); */
      
  }

  Send(msg){
    if(msg != ''){
      this.socket.emit('message',msg);
    }
    this.chatinp = "";
  }

  ionViewDidLoad(){
    let loader = this.loadingCtrl.create({
      content: "Consultando noticias..."
    });
    loader.present();
    let settings = {"directory": "Report/LastNews","method": "GET","parameters": ""};
    this.webApi.CallWebApi(settings).then(
      data => {
        this.noticias = data;
        loader.dismiss();   
        this.isLoading = false; 
      },
      error => {
        loader.dismiss();
        this.isLoading = false;
        this.AlertErrorMessage("Ups! Problemas con la conexión a internet!", "Por favor revisa tu conexión e intenta de nuevo.");
        console.log(error);          
      }
    ).catch((error)=>{
      loader.dismiss();
      this.AlertErrorMessage("Ups! Problemas con la conexión a internet!", "Por favor revisa tu conexión e intenta de nuevo.");
      console.log(error);      
    });
  }
  
  
  AlertErrorMessage(title, message){
    let alert = this.alertController.create({
      title: title,
      message: message,
      buttons: [{ 
        text: 'Aceptar'
        
      }]
    });
    alert.present(); 
  } 

  openMenu() {
    this.menuCtrl.open();
  }

  closeMenu() {
    this.menuCtrl.close();
  }


}
