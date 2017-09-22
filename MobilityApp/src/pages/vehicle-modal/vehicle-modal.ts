import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,ViewController, LoadingController, AlertController } from 'ionic-angular';
import {Validators, FormBuilder, FormGroup } from '@angular/forms';
import { EmailValidator } from  '../../app/validators/email';
import { WebApiProvider } from '../../providers/web-api/web-api';
import { PhotoProvider } from '../../providers/photo/photo';
import { NetworkServiceProvider } from '../../providers/network-service/network-service';
/**
 * Generated class for the VehicleModalPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-vehicle-modal',
  templateUrl: 'vehicle-modal.html',
})
export class VehicleModalPage {
  
  vehicleId:any;
  cupos = ["1","2","3","4","5","6","7","8","9","10"];
  vehicle = {"vehiculo_placa": "","vehiculo_marca": "","vehiculo_modelo": "","vehiculo_color": "","vehiculo_cupo": "","vehiculo_id": ""};
  currentYear: any;
  currentDate:any;
  loader:any;
  apiPath = {"directory": "","method": "","parameters": ""};// Arreglo para consultar el API
  isVisited = {"placa": false,"marca": false, "modelo":false, "color":false, "cupo":false }; //Indica si el usuario está dentro del input o fuera de el (focus o onblur)  
  private siteForm : FormGroup;
  isLoading: Boolean = true;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public formBuilder: FormBuilder,
    public webApi: WebApiProvider,
    public networkService:NetworkServiceProvider,
    public loadingCtrl: LoadingController,
    public alertController: AlertController,
    public photoProvider : PhotoProvider
  ) {
    this.vehicleId =  navParams.get('vehicleId');
    this.currentDate = new Date();
    this.currentYear = this.currentDate.getFullYear();
    this.siteForm = this.formBuilder.group({
      vehiculo_placa:['',[ Validators.maxLength(6),Validators.minLength(6),Validators.required, EmailValidator.isPlaque]],
      vehiculo_marca:['',[Validators.required,Validators.maxLength(20),Validators.minLength(4),Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ ]{0,80}')]],
      vehiculo_modelo:['',Validators.required],
      vehiculo_color:['',[Validators.required,Validators.maxLength(20),Validators.minLength(4),Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ ]{0,80}')]],
      vehiculo_foto:['assets/img/Vehiculo-Default.png'],
      vehiculo_cupo:['',Validators.required],
      vehiculo_id:['',Validators.required],
      usuario_id:['']
    });
  }

  ionViewDidLoad() {
    this.CallReadAPI();
  }
  Cancel(){
    this.viewCtrl.dismiss();
  }

  isVisitedChangeForm(input){
    if(this.isVisited[input] == false){
      this.isVisited[input] = true;
    }else{
      this.isVisited[input] = false;
    } 
  }
  ChangePhoto(vehicleId): any { 
    this.photoProvider.GetPicture().then((imageData) => {
      let message = "Actualizando foto."
      this.LoadingMessage(message);
        this.webApi.ChangeVehiclePhoto(vehicleId, imageData).then((data) => {
          this.loader.dismiss();
          this.siteForm.controls["vehiculo_foto"].setValue('data:image/png;base64,' + data); 
        },
        (error) =>{
         
        });
    }, (error) =>{
   
    });
  }   


  
  EditVehicle(){
    this.vehicle["vehiculo_placa"] =   this.siteForm.controls["vehiculo_placa"].value.toUpperCase();
    this.vehicle["vehiculo_marca"] =  this.siteForm.controls["vehiculo_marca"].value;
    this.vehicle["vehiculo_modelo"] =  this.siteForm.controls["vehiculo_modelo"].value;
    this.vehicle["vehiculo_color"] =  this.siteForm.controls["vehiculo_color"].value;
    this.vehicle["vehiculo_cupo"] =  this.siteForm.controls["vehiculo_cupo"].value;
    this.vehicle["vehiculo_id"] =  this.siteForm.controls["vehiculo_id"].value; 
    this.CallUpdateAPI(this.vehicle);
   
  }
  CallUpdateAPI(vehicle){
    this.apiPath.directory = 'Vehicle/UpdateVehicle';
    this.apiPath.method = 'POST';
    this.apiPath.parameters = "vehicle=" +JSON.stringify(vehicle);
    let message = "Actualizando Vehículo."
    this.LoadingMessage(message);
    this.API();  
  }
 /******************************************************************
  ********************************************************************
                        Metodos que llaman al API 
  *********************************************************************
  ********************************************************************/
  CallReadAPI(){
    let message = "Cargando el vehículo."
    this.LoadingMessage(message);
    this.apiPath.directory = 'Vehicle/ReadVehicle';
    this.apiPath.method = 'GET';
    this.apiPath.parameters = "/" +this.vehicleId +"/0";
    this.webApi.CallWebApi(this.apiPath).then(
      data => {
        this.siteForm.controls["vehiculo_placa"].setValue(data[0].vehiculo_placa); 
        this.siteForm.controls["vehiculo_marca"].setValue(data[0].vehiculo_marca); 
        this.siteForm.controls["vehiculo_modelo"].setValue(data[0].vehiculo_modelo); 
        this.siteForm.controls["vehiculo_color"].setValue(data[0].vehiculo_color); 
        this.siteForm.controls["vehiculo_foto"].setValue('data:image/png;base64,'+data[0].vehiculo_foto); 
        this.siteForm.controls["vehiculo_cupo"].setValue(data[0].vehiculo_cupo); 
        this.siteForm.controls["vehiculo_id"].setValue(data[0].vehiculo_id); 
        this.loader.dismiss(); 
        this.isLoading = false;
      },
      error =>{
        console.log(error);
        let title = "Ups! Hubo un error";
        let message = "No pudimos traer la información de  tu vehículo, intenta más tarde.";
        this.AlertMessage(title,message);
        this.loader.dismiss(); 
        this.isLoading = false;
        
      }).catch((error) => {
          console.log(error);
          let title = "Ups! Hubo un error";
          let message ="No pudimos traer la información de  tu vehículo, intenta más tarde.";
          this.AlertMessage(title,message);
          this.loader.dismiss(); 
          this.isLoading = false; 
      });
  }


  API(){
    this.webApi.CallWebApi(this.apiPath).then(
        data => {
          if(data == true){
            this.loader.dismiss(); 
            let title = "Vehículo actualizado";
            let message = "Te invitamos a ver tus vehículos.";
            this.AlertMessage(title,message);  
          }else if(data == false){
            this.loader.dismiss(); 
            let title = "Ups! Hubo un error";
            let message = "No pudimos actualizar  tu vehículo, intenta más tarde.";
            this.AlertMessage(title,message);  
          }else{
            this.loader.dismiss(); 
            let title = "Ups! Número de placa registrada.";
            let message = "La placa que estás intentando colocar ya fue registrada.";
            this.AlertMessagePlaque(title,message);  
          }
         
        },
        error =>{
          console.log(error);
          let title = "Ups! Hubo un error";
          let message = "No pudimos actualizar  tu vehículo, intenta más tarde.";
          this.AlertMessage(title,message);
          this.loader.dismiss(); 
          
        }
    ).catch((error) => {
      console.log(error);
      let title = "Ups! Hubo un error";
      let message = "No pudimos actualizar  tu vehículo, intenta más tarde.";
      this.AlertMessage(title,message);
        this.loader.dismiss();  
    });
  }
   /******************************************************************
  ********************************************************************
                      Fin   Metodos que llaman al API 
  *********************************************************************
  ********************************************************************/


   /******************************************************************
  ********************************************************************
                        Metodos de alerta y loading 
  *********************************************************************
  ********************************************************************/
  AlertMessage(title, message){
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
  AlertMessagePhoto(title, message){
    let alert = this.alertController.create({
      title: title,
      message: message,
      buttons: [{ 
        text: 'Aceptar', 
        handler: () => {
        }
      }]
    });
    alert.present(); 
  }

  AlertMessagePlaque(title, message){
    let alert = this.alertController.create({
      title: title,
      message: message,
      buttons: [{ 
        text: 'Aceptar'
      }]
    });
    alert.present(); 
  }
  
  LoadingMessage(message){
  this.loader = this.loadingCtrl.create({
    content: message
  });
  this.loader.present();
  }
/******************************************************************
********************************************************************
                  Fin  Metodos de alerta y loading 
*********************************************************************
********************************************************************/
}
