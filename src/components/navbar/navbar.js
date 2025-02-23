"use client";

import React, { useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Cookies from "js-cookie";
import { fetchData, postData } from "@/utility/api_utility";
import ColorContext from "@/contexts/ColorContext";
import { useDispatch, useSelector } from "react-redux";
import {
  clearNotifications,
  ignoreNotificationAsync,
  markAsReadAsync,
} from "@/redux/notifications/NotificationSlice";
import { auth } from "@/config/firebaseConfig";
import {
  BadgeCheck,
  Bell,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  Cog,
  LayoutDashboard,
  LogOut,
  Menu,
  Plug,
  Settings,
  Shield,
  Trash2,
  UserCircle,
  Users,
  X,
} from "lucide-react";

// MenuItem component integrated into Navbar
// const MenuItem = ({
//   item,
//   parentPath = '',
//   depth = 0,
//   activeMenuPath,
//   setActiveMenuPath,
//   onMenuOpen
// }) => {
//   const menuRef = useRef(null);
//   const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

//     const currentPath = `${parentPath}/${item.Menu_ID}`;
//     const isActive = activeMenuPath.startsWith(currentPath);

//     useEffect(() => {
//       if (isActive && menuRef.current && depth > 0) {
//         const rect = menuRef.current.getBoundingClientRect();
//         const windowWidth = window.innerWidth;
//         const windowHeight = window.innerHeight;
//         const submenuWidth = 220; // Approximate width of submenu

//         // Check if submenu would go off screen to the right
//         const wouldOverflowRight = rect.right + submenuWidth > windowWidth;

//         // Check if submenu would go off screen at the bottom
//         const wouldOverflowBottom = rect.bottom > windowHeight;

//         setMenuPosition({
//           top: 0, // Position at the top of parent
//           left: wouldOverflowRight ? -submenuWidth : rect.width, // Position left or right based on space
//         });
//       }
//     }, [isActive, depth]);

//   const handleAnalytics = useCallback((menuDesc) => {
//     if (analytics) {
//       logEvent(analytics, 'menu_click', {
//         menu_item: menuDesc,
//         menu_id: item.Menu_ID,
//         parent_path: parentPath,
//         depth
//       });
//     }
//   }, [item.Menu_ID, parentPath, depth]);

//   // const currentPath = `${parentPath}/${item.Menu_ID}`;
//   // const isActive = activeMenuPath.startsWith(currentPath);

//     const handleItemClick = useCallback((e) => {
//       if (item.children?.length) {
//         e.preventDefault();
//         e.stopPropagation();

//         // Toggle this menu's active state
//         setActiveMenuPath(prev => {
//           // If clicking an already active path, close it
//           if (prev === currentPath) return parentPath;
//           // Otherwise, set it as active
//           return currentPath;
//         });

//         if (onMenuOpen) onMenuOpen();
//       }
//     }, [item.children, currentPath, parentPath, setActiveMenuPath, onMenuOpen]);

//   // Close menu when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (menuRef.current && !menuRef.current.contains(event.target)) {
//         // Only close this menu level and below, not parent menus
//         if (activeMenuPath.startsWith(currentPath)) {
//           setActiveMenuPath(parentPath);
//         }
//       }
//     };

//     if (isActive) {
//       document.addEventListener('mousedown', handleClickOutside);
//     }

//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [isActive, setActiveMenuPath, currentPath, parentPath, activeMenuPath]);

//   console.log(item)
//   const fullPath = `${item.Menu_Path && item.Menu_Path !== 'null' ? `/${item.Menu_Path}` : ''}`;

//   const menuItemClasses = `
//   flex items-center justify-between px-4 py-2 text-gray-600 dark:text-gray-300
//   hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors rounded-lg no-underline
//   ${depth > 0 ? 'text-sm' : 'font-medium'}
//   ${isActive ? 'bg-gray-50 dark:bg-gray-800/50' : ''}
// `;

//   if (item.children?.length) {
//     return (
//       <div ref={menuRef} className="menu-item-container relative">
//         <button
//           onClick={handleItemClick}
//           className={menuItemClasses}
//         >
//           <span>{item.Menu_Desc}</span>
//           {depth > 0 ? (
//             <ChevronRight className={`h-4 w-4 ml-1 transition-transform duration-200 ${
//               isActive ? 'rotate-90' : ''
//             }`} />
//           ) : (
//             <ChevronDown className={`h-4 w-4 ml-1 transition-transform duration-200 ${
//               isActive ? 'rotate-180' : ''
//             }`} />
//           )}
//         </button>

//         {isActive && (
//           <div className={`
//                 absolute z-[999]  bg-white dark:bg-gray-800
//     rounded-xl border border-gray-200/50 dark:border-gray-700/50
//     shadow-lg overflow-hidden transition-all duration-200 ease-in-out
//             ${depth > 0 ? 'left-full top-0 ml-2' : 'left-0 mt-2'}
//           `}
//           style={depth > 0 ? {
//             top: menuPosition.top,
//             bottom: menuPosition.bottom,
//             left: menuPosition.left,
//           } : undefined}
//           >

//             <div className="relative py-1">
//       {item.children.map((child) => (
//         <MenuItem
//           key={child.Menu_ID}
//           item={child}
//           parentPath={currentPath}
//           depth={depth + 1}
//           activeMenuPath={activeMenuPath}
//           setActiveMenuPath={setActiveMenuPath}
//           onMenuOpen={onMenuOpen}
//         />
//       ))}
//     </div>
//           </div>
//         )}
//       </div>
//     );
//   }

//   return (
//     <Link
//       href={fullPath}
//       onClick={() => {
//         handleAnalytics(item.Menu_Desc);
//         if (onMenuOpen) onMenuOpen();
//         setActiveMenuPath('');
//       }}
//       className={menuItemClasses}
//     >
//       {item.Menu_Desc}
//     </Link>
//   );
// };

const DashMenu = () => {
  const notifications = useSelector(
    (state) => state.notification.notifications
  );
  const [filter, setFilter] = useState("all");
  const [menuData, setMenuData] = useState([]);
  const [companyName, setCompanyName] = useState("");
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [userGroup, setUserGroup] = useState("");
  const [navbarOpen, setNavbarOpen] = useState(false);
  // const {colors, loading} = useContext(ColorContext);
  const router = useRouter();
  const dispatch = useDispatch();

  // Replace activeMenuItem with activeMenuPath for better nested menu tracking
  const [activeMenuPath, setActiveMenuPath] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);

  const handleMarkAsRead = () => {
    notifications.forEach((notification) => {
      if (!notification.read) {
        dispatch(markAsReadAsync(notification.id));
      }
    });
  };

  // Toggle dropdown and close menus
  const toggleDropdown = useCallback((dropdown) => {
    setActiveDropdown((prev) => (prev === dropdown ? null : dropdown));
    setActiveMenuPath(""); // Close any open menu items
  }, []);

  // Close all dropdowns and menus when clicking outside
  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     const isDropdownClick = event.target.closest('.dropdown-container');
  //     const isMenuItemClick = event.target.closest('.menu-item-container');

  //     if (!isDropdownClick && !isMenuItemClick) {
  //       setActiveDropdown(null);
  //       setActiveMenuPath('');
  //     }
  //   };

  //   document.addEventListener('mousedown', handleClickOutside);
  //   return () => document.removeEventListener('mousedown', handleClickOutside);
  // }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarOpen && !event.target.closest(".mobile-menu-container")) {
        setNavbarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [navbarOpen]);

  useEffect(() => {
    const fetchDataForUser = async () => {
      const User_ID = Cookies.get("User_ID");
      if (User_ID) {
        try {
          const [menuResult, companyResult, userResult] = await Promise.all([
            postData("/api/getMenuDataForUser", { User_ID }).catch((err) => {
              console.error("Error fetching menu data:", err);
              return [];
            }),
            fetchData("/api/getCompanyLogo").catch((err) => {
              console.error("Error fetching company logo:", err);
              return { logoUrl: null };
            }),
            postData("/api/getUserInfo", { User_ID }).catch((err) => {
              console.error("Error fetching user info:", err);
              return {};
            }),
          ]);

          setMenuData(menuResult);
          setCompanyName(companyResult?.logoUrl || "");
          setUserName(userResult?.FirstName || "Guest");
          setUserId(userResult?.User_ID || "Unknown");
          setUserGroup(userResult?.UserGroup || "None");
        } catch (err) {
          console.error("Unexpected error:", err);
        }
      }
    };

    fetchDataForUser();
  }, []);
  const renderMenuItems = (items, parentPath = "", depth = 0) => {
    return items.map((item) => {
      const currentPath = `${parentPath}/${item.Menu_ID}`;
      const isActive = activeMenuPath.startsWith(currentPath);
      const fullPath =
        item.Menu_Path && item.Menu_Path !== "null" ? `/${item.Menu_Path}` : "";

      return (
        <div key={item.Menu_ID} className="relative">
          {item.children?.length ? (
            <>
              <button
                onClick={(e) =>
                  handleItemClick(e, item, currentPath, parentPath)
                }
                className={`flex items-center justify-between px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-lg transition-colors ${
                  isActive ? "bg-gray-50 dark:bg-gray-800/50" : ""
                }`}
              >
                <span>{item.Menu_Desc}</span>
                {depth > 0 ? (
                  <ChevronRight
                    className={`h-4 w-4 ml-1 transition-transform ${
                      isActive ? "rotate-90" : ""
                    }`}
                  />
                ) : (
                  <ChevronDown
                    className={`h-4 w-4 ml-1 transition-transform ${
                      isActive ? "rotate-180" : ""
                    }`}
                  />
                )}
              </button>
              {isActive && (
                <div
                  className={`absolute left-0 mt-2 min-w-[250px] bg-white dark:bg-gray-800 rounded-xl border shadow-lg p-1 transition-all ${
                    depth > 0 ? "left-full top-0 ml-2" : ""
                  }`}
                >
                  {renderMenuItems(item.children, currentPath, depth + 1)}
                </div>
              )}
            </>
          ) : (
            <Link
              href={fullPath}
              className="block px-4 py-2 no-underline text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              {item.Menu_Desc}
            </Link>
          )}
        </div>
      );
    });
  };
  const handleItemClick = (e, item, currentPath, parentPath) => {
    if (item.children?.length) {
      e.preventDefault();
      setActiveMenuPath((prev) =>
        prev === currentPath ? parentPath : currentPath
      );
    }
  };
  const handleLogout = async () => {
    Cookies.remove("User_ID");
    Cookies.remove("AuthToken");
    try {
      await auth.signOut();
    } catch (e) {
      console.error("Error signing out:", e);
    }
    router.push("/auth/login");
  };

  const handleUsersClick = () => router.push("/settings/users");
  const handleRolesClick = () => router.push("/settings/roles");
  const handleSettingsClick = () => router.push("/settings/settings");
  const handleConnectorsClick = () => router.push("/connectors");

  // if (loading) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass dark:glass-dark border-b border-gray-200/50 dark:border-gray-700/50">
      <div className="max-w-full mx-auto py-2 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between ">
          {/* Logo */}
          <div className=" flex items-center">
            {companyName ? (
              <img
                src={companyName}
                alt="Company Logo"
                className="h-6 w-auto"
              />
            ) : (
              <div className="flex items-center gap-2">
                <LayoutDashboard className="h-8 w-8 text-purple-600" />
                <span className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  MosTech
                </span>
              </div>
            )}
          </div>

          {/* Desktop Menu */}
          <div
            tabIndex={0} // Makes the container focusable
            onBlur={(e) => {
              // Check if the newly focused element is outside of this container
              if (!e.currentTarget.contains(e.relatedTarget)) {
                setActiveMenuPath(""); // Close open menu items
              }
            }}
            className="hidden md:flex flex-1 items-center justify-center px-8"
          >
            <div className="flex">{renderMenuItems(menuData)}</div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Profile Menu */}
            <div className="dropdown-container relative">
              <button
                onClick={() => toggleDropdown("profile")}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <UserCircle className="h-6 w-6 text-white" />
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-gray-600 dark:text-gray-300 transition-transform duration-200 ${
                    activeDropdown === "profile" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {activeDropdown === "profile" && (
                <div className="absolute right-0 mt-2 w-72 glass bg-white dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                  <div className="p-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <UserCircle className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{userName}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <BadgeCheck className="h-3 w-3" />
                          <span>{userGroup}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          ID: {userId}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="dropdown-container relative">
              <button
                onClick={() => {
                  toggleDropdown("notifications");
                  handleMarkAsRead();
                }}
                className="p-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors relative"
              >
                <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                    {notifications.filter((n) => !n.read).length}
                  </span>
                )}
              </button>

              {activeDropdown === "notifications" && (
                <div className="absolute right-0 mt-2 w-96 glass bg-white dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold">Notifications</h3>
                      <button
                        onClick={() => dispatch(clearNotifications())}
                        className="text-sm text-purple-600 hover:text-purple-700"
                      >
                        Clear all
                      </button>
                    </div>
                    {notifications.length > 0 ? (
                      <div className="space-y-4">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className="flex items-start space-x-4"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-500">
                                {notification.body}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() =>
                                  dispatch(markAsReadAsync(notification.id))
                                }
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                              >
                                <Check className="h-4 w-4 text-green-500" />
                              </button>
                              <button
                                onClick={() =>
                                  dispatch(
                                    ignoreNotificationAsync(notification.id)
                                  )
                                }
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-2">
                        No new notifications
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <div className="dropdown-container relative">
              <button
                onClick={() => toggleDropdown("settings")}
                className="p-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <Settings className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>

              {activeDropdown === "settings" && (
                <div className="absolute right-0 mt-2 w-56 glass bg-white dark:glass-dark rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg overflow-hidden">
                  <div className="p-2">
                    <button
                      onClick={handleSettingsClick}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <Cog className="h-4 w-4" />
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={handleUsersClick}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <Users className="h-4 w-4" />
                      <span>Users</span>
                    </button>
                    <button
                      onClick={handleRolesClick}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <Shield className="h-4 w-4" />
                      <span>Roles</span>
                    </button>
                    <button
                      onClick={handleConnectorsClick}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <Plug className="h-4 w-4" />
                      <span>Connectors</span>
                    </button>
                    <div className="border-t border-gray-200/50 dark:border-gray-700/50 my-2"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100/50 dark:hover:bg-red-900/40 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden mobile-menu-container">
            <button
              onClick={() => setNavbarOpen(!navbarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors"
            >
              {navbarOpen ? (
                <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {navbarOpen && (
          <div className="md:hidden py-4 space-y-2 mobile-menu-container">
            {renderMenuItems(menuData)}
          </div>
        )}
      </div>
    </nav>
  );
};

export default React.memo(DashMenu);
