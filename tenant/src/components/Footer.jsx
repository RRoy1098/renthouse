import { Link } from "react-router-dom";
import { Building2, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {

  const ownerSiteUrl = import.meta.env.VITE_OWNER_SITE_URL;
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link
              to="/"
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors"
            >
              <img src="/logo.png" alt="logo" className="w-25" />
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Find your perfect rental home with ease. AI-powered matching for
              tenants and property owners.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/rooms"
                  className="hover:text-white transition-colors"
                >
                  Browse Rooms
                </Link>
              </li>
              <li>
                <Link
                  to="/sign-in"
                  className="hover:text-white transition-colors"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  to="/sign-up"
                  className="hover:text-white transition-colors"
                >
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* For Owners */}
          <div>
            <h3 className="text-white font-semibold mb-4">For Owners</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href={`${ownerSiteUrl}/register`}
                  className="hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Register as Owner
                </a>
              </li>


               <li>
                <a
                  href={`${ownerSiteUrl}`}
                  className="hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Owner Dashboard
                </a>
              </li>
              
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-400" />
                <span>Guwahati, Assam</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary-400" />
                <span>resaroyyy53@gmail.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary-400" />
                <span>9709xxxxx</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} RentHouse. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:text-gray-300 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/" className="hover:text-gray-300 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
