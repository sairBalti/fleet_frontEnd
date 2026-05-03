import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";
import { useForm } from "react-hook-form";
import { login } from "../services/authService";
import dashboardHero from "../assets/dashboard-hero.svg";

const marketingOrigin = (
  import.meta.env.VITE_MARKETING_ORIGIN || "http://localhost:5173"
).replace(/\/$/, "");
const requestDemoUrl = `${marketingOrigin}/request-demo`;

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
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 py-8">
      <div className="flex w-full max-w-6xl flex-col overflow-hidden rounded-lg bg-white shadow-md lg:max-h-[min(90vh,44rem)] lg:min-h-[36rem] lg:flex-row">
        {/* Left Section */}
        <div className="flex flex-col bg-cabs-blue p-6 text-white sm:p-8 lg:w-1/2 lg:p-10">
          <BrandLogo theme="hero" />
          <div className="mt-2 mb-4 w-full max-w-md lg:mb-6">
            <img
              src={dashboardHero}
              alt="Fleet dashboard preview"
              className="w-full rounded-xl bg-white/10 object-cover shadow-lg ring-1 ring-white/20"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex w-full flex-1 items-center justify-center bg-gray-100 p-4 sm:p-6 lg:w-1/2">
          <div className="w-full max-w-md rounded-lg bg-white shadow-md">
            <div className="mt-5 flex flex-col items-center justify-center px-4 text-center">
              <BrandLogo theme="authForm" />
              <h2 className="text-2xl font-bold text-gray-800">Login</h2>
              <p className="text-sm text-gray-700 font-bold mt-2">
                Welcome back! Please enter your details
              </p>

              {/* Role Selection */}
              <div className="mt-8 flex w-full max-w-xs justify-center gap-3 sm:max-w-none sm:space-x-4">
                <button
                  type="button"
                  className={`min-w-0 flex-1 max-w-[8rem] rounded-md py-2 text-sm font-medium sm:w-32 sm:flex-none ${
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
                  className={`min-w-0 flex-1 max-w-[8rem] rounded-md py-2 text-sm font-medium sm:w-32 sm:flex-none ${
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
            <div className="flex flex-col items-center justify-center px-3 py-4 sm:px-4">
              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <form onSubmit={handleSubmit(handleLogin)}>
                {/* Email */}
                <div className="mx-auto mt-4 w-full max-w-sm">
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
                <div className="mx-auto mt-4 w-full max-w-sm">
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
                <div className="mx-auto mt-3 flex w-full max-w-sm justify-between gap-2">
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
                  className="mt-4 w-full max-w-sm rounded-md bg-blue-600 py-2 text-white transition hover:bg-blue-700"
                >
                  Login
                </button>
              </form>

              {/* Request demo (marketing site) */}
              <div className="mt-3 w-full text-center">
                <p className="text-sm">
                  Don&apos;t have an account?{" "}
                  <a
                    href={requestDemoUrl}
                    className="text-blue-600 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Request a demo
                  </a>
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
