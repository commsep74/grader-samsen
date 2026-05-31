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
  role: 'student' | 'teacher'
}

export default function Register() {
  const navigate = useNavigate()
  const registerWithCredentials = useAppStore((s) => s.registerWithCredentials)
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<RegisterForm>({
    defaultValues: {
      role: 'student'
    }
  })

  const onSubmit = async (data: RegisterForm) => {
    try {
      const user = await registerWithCredentials(data.username, data.password, data.role)
      toast.success('Account created!')
      navigate(user.role === 'teacher' || user.role === 'admin' ? '/admin' : '/app')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed')
    }
  }

  return (
    <div className="gradient-auth flex min-h-dvh items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4">
          <Link to="/" className="inline-block w-fit rounded-lg outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">
            <BrandMark />
          </Link>
          <div>
            <CardTitle className="text-xl">Create account</CardTitle>
            <CardDescription className="mt-1.5">
              Choose a username and password to get started.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-foreground">
                Username
              </label>
              <Input
                id="username"
                autoComplete="username"
                {...register('username', { required: true })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                {...register('password', { required: true, minLength: 6 })}
              />
              <p className="text-xs text-muted-foreground">At least 6 characters</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium text-foreground">
                I am a
              </label>
              <select
                id="role"
                {...register('role', { required: true })}
                className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
