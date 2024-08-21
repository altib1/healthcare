'use client'

import React from 'react'
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Control } from 'react-hook-form'
import Image from 'next/image'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { E164Number } from 'libphonenumber-js/min'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { Select, SelectTrigger, SelectValue, SelectContent } from './ui/select'
import { Textarea } from './ui/textarea'
import { Checkbox } from './ui/checkbox'

export enum FormFieldType {
    INPUT = "input",
    TEXTAREA = "textarea",
    PHONE_INPUT = "phoneInput",
    CHECKBOX = "checkbox",
    DATE_PICKER = "datePicker",
    SELECT = "select",
    SKELETON = "skeleton",
  }

interface CustomProps {
  control: Control<any>,
  fieldType: FormFieldType,
    name: string,
    label?: string,
    placeholder?: string,
    iconSrc?: string,
    iconAlt?: string,
    disabled?: boolean,
    dateFormat?: string,
    showTimeSelect?: boolean,
    children?: React.ReactNode,
    renderSkeleton?: (field: any) => React.ReactNode,
}

const RenderField = ({field, props}: {field:any; props: CustomProps}) => {
    const { fieldType, iconSrc, iconAlt, placeholder, showTimeSelect, dateFormat, renderSkeleton } = props

    switch (fieldType) {
        case FormFieldType.INPUT:
            return (
                <div className='flex rounded-md border border-dark-500 bg-dark-400'>
                    {iconSrc && (
                       <Image src={iconSrc} 
                       alt={iconAlt || 'icon'} 
                       width={24} 
                       height={24} 
                       className='ml-2'
                       /> 
                        
                        )}
                    <FormControl>
                        <Input 
                        placeholder={placeholder}
                        {...field}
                        className='shad-input border-0'
                        />
                    </FormControl>
                </div>
            )
        case FormFieldType.PHONE_INPUT:
            return (
                <FormControl>
                    <PhoneInput 
                    defaultCountry='AL'
                    placeholder={placeholder}
                    international
                    withCountryCallingCode
                    value={field.value as E164Number | undefined}
                    onChange={field.onChange}
                    className='input-phone'
                    {...field}
                    />
                </FormControl>
            )
        case FormFieldType.DATE_PICKER:
            return (
                <div className='flex rounded-md border border-dark-500 bg-dark-400 '>
                    <Image 
                    src="/assets/icons/calendar.svg"
                    alt='calendar'
                    width={24}
                    height={24}
                    className='ml-2'
                    />
                    <FormControl>
                        <DatePicker
                        selected={field.value}
                        onChange={(date) => field.onChange(date)}
                        showTimeSelect={showTimeSelect ?? false}
                        dateFormat={dateFormat ?? 'MM/dd/yyyy'}
                        timeInputLabel='Time:'
                        wrapperClassName='date-picker'
                        />
                    </FormControl>
                </div>
            )    
        case FormFieldType.SKELETON:
            return renderSkeleton ? renderSkeleton(field) : null
  
        case FormFieldType.SELECT:
            return (
                <FormControl>
                    <Select onValueChange={field.onChange}
                    defaultValue={field.value}
                    >
                        <SelectTrigger className='shad-select-trigger'>
                            <SelectValue placeholder={placeholder} />
                        </SelectTrigger>
                        <SelectContent
                        
                        className='shad-select-content'
                        >
                            {props.children}
                        </SelectContent>
                    </Select>
                </FormControl>
            )  
        case FormFieldType.TEXTAREA:
            return (
                <FormControl>
                    <Textarea 
                    placeholder={placeholder}
                    {...field}
                    className='shad-textarea'
                    disabled={props.disabled}
                    />
                </FormControl>
            )   
        case FormFieldType.CHECKBOX:
            return (
            <FormControl>
                <div className='flex items-center gap-4'>
                    <Checkbox 
                    id={props.name}
                    checked = {field.value}
                    onCheckedChange={field.onChange}
                    />
                    <label htmlFor={props.name} className='checkbox-label'>
                        {props.label}
                    </label>
                </div>
            </FormControl> 
            )
                
        default:
            return null
    }
}
const CustomFormField = (props: CustomProps) => {
    const {
        control,
        fieldType,
        name,
        label,
        placeholder,
        iconSrc,
        iconAlt,
        disabled,
        dateFormat,
        showTimeSelect,
        children,
        renderSkeleton,
    } = props

  return (
    
    <FormField
    control={control}
    name={name}
    render={({ field }) => (
        <FormItem className='flex-1'>
            {fieldType !== FormFieldType.CHECKBOX && label && (
                    <FormLabel>{label}</FormLabel>

            )}

            <RenderField field={field} props={props}/>
            <FormMessage className='shad-error' />
        </FormItem>
    )}
  />
  )
}

export default CustomFormField