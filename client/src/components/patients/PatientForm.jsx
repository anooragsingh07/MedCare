import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import Button from '../ui/Button.jsx'
import { Input, Label, Select, Textarea } from '../ui/Field.jsx'
import { patientFormSchema, toPatientPayload } from '../../lib/patientForm.js'

export default function PatientForm({
  defaultValues,
  submitLabel = 'Save patient',
  isSubmitting = false,
  onSubmit,
  formId = 'patient-form',
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(patientFormSchema),
    defaultValues,
  })

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(async (values) => {
        await onSubmit(toPatientPayload(values))
      })}
      className="grid gap-4 md:grid-cols-2"
    >
      <div>
        <Label htmlFor={`${formId}-name`}>Full name</Label>
        <Input id={`${formId}-name`} {...register('name')} aria-invalid={Boolean(errors.name)} />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
      </div>
      <div>
        <Label htmlFor={`${formId}-age`}>Age</Label>
        <Input id={`${formId}-age`} type="number" min={0} max={130} step={1} {...register('age')} aria-invalid={Boolean(errors.age)} />
        {errors.age && <p className="mt-1 text-xs text-red-600">{errors.age.message}</p>}
      </div>
      <div>
        <Label htmlFor={`${formId}-gender`}>Gender</Label>
        <Select id={`${formId}-gender`} {...register('gender')} aria-invalid={Boolean(errors.gender)}>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </Select>
        {errors.gender && <p className="mt-1 text-xs text-red-600">{errors.gender.message}</p>}
      </div>
      <div>
        <Label htmlFor={`${formId}-phone`}>Phone</Label>
        <Input id={`${formId}-phone`} {...register('phone')} aria-invalid={Boolean(errors.phone)} />
        {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
      </div>
      <div className="md:col-span-2">
        <Label htmlFor={`${formId}-address`}>Address</Label>
        <Textarea id={`${formId}-address`} rows={2} {...register('address')} aria-invalid={Boolean(errors.address)} />
        {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address.message}</p>}
      </div>
      <div className="md:col-span-2">
        <Label htmlFor={`${formId}-symptoms`}>Symptoms</Label>
        <Textarea id={`${formId}-symptoms`} rows={2} {...register('symptoms')} />
        {errors.symptoms && <p className="mt-1 text-xs text-red-600">{errors.symptoms.message}</p>}
      </div>
      <div className="md:col-span-2">
        <Label htmlFor={`${formId}-diagnosis`}>Diagnosis</Label>
        <Textarea id={`${formId}-diagnosis`} rows={2} {...register('diagnosis')} />
        {errors.diagnosis && <p className="mt-1 text-xs text-red-600">{errors.diagnosis.message}</p>}
      </div>
      <div className="md:col-span-2">
        <Label htmlFor={`${formId}-meds`}>Prescribed medicines (comma-separated)</Label>
        <Input id={`${formId}-meds`} placeholder="e.g. Amlodipine 5mg, Paracetamol 500mg" {...register('prescribedMedicines')} />
        {errors.prescribedMedicines && (
          <p className="mt-1 text-xs text-red-600">{errors.prescribedMedicines.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor={`${formId}-visit`}>Visit date &amp; time</Label>
        <Input id={`${formId}-visit`} type="datetime-local" {...register('visitDate')} aria-invalid={Boolean(errors.visitDate)} />
        {errors.visitDate && <p className="mt-1 text-xs text-red-600">{errors.visitDate.message}</p>}
      </div>
      <div className="flex items-end md:col-span-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
