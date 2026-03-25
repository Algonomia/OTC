import {BaseMetaCompMap} from './metaforms';
import {FieldTextComponent} from './form-control-fields/field-text/field-text.component';
import {FieldListComponent} from './form-control-fields/field-list/field-list.component';
import {FieldPeriodComponent} from './form-control-fields/field-period/field-period.component';
import {FieldDateComponent} from './form-control-fields/field-date/field-date.component';
import {FieldSubDateComponent} from './form-control-fields/field-sub-date/field-sub-date.component';
import {FieldObjectComponent} from './form-control-fields/field-object/field-object.component';
import {FieldFilesComponent} from './form-control-fields/field-files/field-files.component';
import {FieldRateComponent} from './form-control-fields/field-rate/field-rate.component';
import {FieldNumberComponent} from './form-control-fields/field-number/field-number.component';
import {FieldBoundedNumberComponent} from './form-control-fields/field-bounded-number/field-bounded-number.component';
import {FieldComplexValueComponent} from './form-control-fields/field-complex-value/field-complex-value.component';

export const stdCompMap: BaseMetaCompMap = {
    text: FieldTextComponent,
    number: FieldNumberComponent,
    bounded_number: FieldBoundedNumberComponent,
    rate: FieldRateComponent,
    qcm: FieldListComponent,
    multi_qcm: FieldListComponent,
    boolean: FieldTextComponent,
    period: FieldPeriodComponent,
    date: FieldDateComponent,
    day_month: FieldSubDateComponent,
    object: FieldObjectComponent,
    complex_value: FieldComplexValueComponent,
    file: FieldFilesComponent
}
