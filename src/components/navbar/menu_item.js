const MenuItem = ({
                      item,
                      parentPath = '',
                      depth = 0,
                      activeMenuPath,
                      setActiveMenuPath,
                      onMenuOpen
                  }) => {
    const menuRef = useRef(null);
    const [menuPosition, setMenuPosition] = useState({top: 0, left: 0});

    const currentPath = `${parentPath}/${item.Menu_ID}`;
    const isActive = activeMenuPath.startsWith(currentPath);


    useEffect(() => {
        if (isActive && menuRef.current && depth > 0) {
            const rect = menuRef.current.getBoundingClientRect();
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            const submenuWidth = 220; // Approximate width of submenu

            // Check if submenu would go off screen to the right
            const wouldOverflowRight = rect.right + submenuWidth > windowWidth;

            // Check if submenu would go off screen at the bottom
            const wouldOverflowBottom = rect.bottom > windowHeight;

            setMenuPosition({
                top: 0, // Position at the top of parent
                left: wouldOverflowRight ? -submenuWidth : rect.width, // Position left or right based on space
            });
        }
    }, [isActive, depth]);


    const handleAnalytics = useCallback((menuDesc) => {
        if (analytics) {
            logEvent(analytics, 'menu_click', {
                menu_item: menuDesc,
                menu_id: item.Menu_ID,
                parent_path: parentPath,
                depth
            });
        }
    }, [item.Menu_ID, parentPath, depth]);

    // const currentPath = `${parentPath}/${item.Menu_ID}`;
    // const isActive = activeMenuPath.startsWith(currentPath);

    const handleItemClick = useCallback((e) => {
        if (item.children?.length) {
            e.preventDefault();
            e.stopPropagation();

            // Toggle this menu's active state
            setActiveMenuPath(prev => {
                // If clicking an already active path, close it
                if (prev === currentPath) return parentPath;
                // Otherwise, set it as active
                return currentPath;
            });

            if (onMenuOpen) onMenuOpen();
        }
    }, [item.children, currentPath, parentPath, setActiveMenuPath, onMenuOpen]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                // Only close this menu level and below, not parent menus
                if (activeMenuPath.startsWith(currentPath)) {
                    setActiveMenuPath(parentPath);
                }
            }
        };

        if (isActive) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isActive, setActiveMenuPath, currentPath, parentPath, activeMenuPath]);

    console.log(item)
    const fullPath = `${item.Menu_Path && item.Menu_Path !== 'null' ? `/${item.Menu_Path}` : ''}`;

    const menuItemClasses = `
  flex items-center justify-between px-4 py-2 text-gray-600 dark:text-gray-300 
  hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors rounded-lg
  ${depth > 0 ? 'text-sm' : 'font-medium'}
  ${isActive ? 'bg-gray-50 dark:bg-gray-800/50' : ''}
`;

    if (item.children?.length) {
        return (
            <div ref={menuRef} className="menu-item-container relative">
                <button
                    onClick={handleItemClick}
                    className={menuItemClasses}
                >
                    <span>{item.Menu_Desc}</span>
                    {depth > 0 ? (
                        <ChevronRight className={`h-4 w-4 ml-1 transition-transform duration-200 ${
                            isActive ? 'rotate-90' : ''
                        }`}/>
                    ) : (
                        <ChevronDown className={`h-4 w-4 ml-1 transition-transform duration-200 ${
                            isActive ? 'rotate-180' : ''
                        }`}/>
                    )}
                </button>

                {isActive && (
                    <div className={`
                absolute z-[999]  bg-white dark:bg-gray-800 
    rounded-xl border border-gray-200/50 dark:border-gray-700/50 
    shadow-lg overflow-hidden transition-all duration-200 ease-in-out
            ${depth > 0 ? 'left-full top-0 ml-2' : 'left-0 mt-2'}
          `}
                         style={depth > 0 ? {
                             top: menuPosition.top,
                             bottom: menuPosition.bottom,
                             left: menuPosition.left,
                         } : undefined}
                    >


                        {item.children.map((child) => (
                            <MenuItem
                                key={child.Menu_ID}
                                item={child}
                                parentPath={currentPath}
                                depth={depth + 1}
                                activeMenuPath={activeMenuPath}
                                setActiveMenuPath={setActiveMenuPath}
                                onMenuOpen={onMenuOpen}
                            />
                        ))}

                    </div>
                )}
            </div>
        );
    }

    return (
        <Link
            href={fullPath}
            onClick={() => {
                handleAnalytics(item.Menu_Desc);
                if (onMenuOpen) onMenuOpen();
                setActiveMenuPath('');
            }}
            className={menuItemClasses}
        >
            {item.Menu_Desc}
        </Link>
    );
};
