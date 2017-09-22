import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController} from 'ionic-angular';

import { FormBuilder, FormGroup } from '@angular/forms';
import { WebApiProvider } from '../../providers/web-api/web-api';
import { NotificationProvider } from '../../providers/notification/notification';

import { Storage } from '@ionic/storage';

import { EmailValidator } from  '../../app/validators/email';
import { NetworkServiceProvider } from '../../providers/network-service/network-service';

/**
 * Generated class for the RegisterPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
})
export class RegisterPage {
  
  private siteForm : FormGroup;

  constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public alertController: AlertController,
        public loadingCtrl: LoadingController,
        public webApi: WebApiProvider,
        public networkService:NetworkServiceProvider,
        public formBuilder: FormBuilder,
        public storage: Storage, 
        public notification: NotificationProvider) { 
            
             this.siteForm = this.formBuilder.group({
              usuario_correo:['', EmailValidator.isValid]
            });
        }
  
  secretarias: any;
	entidades: any;
	//entidadesToChoose: any;
  email: any;
  verificationCode: string;
	code: string;
	todo = {
        "nombre": "",
		    "secretaria": "",
        "entidad": ""
	};
  verification = 0;
  isRegistered = false;
  ionViewWillEnter(){
    if(this.networkService.connectionState){
      let settings = {"directory": "sector/sector/","method": "GET","parameters": ""};
      this.webApi.CallWebApi(settings).then(
        data => {
          this.secretarias = data["secretarias"];
          this.entidades = data["entidades"];
        },
        error => {
          this.showAlert(error, "Error");
        }
      ).catch((error)=>{
        this.showAlert(error, "Error");
      });
    }
  
     this.storage.get('emailState').then((value) =>{
      if(value == 'inProcess'){
        this.verification = 0; 
      }else if(value == 'register'){
        this.navCtrl.push('StartPage');
      }
    });
  }


	/*recharging() {
		this.entidadesToChoose = this.entidades.filter(x => x.secretaria_id === this.todo.secretaria);
	}*/
  sendEmail() {
    let loader = this.loadingCtrl.create({
      content: "Verificando su correo"
    });
    loader.present();
    let settings = {"directory": "Domain/ValidDomain/","method": "GET","parameters": this.siteForm.value['usuario_correo'] };
    this.webApi.CallWebApi(settings).then(
      data => {
        loader.dismiss();
        if (data.response == null) {
          this.showAlert("El correo ingresado no pertenece a un dominio de la alcaldía", "Dominio no válido.");
        } else{
         if (typeof data.isRegistered !== 'undefined') {
            this.storage.set('userId', data.isRegistered);
            this.isRegistered = true;
          }   
          this.code = data.response;
          this.verification = 1; 
          this.storage.set('emailState', 'inProcess');
          this.storage.set('email', this.siteForm.value['usuario_correo']);
          this.notification.RegisterDevice();
      
        }
        
      },
      error => {
        loader.dismiss();
        console.dir(error);
        this.showAlert(error, "Error");
      }
    ).catch((error)=>{
      this.showAlert(error, "Error");
    });
	}

	logForm() {
		let loader = this.loadingCtrl.create({
			content: "Creando perfil"
		});
		loader.present();
    if(this.todo.nombre == "" || this.todo.entidad == ""){
      loader.dismiss();
      this.showAlert("Llena todos los campos", "Error");
      return;
    }
  this.storage.get('email').then((value) =>{
    let settings = {"directory": "User/CreateUser/","method": "POST","parameters": 'nombre=' + this.todo.nombre + '&entidad=' +  this.todo.entidad + '&correo=' + value };
     this.webApi.CallWebApi(settings).then(
			data => {
				loader.dismiss();
				this.storage.set('emailState', 'register');
        this.storage.set('userId', data[0]['newId']);
				this.showAlert("Haz completado tu registro con éxito!", "Felicitaciones");
        this.navCtrl.setRoot('StartPage');
			},
			error => {
				loader.dismiss();
				console.log(error);
				this.showAlert(error, "Error");
			}
		).catch((error)=>{
      this.showAlert(error, "Error");
    });
  });
		
		
	}
  verify() {
    this.verificationCode = this.verificationCode.toUpperCase();
		if (this.verificationCode == this.code) {
     
      if(this.isRegistered == true){
        this.storage.set('emailState', 'register');
        this.navCtrl.setRoot('StartPage');
      }else{
        setTimeout(this.verification = 2, 2000);
      }
      
    }else{
      this.showAlert("Ups! este código no coincide", "Error");
    }
  }
  showAlert(message: string, title: string) {
    let alert = this.alertController.create({
      title: title,
      message: message,
      buttons: [{ text: 'Aceptar' }]
    });
    alert.present();
  }

}
