import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController} from 'ionic-angular';
import { CustomValidators } from 'ng2-validation';
import { Validators,FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { WebApiProvider } from '../../providers/web-api/web-api';
import { Storage } from '@ionic/storage';
import { NetworkServiceProvider } from '../../providers/network-service/network-service';
/**
 * Generated class for the EditProfilePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage() 
@Component({
  selector: 'page-edit-profile',
  templateUrl: 'edit-profile.html',
})
export class EditProfilePage {

  private siteForm : FormGroup;
  isVisited = {"nombre": false,"cedula": false, "celular":false }; //Indica si el usuario está dentro del input o fuera de el (focus o onblur)
  isLoading: Boolean = true;
  availableNetwork:boolean;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public webApi: WebApiProvider,
    public loadingCtrl: LoadingController,
    public alertController: AlertController,
    public networkService:NetworkServiceProvider,
    public storage: Storage,
     public formBuilder: FormBuilder) {

        this.siteForm = new FormGroup({
          usuario_nombre: new FormControl('',[ Validators.maxLength(60),Validators.minLength(4),Validators.required,Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ ]{0,80}')] ),
          usuario_cedula: new FormControl('',[ Validators.maxLength(10),Validators.minLength(6),Validators.required,CustomValidators.number]),
          usuario_celular: new FormControl('', [Validators.maxLength(10),Validators.minLength(10),Validators.required,CustomValidators.number]),
          usuario_id: new FormControl(''),
        });
  }
  ngOnInit() { 
    this.LoadForm(); 
  }

  LoadForm() {
    let loader = this.loadingCtrl.create({
      content: "Cargando Perfil"
    });
    loader.present();
    this.siteForm.controls["usuario_nombre"].setValue(this.navParams.get("nombre")); 
    this.siteForm.controls["usuario_celular"].setValue(this.navParams.get("celular")); 
    this.siteForm.controls["usuario_cedula"].setValue(this.navParams.get("cedula")); 
    loader.dismiss();
    this.isLoading = false;
  }
  isVisitedChangeForm(input){
    
    if(this.isVisited[input] == false){
      this.isVisited[input] = true;
    }else{
      this.isVisited[input] = false;
    }
    
  }
  EditForm() {
    let loader = this.loadingCtrl.create({
      content: "Editando Perfil"
    });
    loader.present();
    this.storage.get('userId').then((Id) => {
      this.siteForm.controls["usuario_id"].setValue(Id); 
      let settings = {"directory": "User/EditUser/","method": "POST","parameters": 'usuarioId=' + this.siteForm.controls["usuario_id"].value + '&nombre=' + this.siteForm.controls["usuario_nombre"].value.toUpperCase() + '&celular=' + this.siteForm.controls["usuario_celular"].value + '&cedula=' + this.siteForm.controls["usuario_cedula"].value };
      this.webApi.CallWebApi(settings).then(
        data => {
          loader.dismiss();
          this.ShowAlert("Perfil editado con éxito.", "Edición completa");
        
        },
        error => {
          loader.dismiss();
          this.AlertErrorMessage("Ups! Problemas con la conexión a internet!", "Por favor revisa tu conexión e intenta de nuevo.");
          console.log(error);
        }
      );
    }).catch((error)=>{
      loader.dismiss();
      this.AlertErrorMessage("Ups! Problemas con la conexión a internet!", "Por favor revisa tu conexión e intenta de nuevo.");
      console.log(error);
    });
    
  }
  Cancel(){
    this.navCtrl.pop();
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
      buttons: [{ 
        text: 'Aceptar', 
        handler: () => {
          this.navCtrl.pop();
        }
      }]
    });
    alert.present();
  }

 
}
