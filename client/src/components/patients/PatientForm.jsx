import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { useFieldArray, useForm } from 'react-hook-form'
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
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(patientFormSchema),
    defaultValues,
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'medications' })

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(async (values) => {
        await onSubmit(toPatientPayload(values))
      })}
      className="grid gap-4 sm:gap-5 md:grid-cols-2"
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
      <div>
        <Label htmlFor={`${formId}-roll`}>Roll no.</Label>
        <Input id={`${formId}-roll`} required placeholder="e.g. 23CS001" {...register('rollNo')} aria-invalid={Boolean(errors.rollNo)} />
        {errors.rollNo && <p className="mt-1 text-xs text-red-600">{errors.rollNo.message}</p>}
      </div>
      <div>
        <Label htmlFor={`${formId}-dept`}>Department</Label>
        <Input id={`${formId}-dept`} required placeholder="e.g. Computer Science" {...register('department')} aria-invalid={Boolean(errors.department)} />
        {errors.department && <p className="mt-1 text-xs text-red-600">{errors.department.message}</p>}
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

      <div className="md:col-span-2 space-y-3 rounded-2xl border border-slate-200/90 bg-slate-50/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label className="mb-0">Prescribed medicines &amp; dosage</Label>
          <Button
            type="button"
            variant="secondary"
            className="gap-1.5 rounded-lg px-3 py-2 text-xs"
            onClick={() => append({ medicine: '', dosage: '' })}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            Add line
          </Button>
        </div>
        {errors.medications && typeof errors.medications.message === 'string' && (
          <p className="text-xs text-red-600">{errors.medications.message}</p>
        )}
        <ul className="space-y-3">
          {fields.map((field, index) => (
            <li key={field.id} className="grid gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <div>
                <Label htmlFor={`${formId}-med-${index}`}>Medicine</Label>
                <Input
                  id={`${formId}-med-${index}`}
                  placeholder="e.g. Paracetamol 500mg"
                  {...register(`medications.${index}.medicine`)}
                  aria-invalid={Boolean(errors.medications?.[index]?.medicine)}
                />
                {errors.medications?.[index]?.medicine && (
                  <p className="mt-1 text-xs text-red-600">{errors.medications[index].medicine.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor={`${formId}-dose-${index}`}>Dosage</Label>
                <Input
                  id={`${formId}-dose-${index}`}
                  placeholder="e.g. 1 tablet twice daily after meals"
                  {...register(`medications.${index}.dosage`)}
                  aria-invalid={Boolean(errors.medications?.[index]?.dosage)}
                />
                {errors.medications?.[index]?.dosage && (
                  <p className="mt-1 text-xs text-red-600">{errors.medications[index].dosage.message}</p>
                )}
              </div>
              <div className="flex sm:justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  className="gap-1.5 rounded-lg px-3 py-2 text-xs text-slate-600"
                  disabled={fields.length <= 1}
                  onClick={() => remove(index)}
                  aria-label={`Remove medicine row ${index + 1}`}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <Label htmlFor={`${formId}-visit`}>Visit date &amp; time</Label>
        <Input id={`${formId}-visit`} type="datetime-local" {...register('visitDate')} aria-invalid={Boolean(errors.visitDate)} />
        {errors.visitDate && <p className="mt-1 text-xs text-red-600">{errors.visitDate.message}</p>}
      </div>
      <div className="flex w-full items-end md:col-span-2">
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
