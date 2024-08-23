"use client"
 
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form } from "@/components/ui/form"
import CustomFormField, { FormFieldType} from "../CustomFormField"
import SubmitButton from "../SubmitButton"
import { useState } from "react"
import { getAppointmentSchema } from "@/lib/Validation"
import { useRouter } from "next/navigation"
import { createUser } from "@/lib/actions/patient.actions"
import { SelectItem } from "../ui/select"
import { Doctors } from "@/constants"
import Image from "next/image"
import { createAppointment, updateAppointment } from "@/lib/actions/appointments.actions"
import { Appointment } from "@/types/appwrite.types"
 
export const AppointmentForm = ({userId, patientId, type, appointment, setOpen} : {
  userId: string; 
  patientId: string; 
  type: "create" | "cancel" | "schedule"
  appointment?: Appointment;
  setOpen: (open: boolean) => void;
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  let AppointmentFormValidation = getAppointmentSchema(type);

  const form = useForm<z.infer<typeof AppointmentFormValidation>>({
    resolver: zodResolver(AppointmentFormValidation),
    defaultValues: {
        primaryPhysician: appointment ? appointment.primaryPhysician : "",
        schedule: appointment ? new Date(appointment.schedule) : new Date(),
        reason: appointment ? appointment.reason : "",
        note: appointment ? appointment.note : "",
        cancellationReason: appointment?.cancellationReason || "",
    },
  });

  async function onSubmit(values: z.infer<typeof AppointmentFormValidation>) {
    setIsLoading(true);

    let status;
    switch (type) {
        case "schedule":
            status = "scheduled";
            break;
        case "cancel":
            status = "cancelled";
            break;
        default:
            status = "pending";
            break;
        }

    try {
      if (type === "create" && patientId) {
        console.log('creating appointment');
        const appointmentData =  {
            userId,
            patient: patientId,
            primaryPhysician: values.primaryPhysician,
            schedule: new Date(values.schedule),
            reason: values.reason!,
            note: values.note,
            status: status as Status
            };

            const appointment = await createAppointment(appointmentData);

            if (appointment) {
                form.reset();
                router.push(`/patients/${userId}/new-appointment/success?appointmentId=${appointment.$id}`);
            }
        } else {
            const appointmentToUpdate = {
             userId,
             appointmentId: appointment?.$id!,
             appointment: {
              primaryPhysician: values?.primaryPhysician,
              schedule: new Date(values?.schedule),
              status: status as Status,
              cancellationReason: values?.cancellationReason,
             },
             type
            };

            const updatedAppointment = await updateAppointment(appointmentToUpdate);

            if (updatedAppointment) {
                setOpen && setOpen(false);
                form.reset();
            } 
    }
   } catch (error) {
      console.log(error);
    }

    setIsLoading(false);
  };

  let buttonLabel;

  switch (type) {
    case "create":
      buttonLabel = "Create Appointment";
      break;
    case "cancel":
      buttonLabel = "Cancel Appointment";
      break;
    case "schedule":
        buttonLabel = "Schedule Appointment";
        break;
    default:
        break;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-6">
        {type === 'create' && <section className="mb-12 space-y-4">
          <h1 className="header">New Appointment</h1>
          <p className="text-dark-700">Request a new appointemnts</p>
        </section> }

        {type !== "cancel" && (
            <>
                <CustomFormField
                fieldType={FormFieldType.SELECT}
                control={form.control}
                name="primaryPhysician"
                label="Doctor"
                placeholder="select a Doctor"
                >
                    {Doctors.map((doctor) => (
                       <SelectItem key={doctor.name} value={doctor.name}>
                           <div className="flex cursor-pointer gap-2 items-center">
                                <Image
                                    src={doctor.image}
                                    alt={doctor.name}
                                    width={32}
                                    height={32}
                                    className="rounded-full border border-dark-500"
                                />
                                <p>{doctor.name}</p>
                           </div>
                        </SelectItem>
                    ))}
                </CustomFormField>

                <CustomFormField
                    fieldType={FormFieldType.DATE_PICKER}
                    control={form.control}
                    name="schedule"
                    label="Expected appoint Date"
                    showTimeSelect
                    dateFormat="MM/dd/yyyy - h:mm aa"
                />

                <div className="flex flex-col gap-6 xl:flex-row">
                    <CustomFormField
                      fieldType={FormFieldType.TEXTAREA}
                      control={form.control}
                      name="reason"
                      label="Reason for Appointment"
                      placeholder="Enter reason for appointment"
                    />

                    <CustomFormField
                      fieldType={FormFieldType.TEXTAREA}
                      control={form.control}
                      name="note"
                      label="Notes"
                      placeholder="Enter notes"
                    />
                </div>
            </>
        )}

        {type === "cancel" && (

            <CustomFormField
                fieldType={FormFieldType.TEXTAREA}
                control={form.control}
                name="cancellationReason"
                label="Reason for Cancellation"
                placeholder="Enter reason for cancellation"
            />
        )}

        <SubmitButton isLoading={isLoading} className={`${type === 'cancel' ? 'shad-danger-btn' : 'shad-primary-btn' } w-full`}>{buttonLabel}</SubmitButton>
      </form>
    </Form>
  );
};