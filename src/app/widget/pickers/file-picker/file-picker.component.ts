import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'file-picker',
    templateUrl: './file-picker.component.html',
    styles: [
        ':host { flex: 1; }'
    ]
})
export class FilePickerComponent {
    
    @Input() label: string = "Browse";
    @Input() size: string;
    @Input() accept: string;
    @Input() placeholder: string = "Select a file...";
    @Input() file: File; //in case the file is already known when the component is initialized
    
    @Output() fileChanged = new EventEmitter<File>();
    
    inputGroupClass: string = "";
    
    constructor() { }

    ngOnChanges() {
        if (this.size == "xs" || this.size == "sm" || this.size == "lg") {
            this.inputGroupClass = " input-group-" + this.size;
        }
    }
    
    fileChangeEvent(file: File) {
        if (file != null) {
            this.file = file;
            this.fileChanged.emit(file);
        }
    }

}