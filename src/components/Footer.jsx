import React from "react";
import { APP_NAME } from "../utils/constants";
import { FaGithub, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="border-t border-base-200 bg-base-100/80 backdrop-blur">
      <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: copyright */}
        <p className="text-sm opacity-80">
          © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>

        {/* Right: social links */}
        <div className="flex items-center gap-5 text-xl">
          <a
            href="https://github.com/ArponRoy7"
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-70 hover:opacity-100 transition"
            aria-label="GitHub"
          >
            <FaGithub />
          </a>
          <a
            href="https://www.linkedin.com/in/arpon-roy-b461321a8/"
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-70 hover:opacity-100 transition text-[#0A66C2]"
            aria-label="LinkedIn"
          >
            <FaLinkedin />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
