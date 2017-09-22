import { NgModule } from '@angular/core';
import { MyGoogleMapDirective } from '../../directives/my-google-map/my-google-map';

@NgModule({
    declarations: [
        MyGoogleMapDirective
    ],
    exports: [
        MyGoogleMapDirective
    ]
})
export class SharedModule{}