import { Directive, ElementRef, Input, Output, EventEmitter} from '@angular/core';

/**
 * Generated class for the MyGoogleMapDirective directive.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/DirectiveMetadata-class.html
 * for more info on Angular Directives.
 */
declare var google;
@Directive({
  selector: '[my-google-map]' // Attribute selector
})
export class MyGoogleMapDirective {
  constructor(
    private el: ElementRef) {
  }
  @Output('UpdateLocation') UpdateLocation: EventEmitter<[string, string,string, string]>= new EventEmitter<[string, string, string, string]>();
  @Input('inputIndex') inputIndex: any;
  ngAfterViewInit(){
    let input; 
    if(this.el.nativeElement.localName == 'ion-input'){
      input = this.el.nativeElement.getElementsByTagName('input')[0];
    }else{
      input= this.el.nativeElement;
    }
    var bounds = {
      north: 4.785461937104788,
      south: 4.501622688071698,
      east: -73.96332470703123,
      west: -74.2270029296875
    };
    let searchBox =  new google.maps.places.SearchBox(input); 
    searchBox.setBounds(bounds);
    searchBox.addListener('places_changed', () => {
      var places = searchBox.getPlaces();
      if (places.length == 0) {
        alert("Soy 0")
        return;
      }
      let place = places[0];
      if (!place.geometry) {
        alert("Returned place contains no geometry");
        return;
      }
      if(place.formatted_address != null)
        input.innerHtml = place.formatted_address;
      console.log(this.inputIndex);
      this.UpdateLocation.emit([place.geometry.location.lat(), place.geometry.location.lng(), place.formatted_address, this.inputIndex]);
    });
  }
}
