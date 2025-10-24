import { useEffect, useRef, useState } from 'react';
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

  const allDoctors = [];

  // Simulate initial loading
  useEffect(() => {
    const init = async () => {
      setPageLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.log(error);
      } finally {
        setPageLoading(false);
      }
    };
    init();
  }, []);

  // Header scroll background change
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll for internal links
  useEffect(() => {
    const handleSmoothScroll = e => {
      const href = e.target.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          window.history.pushState(null, null, href);
          setIsMenuOpen(false);
        }
      }
    };

    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => link.addEventListener('click', handleSmoothScroll));
    return () =>
      links.forEach(link =>
        link.removeEventListener('click', handleSmoothScroll)
      );
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Section component with reveal animation - FIXED
  const Section = ({ id, className, children }) => {
    const ref = useRef(null);

    useEffect(() => {
      const section = ref.current;
      if (!section) return;

      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('reveal-visible');
            } else {
              entry.target.classList.remove('reveal-visible');
            }
          });
        },
        {
          threshold: 0.15,
          rootMargin: '0px 0px -50px 0px',
        }
      );

      observer.observe(section);

      return () => observer.unobserve(section);
    }, []);

    return (
      <section
        ref={ref}
        id={id}
        className={`reveal-section py-20 min-h-screen flex items-center justify-center scroll-mt-20 ${className}`}
      >
        <div className="container mx-auto px-6 w-full">{children}</div>
      </section>
    );
  };

  // Loading overlay
  const LoadingOverlay = () => (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#172554] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#172554] font-semibold">
          Loading HVill Hospital...
        </p>
      </div>
    </div>
  );

  const filteredDocs = allDoctors
    ? allDoctors.sort((a, b) => a.department.localeCompare(b.department))
    : [];

  if (pageLoading) return <LoadingOverlay />;

  return (
    <div className="antialiased font-inter text-gray-800 bg-white">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />

      {/* Reveal animation CSS - FIXED */}
      <style>
        {`
          .reveal-section {
            opacity: 0;
            transform: translateY(40px);
            transition: opacity 0.8s ease-out, transform 0.8s ease-out;
          }
          .reveal-visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
          }
          /* Prevent flicker on initial load */
          .reveal-section:first-of-type {
            opacity: 1;
            transform: translateY(0);
          }
        `}
      </style>

      {/* HEADER */}
      <header
        className={`fixed w-full top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-lg py-2'
            : 'bg-transparent py-4'
        }`}
      >
        <nav className="container mx-auto px-6 flex justify-between items-center">
          <a
            href="#home"
            className={`text-2xl font-bold flex items-center space-x-3 transition-colors ${
              isScrolled ? 'text-[#172554]' : 'text-white'
            }`}
          >
            <div className="bg-white rounded-full p-2 shadow-lg">
              <img
                src="/images/logo.png"
                alt="HVill Hospital Logo"
                className="h-8 w-8 transition-transform duration-300 hover:scale-110"
              />
            </div>
            <span className="text-xl font-bold">HVill Hospital</span>
          </a>

          {/* MOBILE MENU BUTTON */}
          <div className="md:hidden">
            <button
              className={`p-2 rounded-lg transition-colors ${
                isScrolled
                  ? 'text-[#172554] hover:bg-gray-100'
                  : 'text-white hover:bg-white/20'
              }`}
              onClick={toggleMenu}
              aria-label="Toggle menu"
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
          </div>

          {/* DESKTOP NAVIGATION */}
          <ul
            className={`hidden md:flex items-center space-x-1 font-medium ${
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
                  className="px-4 py-2 rounded-full hover:bg-white/20 transition-all duration-300 font-semibold hover:scale-105"
                >
                  {item}
                </a>
              </li>
            ))}
            <li>
              <Link
                to="/login"
                className="ml-4 bg-white text-[#172554] px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Login
              </Link>
            </li>
          </ul>
        </nav>

        {/* MOBILE MENU */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsMenuOpen(false)}
            ></div>
            <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-100 rounded-full p-2">
                      <img
                        src="/images/logo.png"
                        alt="HVill Hospital Logo"
                        className="h-8 w-8"
                      />
                    </div>
                    <span className="text-xl font-bold text-[#172554]">
                      HVill Hospital
                    </span>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 text-gray-500 hover:text-[#172554] transition-colors duration-300"
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

              <ul className="p-6 space-y-4">
                {[
                  'Home',
                  'Mission & Vision',
                  'About',
                  'Services',
                  'Doctors',
                  'Contact',
                ].map((item, index) => (
                  <li key={item}>
                    <a
                      href={`#${item
                        .toLowerCase()
                        .replace(' & ', '-')
                        .replace(' ', '-')}`}
                      className="block py-3 px-4 text-gray-700 hover:text-[#172554] hover:bg-blue-50 rounded-lg transition-all duration-300 font-semibold transform hover:translate-x-2"
                      style={{ transitionDelay: `${index * 100}ms` }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item}
                    </a>
                  </li>
                ))}
                <li className="pt-4 border-t">
                  <Link
                    to="/login"
                    className="block w-full bg-[#172554] text-white text-center py-3 px-4 rounded-lg font-semibold hover:bg-[#1e3a8a] transition-all duration-300 shadow-lg transform hover:scale-105"
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
        <Section
          id="home"
          className="relative text-white bg-gradient-to-br from-[#172554] via-[#1e40af] to-[#3b82f6]"
        >
          <HomeSection />
        </Section>

        <Section id="mission-vision" className="bg-white">
          <MissionVisionSection />
        </Section>

        <Section id="about" className="bg-gray-50">
          <AboutSection />
        </Section>

        <Section id="services" className="bg-white">
          <ServicesSection />
        </Section>

        <Section id="doctors" className="bg-gray-50">
          <DoctorsSection doctors={filteredDocs} />
        </Section>

        <Section id="contact" className="bg-white">
          <ContactSection />
        </Section>
      </main>

      <FooterSection />
    </div>
  );
};

export default LandingPage;
