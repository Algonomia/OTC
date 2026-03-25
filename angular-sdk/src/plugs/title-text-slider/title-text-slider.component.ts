import {Component, ContentChild, ElementRef, Input, TemplateRef, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ButtonSliderComponent} from '../../design-elements/buttons/buttons/button-slider/button-slider.component';

export interface ITitleText {
    title: string;
    text: string;
}

@Component({
    selector: 'app-title-text-slider',
    templateUrl: './title-text-slider.component.html',
    styleUrl: './title-text-slider.component.scss',
    standalone: true,
    imports: [
        CommonModule,
        ButtonSliderComponent,
    ]
})
export class TitleTextSliderComponent {
    @ViewChild('slider') slider!: ElementRef;
    @ViewChild('sliderItem') sliderItem!: ElementRef;
    @ContentChild('dataContent') dataContent!: TemplateRef<any>;
    @Input() list!: ITitleText[];

    public active_item: number = 0;

    previous(): void {
        const li_width = this.sliderItem.nativeElement.offsetWidth;

        if (this.active_item > 0) {
            this.active_item -= 1;
            this.slider.nativeElement.style.transform = `translateX(-${li_width * this.active_item}px)`;
        } else {
            this.slider.nativeElement.style.transform = `translateX(-${li_width * (this.list.length - 1)}px`;
            this.active_item = this.list.length - 1;
        }
    }

    next(): void {
        const li_width = this.sliderItem.nativeElement.offsetWidth;

        if (this.active_item < this.list.length - 1) {
            this.active_item += 1;
            this.slider.nativeElement.style.transform = `translateX(-${li_width * this.active_item}px)`;
        } else {
            this.slider.nativeElement.style.transform = `translateX(0px)`;
            this.active_item = 0;
        }
    }
}
