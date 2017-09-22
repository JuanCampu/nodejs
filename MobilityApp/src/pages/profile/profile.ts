import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController,Platform} from 'ionic-angular';

import { WebApiProvider } from '../../providers/web-api/web-api';
import { PhotoProvider } from '../../providers/photo/photo';
import { Storage } from '@ionic/storage';
import { ActionSheetController} from 'ionic-angular';
import { NetworkServiceProvider } from '../../providers/network-service/network-service';

import { TextToSpeech } from '@ionic-native/text-to-speech';
import { Subscription} from 'rxjs/Subscription';
/**
 * Generated class for the ProfilePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {
  photo: any;
  imageData: string;
  isLoading: Boolean = true;
  pause:Subscription;
  
  usuario = {"nombre": "","celular": "","cedula": "","email": "","usuarioId": ""};
  constructor(
        public navCtrl: NavController, 
        public navParams: NavParams,
        public webApi: WebApiProvider,
        public loadingCtrl: LoadingController,
        private tts: TextToSpeech,
        public alertController: AlertController,
        public storage: Storage,
        public photoProvider: PhotoProvider,
        public networkService:NetworkServiceProvider,
        public platform: Platform,
        public actionSheetCtrl: ActionSheetController){ 
          platform.ready().then(() => {
            this.pause = this.platform.pause.subscribe(() => {
              this.tts.speak("");
            });
        });
  }
  
  ionViewCanEnter(){
    this.isLoading = true;
  }

  ionViewWillLeave(){
    this.tts.stop();
    this.tts.speak("");
    this.pause.unsubscribe();
  }
  ionViewWillEnter () { 
    
    this.loadForm(); 
    this.photo = 'assets/img/profile-img.png';
   
  }
  loadForm() {
    let loader = this.loadingCtrl.create({
      content: "Cargando Perfil"
    });
    loader.present();
    this.storage.ready().then(() => {
      this.storage.get('userId').then((Id) => {
        let settings = {"directory": "User/GetUser","method": "GET","parameters": "/"+ Id};
        this.webApi.CallWebApi(settings).then(
          data => {
            loader.dismiss();   
            this.isLoading = false;
     
                    
            this.usuario.nombre = data.usuario_nombre;
            if(data.usuario_cedula == null || data.usuario_cedula == null){
              data.usuario_cedula = "";
            }
            if(data.usuario_celular == null || data.usuario_celular == null){
              data.usuario_celular = "";
            }
            this.usuario.cedula = data.usuario_cedula;
            this.usuario.celular = data.usuario_celular;
            this.usuario.email = data.usuario_correo;
            this.photo = 'data:image/png;base64,' + data.usuario_foto;
          },
          error => {
            loader.dismiss();
            this.isLoading = false;
            this.AlertErrorMessage("Ups! Problemas con la conexión a internet!", "Por favor revisa tu conexión e intenta de nuevo.");
            console.log(error);          
          }
        );
      }).catch((error)=>{
          loader.dismiss();
          this.AlertErrorMessage("Ups! Problemas con la conexión a internet!", "Por favor revisa tu conexión e intenta de nuevo.");
          console.log(error);      
      });
    });
  }
  ChangePhoto(): any { 
    this.photoProvider.GetPicture().then((imageData) => {
      let loader = this.loadingCtrl.create({
        content: "Actualizando foto"
      });
      loader.present();
      this.storage.ready().then(() => {
        this.storage.get('userId').then((Id) => {
          this.webApi.ChangeUserPhoto(Id, imageData).then((data) => {
            loader.dismiss();
            this.photo = 'data:image/png;base64,' + data;
          });
        })
      });
    },(error)=>{
      this.AlertErrorMessage("Ups! Problemas con la conexión a internet!", "Por favor revisa tu conexión e intenta de nuevo.");
      console.log(error);  
    }).catch((error)=>{
      this.AlertErrorMessage("Ups! Tuvimos un problema intentado usar la camara!", "Por favor  intenta de nuevo.");
      console.log(error);     
    });
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

 
  goEdit() {
    this.navCtrl.push('EditProfilePage',this.usuario);
  }

}
