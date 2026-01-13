import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

export default function Afterlogin() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.user_type || "user";
  const email = user?.email || "user@email.com";
  const firstLetter = email.charAt(0).toUpperCase();

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* NAVBAR */}
      <nav className="bg-white shadow px-6 py-3 flex justify-between items-center">
        {/* LEFT */}
        <div
          className="text-xl font-extrabold tracking-tight cursor-pointer"
          onClick={() => navigate("/afterlogin")}
        >
          DWJD
        </div>

        {/* CENTER */}
        <ul className="flex gap-6 text-sm font-medium text-gray-600">
          <li
            onClick={() => navigate("/afterlogin")}
            className="cursor-pointer hover:text-black"
          >
            Home
          </li>
          <li
            onClick={() => navigate("/afterlogin/about")}
            className="cursor-pointer hover:text-black"
          >
            About
          </li>
          <li
            onClick={() => navigate("/afterlogin/contact")}
            className="cursor-pointer hover:text-black"
          >
            Contact
          </li>
        </ul>

        {/* RIGHT */}
        <div className="flex items-center gap-4 relative">
          {/* PROFILE ICON */}
          <div
            title={email}
            onClick={() => navigate("/afterlogin/profile")}
            className={`w-10 h-10 rounded-full text-white
              flex items-center justify-center font-bold cursor-pointer
              ${role === "user" ? "bg-blue-600" : "bg-green-600"}
            `}
          >
            {firstLetter}
          </div>

          {/* MENU ICON */}
          <button
            onClick={() => setMenuOpen(prev => !prev)}
            className="text-2xl font-bold select-none"
          >
            ☰
          </button>

          {/* DROPDOWN */}
          {menuOpen && (
            <div className="absolute right-0 top-14 w-52 bg-white shadow-xl rounded-xl p-2 text-sm z-50">
              {role === "user" ? (
                <>
                  <MenuItem
                    text="My Requests"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("donate/request")
                    }}
                  />
                  <MenuItem
                    text="Donate Food"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/afterlogin/donate");
                    }}
                  />
                </>
              ) : (
                <>
                  <MenuItem
                    text="Available Pickups"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/afterlogin/pickup/requests")
                    }}
                  />
                  <MenuItem
                    text="My Deliveries"
                    onClick={() => {setMenuOpen(false);
                    navigate("/afterlogin/pickup/my-rides");
                    }
                    }
                  />
                </>
              )}

              <MenuItem
                text="My Profile"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/afterlogin/profile");
                }}
              />

              <hr className="my-1" />

              <MenuItem
                text="Logout"
                danger
                onClick={() => {
                  localStorage.clear();
                  navigate("/login");
                }}
              />
            </div>
          )}
        </div>
      </nav>

      {/* PAGE CONTENT */}
      <div className="p-6">
        <Outlet />
      </div>
    </div>
  );
}

/* REUSABLE MENU ITEM */
function MenuItem({ text, onClick, danger }) {
  return (
    <div
      onClick={onClick}
      className={`px-3 py-2 rounded-lg cursor-pointer transition
        ${danger
          ? "text-red-600 hover:bg-red-100"
          : "hover:bg-gray-100"
        }
      `}
    >
      {text}
    </div>
  );
}
