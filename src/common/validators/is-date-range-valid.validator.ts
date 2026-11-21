import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isDateRangeValid', async: false })
class IsDateRangeValidConstraint implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments) {
        const [dateFromArg] = args.constraints;
        const relatedValue = (args.object as any)[dateFromArg];

        if (!value || !relatedValue) return true;

        const dateTo = new Date(value).getTime();
        const dateFrom = new Date(relatedValue).getTime();

        if (Number.isNaN(dateTo) || Number.isNaN(dateFrom)) {
            return true;
        }

        return dateTo >= dateFrom;
    }

    defaultMessage() {
        return 'dateTo must be greater than or equal to dateFrom';
    }
}

export function IsDateRangeValid(
    relatedProperty: string,
    validationOptions?: ValidationOptions,
) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [relatedProperty],
            validator: IsDateRangeValidConstraint,
        });
    };
}
