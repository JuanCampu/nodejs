import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers} from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { CacheService } from "ionic-cache";
import { Transfer, TransferObject, FileUploadOptions} from '@ionic-native/transfer';
 
/*
  Generated class for the WebApiProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class WebApiProvider {
  private baseUrl = 'http://localhost/MobilityApi/';

  constructor(public http: Http, public transfer: Transfer,public cache: CacheService) {
  }

  CallBicycleRoutes(){
    let url = "http://www.simur.gov.co/SimurMapaMovilidadWA/CiclorutasService";
    return this.http.get(url).toPromise().catch(this.handleError).then(this.extractData);
  }
  CallWebApi(setting: any): Promise<any>{
    let url = this.baseUrl + setting.directory;
    
    if(setting.method == "POST"){
      setTimeout(function() {
        return Promise.reject('Promise timed out after ' + 10000 + ' ms');
       }, 10000);
      let headers = new Headers({
      'Content-Type': 'application/x-www-form-urlencoded'
      });
      let options = new RequestOptions({headers: headers});
      let body = setting.parameters;
      return this.http.post(url, body, options).toPromise().catch(
        this.handleError
      ).then(
        this.extractData
      );
    }else{
      url = url + setting.parameters;
		  return this.CacheItem(url);
    }  
  }

  CreateNewSite(newSite: any): Promise<any>{
    let url = this.baseUrl + "Sites/CreateFavoriteSite";
    let headers = new Headers({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    let options = new RequestOptions({headers: headers});
    let body = 'sitio_nombre='+ newSite.sitio_nombre + '&sitio_descripcion=' + newSite.sitio_descripcion +
    '&sitio_latitud=' + newSite.sitio_latitud + '&sitio_longitud=' + newSite.sitio_longitud + 
    '&sitio_direccion=' + newSite.sitio_direccion + '&usuario_id=' + newSite.usuario_id;
    return this.http.post(url, body, options).toPromise().catch(this.handleError).then(this.extractData);
  }

  
  CacheItem(url){
    return new Promise((resolve, reject)=>{
      this.cache.getItem(url).catch(() => {
          // fall here if item is expired or doesn't exist
         /*  this.http.get(url).toPromise().catch(this.handleError).then(response => {
            let result=  this.extractData(response);
            resolve(result);
          }); */
      }).then((data) => {
        setTimeout(function() {
            reject('Promise timed out after ' + 10000 + ' ms');
        }, 10000);
        if(typeof data === "undefined"){
          this.http.get(url).toPromise().catch(this.handleError).then(response => {
            let result=  this.extractData(response);
            resolve(result);
          });
        }else if(data != false){
          resolve(data);
        }else{
          resolve("noconnection");
        }
      });
    });

  }



  CreateVehicle(vehicle: any) : Promise<any> {
    return new Promise((resolve, reject)=>{
      let url = this.baseUrl + 'Vehicle/CreateVehicle';
      const fileTransfer: TransferObject = this.transfer.create();
      let options: FileUploadOptions = {
        chunkedMode: false,
        fileKey: 'file',
        fileName: 'image.jpg',
        headers: {},
        params: { "vehicle": JSON.stringify(vehicle) }
      }
      fileTransfer.upload(vehicle.vehiculo_foto, url, options)
        .then((data) => {
         resolve(data.response);
        },(err) => {
          reject(err);
      });
  
    });
    
  }



  ChangeUserPhoto(userId: string, imageData: any) : Promise<any> {
    return new Promise((resolve, reject) => {
      let url = this.baseUrl + "User/ChangePhoto";
      const fileTransfer: TransferObject = this.transfer.create();
      let options: FileUploadOptions = {
        chunkedMode: false,
        fileKey: 'file',
        fileName: 'image.jpg',
        headers: {},
        params: { "userId": userId }
      }
      fileTransfer.upload(imageData, url, options)
        .then((data) => {
          resolve(JSON.parse(data.response).newPhoto);
        },(err) => {
          reject(err);
      });
    });  
  }

  ChangeVehiclePhoto(vehicleId: string, imageData: any) : Promise<any> {
    return new Promise((resolve, reject) => {
      let url = this.baseUrl + "Vehicle/ChangePhoto";
      const fileTransfer: TransferObject = this.transfer.create();
      let options: FileUploadOptions = {
        chunkedMode: false,
        fileKey: 'file',
        fileName: 'image.jpg',
        headers: {},
        params: { "vehicleId": vehicleId }
      }
      fileTransfer.upload(imageData, url, options)
        .then((data) => {
          resolve(JSON.parse(data.response).newPhoto);
        },(err) => {
          reject(err);
      });
    });  
  }

  private extractData(res: Response) {
    console.log(res);
    let body = res.json();
    return body;
  }

  private handleError(res: Response | any) {
    console.log(res);
    return Promise.reject("Hubo un error conectando al servidor");
  }

}
