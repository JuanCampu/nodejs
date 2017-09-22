import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';



import { Camera } from '@ionic-native/camera';
import { ActionSheetController} from 'ionic-angular';

/*
  Generated class for the PhotoProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class PhotoProvider {
  constructor(
    public actionSheetCtrl: ActionSheetController,
    private camera: Camera) {
    
  }
  GetPicture(options?: any) : Promise<any>{ 
    return new Promise((resolve, reject) => {
      if(options == null){
        options = {
          quality: 100,
          saveToPhotoAlbum: false,
          targetWidth: 300,
          targetHeight: 400,
          correctOrientation: true
        };
      }
      let actionSheet = this.actionSheetCtrl.create({
        title: 'Seleccione el origen',
        buttons: [{
            text: 'Cargar de la galeria',
            handler: () => {
              this.TakePicture(this.camera.PictureSourceType.PHOTOLIBRARY, options).then((imageData) => {
                resolve(imageData);
              }).catch((error) => {
                reject(error);
              });
            }
          },{
            text: 'Usar la camara',
            handler: () => {
              this.TakePicture(this.camera.PictureSourceType.CAMERA, options).then((imageData) => {
                resolve(imageData);
              }).catch((error) => {
                reject(error);
              });
            }
          },{
            text: 'Cancelar',
            role: 'cancel'
          }]
      });
      actionSheet.present();
    });
    
  }
  private TakePicture(sourceType: any, options: any): Promise<any> {
    return new Promise((resolve, reject)=> {
      options.sourceType = sourceType;
      this.camera.getPicture(options).then((imageData) => {
        resolve(imageData);
      }).catch((error) => {
        reject(error);
      });
   })
  }   
}
