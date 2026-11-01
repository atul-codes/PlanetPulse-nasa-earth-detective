'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [utcTime, setUtcTime] = useState('04:32 UTC');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hrs = String(now.getUTCHours()).padStart(2, '0');
      const mins = String(now.getUTCMinutes()).padStart(2, '0');
      setUtcTime(`${hrs}:${mins} UTC`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const links = [
    { href: '/dashboard',   label: 'Workspace' },
    { href: '/investigate', label: 'Methodology' },
    { href: '/compare',     label: 'Data Sources' },
    { href: '/reports',     label: 'Reports' },
  ];

  return (
    <>
      {/* Topline Banner matching ORBIT */}
      <div className="topline">
        <span>LIVE TRACKING</span> &nbsp; NASA Earth Systems Intelligence &nbsp; · &nbsp; {utcTime}
      </div>

      {/* Main Navigation Header */}
      <header className="relative z-30 border-b border-white/[0.14] bg-[#070b13]/90 backdrop-blur-md">
        <div className="wrap flex items-center justify-between h-[74px]">
          
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 font-display font-bold text-lg tracking-[0.08em] text-[#f3f5f8] group">
            <Image
              src="/nasa-logo.svg"
              alt="NASA Logo"
              width={42}
              height={35}
              unoptimized
              priority
              className="h-8 w-auto object-contain shrink-0 transition-transform duration-200 group-hover:scale-105"
            />
            <span className="tracking-[0.08em] text-white">NASA SPACE</span>
            <span className="h-5 w-[1px] bg-white/25 mx-0.5" />
            <span className="text-[10px] sm:text-[11px] font-mono font-normal tracking-[0.2em] text-[#9aa7bd] uppercase">
              EARTH DETECTIVE
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-9 text-xs text-[#d8dee8]">
            {links.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`transition-colors duration-150 tracking-[0.04em] ${
                    active ? 'text-[#70a7ff] font-medium' : 'hover:text-[#70a7ff]'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/dashboard" className="nav-cta">
              Explore Workspace &nbsp; ↗
            </Link>
          </div>

          {/* Mobile hamburger button */}
          <button
            className="md:hidden text-2xl text-[#f3f5f8] bg-transparent border-0 p-1 cursor-pointer"
            aria-label="Toggle navigation menu"
            onClick={() => setMobileMenuOpen(v => !v)}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-[74px] left-0 right-0 bg-[#0b111c] border-b border-white/[0.14] p-6 flex flex-col gap-5 z-50">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm tracking-wide ${pathname === href ? 'text-[#70a7ff]' : 'text-[#d8dee8]'}`}
              >
                {label}
              </Link>
            ))}
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="nav-cta text-center mt-2"
            >
              Explore Workspace &nbsp; ↗
            </Link>
          </div>
        )}
      </header>
    </>
  );
}
