// src/components/Footer.jsx
import React from "react";
import { APP_NAME } from "../utils/constants";
import { FaGithub, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-base-100 border-t border-base-200">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: copyright */}
        <p className="text-sm opacity-70 text-center md:text-left">
          © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>

        {/* Right: social links */}
        <div className="flex items-center gap-5 text-xl">
          <a
            href="https://github.com/ArponRoy7"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="btn btn-ghost btn-circle text-xl opacity-70 hover:opacity-100 transition"
          >
            <FaGithub />
          </a>
          <a
            href="https://www.linkedin.com/in/arpon-roy-b461321a8/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="btn btn-ghost btn-circle text-xl opacity-70 hover:opacity-100 transition text-[#0A66C2]"
          >
            <FaLinkedin />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
