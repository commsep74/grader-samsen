import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { BrandMark } from '@/components/BrandMark'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppStore } from '@/store/useAppStore'

interface LoginForm {
  username: string
  password: string
}

export default function Login() {
  const navigate = useNavigate()
  const loginWithCredentials = useAppStore((s) => s.loginWithCredentials)
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    try {
      const user = await loginWithCredentials(data.username, data.password)
      toast.success('Welcome back!')
      navigate(user.role === 'teacher' || user.role === 'admin' ? '/admin' : '/app')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Sign in failed')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <Link to="/" className="text-sm">
            <BrandMark />
          </Link>
          <CardTitle className="pt-4">Sign in</CardTitle>
          <CardDescription>Enter your username and password to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <Input
                id="username"
                autoComplete="username"
                className="mt-1.5"
                {...register('username', { required: true })}
              />
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                className="mt-1.5"
                {...register('password', { required: true })}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-500">
            No account?{' '}
            <Link to="/register" className="font-medium text-gray-900 dark:text-gray-100">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
