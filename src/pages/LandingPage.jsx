import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router';

import HomeSection from '../components/landingPage/HomeSection';
import MissionVisionSection from '../components/landingPage/MissionVisionSection';
import ServicesSection from '../components/landingPage/ServicesSection';
import DoctorsSection from '../components/landingPage/DoctorsSection';
import ContactSection from '../components/landingPage/ContactSection';
import FooterSection from '../components/landingPage/FooterSection';
import AboutSection from '../components/landingPage/AboutSection';

import LoadingOverlay from '../components/shared/LoadingOverlay';

const LandingPage = () => {
  const [pageLoading, setPageLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [revealedSections, setRevealedSections] = useState(new Set(['home']));

  const allDoctors = [];

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Fixed scroll handler with useCallback
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let scrollTimer = null;

    const handleScroll = () => {
      if (scrollTimer !== null) {
        clearTimeout(scrollTimer);
      }

      scrollTimer = setTimeout(() => {
        const currentScrollY = window.scrollY;
        if (Math.abs(currentScrollY - lastScrollY) > 10) {
          setIsScrolled(currentScrollY > 50);
          lastScrollY = currentScrollY;
        }
        scrollTimer = null;
      }, 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimer !== null) {
        clearTimeout(scrollTimer);
      }
    };
  }, []);

  // Fixed section reveal with useCallback to prevent infinite re-renders
  const checkSections = useCallback(() => {
    const sections = [
      'home',
      'mission-vision',
      'about',
      'services',
      'doctors',
      'contact',
    ];
    const windowHeight = window.innerHeight;
    const scrollY = window.scrollY;
    const newRevealed = new Set(revealedSections);

    let hasChanges = false;

    sections.forEach(sectionId => {
      const element = document.getElementById(sectionId);
      if (element) {
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top + scrollY;
        const elementVisible = scrollY + windowHeight > elementTop + 100;

        if (elementVisible && !newRevealed.has(sectionId)) {
          newRevealed.add(sectionId);
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      setRevealedSections(newRevealed);
    }
  }, [revealedSections]);

  useEffect(() => {
    let scrollTimer = null;

    const handleScroll = () => {
      if (scrollTimer !== null) return;

      scrollTimer = setTimeout(() => {
        checkSections();
        scrollTimer = null;
      }, 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    checkSections(); // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimer !== null) {
        clearTimeout(scrollTimer);
      }
    };
  }, [checkSections]);

  // Fixed smooth scroll handler
  useEffect(() => {
    const handleClick = e => {
      // Check if it's a link with hash
      let target = e.target;
      while (target && target !== document.body) {
        if (target.tagName === 'A') {
          const href = target.getAttribute('href');
          if (href && href.startsWith('#')) {
            e.preventDefault();
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
              const offsetTop = targetElement.offsetTop - 80;
              window.scrollTo({
                top: offsetTop,
                behavior: 'smooth',
              });
              setIsMenuOpen(false);
            }
            return;
          }
        }
        target = target.parentElement;
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const filteredDocs =
    allDoctors && allDoctors.length > 0
      ? allDoctors.sort((a, b) => a.department.localeCompare(b.department))
      : [];

  if (pageLoading) {
    return <LoadingOverlay message="Loading..." size="xl" />;
  }

  return (
    <div className="antialiased font-inter text-gray-800 bg-white">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />

      {/* Fixed CSS animations */}
      <style>{`
        .section-reveal {
          opacity: 0;
          transform: translateY(30px);
        }
        .section-visible {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        #home {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>

      {/* SIMPLIFIED HEADER */}
      <header
        className={`fixed w-full top-0 z-50 ${
          isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
        }`}
        style={{
          transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
        }}
      >
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <a
            href="#home"
            className={`text-xl font-bold flex items-center space-x-2 ${
              isScrolled ? 'text-blue-900' : 'text-white'
            }`}
            style={{ transition: 'color 0.3s ease' }}
          >
            <div className="bg-white rounded-full p-2 shadow-md">
              <img
                src="/images/logo.png"
                alt="HVill Hospital"
                className="h-8 w-8"
              />
            </div>
            <span>HVill Hospital</span>
          </a>

          {/* MOBILE MENU BUTTON - Fixed with type="button" */}
          <button
            type="button" // Added this line
            className={`md:hidden p-2 rounded ${
              isScrolled ? 'text-blue-900' : 'text-white'
            }`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              ></path>
            </svg>
          </button>

          {/* DESKTOP NAVIGATION */}
          <ul
            className={`hidden md:flex items-center space-x-1 ${
              isScrolled ? 'text-gray-700' : 'text-white'
            }`}
          >
            {[
              'Home',
              'Mission & Vision',
              'About',
              'Services',
              'Doctors',
              'Contact',
            ].map(item => (
              <li key={item}>
                <a
                  href={`#${item
                    .toLowerCase()
                    .replace(' & ', '-')
                    .replace(' ', '-')}`}
                  className="px-4 py-2 rounded-full font-medium hover:bg-white hover:bg-opacity-20 transition-colors duration-200"
                >
                  {item}
                </a>
              </li>
            ))}
            <li>
              <Link
                to="/login"
                className={`px-6 py-2 rounded-full font-semibold shadow-md block text-center md:inline-block md:ml-4 transition-all duration-300 ${
                  isScrolled
                    ? 'bg-[#1e3a8a] text-white hover:bg-[#1d4ed8]'
                    : 'bg-[#1e3a8a] text-white hover:bg-[#1d4ed8]'
                }`}
                style={{
                  boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                }}
              >
                Login
              </Link>
            </li>
          </ul>
        </nav>

        {/* MOBILE MENU */}
        {isMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black"
              style={{ opacity: 0.5 }}
              onClick={() => setIsMenuOpen(false)}
            ></div>
            <div
              className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl"
              style={{
                transform: isMenuOpen ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform 0.3s ease',
              }}
            >
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <img
                      src="/images/logo.png"
                      alt="Logo"
                      className="h-8 w-8"
                    />
                    <span className="text-xl font-bold text-blue-900">
                      HVill Hospital
                    </span>
                  </div>
                  <button
                    type="button" // Added this line
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 text-gray-500"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      ></path>
                    </svg>
                  </button>
                </div>
              </div>

              <ul className="p-6 space-y-3">
                {[
                  'Home',
                  'Mission & Vision',
                  'About',
                  'Services',
                  'Doctors',
                  'Contact',
                ].map(item => (
                  <li key={item}>
                    <a
                      href={`#${item
                        .toLowerCase()
                        .replace(' & ', '-')
                        .replace(' ', '-')}`}
                      className="block py-3 px-4 text-gray-700 rounded-lg font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item}
                    </a>
                  </li>
                ))}
                <li className="pt-4 border-t">
                  <Link
                    to="/login"
                    className="block w-full bg-[#1e3a8a] text-white text-center py-3 px-4 rounded-lg font-semibold hover:bg-[#1d4ed8] transform hover:scale-105 transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login to Portal
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        )}
      </header>

      {/* MAIN CONTENT */}
      <main>
        <section
          id="home"
          className="section-reveal section-visible py-20 min-h-screen flex items-center justify-center text-white"
          style={{
            background:
              'linear-gradient(to bottom right, #1e3a8a, #3b82f6, #60a5fa)',
          }}
        >
          <div className="container mx-auto px-6 w-full">
            <HomeSection />
          </div>
        </section>

        <section
          id="mission-vision"
          className={`section-reveal ${
            revealedSections.has('mission-vision') ? 'section-visible' : ''
          } py-20 min-h-screen flex items-center justify-center bg-white`}
        >
          <div className="container mx-auto px-6 w-full">
            <MissionVisionSection />
          </div>
        </section>

        <section
          id="about"
          className={`section-reveal ${
            revealedSections.has('about') ? 'section-visible' : ''
          } py-20 min-h-screen flex items-center justify-center bg-gray-50`}
        >
          <div className="container mx-auto px-6 w-full">
            <AboutSection />
          </div>
        </section>

        <section
          id="services"
          className={`section-reveal ${
            revealedSections.has('services') ? 'section-visible' : ''
          } py-20 min-h-screen flex items-center justify-center bg-white`}
        >
          <div className="container mx-auto px-6 w-full">
            <ServicesSection />
          </div>
        </section>

        <section
          id="doctors"
          className={`section-reveal ${
            revealedSections.has('doctors') ? 'section-visible' : ''
          } py-20 min-h-screen flex items-center justify-center bg-gray-50`}
        >
          <div className="container mx-auto px-6 w-full">
            <DoctorsSection doctors={filteredDocs} />
          </div>
        </section>

        <section
          id="contact"
          className={`section-reveal ${
            revealedSections.has('contact') ? 'section-visible' : ''
          } py-20 min-h-screen flex items-center justify-center bg-white`}
        >
          <div className="container mx-auto px-6 w-full">
            <ContactSection />
          </div>
        </section>
      </main>

      <FooterSection />
    </div>
  );
};

export default LandingPage;
