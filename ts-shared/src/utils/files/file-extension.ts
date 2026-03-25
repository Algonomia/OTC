import {AEnhancedEnumFactory} from '../../ts-templates/enhanced-enum-factory.abstract';

export class FileExtensions extends AEnhancedEnumFactory {
    static readonly pdf = new FileExtensions('pdf', 'assets/images/files-type/PDF.png', ['doc']);
    static readonly doc = new FileExtensions('doc', 'assets/images/files-type/Office_Word.png', ['doc']);
    static readonly docx = new FileExtensions('docx', 'assets/images/files-type/Office_Word.png', ['doc']);
    static readonly xls = new FileExtensions('xls', 'assets/images/files-type/Office_Excel.png', ['doc']);
    static readonly xlsx = new FileExtensions('xlsx', 'assets/images/files-type/Office_Excel.png', ['doc']);
    static readonly csv = new FileExtensions('csv', 'assets/images/files-type/Office_Excel.png', ['doc']);
    static readonly png = new FileExtensions('png', 'assets/images/files-type/Generic_image.png');
    static readonly jpg = new FileExtensions('jpg', 'assets/images/files-type/Generic_image.png');
    static readonly jpeg = new FileExtensions('jpeg', 'assets/images/files-type/Generic_image.png');
    static readonly pptx = new FileExtensions('pptx', 'assets/images/files-type/Office_Powerpoint.png', ['doc']);
    static readonly odg = new FileExtensions('odg', 'assets/images/files-type/Office_Powerpoint.png', ['doc']);
    static readonly mp4 = new FileExtensions('mp4', 'assets/images/files-type/Generic_video.png');
    static readonly webm = new FileExtensions('webm', 'assets/images/files-type/Generic_video.png');
    static readonly avi = new FileExtensions('avi', 'assets/images/files-type/Generic_video.png');
    static readonly note = new FileExtensions('note', 'assets/images/files-type/Office_Note.png', ['doc']);
    static readonly txt = new FileExtensions('txt', 'assets/images/files-type/Generic_text.png', ['doc']);
    static readonly zip = new FileExtensions('zip', 'assets/images/files-type/Folder-zip.png');
    static readonly unknown = new FileExtensions('', 'assets/images/files-type/Generic_unknown.png');

    static getIconByExtension(extension: string) {
        return this.getByExtension(extension).icon;
    }

    static getByExtension(extension: string): FileExtensions {
        return (this.getById(extension) as FileExtensions | undefined) ?? this.unknown;
    }

    static getDocExtensionIds(): string[] {
        return this.getDocExtensions().map(x => x.extension);
    }

    static getDocExtensions(): FileExtensions[] {
        return (this.getByTag('doc') as FileExtensions[]) ?? [];
    }

    private constructor(readonly extension: string, readonly icon: string, tags: string[] = []) {
        super(extension, tags);
    }
}
