"use client"

import type React from "react"

import { useSearchParams, useRouter } from "next/navigation"
import { useState } from "react"

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = searchParams.get("role") || "patient"
  const language = sessionStorage.getItem("selectedLanguage") || "en"

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    specialization: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const langText = {
    en: {
      register: "Register",
      name: "Full Name",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      specialization: "Specialization",
      createAccount: "Create Account",
      haveAccount: "Already have an account?",
      login: "Login here",
    },
    hi: {
      register: "पंजीकरण",
      name: "पूरा नाम",
      email: "ईमेल",
      password: "पासवर्ड",
      confirmPassword: "पासवर्ड की पुष्टि करें",
      specialization: "विशेषज्ञता",
      createAccount: "खाता बनाएं",
      haveAccount: "पहले से खाता है?",
      login: "यहाँ लॉगिन करें",
    },
    mr: {
      register: "नोंदणी",
      name: "पूर्ण नाव",
      email: "ईमेल",
      password: "पासवर्ड",
      confirmPassword: "पासवर्ड पुष्टी करा",
      specialization: "विशेषीकरण",
      createAccount: "खाते तयार करा",
      haveAccount: "आधीच खाते आहे?",
      login: "येथे लॉगिन करा",
    },
  }

  const t = langText[language as keyof typeof langText]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role,
          specialization: role === "doctor" ? formData.specialization : null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Registration failed")
      }

      const data = await response.json()
      localStorage.setItem("token", data.token)
      localStorage.setItem("userId", data.userId)
      localStorage.setItem("role", role)
      localStorage.setItem("language", language)

      const dashboardMap: Record<string, string> = {
        patient: "/patient/dashboard",
        doctor: "/doctor/dashboard",
        admin: "/admin/dashboard",
      }

      router.push(dashboardMap[role] || "/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-white px-4">
      <div className="card-shadow max-w-md w-full">
        <h1 className="text-3xl font-bold text-primary mb-2">{t.register}</h1>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t.name}</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t.email}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t.password}</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t.confirmPassword}</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="••••••••"
            />
          </div>

          {role === "doctor" && (
            <div>
              <label className="block text-sm font-medium mb-1">{t.specialization}</label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                placeholder="e.g., Cardiology"
              />
            </div>
          )}

          {error && <div className="bg-destructive/10 text-destructive p-3 rounded text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2 rounded font-semibold hover:bg-primary-light transition-colors disabled:opacity-50"
          >
            {loading ? "Creating..." : t.createAccount}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          {t.haveAccount}{" "}
          <button
            onClick={() => router.push(`/auth/login?role=${role}`)}
            className="text-primary font-semibold hover:text-primary-light"
          >
            {t.login}
          </button>
        </p>
      </div>
    </div>
  )
}
