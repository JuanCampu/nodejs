import { Component } from '@angular/core';
import { IonicPage, NavController, LoadingController, NavParams, AlertController } from 'ionic-angular';

import {Validators, FormBuilder, FormGroup } from '@angular/forms';
import { EmailValidator } from  '../../app/validators/email';
import { WebApiProvider } from '../../providers/web-api/web-api';
import { PhotoProvider } from '../../providers/photo/photo';
import { Storage } from '@ionic/storage';
import { FilePath } from '@ionic-native/file-path';
import { NetworkServiceProvider } from '../../providers/network-service/network-service';

/**
 * Generated class for the NewVehiclePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-new-vehicle',
  templateUrl: 'new-vehicle.html',
})
export class NewVehiclePage {

  imageData: string;
  photo = 'assets/img/Vehiculo-Default.png';
  test: any;
  image1: any;
  private siteForm : FormGroup;
  cupos = ["1","2","3","4","5","6","7","8","9","10"];
  currentYear: any;
  currentDate:any;
  nextYear: any;
  isClickedOnce: any;
  loader:any; 
  isVisited = {"placa": false,"marca": false, "modelo":false, "color":false, "cupo":false }; //Indica si el usuario está dentro del input o fuera de el (focus o onblur)


  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public webApi: WebApiProvider,
    public storage: Storage,
    public photoProvider: PhotoProvider,
    public loadingCtrl: LoadingController,
    public networkService:NetworkServiceProvider,
    public formBuilder: FormBuilder,
    public alertController: AlertController,
    public filePath: FilePath) {
      this.currentDate = new Date();
      this.currentYear = this.currentDate.getFullYear();
      this.siteForm = this.formBuilder.group({
        vehiculo_placa:['',[ Validators.maxLength(6),Validators.minLength(6),Validators.required, EmailValidator.isPlaque]],
        vehiculo_marca:['',[Validators.required,Validators.maxLength(20),Validators.minLength(4),Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ ]{0,80}')]],
        vehiculo_modelo:['',Validators.required],
        vehiculo_color:['',[Validators.required,Validators.maxLength(20),Validators.minLength(4),Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ ]{0,80}')]],
        vehiculo_foto:[''],
        vehiculo_cupo:['',Validators.required],
        usuario_id:['']
      });
  }
  ionViewWillEnter(){
   this.photo = this.GetImgPath(this.photo);
  }

  isVisitedChangeForm(input){
    
    if(this.isVisited[input] == false){
      this.isVisited[input] = true;
    }else{
      this.isVisited[input] = false;
    }
    
  }
 
  CreateVehicle(){

   this.isClickedOnce = true;
    this.loader = this.loadingCtrl.create({
      content: "Creando Vehículo"
    });
    this.loader.present();
    this.siteForm.controls["vehiculo_placa"].setValue(this.siteForm.controls["vehiculo_placa"].value.toUpperCase());
    if(this.imageData != null){
       this.siteForm.controls["vehiculo_foto"].setValue(this.imageData);  
    }else{
        this.siteForm.controls["vehiculo_foto"].setValue(this.photo);  
    }
     this.storage.ready().then(() => {
      this.storage.get('userId').then((Id) => {
        this.siteForm.controls["usuario_id"].setValue(Id); 
        this.CallAPI();
     });
    });   
  }
  GetImgPath(img){

    this.image1 = new Image();
    this.image1.src=img;
    return this.image1.src;
  
  }
  GetPhoto(): any { 
    this.photoProvider.GetPicture().then((imageData) => {
      let loader = this.loadingCtrl.create({
        content: "Subiendo  foto"
      });
      loader.present();
      this.imageData = imageData;
      this.photo = imageData;
      loader.dismiss();      
    },(error)=>{
      this.AlertInternet("Ups! Problemas con la conexión a internet!", "Por favor revisa tu conexión e intenta de nuevo.");
      console.log(error);  
    }).catch((error)=>{
      this.AlertInternet("Ups! Tuvimos un problema intentado usar la camara!", "Por favor  intenta de nuevo.");
      console.log(error);    
    });
  }  

  CallAPI(){
    
    this.webApi.CreateVehicle(this.siteForm.value).then(
        data => {
           this.loader.dismiss();
          if(data == "true"){
           let alert = this.alertController.create({
              title: "Vehículo creado",
              message: "El vehículo fue creado de manera exitosa.",
                buttons: [
                  { text: 'Aceptar', 
                    handler: () => {
                      this.navCtrl.pop();
                    }
                  }
                ]
            });
            alert.present();
          }else if(data == "false"){
             let alert = this.alertController.create({
              title: "Ups! Hubo un error",
              message: "No pudimos crear  tu vehículo, intenta más tarde.",
                buttons: [{ text: 'Aceptar',
                 handler: () => {
                  this.navCtrl.pop();
                } }]
            });
            alert.present();
          }else{
            let alert = this.alertController.create({
              title: "Ups! Número de placa registrada.",
              message: "La placa que estás intentando colocar ya fue registrada.",
                buttons: [{ text: 'Aceptar',
                handler: () => {
                  this.navCtrl.pop();
                }
               }]
            });
            alert.present();
          } 
        },
        error =>{
            this.loader.dismiss();
            this.loader.dismiss(); 
            let title = "Revisa tu conexión a internet";
            let message = "No pudimos traer la información!";
            this.AlertInternet(title,message);  
            console.log(error);
        }
    ).catch((error) => {
      this.loader.dismiss();
      let alert = this.alertController.create({
        title: "Ups! Hubo un error",
        message: "No pudimos crear  tu vehículo, intenta más tarde.",
          buttons: [{ text: 'Aceptar' }]
      });
      alert.present();
    });
  }
  AlertInternet($title, $message){
    let alert = this.alertController.create({
      title: $title,
      message: $message,
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
  AlertMessage(title, message){
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

}
