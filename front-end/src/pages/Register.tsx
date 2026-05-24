import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { BrandMark } from '@/components/BrandMark'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppStore } from '@/store/useAppStore'

interface RegisterForm {
  username: string
  password: string
}

export default function Register() {
  const navigate = useNavigate()
  const registerWithCredentials = useAppStore((s) => s.registerWithCredentials)
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<RegisterForm>()

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerWithCredentials(data.username, data.password)
      toast.success('Account created!')
      navigate('/app')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <Link to="/" className="text-sm">
            <BrandMark />
          </Link>
          <CardTitle className="pt-4">Create account</CardTitle>
          <CardDescription>Choose a username and password to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="username" className="text-sm font-medium">Username</label>
              <Input
                id="username"
                autoComplete="username"
                className="mt-1.5"
                {...register('username', { required: true })}
              />
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                className="mt-1.5"
                {...register('password', { required: true, minLength: 6 })}
              />
              <p className="mt-1 text-xs text-gray-400">At least 6 characters</p>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-500">
            Have an account? <Link to="/login" className="font-medium text-gray-900 dark:text-gray-100">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
