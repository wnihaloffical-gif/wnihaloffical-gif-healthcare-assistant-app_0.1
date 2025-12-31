"use client"

import type React from "react"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = searchParams.get("role") || "patient"

  const [language, setLanguage] = useState("en")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const selectedLanguage = typeof window !== "undefined" ? sessionStorage.getItem("selectedLanguage") : null
    if (selectedLanguage) {
      setLanguage(selectedLanguage)
    }
  }, [])

  const langText = {
    en: {
      login: "Login",
      email: "Email",
      password: "Password",
      signIn: "Sign In",
      noAccount: "Don't have an account?",
      register: "Register here",
      patientDash: "Patient Dashboard",
      doctorDash: "Doctor Dashboard",
      adminDash: "Admin Dashboard",
    },
    hi: {
      login: "लॉगिन",
      email: "ईमेल",
      password: "पासवर्ड",
      signIn: "साइन इन करें",
      noAccount: "खाता नहीं है?",
      register: "यहाँ पंजीकरण करें",
      patientDash: "रोगी डैशबोर्ड",
      doctorDash: "डॉक्टर डैशबोर्ड",
      adminDash: "प्रशासक डैशबोर्ड",
    },
    mr: {
      login: "लॉगिन",
      email: "ईमेल",
      password: "पासवर्ड",
      signIn: "साइन इन करा",
      noAccount: "खाते नाही?",
      register: "येथे नोंदणी करा",
      patientDash: "रुग्ण डेशबोर्ड",
      doctorDash: "डॉक्टर डेशबोर्ड",
      adminDash: "प्रशासक डेशबोर्ड",
    },
  }

  const t = langText[language as keyof typeof langText]

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Login failed")
      }

      const data = await response.json()
      localStorage.setItem("token", data.token)
      localStorage.setItem("userId", data.userId)
      localStorage.setItem("role", role)
      localStorage.setItem("language", language)

      document.cookie = `token=${data.token}; path=/; max-age=86400`

      // Redirect based on role
      const dashboardMap: Record<string, string> = {
        patient: "/patient/dashboard",
        doctor: "/doctor/dashboard",
        admin: "/admin/dashboard",
      }

      router.push(dashboardMap[role] || "/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-white px-4">
      <div className="card-shadow max-w-md w-full">
        <h1 className="text-3xl font-bold text-primary mb-2">{t.login}</h1>
        <p className="text-gray-500 mb-6 capitalize">
          {role === "patient" ? t.patientDash : role === "doctor" ? t.doctorDash : t.adminDash}
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t.email}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t.password}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          {error && <div className="bg-destructive/10 text-destructive p-3 rounded text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2 rounded font-semibold hover:bg-primary-light transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : t.signIn}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          {t.noAccount}{" "}
          <button
            onClick={() => router.push(`/auth/register?role=${role}`)}
            className="text-primary font-semibold hover:text-primary-light"
          >
            {t.register}
          </button>
        </p>
      </div>
    </div>
  )
}
