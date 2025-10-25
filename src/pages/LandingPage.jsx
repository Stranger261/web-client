import { useEffect, useState } from 'react';
import HomeSection from '../components/landingPage/HomeSection';
import MissionVisionSection from '../components/landingPage/MissionVisionSection';
import ServicesSection from '../components/landingPage/ServicesSection';
import DoctorsSection from '../components/landingPage/DoctorsSection';
import ContactSection from '../components/landingPage/ContactSection';
import FooterSection from '../components/landingPage/FooterSection';
import AboutSection from '../components/landingPage/AboutSection';
import { Link } from 'react-router';

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

  // Simple scroll handler - compatible with older Chrome
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

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimer !== null) {
        clearTimeout(scrollTimer);
      }
    };
  }, []);

  // Manual reveal on scroll - no IntersectionObserver for better compatibility
  useEffect(() => {
    let scrollTimer = null;

    const checkSections = () => {
      if (scrollTimer !== null) return;

      scrollTimer = setTimeout(() => {
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

        sections.forEach(sectionId => {
          const element = document.getElementById(sectionId);
          if (element) {
            const rect = element.getBoundingClientRect();
            const elementTop = rect.top + scrollY;
            const elementVisible = scrollY + windowHeight > elementTop + 100;

            if (elementVisible) {
              newRevealed.add(sectionId);
            }
          }
        });

        if (newRevealed.size !== revealedSections.size) {
          setRevealedSections(newRevealed);
        }

        scrollTimer = null;
      }, 100);
    };

    window.addEventListener('scroll', checkSections);
    checkSections(); // Initial check

    return () => {
      window.removeEventListener('scroll', checkSections);
      if (scrollTimer !== null) {
        clearTimeout(scrollTimer);
      }
    };
  }, [revealedSections]);

  // Simple smooth scroll - no event delegation
  useEffect(() => {
    const handleClick = e => {
      const target = e.target;
      if (target.tagName !== 'A') return;

      const href = target.getAttribute('href');
      if (!href || !href.startsWith('#')) return;

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
    };

    document.body.addEventListener('click', handleClick);
    return () => document.body.removeEventListener('click', handleClick);
  }, []);

  const filteredDocs =
    allDoctors && allDoctors.length > 0
      ? allDoctors.sort((a, b) => a.department.localeCompare(b.department))
      : [];

  if (pageLoading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-600 font-semibold">
            Loading HVill Hospital...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="antialiased font-inter text-gray-800 bg-white">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />

      {/* Simple CSS animations */}
      <style>
        {`
          .section-reveal {
            opacity: 0;
            transform: translateY(30px);
          }
          .section-visible {
            opacity: 1;
            transform: translateY(0);
            transition: opacity 0.6s ease, transform 0.6s ease;
          }
          .section-reveal:first-child {
            opacity: 1;
            transform: translateY(0);
          }
        `}
      </style>

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

          {/* MOBILE MENU BUTTON */}
          <button
            className={`md:hidden p-2 rounded ${
              isScrolled ? 'text-blue-900' : 'text-white'
            }`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            type="button"
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
                  className="px-4 py-2 rounded-full font-medium"
                  style={{ transition: 'background-color 0.2s ease' }}
                  onMouseEnter={e =>
                    (e.target.style.backgroundColor = 'rgba(255,255,255,0.2)')
                  }
                  onMouseLeave={e =>
                    (e.target.style.backgroundColor = 'transparent')
                  }
                >
                  {item}
                </a>
              </li>
            ))}
            <li>
              <Link
                to="/login"
                className="ml-4 bg-white text-blue-900 px-6 py-2 rounded-full font-semibold shadow-md"
                style={{
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={e => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
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
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 text-gray-500"
                    type="button"
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
                      className="block py-3 px-4 text-gray-700 rounded-lg font-medium"
                      style={{ transition: 'all 0.2s ease' }}
                      onMouseEnter={e => {
                        e.target.style.backgroundColor = '#EFF6FF';
                        e.target.style.color = '#1E40AF';
                      }}
                      onMouseLeave={e => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = '#374151';
                      }}
                    >
                      {item}
                    </a>
                  </li>
                ))}
                <li className="pt-4 border-t">
                  <Link
                    to="/login"
                    className="block w-full bg-blue-900 text-white text-center py-3 px-4 rounded-lg font-semibold"
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
          className={`section-reveal ${
            revealedSections.has('home') ? 'section-visible' : ''
          } py-20 min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 text-white`}
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
