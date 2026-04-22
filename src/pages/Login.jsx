import { useState } from "react";
import logo from "../assets/logoimg.png"; 
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { login } from "../services/authService";

const Login = () => {
  const [role, setRole] = useState("Manager");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleLogin = async (data) => {
    setError("");
    try {
      const response = await login(data.email, data.password);

      if (response.jwtToken) {
        localStorage.setItem("jwtToken", response.jwtToken);
        localStorage.setItem("user", JSON.stringify(response.user));
        navigate("/Dashboard");
      }
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-[1000px] h-[700px] bg-white rounded-lg shadow-md flex overflow-hidden">
        
        {/* Left Section */}
        <div className="w-1/2 bg-cabs-blue text-white p-10">
          <div className="flex">
            <img src={logo} alt="Logo" className="h-20 mb-4" />
            <h2 className="text-xl font-bold mt-4 font-sans">FreshFold</h2>
          </div>
          <h2 className="text-2xl font-bold">Fleet Management System</h2>
          <p className="text-sm mt-2">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
          <img src="/fleet-dashboard.png" alt="Dashboard" className="mt-6" />
        </div>

        {/* Right Section */}
        <div className="w-1/2 bg-gray-100 flex justify-center items-center">
          <div className="rounded-lg shadow-md bg-white w-[87%] min-h-[70%]">
            <div className="flex flex-col items-center justify-center text-center mt-5">
              <h2 className="text-2xl font-bold text-gray-800">Login</h2>
              <p className="text-sm text-gray-700 font-bold mt-2">
                Welcome back! Please enter your details
              </p>

              {/* Role Selection */}
              <div className="flex justify-center mt-8 space-x-4 w-full">
                <button
                  type="button"
                  className={`w-32 py-2 text-sm font-medium rounded-md ${
                    role === "Driver"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200"
                  }`}
                  onClick={() => setRole("Driver")}
                >
                  Driver
                </button>
                <button
                  type="button"
                  className={`w-32 py-2 text-sm font-medium rounded-md ${
                    role === "Manager"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200"
                  }`}
                  onClick={() => setRole("Manager")}
                >
                  Manager
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="flex flex-col items-center justify-center py-4">
              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <form onSubmit={handleSubmit(handleLogin)}>
                {/* Email */}
                <div className="mt-4 w-80 mx-auto">
                  <label className="text-sm font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="example@email.com"
                    className={`w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 
                      ${errors.email || error ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"}`}
                    {...register("email", { required: "Email is required" })}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.email.message}
                    </p>
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
                        ${errors.password || error ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"}`}
                      {...register("password", {
                        required: "Password is required",
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

                {/* Remember Me */}
                <div className="mt-3 w-80 flex justify-between">
                  <label className="flex items-center text-sm">
                    <input type="checkbox" className="mr-1" />
                    Remember Me
                  </label>
                  <u>
                    <a href="#" className="text-blue-600 text-sm">
                      Forgot Password?
                    </a>
                  </u>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  className="w-[75%] mt-4 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
                >
                  Login
                </button>
              </form>

              {/* Signup Link */}
              <div className="self-start mt-3 ml-14">
                <p className="text-sm">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-blue-600">
                    Sign Up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
