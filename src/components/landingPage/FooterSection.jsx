const FooterSection = () => {
  return (
    <footer className="bg-gray-800 text-gray-300 py-10">
      <div className="container mx-auto px-6 text-center">
        <p>
          &copy; {new Date().getFullYear()} H Vill Hospital. All Rights
          Reserved.
        </p>
        <div className="mt-4 space-x-4">
          <a href="#" className="hover:text-[#172554]">
            <i className="fab fa-facebook-f"></i>
          </a>
          <a href="#" className="hover:text-[#172554]">
            <i className="fab fa-twitter"></i>
          </a>
          <a href="#" className="hover:text-[#172554]">
            <i className="fab fa-instagram"></i>
          </a>
          <a href="#" className="hover:text-[#172554]">
            <i className="fab fa-linkedin-in"></i>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
