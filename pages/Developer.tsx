import { Github, Linkedin, Globe, CheckCircle } from "lucide-react";

function AboutMe() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
        About Me
      </h1>
      <p className="text-slate-600 dark:text-slate-300 text-lg">
        Hi! I'm <span className="font-semibold">Iresh Nimantha</span>, the
        developer behind this project. I specialize in building modern web
        applications using cutting-edge technologies.
      </p>

      {/* Tech Stack */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-3">
          Project Technology
        </h2>
        <ul className="flex flex-wrap gap-4 text-sm text-slate-700 dark:text-slate-300">
          <li className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full">
            React (TypeScript)
          </li>
          <li className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full">
            Tailwind CSS
          </li>
          <li className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full">
            Vercel
          </li>
          <li className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full">
            GitHub
          </li>
          <li className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full">
            JavaScript/TypeScript
          </li>
        </ul>
      </div>

      {/* Skills */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-3">
          My Skills
        </h2>
        <ul className="grid grid-cols-2 md:grid-cols-3 gap-4 text-slate-700 dark:text-slate-300">
          <li className="flex items-center gap-2">
            <CheckCircle className="text-emerald-500" /> Frontend Development
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="text-emerald-500" /> React & TypeScript
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="text-emerald-500" /> Tailwind CSS &
            Responsive UI
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="text-emerald-500" /> API Integration
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="text-emerald-500" /> Web Deployment (Vercel)
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="text-emerald-500" /> Git & Version Control
          </li>
        </ul>
      </div>

      {/* Links */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-3">
          Connect with Me
        </h2>
        <div className="flex items-center gap-6">
          <a
            href="https://github.com/Iresh-Nimantha"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition-colors"
          >
            <Github size={20} /> GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/ireshnimantha/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <Linkedin size={20} /> LinkedIn
          </a>
          <a
            href="https://iresh-nimantha.github.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <Globe size={20} /> Portfolio
          </a>
        </div>
      </div>
    </div>
  );
}

export default AboutMe;
