'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Loader2, User, Mail, Phone, MapPin, Link2, Globe, Lock, LogOut, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'
import { useUser } from '@/hooks/useUser'
import { useUserStore } from '@/store/userStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

const profileSchema = z.object({
  full_name:    z.string().min(2, 'Name must be at least 2 characters'),
  phone:        z.string().optional(),
  location:     z.string().optional(),
  linkedin_url: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  website_url:  z.string().url('Enter a valid URL').optional().or(z.literal('')),
  bio:          z.string().max(300, 'Bio cannot exceed 300 characters').optional(),
})

type ProfileForm = z.infer<typeof profileSchema>

const passwordSchema = z.object({
  newPassword: z.string().min(8, 'Must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})
type PasswordForm = z.infer<typeof passwordSchema>

export default function SettingsPage() {
  const router = useRouter()
  const { user } = useUser()
  const { reset } = useUserStore()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.user_metadata?.full_name ?? '',
      phone: '',
      location: '',
      linkedin_url: '',
      website_url: '',
      bio: '',
    },
  })

  const {
    register: regPwd,
    handleSubmit: handlePwdSubmit,
    formState: { isSubmitting: isPwdSubmitting, errors: pwdErrors },
    reset: resetPwdForm,
  } = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) })

  const onSaveProfile = async (data: ProfileForm) => {
    const supabase = createClient()
    const updatePayload = {
      full_name:    data.full_name,
      phone:        data.phone ?? null,
      location:     data.location ?? null,
      linkedin_url: data.linkedin_url ?? null,
      website_url:  data.website_url ?? null,
      bio:          data.bio ?? null,
      updated_at:   new Date().toISOString(),
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('profiles')
      .update(updatePayload)
      .eq('id', user?.id ?? '')

    if (error) {
      toast.error('Failed to save profile')
      return
    }

    // Also update auth metadata for display name
    await supabase.auth.updateUser({ data: { full_name: data.full_name } })
    toast.success('Profile saved!')
  }

  const onChangePassword = async (data: PasswordForm) => {
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: data.newPassword })
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Password updated!')
    resetPwdForm()
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    reset()
    router.push('/login')
  }

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? 'CA'

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-up">
      <div>
        <h2 className="text-2xl font-bold text-slate-100">Settings</h2>
        <p className="text-slate-400 text-sm mt-1">Manage your account and profile</p>
      </div>

      {/* Profile Section */}
      <div className="card-surface p-6 space-y-5">
        <h3 className="text-slate-200 font-semibold text-sm">Profile Information</h3>

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="gradient-brand text-white text-lg font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-slate-200 font-medium">{user?.user_metadata?.full_name ?? 'User'}</p>
            <p className="text-slate-500 text-sm">{user?.email}</p>
          </div>
        </div>

        <Separator className="bg-white/6" />

        <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm font-medium">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                className="pl-10 bg-white/5 border-white/10 text-slate-200 h-10 rounded-xl"
                placeholder="Ravi Sharma"
                {...register('full_name')}
              />
            </div>
            {errors.full_name && <p className="text-red-400 text-xs">{errors.full_name.message}</p>}
          </div>

          {/* Phone + Location */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm font-medium">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  className="pl-10 bg-white/5 border-white/10 text-slate-200 h-10 rounded-xl"
                  placeholder="+91 98765 43210"
                  {...register('phone')}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm font-medium">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  className="pl-10 bg-white/5 border-white/10 text-slate-200 h-10 rounded-xl"
                  placeholder="Bengaluru, India"
                  {...register('location')}
                />
              </div>
            </div>
          </div>

          {/* LinkedIn + Website */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm font-medium">LinkedIn URL</Label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  className="pl-10 bg-white/5 border-white/10 text-slate-200 h-10 rounded-xl text-xs"
                  placeholder="https://linkedin.com/in/ravi"
                  {...register('linkedin_url')}
                />
              </div>
              {errors.linkedin_url && <p className="text-red-400 text-xs">{errors.linkedin_url.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm font-medium">Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  className="pl-10 bg-white/5 border-white/10 text-slate-200 h-10 rounded-xl text-xs"
                  placeholder="https://yoursite.com"
                  {...register('website_url')}
                />
              </div>
              {errors.website_url && <p className="text-red-400 text-xs">{errors.website_url.message}</p>}
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm font-medium">Short Bio</Label>
            <Textarea
              className="bg-white/5 border-white/10 text-slate-200 rounded-xl resize-none"
              placeholder="Senior software engineer with 5 years of experience in React & Node..."
              rows={3}
              {...register('bio')}
            />
            {errors.bio && <p className="text-red-400 text-xs">{errors.bio.message}</p>}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="btn-brand rounded-xl h-10 px-5 font-semibold text-sm"
          >
            {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</> : 'Save Profile'}
          </Button>
        </form>
      </div>

      {/* Change Password */}
      <div className="card-surface p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-slate-400" />
          <h3 className="text-slate-200 font-semibold text-sm">Change Password</h3>
        </div>
        <form onSubmit={handlePwdSubmit(onChangePassword)} className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm font-medium">New Password</Label>
            <Input
              type="password"
              className="bg-white/5 border-white/10 text-slate-200 h-10 rounded-xl"
              placeholder="••••••••"
              {...regPwd('newPassword')}
            />
            {pwdErrors.newPassword && <p className="text-red-400 text-xs">{pwdErrors.newPassword.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm font-medium">Confirm New Password</Label>
            <Input
              type="password"
              className="bg-white/5 border-white/10 text-slate-200 h-10 rounded-xl"
              placeholder="••••••••"
              {...regPwd('confirmPassword')}
            />
            {pwdErrors.confirmPassword && <p className="text-red-400 text-xs">{pwdErrors.confirmPassword.message}</p>}
          </div>
          <Button
            type="submit"
            disabled={isPwdSubmitting}
            variant="outline"
            className="border-white/10 text-slate-300 hover:bg-white/5 rounded-xl h-10 px-5 text-sm"
          >
            {isPwdSubmitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Updating...</> : 'Update Password'}
          </Button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="card-surface p-6 border-red-500/20 space-y-3">
        <h3 className="text-red-400 font-semibold text-sm">Danger Zone</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-300 text-sm font-medium">Sign out</p>
            <p className="text-slate-500 text-xs">Sign out of CareerAI on this device</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-xl h-9 px-4 text-sm"
          >
            <LogOut className="w-3.5 h-3.5 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  )
}
