import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const session = await auth();

  // If authenticated, redirect to appropriate dashboard
  if (session) {
    switch (session.user.role) {
      case "ADMIN":
        redirect("/admin");
      case "OWNER":
        redirect("/dashboard/owner");
      case "PARENT":
        redirect("/portal");
      default:
        redirect("/login");
    }
  }

  // Landing page for unauthenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6">
              Early Childhood Development Portal
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Track your child&apos;s developmental milestones with the Ages & Stages Questionnaire (ASQ) framework.
              Get personalized insights and intervention recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-emerald-700 bg-white border-2 border-emerald-200 rounded-full shadow-lg hover:shadow-xl hover:border-emerald-300 transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">ASQ Assessments</h3>
            <p className="text-gray-600">
              Complete standardized developmental screenings for children ages 2-60 months across 5 key domains.
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Progress Tracking</h3>
            <p className="text-gray-600">
              Monitor your child&apos;s growth over time with visual reports and developmental trend analysis.
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Intervention Videos</h3>
            <p className="text-gray-600">
              Access curated educational videos and activities tailored to support your child&apos;s development.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-sm border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-500">
            © 2024 ECD Portal. Supporting early childhood development through evidence-based assessments.
          </p>
        </div>
      </footer>
    </div>
  );
}
