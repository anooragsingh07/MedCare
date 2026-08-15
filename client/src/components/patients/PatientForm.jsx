import { useEffect, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, Plus, Search, Trash2 } from 'lucide-react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import Button from '../ui/Button.jsx'
import { Input, Label, Select, Textarea } from '../ui/Field.jsx'
import { patientFormSchema, toPatientPayload } from '../../lib/patientForm.js'
import { studentsApi } from '../../services/studentsApi.js'

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
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(patientFormSchema),
    defaultValues,
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'medications' })

  const rollNo = useWatch({ control, name: 'rollNo' })
  const [lookup, setLookup] = useState({ state: 'idle', student: null, message: '', uid: '' })
  const lookupSeq = useRef(0)

  useEffect(() => {
    const uid = String(rollNo ?? '').trim()
    if (!uid) return undefined

    const seq = ++lookupSeq.current
    const t = setTimeout(async () => {
      if (seq !== lookupSeq.current) return
      setLookup({ state: 'searching', student: null, message: '', uid })
      try {
        const res = await studentsApi.lookupByUid(uid)
        if (seq !== lookupSeq.current) return
        if (res.found && res.data) {
          setLookup({ state: 'found', student: res.data, message: `Found: ${res.data.name} · ${res.data.department}`, uid })
          setValue('name', res.data.name, { shouldValidate: true })
          setValue('department', res.data.department, { shouldValidate: true })
          setValue('gender', res.data.gender || 'Other', { shouldValidate: true })
          setValue('phone', res.data.phone || '', { shouldValidate: true })
          setValue('address', res.data.address || '', { shouldValidate: true })
        } else {
          setLookup({
            state: 'missing',
            student: null,
            message: `Roll number “${uid}” is not in the student directory.`,
            uid,
          })
        }
      } catch {
        if (seq === lookupSeq.current) setLookup({ state: 'error', student: null, message: '', uid })
      }
    }, 400)
    return () => clearTimeout(t)
  }, [rollNo, setValue])

  const currentRoll = String(rollNo ?? '').trim()
  const activeLookup = lookup.uid === currentRoll ? lookup : { state: 'idle' }

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
        <Label htmlFor={`${formId}-roll`}>Roll no. (UID)</Label>
        <Input id={`${formId}-roll`} required placeholder="e.g. 23CS001" {...register('rollNo')} aria-invalid={Boolean(errors.rollNo)} />
        {errors.rollNo && <p className="mt-1 text-xs text-red-600">{errors.rollNo.message}</p>}
        {activeLookup.state === 'searching' && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            <Search className="h-3.5 w-3.5" aria-hidden /> Looking up student…
          </p>
        )}
        {activeLookup.state === 'found' && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> {activeLookup.message}
          </p>
        )}
        {activeLookup.state === 'missing' && (
          <p className="mt-1 text-xs text-amber-700">{activeLookup.message}</p>
        )}
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
