"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, EyeOff, Check, X } from "lucide-react"
import { useTheme } from "next-themes"

export default function SignupPage() {
  const [formData, setFormData] = useState({
    userId: "",
    password: "",
    confirmPassword: "",
    name: "",
    email: "",
    phone: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [userIdChecked, setUserIdChecked] = useState(false)
  const [userIdAvailable, setUserIdAvailable] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [mounted, setMounted] = useState(false)

  const { theme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/[^\d]/g, '')
    
    if (phoneNumber.length <= 3) {
      return phoneNumber
    } else if (phoneNumber.length <= 7) {
      return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`
    } else if (phoneNumber.length <= 11) {
      return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 7)}-${phoneNumber.slice(7)}`
    }
    
    return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 7)}-${phoneNumber.slice(7, 11)}`
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    let processedValue = value

    if (name === "userId" && userIdChecked) {
      setUserIdChecked(false)
      setUserIdAvailable(false)
    }

    if (name === "phone") {
      processedValue = formatPhoneNumber(value)
    }

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }))
  }


  const checkUserId = async () => {

    try{
      console.log("Client - Fetching CheckId via API Route:", { userId: formData.userId });

      const response = await fetch("/api/register/CheckId", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: formData.userId }),
      });

      const rawResponseText = await response.text();
      console.log("Client - Raw response text from API Route:", rawResponseText);

      let data;
      try {
          data = JSON.parse(rawResponseText);
          console.log("Client - Parsed JSON data:", data);
      } catch (jsonError) {
          console.error("Client - Failed to parse JSON response:", jsonError);

          setErrors((prev) => ({ ...prev, userId: `Invalid response format from server (Status: ${response.status}).` }));
          setUserIdChecked(true);
          setUserIdAvailable(false);
          alert(`An error occurred while processing server response (Status: ${response.status}).`);
          return;
      }

      // response.ok가 false이면 오류로 간주하고 throw
      if (!response.ok) {
         // API Route가 전달한 오류 응답 (JSON으로 파싱된 data)
         throw new Error(data.message || `API Route returned error status: ${response.status}`);
      }

      setUserIdChecked(true);

      alert(data.message);

      if (data.code === "0000") {
        setUserIdAvailable(true);
      } else {
        setUserIdAvailable(false);
      }

    } catch (error: any) {
      console.error("Client - Fetch or processing error:", error);
      setUserIdChecked(true);
      setUserIdAvailable(false);

      let errorMessage = "An unexpected error occurred.";
      if (error instanceof Error) {
          errorMessage = error.message;
      } else if (typeof error === 'string') {
          errorMessage = error;
      } else if (error && typeof error === 'object' && error.message) {
           errorMessage = error.message;
      }

      alert(errorMessage);
      setErrors((prev) => ({ ...prev, userId: errorMessage }));

    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.userId) {
      newErrors.userId = "아이디를 입력해주세요."
    } else if (formData.userId.length < 4) {
      newErrors.userId = "아이디는 최소 4자 이상이어야 합니다."
    } else if (!userIdChecked) {
      newErrors.userId = "아이디 중복확인을 해주세요."
    } else if (!userIdAvailable) {
      newErrors.userId = "이미 사용 중인 아이디입니다."
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "비밀번호를 입력해주세요."
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호 확인을 입력해주세요."
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다."
    }

    if (!formData.name) {
      newErrors.name = "이름을 입력해주세요."
    }

    if (!formData.email) {
      newErrors.email = "이메일을 입력해주세요."
    } 

    if (!formData.phone) {
      newErrors.phone = "휴대폰 번호를 입력해주세요."
    } else {
      const phoneRegex = /^010-\d{4}-\d{4}$/
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = "올바른 휴대폰 번호 형식이 아닙니다. (010-0000-0000)"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (!userIdChecked || !userIdAvailable) {
      setErrors(prev => ({ ...prev, userId: "아이디 중복 확인을 완료하고 사용 가능한 아이디인지 확인해주세요." }));
      console.log("Client - userId check not completed or not available.");
      return;
    }

    setIsSubmitting(true)

    setErrors({});

    try {
      console.log("Client - Submitting signup form:", { userId: formData.userId });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register/registerProcess`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          checkIdPerformed: userIdAvailable
        }), 
      });

      const data = await response.json();

      if (!response.ok) {
         const errorMessage = data.message || `Signup failed with status: ${response.status}`;
         throw new Error(errorMessage); 
      }

      console.log("Client - Signup request successful.");

      if (data.code === "0000") {
        alert("회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.");
        window.location.href = "/auth/login"; 
      } else {
        alert(`회원가입 실패: ${data.message}`);
        if (data.fieldErrors) { 
             setErrors(data.fieldErrors);
        } else if (data.message) {
            setErrors(prev => ({ ...prev, form: data.message }));
        }
      }
    } catch (error: any) {
      console.error("Client - Signup fetch or processing error:", error);

      let errorMessage = "회원가입 중 알 수 없는 오류가 발생했습니다. 다시 시도해주세요.";
      if (error instanceof Error) {
          errorMessage = error.message;
      } else if (typeof error === 'string') {
          errorMessage = error;
      } else if (error && typeof error === 'object' && error.message) {
           errorMessage = error.message;
      }

      alert(errorMessage); 
       setErrors(prev => ({ ...prev, form: errorMessage })); 
    } finally {
      setIsSubmitting(false); 
    }
  };

  return (
    <>
      <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <Link href="/">
              {theme === "dark" ? (
                <Image src="/logo-dark.svg" alt="DevForum Logo" width={50} height={50} className="h-12 w-12" />
              ) : (
                <Image src="/logo-light.svg" alt="DevForum Logo" width={50} height={50} className="h-12 w-12" />
              )}
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-center mb-6">회원가입</h1>

          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* UserId field with check button */}
                <div>
                  <label htmlFor="userId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    ID
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="userId"
                        name="userId"
                        value={formData.userId}
                        onChange={handleChange}
                        className={`w-full ${userIdChecked ? (userIdAvailable ? "border-green-500" : "border-red-500") : ""}`}
                        disabled={isSubmitting}
                      />
                      {userIdChecked && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {userIdAvailable ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      onClick={checkUserId}
                      disabled={!formData.userId || isSubmitting}
                      className="whitespace-nowrap"
                    >
                      Check_ID
                    </Button>
                  </div>
                  {errors.userId && <p className="text-sm text-red-500 mt-1">{errors.userId}</p>}
                </div>

                {/* Password field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pr-10"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
                  <p className="text-xs text-muted-foreground mt-1">Password must be at least 8 characters long.</p>
                </div>

                {/* Confirm Password field */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    password_confirm
                  </label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pr-10"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>}
                </div>

                {/* Name field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full"
                    disabled={isSubmitting}
                  />
                  {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                </div>

                {/* Email field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full"
                    disabled={isSubmitting}
                  />
                  {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                </div>

                {/* Phone field */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="010-0000-0000"
                    className="w-full"
                    disabled={isSubmitting}
                  />
                  {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
                </div>

                <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 mt-6" disabled={isSubmitting}>
                  {isSubmitting ? "Processing ..." : "Register"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-blue-500 hover:text-blue-600">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}


