import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {Validators, FormBuilder, FormGroup} from '@angular/forms';
import { PathNearPage } from '../path-near/path-near';
import { NetworkServiceProvider } from '../../providers/network-service/network-service';
/**
 * Generated class for the SearchNamePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-search-name',
  templateUrl: 'search-name.html',
})
export class SearchNamePage {
  private nameForm: FormGroup;
  isVisited = {"nombre": false }; //Indica si el usuario está dentro del input o fuera de el (focus o onblur)
  constructor(
    public navCtrl: NavController,
    private formBuilder: FormBuilder,
    public networkService:NetworkServiceProvider, 
    public navParams: NavParams) {
      this.nameForm = this.formBuilder.group({
        nombre: ['', [ Validators.maxLength(60),Validators.minLength(3),Validators.required,Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ ]{0,80}')]],
      });
  }
  isVisitedChangeForm(input){
    if(this.isVisited[input] == false){
      this.isVisited[input] = true;
    }else{
      this.isVisited[input] = false;
    }
  }
  GoNearPaths(){
    this.navCtrl.push(PathNearPage, {name: this.nameForm.controls["nombre"].value});
  }


}
