import { useState } from "react";
import logo from "../assets/logoimg.png";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { signup } from "../services/authService";

const SignUp = () => {
  const [role, setRole] = useState("Manager");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const handleSignUp = async (data) => {
    setError("");
    try {
      const response = await signup({
        role,
        firstname: data.firstname,
        lastname: data.lastname,
        phone: data.phone,
        email: data.email,
        password: data.password,
      });

      if (response.message) {
        navigate("/login"); // Redirect after signup
      }
    } catch (err) {
      setError("Signup failed. Try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg w-[400px] sm:w-[450px] p-6">
        <div className="flex flex-col items-center text-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Sign Up</h2>
          <p className="text-sm text-gray-700 font-bold mt-2">
            Fill in your details to create an account
          </p>
        </div>

        {error && <p className="text-red-500 text-sm text-center mb-2">{error}</p>}

        <form onSubmit={handleSubmit(handleSignUp)}>
          {/* Role Selection */}
          <div className="flex justify-center mt-2 space-x-4 w-full">
            <button
              type="button"
              className={`w-32 py-2 text-sm font-medium rounded-md ${
                role === "Driver" ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
              onClick={() => setRole("Driver")}
            >
              Driver
            </button>
            <button
              type="button"
              className={`w-32 py-2 text-sm font-medium rounded-md ${
                role === "Manager" ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
              onClick={() => setRole("Manager")}
            >
              Manager
            </button>
          </div>

          {/* First Name */}
          <div className="mt-4 w-80 mx-auto">
            <label className="text-sm font-medium text-gray-700">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter first name"
              className={`w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 
                ${errors.firstname ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"}`}
              {...register("firstname", { required: "First name is required" })}
            />
            {errors.firstname && (
              <p className="text-red-500 text-xs mt-1">
                {errors.firstname.message}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div className="mt-4 w-80 mx-auto">
            <label className="text-sm font-medium text-gray-700">Last Name</label>
            <input
              type="text"
              placeholder="Enter last name"
              className="w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("lastname")}
            />
          </div>

          {/* Phone */}
          <div className="mt-4 w-80 mx-auto">
            <label className="text-sm font-medium text-gray-700">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter phone number"
              className={`w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 
                ${errors.phone ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"}`}
              {...register("phone", { required: "Phone is required" })}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="mt-4 w-80 mx-auto">
            <label className="text-sm font-medium text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="example@email.com"
              className={`w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 
                ${errors.email ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"}`}
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="mt-4 w-80 mx-auto">
            <label className="text-sm font-medium text-gray-700">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                className={`w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 
                  ${errors.password ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"}`}
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Password must be at least 6 characters" },
                })}
              />
              <span
                className="absolute right-3 top-3 text-gray-500 cursor-pointer"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mt-4 w-80 mx-auto">
            <label className="text-sm font-medium text-gray-700">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                className={`w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 
                  ${errors.confirmPassword ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"}`}
                {...register("confirmPassword", {
                  required: "Confirm Password is required",
                  validate: (value) =>
                    value === watch("password") || "Passwords do not match",
                })}
              />
              <span
                className="absolute right-3 top-3 text-gray-500 cursor-pointer"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                {showConfirmPassword ? "🙈" : "👁️"}
              </span>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Signup Button */}
          <button
            type="submit"
            className="w-[75%] mt-6 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition mx-auto block"
          >
            Sign Up
          </button>
        </form>

        {/* Login Link */}
        <div className="self-start mt-3 ml-14">
          <p className="text-sm">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-blue-600 underline"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
