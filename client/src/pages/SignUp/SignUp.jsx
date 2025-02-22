import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { saveUser } from "@/Utilities/Utiliti";


const SignUp = () => {
  const { createNewUser, signInWithGoogle,  updateUserProfile, } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const { name, email, password, } = data;
    const image = "https://i.ibb.co.com/Jwn4D7vk/user.jpg"

    try {
      const result = await createNewUser(email, password);
      await updateUserProfile(name, image);
      await saveUser({ ...result?.user, displayName: name, photoURL: image });
      navigate('/dashboard');
    } catch (error) {
      console.log(error?.message);
    }
  };

  // Google Signin
  const handleGoogleSignIn = async () => {
    try {
      const data = await signInWithGoogle()
      await saveUser(data?.user)
      navigate('/dashboard');
    } catch (err) {
      console.log(err?.message);
    }
  }



  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 pt-16 px-4">
      <Card className="w-full max-w-md p-6 shadow-md">
        <CardHeader>
          <CardTitle className="text-4xl font-bold">Sign Up</CardTitle>
          <CardDescription>Enter Your Information Below.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Input */}
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                {...register("name", {
                  required: "Name is required",
                  minLength: {
                    value: 6,
                    message: "Name must be at least 6 characters",
                  },
                })}
              />
              {errors.name && (
                <p className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" /> {errors.name.message}
                </p>
              )}
            </div>

            {/* Email Input */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/,
                    message: "Enter a valid email",
                  },
                })}
              />
              {errors.email && (
                <p className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" /> {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
                      message: "Password must have at least one uppercase, one lowercase letter, one digit and special character",
                    },
                  })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" /> {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full">
              Sign Up
            </Button>
          </form>

          <p className="text-center mt-4 text-sm">
            Already have an account?
            <Link to={'/login'} className="ml-1 text-blue-500 hover:underline">
              Login
            </Link>
          </p>

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-2 text-gray-500">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Google Login Button */}
          <Button
           onClick={handleGoogleSignIn}
            size={"lg"}
            className="w-full"
            variant={"outline"}
          >
            <img src="https://docs.material-tailwind.com/icons/google.svg" alt="Google" className="w-5 h-5" />
            Continue with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;