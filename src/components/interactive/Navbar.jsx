"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar({ activePage = "" }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div
      data-animation="default"
      data-collapse="medium"
      data-duration="400"
      data-easing="ease"
      data-easing2="ease"
      role="banner"
      className="navbar w-nav"
    >
      <div className="container-large w-container">
        <div className="navbar-area">
          <Link
            href="/home"
            className={`brand-logo-wrap w-nav-brand ${
              activePage === "home" ? "w--current" : ""
            }`}
          >
            <img
              src="/images/sarthi-logo.png"
              loading="eager"
              alt="SARTHI Logo"
              className="brand-logo"
              style={{
                maxHeight: "52px",
                width: "auto",
                objectFit: "contain",
                background: "transparent",
                mixBlendMode: "screen",
              }}
            />
          </Link>
          <nav
            role="navigation"
            className={`nav-menu-area w-nav-menu ${
              isMobileOpen ? "w--open" : ""
            }`}
          >
            <div className="nav-menu-wrap">
              <Link
                href="/home"
                className={`nav-link w-nav-link ${
                  activePage === "home" ? "w--current" : ""
                }`}
                onClick={() => setIsMobileOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/about"
                className={`nav-link w-nav-link ${
                  activePage === "about" ? "w--current" : ""
                }`}
                onClick={() => setIsMobileOpen(false)}
              >
                About
              </Link>
              <Link
                href="/courses"
                className={`nav-link w-nav-link ${
                  activePage === "courses" ? "w--current" : ""
                }`}
                onClick={() => setIsMobileOpen(false)}
              >
                Courses
              </Link>
              <div
                className={`nav-dropdown w-dropdown ${
                  isDropdownOpen ? "w--open" : ""
                }`}
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <div
                  className={`nav-link navbar-dropdown w-dropdown-toggle ${
                    isDropdownOpen ? "w--open" : ""
                  }`}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <div>Pages</div>
                  <div className="nav-dropdown-icon w-icon-dropdown-toggle"></div>
                </div>
                <nav
                  className={`navigation-menu-area w-dropdown-list ${
                    isDropdownOpen ? "w--open" : ""
                  }`}
                  style={{ display: isDropdownOpen ? "block" : "none" }}
                >
                  <div className="navigation-menu-wrap">
                    <Link
                      href="/membership"
                      className="navigation-menu w-dropdown-link"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      User Roles
                    </Link>
                    <Link
                      href="/events"
                      className="navigation-menu w-dropdown-link"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      Events
                    </Link>
                    <Link
                      href="/team"
                      className="navigation-menu w-dropdown-link"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      Team
                    </Link>
                    <Link
                      href="/contact"
                      className="navigation-menu w-dropdown-link"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      Contact
                    </Link>
                  </div>
                </nav>
              </div>
              <Link
                href="/blog"
                className={`nav-link w-nav-link ${
                  activePage === "blog" ? "w--current" : ""
                }`}
                onClick={() => setIsMobileOpen(false)}
              >
                Blog
              </Link>
            </div>
            <div className="nav-button-wrap">
              <Link
                href="/login"
                title="Left-click: Sign In | Right-click: Sign Up"
                className="white-button w-variant-b5e20566-3477-dba0-25ea-a79fe332753d w-inline-block"
                onClick={() => setIsMobileOpen(false)}
              >
                <div className="button-text">Sign In / Sign Up</div>
                <div className="button-bg green-bg"></div>
              </Link>
            </div>
          </nav>
          <div
            className={`nav-menu-button w-nav-button ${
              isMobileOpen ? "w--open" : ""
            }`}
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label="Toggle Navigation Menu"
          >
            <div className="w-icon-nav-menu"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
