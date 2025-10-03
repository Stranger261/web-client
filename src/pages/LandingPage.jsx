import { useEffect, useState } from 'react';
import HomeSection from '../components/landingPage/HomeSection';
import MissionVisionSection from '../components/landingPage/MissionVisionSection';
import ServicesSection from '../components/landingPage/ServicesSection';
import DoctorsSection from '../components/landingPage/DoctorsSection';
import ContactSection from '../components/landingPage/ContactSection';
import FooterSection from '../components/landingPage/FooterSection';
import AboutSection from '../components/landingPage/AboutSection';
import { Link } from 'react-router';
import { useSchedule } from '../context/ScheduleContext';
import LoadingOverlay from '../components/generic/LoadingOverlay';

const LandingPage = () => {
  const { allDoctors, getDoctors } = useSchedule();
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      setPageLoading(true);
      try {
        const delay = new Promise(res => setTimeout(res, 1000));
        await Promise.race([delay, getDoctors()]);
      } catch (error) {
        console.log(error);
      } finally {
        setPageLoading(false);
      }
    };

    init();
  }, [getDoctors]);

  const filteredDocs =
    allDoctors && allDoctors.sort((a, b) => a.department - b.department);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    const handleSmoothScroll = e => {
      const href = e.target.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
          window.history.pushState(null, null, href); // This updates the URL without page reload
          setIsMenuOpen(false);
        }
      }
    };

    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
      link.addEventListener('click', handleSmoothScroll);
    });

    return () => {
      links.forEach(link => {
        link.removeEventListener('click', handleSmoothScroll);
      });
    };
  }, []);

  const FullHeightSection = ({ id, className, children }) => (
    <section
      id={id}
      className={`py-20 min-h-screen flex items-center justify-center ${className}`}
    >
      <div className="container mx-auto px-6">{children}</div>
    </section>
  );

  return pageLoading || filteredDocs.length === 0 ? (
    <LoadingOverlay />
  ) : (
    <div className="antialiased font-inter text-gray-800 bg-slate-50">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />

      {/* HEADER WITH LOGO */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <a
            href="#home"
            className="text-2xl font-bold text-gray-800 flex items-center space-x-2"
          >
            <img
              src="images/logo.png"
              alt="HVill Hospital Logo"
              className="h-10 md:mr-2 transition-transform duration-300 ease-in-out transform hover:scale-110"
            />
            <span className="text-2xl font-semibold text-[#172554]">
              HVill Hospital
            </span>
          </a>

          {/* MOBILE MENU BUTTON */}
          <div className="md:hidden">
            <button
              id="menu-btn"
              className="text-gray-600 focus:outline-none"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
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

          {/* DESKTOP LINKS */}
          {/* prettier-ignore */}
          <ul className="hidden md:flex items-center space-x-8 text-gray-600 font-medium">
            <li><a href="#home" className="hover:text-[#172554] transition-colors">Home</a></li>
            <li><a href="#mission-vision" className="hover:text-[#172554] transition-colors">Mission & Vision</a></li>
            <li><a href="#about" className="hover:text-[#172554] transition-colors">About</a></li>
            <li><a href="#services" className="hover:text-[#172554] transition-colors">Services</a></li>
            <li><a href="#doctors" className="hover:text-[#172554] transition-colors">Doctors</a></li>
            <li><a href="#contact" className="hover:text-[#172554] transition-colors">Contact</a></li>
            <li>
              <Link to='/login'  className="bg-[#172554] text-white px-5 py-2 rounded-full font-semibold hover:bg-sky-600 transition-colors shadow-md">
                Login
              </Link>
            </li>
          </ul>

          {/* MOBILE LINKS BAR */}
          {/* prettier-ignore */}
          <div id="mobile-menu" className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl transition-transform duration-300 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:hidden`}>
            <div className="p-6">
              <a href="#home" className="text-2xl font-bold text-gray-800">
                  <i className="fas fa-hospital-user text-[#172554] mr-2"></i>
                  HVill Hospital
              </a>
            </div>
            <ul className="flex flex-col items-start px-6 py-4 space-y-4 text-gray-600 font-medium">
              <li><a href="#home" className="block w-full hover:text-[#172554] transition-colors">Home</a></li>
              <li><a href="#mission-vision" className="block w-full hover:text-[#172554] transition-colors">Mission & Vision</a></li>
              <li><a href="#about" className="block w-full hover:text-[#172554] transition-colors">About</a></li>
              <li><a href="#services" className="block w-full hover:text-[#172554] transition-colors">Services</a></li>
              <li><a href="#doctors" className="block w-full hover:text-[#172554] transition-colors">Doctors</a></li>
              <li><a href="#contact" className="block w-full hover:text-[#172554] transition-colors">Contact</a></li>
              <li>
                  <Link to='/login' className="block w-full bg-[#172554] text-white px-5 py-2 rounded-full font-semibold hover:bg-sky-600 transition-colors shadow-md text-center">
                      Login
                  </Link>
              </li>
            </ul>
          </div>
        </nav>
      </header>

      {/* Sections */}
      <FullHeightSection id="home" className="bg-slate-300 text-center">
        <HomeSection />
      </FullHeightSection>

      <FullHeightSection id="mission-vision" className="bg-white text-center">
        <MissionVisionSection />
      </FullHeightSection>

      <FullHeightSection id="about" className="bg-slate-100 text-center">
        <AboutSection />
      </FullHeightSection>

      <FullHeightSection id="services" className="bg-white">
        <ServicesSection />
      </FullHeightSection>

      <FullHeightSection id="doctors" className="bg-slate-100">
        <DoctorsSection doctors={filteredDocs} />
      </FullHeightSection>

      <FullHeightSection id="contact" className="bg-white">
        <ContactSection />
      </FullHeightSection>

      <FooterSection />
    </div>
  );
};

export default LandingPage;
